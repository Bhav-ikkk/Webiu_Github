/**
 * GitHub Repository Intelligence Analyzer - Constants & Configuration
 *
 * This file contains all the tunable parameters for the scoring algorithms.
 * Values are based on empirical analysis of GitHub repository distributions.
 */

// ============================================================================
// NORMALIZATION CAPS
// These define the "100%" threshold for each metric.
// Based on percentile analysis: ~95th percentile of popular repos
// ============================================================================

export const CAPS = {
  // Activity metrics
  COMMITS_30D: 300,        // Very active repos have 300+ commits/month
  STARS: 100_000,          // Top repos (React, Vue) have 100k+ stars
  FORKS: 30_000,           // Heavily forked repos reach 30k+
  CONTRIBUTORS: 500,       // Large OSS projects have 500+ contributors
  OPEN_ISSUES: 5_000,      // Major projects can have thousands of issues

  // Complexity metrics
  FILE_COUNT: 10_000,      // Large monorepos can have 10k+ files
  LANGUAGE_COUNT: 10,      // Beyond 10 languages = highly diverse
  DEPENDENCY_COUNT: 150,   // Large enterprise apps have 150+ deps
};

// ============================================================================
// ACTIVITY SCORE WEIGHTS (Total = 1.0)
//
// Formula: Activity = Σ(weight_i × normalized_metric_i) × 100
//
// Rationale:
// - Commits (35%): Primary indicator of active development
// - Stars (20%): Community interest and project visibility
// - Contributors (25%): Team engagement and project health
// - Forks (10%): Derivative projects and adoption
// - Issues (10%): Community engagement (both positive and negative signal)
// ============================================================================

export const ACTIVITY_WEIGHTS = {
  commits: 0.35,       // Recent development activity
  stars: 0.20,         // Community interest
  contributors: 0.25,  // Team/community engagement
  forks: 0.10,         // Project adoption
  openIssues: 0.10,    // Community interaction
};

// ============================================================================
// COMPLEXITY SCORE POINTS (Total = 100)
//
// Formula: Complexity = Σ(points_i × normalized_metric_i)
//
// Rationale:
// - Files (30pts): Codebase size is primary complexity indicator
// - Languages (25pts): Polyglot codebases require more knowledge
// - Dependencies (25pts): External dependencies add integration complexity
// - Dependency file (20pts): Indicates build system complexity
// ============================================================================

export const COMPLEXITY_POINTS = {
  fileCount: 30,
  languageDiversity: 25,
  dependencyCount: 25,
  hasDependencyFile: 20,
};

// ============================================================================
// DIFFICULTY THRESHOLDS
//
// Classification based on combined weighted score:
// - Beginner (0-35):      Small codebases, few languages, manageable scope
// - Intermediate (36-60): Medium complexity, some expertise needed
// - Advanced (61-100):    Large codebases, many moving parts
//
// The classification uses a WEIGHTED combination:
// - Complexity (60%): Primary factor - harder code = harder to learn
// - Activity (40%): Secondary - fast-moving targets are harder to track
// ============================================================================

export const DIFFICULTY_WEIGHTS = {
  complexity: 0.60,  // Complexity has more weight in difficulty
  activity: 0.40,    // Activity affects difficulty less
};

export const DIFFICULTY_THRESHOLDS = {
  BEGINNER_MAX: 35,
  INTERMEDIATE_MAX: 60,
};

// ============================================================================
// SYSTEM CONFIGURATION
// ============================================================================

export const CACHE_TTL_MS = 10 * 60 * 1000;  // 10 minutes
export const MAX_REPOS_PER_REQUEST = 10;
export const API_CALLS_PER_REPO = 6;  // Worst-case API calls needed per repo

// Dependency detection patterns
export const DEPENDENCY_FILES = [
  'package.json',      // Node.js
  'requirements.txt',  // Python (pip)
  'Pipfile',           // Python (pipenv)
  'pyproject.toml',    // Python (poetry/modern)
  'Cargo.toml',        // Rust
  'go.mod',            // Go
  'pom.xml',           // Java (Maven)
  'build.gradle',      // Java/Kotlin (Gradle)
  'Gemfile',           // Ruby
  'composer.json',     // PHP
  'Package.swift',     // Swift
  'pubspec.yaml',      // Dart/Flutter
  'mix.exs',           // Elixir
  'Makefile',          // C/C++ (often)
  'CMakeLists.txt',    // C/C++ (CMake)
];

// Special files that indicate project structure complexity
export const STRUCTURE_COMPLEXITY_FILES = [
  'docker-compose.yml',
  'Dockerfile',
  '.github/workflows',
  'lerna.json',         // Monorepo
  'nx.json',            // Monorepo
  'turbo.json',         // Monorepo
  'pnpm-workspace.yaml', // Monorepo
];
