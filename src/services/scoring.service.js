/**
 * Scoring Service - Core Algorithm Implementation
 *
 * This module implements the scoring algorithms for:
 * 1. Activity Score (0-100): How active is repository development?
 * 2. Complexity Score (0-100): How complex is the codebase?
 * 3. Difficulty Classification: Beginner / Intermediate / Advanced
 *
 * All formulas are documented with rationale and mathematical basis.
 */

import {
  CAPS,
  ACTIVITY_WEIGHTS,
  COMPLEXITY_POINTS,
  DIFFICULTY_WEIGHTS,
  DIFFICULTY_THRESHOLDS,
} from '@/lib/constants';
import { logNormalize, linearNormalize, sqrtNormalize, round, safeNumber } from '@/lib/utils';

/**
 * ============================================================================
 * ACTIVITY SCORE (0-100)
 * ============================================================================
 *
 * Measures how active the repository development is.
 *
 * Formula:
 *   Activity = 100 × Σ(weight_i × normalized_metric_i)
 *
 * Components:
 *   - Commits (35%): Recent development activity (last 30 days)
 *   - Contributors (25%): Team engagement and community health
 *   - Stars (20%): Community interest and project visibility
 *   - Forks (10%): Project adoption and derivative works
 *   - Issues (10%): Community engagement (support/feature requests)
 *
 * Normalization:
 *   - Commits: Linear (bounded by time period)
 *   - Stars/Forks/Contributors: Logarithmic (power-law distribution)
 *   - Issues: Logarithmic (power-law distribution)
 *
 * Edge Cases:
 *   - All zeros → Score of 0
 *   - Only stars, no commits → Reflects low recent activity
 *   - New repo with few metrics → Lower score, appropriately
 *
 * @param {Object} metrics - Raw repository metrics
 * @returns {Object} { total: number, breakdown: Object, formula: string }
 */
export function normalizeActivityScore({ commits, stars, forks, contributors, openIssues }) {
  // Safely convert inputs
  const c = safeNumber(commits);
  const s = safeNumber(stars);
  const f = safeNumber(forks);
  const contrib = safeNumber(contributors);
  const issues = safeNumber(openIssues);

  // Normalize each metric
  const commitNorm = linearNormalize(c, CAPS.COMMITS_30D);
  const starsNorm = logNormalize(s, CAPS.STARS);
  const forksNorm = logNormalize(f, CAPS.FORKS);
  const contribNorm = logNormalize(contrib, CAPS.CONTRIBUTORS);
  const issuesNorm = logNormalize(issues, CAPS.OPEN_ISSUES);

  // Calculate weighted score
  const total = (
    commitNorm * ACTIVITY_WEIGHTS.commits +
    starsNorm * ACTIVITY_WEIGHTS.stars +
    forksNorm * ACTIVITY_WEIGHTS.forks +
    contribNorm * ACTIVITY_WEIGHTS.contributors +
    issuesNorm * ACTIVITY_WEIGHTS.openIssues
  ) * 100;

  return {
    total: round(Math.min(total, 100)),
    breakdown: {
      commits: round(commitNorm * 100),
      stars: round(starsNorm * 100),
      forks: round(forksNorm * 100),
      contributors: round(contribNorm * 100),
      openIssues: round(issuesNorm * 100),
    },
    weights: ACTIVITY_WEIGHTS,
  };
}

/**
 * ============================================================================
 * COMPLEXITY SCORE (0-100)
 * ============================================================================
 *
 * Estimates how complex the codebase is to understand and contribute to.
 *
 * Formula:
 *   Complexity = Σ(points_i × normalized_metric_i)
 *
 * Components:
 *   - File Count (30pts): Codebase size - more files = more to navigate
 *   - Language Diversity (25pts): Polyglot codebases require broader knowledge
 *   - Dependency Count (25pts): External deps add integration complexity
 *   - Has Dependency File (20pts): Indicates build system/tooling complexity
 *
 * Normalization:
 *   - Files: Logarithmic (doubling files doesn't double complexity)
 *   - Languages: Square root (diminishing returns after 3-4 languages)
 *   - Dependencies: Linear (each dep adds roughly equal overhead)
 *   - Dep file: Binary (0 or full points)
 *
 * Edge Cases:
 *   - Empty repo → Score of 0
 *   - Single-file repo → Low but non-zero (has some structure)
 *   - Monorepo with many files → Capped by logarithmic normalization
 *
 * @param {Object} metrics - Raw repository metrics
 * @returns {Object} { total: number, breakdown: Object }
 */
export function normalizeComplexityScore({
  fileCount,
  languageCount,
  hasDependencyFile,
  dependencyCount,
}) {
  // Safely convert inputs
  const files = safeNumber(fileCount);
  const langs = safeNumber(languageCount);
  const deps = safeNumber(dependencyCount);
  const hasDeps = Boolean(hasDependencyFile);

  // Normalize each metric with appropriate function
  const fileNorm = logNormalize(files, CAPS.FILE_COUNT);
  const langNorm = sqrtNormalize(langs, CAPS.LANGUAGE_COUNT);
  const depNorm = linearNormalize(deps, CAPS.DEPENDENCY_COUNT);

  // Calculate points for each component
  const breakdown = {
    fileCount: round(fileNorm * COMPLEXITY_POINTS.fileCount),
    languageDiversity: round(langNorm * COMPLEXITY_POINTS.languageDiversity),
    dependencyCount: round(depNorm * COMPLEXITY_POINTS.dependencyCount),
    hasDependencyFile: hasDeps ? COMPLEXITY_POINTS.hasDependencyFile : 0,
  };

  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  return {
    total: round(Math.min(total, 100)),
    breakdown,
    maxPoints: COMPLEXITY_POINTS,
  };
}

/**
 * ============================================================================
 * DIFFICULTY CLASSIFICATION
 * ============================================================================
 *
 * Classifies repository learning difficulty for new contributors.
 *
 * Formula:
 *   Combined = (Complexity × 0.60) + (Activity × 0.40)
 *
 * Why this weighting?
 *   - Complexity (60%): A complex codebase is inherently harder to learn
 *   - Activity (40%): Fast-moving projects require keeping up with changes
 *
 * Classification:
 *   - Beginner (0-35): Small scope, manageable complexity
 *   - Intermediate (36-60): Requires some experience
 *   - Advanced (61-100): Large, complex, fast-moving projects
 *
 * @param {number} activityScore - Activity score (0-100)
 * @param {number} complexityScore - Complexity score (0-100)
 * @returns {Object} { level, combined, description, reasoning }
 */
export function classifyDifficulty(activityScore, complexityScore) {
  const activity = safeNumber(activityScore);
  const complexity = safeNumber(complexityScore);

  // Weighted combination (complexity matters more for learning)
  const combined = round(
    complexity * DIFFICULTY_WEIGHTS.complexity +
    activity * DIFFICULTY_WEIGHTS.activity
  );

  let level, description, reasoning;

  if (combined <= DIFFICULTY_THRESHOLDS.BEGINNER_MAX) {
    level = 'Beginner';
    description = 'Good for newcomers';
    reasoning = 'Small codebase with manageable scope.';
  } else if (combined <= DIFFICULTY_THRESHOLDS.INTERMEDIATE_MAX) {
    level = 'Intermediate';
    description = 'Some experience recommended';
    reasoning = 'Medium complexity project.';
  } else {
    level = 'Advanced';
    description = 'Significant experience required';
    reasoning = 'Large, complex codebase.';
  }

  return {
    level,
    combined,
    description,
    reasoning,
  };
}
