import { parseGitHubUrl } from '@/lib/utils';
import { API_CALLS_PER_REPO } from '@/lib/constants';
import { getCached, setCached } from './cache.service';
import {
  fetchRepoInfo,
  fetchContributorCount,
  fetchRecentCommitCount,
  fetchLanguages,
  fetchTreeData,
  fetchDependencyInfo,
  fetchRateLimit,
} from './github.service';
import {
  normalizeActivityScore,
  normalizeComplexityScore,
  classifyDifficulty,
} from './scoring.service';

async function analyzeSingleRepo(url) {
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    return { url, error: 'Invalid GitHub URL format' };
  }

  const { owner, repo } = parsed;
  const cacheKey = `${owner}/${repo}`.toLowerCase();

  const cached = getCached(cacheKey);
  if (cached) return cached;

  let repoInfo;
  try {
    repoInfo = await fetchRepoInfo(owner, repo);
  } catch (err) {
    return { url, owner, repo, error: err.message || 'Failed to fetch repository' };
  }

  // Fetch all additional data in parallel (single tree call for both file count + deps)
  const [contributorResult, commitResult, languagesResult, treeResult] =
    await Promise.allSettled([
      fetchContributorCount(owner, repo),
      fetchRecentCommitCount(owner, repo),
      fetchLanguages(owner, repo),
      fetchTreeData(owner, repo, repoInfo.defaultBranch),
    ]);

  const contributors = contributorResult.status === 'fulfilled' ? contributorResult.value : 0;
  const commitsLast30d = commitResult.status === 'fulfilled' ? commitResult.value : 0;
  const languages = languagesResult.status === 'fulfilled' ? languagesResult.value : {};
  const treeData = treeResult.status === 'fulfilled' ? treeResult.value : { fileCount: 0, tree: [] };
  const languageCount = Object.keys(languages).length;

  // Get dependency info from the same tree data (no extra API call for tree)
  let depInfo;
  try {
    depInfo = await fetchDependencyInfo(owner, repo, treeData.tree);
  } catch {
    depInfo = { hasDependencyFile: languageCount > 0, dependencyCount: 10 };
  }

  const metrics = {
    stars: repoInfo.stars,
    forks: repoInfo.forks,
    openIssues: repoInfo.openIssues,
    contributors,
    commitsLast30d,
    fileCount: treeData.fileCount,
    languageCount,
    languages,
    hasDependencyFile: depInfo.hasDependencyFile,
    dependencyCountEstimate: depInfo.dependencyCount,
  };

  const activityScore = normalizeActivityScore({
    commits: commitsLast30d,
    stars: repoInfo.stars,
    forks: repoInfo.forks,
    contributors,
    openIssues: repoInfo.openIssues,
  });

  const complexityScore = normalizeComplexityScore({
    fileCount: treeData.fileCount,
    languageCount,
    hasDependencyFile: depInfo.hasDependencyFile,
    dependencyCount: depInfo.dependencyCount,
  });

  const difficulty = classifyDifficulty(activityScore.total, complexityScore.total);

  const result = {
    url,
    owner,
    repo: repoInfo.name,
    name: repoInfo.fullName,
    description: repoInfo.description,
    error: null,
    metrics,
    activityScore,
    complexityScore,
    difficulty,
    analyzedAt: new Date().toISOString(),
  };

  setCached(cacheKey, result);
  return result;
}

function computeSummary(results) {
  const successful = results.filter((r) => !r.error);
  if (successful.length === 0) {
    return {
      totalAnalyzed: results.length,
      successCount: 0,
      errorCount: results.length,
      averageActivity: 0,
      averageComplexity: 0,
      difficultyDistribution: { beginner: 0, intermediate: 0, advanced: 0 },
      highestActivity: null,
      highestComplexity: null,
    };
  }

  const avgActivity =
    successful.reduce((sum, r) => sum + r.activityScore.total, 0) / successful.length;
  const avgComplexity =
    successful.reduce((sum, r) => sum + r.complexityScore.total, 0) / successful.length;

  const highestActivity = successful.reduce((max, r) =>
    r.activityScore.total > (max?.activityScore?.total ?? -1) ? r : max, null
  );
  const highestComplexity = successful.reduce((max, r) =>
    r.complexityScore.total > (max?.complexityScore?.total ?? -1) ? r : max, null
  );

  return {
    totalAnalyzed: results.length,
    successCount: successful.length,
    errorCount: results.length - successful.length,
    averageActivity: Math.round(avgActivity * 10) / 10,
    averageComplexity: Math.round(avgComplexity * 10) / 10,
    difficultyDistribution: {
      beginner: successful.filter((r) => r.difficulty.level === 'Beginner').length,
      intermediate: successful.filter((r) => r.difficulty.level === 'Intermediate').length,
      advanced: successful.filter((r) => r.difficulty.level === 'Advanced').length,
    },
    highestActivity: highestActivity
      ? { name: highestActivity.name, score: highestActivity.activityScore.total }
      : null,
    highestComplexity: highestComplexity
      ? { name: highestComplexity.name, score: highestComplexity.complexityScore.total }
      : null,
  };
}

export async function analyzeRepositories(urls) {
  const rateLimit = await fetchRateLimit();
  const callsNeeded = urls.length * API_CALLS_PER_REPO;
  if (rateLimit.remaining < callsNeeded) {
    const resetTime = new Date(rateLimit.reset * 1000).toLocaleTimeString();
    throw {
      status: 429,
      message: `Insufficient API rate limit. Need ~${callsNeeded} calls but only ${rateLimit.remaining} remaining. Resets at ${resetTime}.`,
    };
  }

  const results = [];
  for (const url of urls) {
    const result = await analyzeSingleRepo(url);
    results.push(result);
  }

  const summary = computeSummary(results);
  const updatedRateLimit = await fetchRateLimit();

  return { repositories: results, summary, rateLimit: updatedRateLimit };
}
