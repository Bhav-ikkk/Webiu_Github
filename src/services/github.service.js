import { Octokit } from 'octokit';
import { DEPENDENCY_FILES } from '@/lib/constants';

let octokitInstance = null;

function getOctokit() {
  if (!octokitInstance) {
    octokitInstance = new Octokit({
      auth: process.env.GITHUB_TOKEN || undefined,
      throttle: {
        onRateLimit: (retryAfter, options, octokit, retryCount) => {
          if (retryCount < 1) return true;
          return false;
        },
        onSecondaryRateLimit: () => false,
      },
    });
  }
  return octokitInstance;
}

export async function fetchRepoInfo(owner, repo) {
  try {
    const { data } = await getOctokit().rest.repos.get({ owner, repo });
    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      defaultBranch: data.default_branch,
      language: data.language,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    if (error.status === 404) {
      throw { status: 404, message: 'Repository not found' };
    }
    if (error.status === 403) {
      const remaining = error.response?.headers?.['x-ratelimit-remaining'];
      if (remaining === '0') {
        throw { status: 429, message: 'GitHub API rate limit exceeded' };
      }
      throw { status: 403, message: 'Access denied (private repository)' };
    }
    throw { status: error.status || 500, message: 'GitHub API error' };
  }
}

export async function fetchContributorCount(owner, repo) {
  try {
    const response = await getOctokit().request(
      'GET /repos/{owner}/{repo}/contributors',
      { owner, repo, per_page: 1, anon: true }
    );
    const linkHeader = response.headers.link;
    if (linkHeader) {
      const match = linkHeader.match(/page=(\d+)>;\s*rel="last"/);
      if (match) return parseInt(match[1], 10);
    }
    return response.data.length;
  } catch {
    return 0;
  }
}

export async function fetchRecentCommitCount(owner, repo) {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const response = await getOctokit().request(
      'GET /repos/{owner}/{repo}/commits',
      { owner, repo, since, per_page: 1 }
    );
    const linkHeader = response.headers.link;
    if (linkHeader) {
      const match = linkHeader.match(/page=(\d+)>;\s*rel="last"/);
      if (match) return parseInt(match[1], 10);
    }
    return response.data.length;
  } catch {
    return 0;
  }
}

export async function fetchLanguages(owner, repo) {
  try {
    const { data } = await getOctokit().rest.repos.listLanguages({ owner, repo });
    return data;
  } catch {
    return {};
  }
}

export async function fetchTreeData(owner, repo, defaultBranch) {
  try {
    const { data } = await getOctokit().rest.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
      recursive: '1',
    });
    const blobs = data.tree.filter((item) => item.type === 'blob');
    const fileCount = data.truncated ? Math.round(blobs.length * 1.5) : blobs.length;
    return { fileCount, tree: data.tree };
  } catch {
    return { fileCount: 0, tree: [] };
  }
}

export async function fetchDependencyInfo(owner, repo, tree) {
  const foundFiles = tree
    ? tree.filter((item) =>
        DEPENDENCY_FILES.some((name) => item.path === name || item.path.endsWith('/' + name))
      )
    : [];

  const hasDependencyFile = foundFiles.length > 0;
  let dependencyCount = 0;

  // Try to read package.json for accurate dep count
  const pkgEntry = foundFiles.find((f) => f.path === 'package.json');
  if (pkgEntry) {
    try {
      const { data } = await getOctokit().rest.repos.getContent({
        owner,
        repo,
        path: 'package.json',
      });
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      const pkg = JSON.parse(content);
      dependencyCount =
        Object.keys(pkg.dependencies || {}).length +
        Object.keys(pkg.devDependencies || {}).length;
    } catch {
      dependencyCount = 20; // fallback estimate
    }
  } else if (hasDependencyFile) {
    dependencyCount = 15; // generic estimate for non-JS projects
  }

  return { hasDependencyFile, dependencyCount };
}

export async function fetchRateLimit() {
  try {
    const { data } = await getOctokit().rest.rateLimit.get();
    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      reset: data.rate.reset,
    };
  } catch {
    return { limit: 60, remaining: 0, reset: 0 };
  }
}
