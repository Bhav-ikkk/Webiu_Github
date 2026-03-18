'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

export function ScoringMethodology() {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Overview */}
      <div className="Box">
        <div className="Box-header">
          <h3 className="font-bold">Scoring Methodology</h3>
        </div>
        <div className="Box-body">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            This analyzer uses a sophisticated multi-factor scoring system to evaluate GitHub repositories across three dimensions:
          </p>
          <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
            <li>💪 <strong>Activity Score</strong>: How actively is the repository being developed?</li>
            <li>🧩 <strong>Complexity Score</strong>: How complex is the codebase to understand?</li>
            <li>📈 <strong>Difficulty Level</strong>: Is this a good project for learning?</li>
          </ul>
        </div>
      </div>

      {/* Activity Score Section */}
      <ActivityScoreSection expanded={expandedSection === 'activity'} onToggle={() => toggleSection('activity')} />

      {/* Complexity Score Section */}
      <ComplexityScoreSection expanded={expandedSection === 'complexity'} onToggle={() => toggleSection('complexity')} />

      {/* Difficulty Classification Section */}
      <DifficultySection expanded={expandedSection === 'difficulty'} onToggle={() => toggleSection('difficulty')} />

      {/* Normalization Methods */}
      <NormalizationSection expanded={expandedSection === 'normalization'} onToggle={() => toggleSection('normalization')} />
    </div>
  );
}

function ActivityScoreSection({ expanded, onToggle }) {
  return (
    <div className="Box">
      <button
        onClick={onToggle}
        className="w-full Box-header flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
      >
        <h3 className="font-bold flex items-center gap-2">
          📊 Activity Score (0-100)
          <Info className="h-4 w-4 text-blue-500" />
        </h3>
        {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {expanded && (
        <div className="Box-body space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Measures how actively the repository is being developed and maintained.
            </p>

            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
              <div className="text-gray-700 dark:text-gray-300">
                <div>Activity = 100 × (w₁×commits + w₂×stars + w₃×forks + w₄×contributors + w₅×issues)</div>
                <div className="mt-2 text-gray-500 dark:text-gray-400 text-xs">
                  Where weights sum to 1.0 and each metric is normalized to [0,1]
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold">35% Commits (Last 30 Days)</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Normalized: Linear</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Measures recent development activity. Cap: 300 commits/month (very active)
                </p>
                <div className="mt-2 text-xs font-mono bg-gray-50 dark:bg-gray-950 p-2 rounded">
                  Score = min(actual_commits / 300, 1.0) × 100
                </div>
              </div>

              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold">25% Contributors</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Normalized: Logarithmic</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Indicates team engagement and community health. Cap: 500 contributors
                </p>
                <div className="mt-2 text-xs font-mono bg-gray-50 dark:bg-gray-950 p-2 rounded">
                  Score = log₁₀(contributors + 1) / log₁₀(501) × 100
                </div>
              </div>

              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold">20% Stars</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Normalized: Logarithmic</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Community interest and project visibility. Cap: 100,000 stars
                </p>
                <div className="mt-2 text-xs font-mono bg-gray-50 dark:bg-gray-950 p-2 rounded">
                  Score = log₁₀(stars + 1) / log₁₀(100001) × 100
                </div>
              </div>

              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold">10% Forks</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Normalized: Logarithmic</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Project adoption and derivative works. Cap: 30,000 forks
                </p>
                <div className="mt-2 text-xs font-mono bg-gray-50 dark:bg-gray-950 p-2 rounded">
                  Score = log₁₀(forks + 1) / log₁₀(30001) × 100
                </div>
              </div>

              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold">10% Open Issues</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Normalized: Logarithmic</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Community engagement (both challenges and opportunities). Cap: 5,000 issues
                </p>
                <div className="mt-2 text-xs font-mono bg-gray-50 dark:bg-gray-950 p-2 rounded">
                  Score = log₁₀(issues + 1) / log₁₀(5001) × 100
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-900 dark:text-blue-200">
                💡 <strong>Why logarithmic normalization?</strong> GitHub metrics follow a power-law distribution. 
                The difference between 0 and 100 stars is more significant than 100k to 100.1k—logarithmic scaling 
                accounts for this, making scores more meaningful across all repository sizes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ComplexityScoreSection({ expanded, onToggle }) {
  return (
    <div className="Box">
      <button
        onClick={onToggle}
        className="w-full Box-header flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
      >
        <h3 className="font-bold flex items-center gap-2">
          🧩 Complexity Score (0-100)
          <Info className="h-4 w-4 text-purple-500" />
        </h3>
        {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {expanded && (
        <div className="Box-body space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Estimates how complex the codebase is to understand and contribute to.
            </p>

            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
              <div className="text-gray-700 dark:text-gray-300">
                <div>Complexity = Σ(points_i × normalized_metric_i)</div>
                <div className="mt-2 text-gray-500 dark:text-gray-400 text-xs">
                  Where max total = 100 points across all factors
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold">30 Points: File Count</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Normalized: Logarithmic</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Codebase size is primary complexity indicator. More files = more to navigate. Cap: 10,000 files
                </p>
                <div className="mt-2 text-xs font-mono bg-gray-50 dark:bg-gray-950 p-2 rounded">
                  Points = log₁₀(files + 1) / log₁₀(10001) × 30
                </div>
              </div>

              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold">25 Points: Language Diversity</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Normalized: Square Root</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Polyglot codebases require broader knowledge. Diminishing returns after 3-4 languages. Cap: 10 languages
                </p>
                <div className="mt-2 text-xs font-mono bg-gray-50 dark:bg-gray-950 p-2 rounded">
                  Points = √(languages / 10) × 25
                </div>
              </div>

              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold">25 Points: Dependency Count</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Normalized: Linear</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  External dependencies add integration complexity. Each dep has roughly equal impact. Cap: 150 dependencies
                </p>
                <div className="mt-2 text-xs font-mono bg-gray-50 dark:bg-gray-950 p-2 rounded">
                  Points = min(dependencies / 150, 1.0) × 25
                </div>
              </div>

              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold">20 Points: Has Dependency File</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Binary</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Indicates build system/tooling complexity (package.json, pom.xml, Cargo.toml, etc.)
                </p>
                <div className="mt-2 text-xs font-mono bg-gray-50 dark:bg-gray-950 p-2 rounded">
                  Points = hasDependencyFile ? 20 : 0
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
              <p className="text-xs text-purple-900 dark:text-purple-200">
                💡 <strong>Why different normalizations?</strong> File counts and language counts have different scaling behaviors. 
                Using log for files (power-law) and sqrt for languages (diminishing returns) gives more accurate complexity estimates.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DifficultySection({ expanded, onToggle }) {
  return (
    <div className="Box">
      <button
        onClick={onToggle}
        className="w-full Box-header flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
      >
        <h3 className="font-bold flex items-center gap-2">
          🎯 Difficulty Classification
          <Info className="h-4 w-4 text-green-500" />
        </h3>
        {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {expanded && (
        <div className="Box-body space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Classifies repository learning difficulty for new contributors using a weighted combination.
            </p>

            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
              <div className="text-gray-700 dark:text-gray-300">
                <div>Combined = (Complexity × 0.60) + (Activity × 0.40)</div>
                <div className="mt-2 text-gray-500 dark:text-gray-400 text-xs">
                  Complexity weighted more heavily: harder code = harder to learn
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🟢</span>
                  <span className="font-bold text-emerald-900 dark:text-emerald-100">Beginner (0-35)</span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-200">
                  Small codebase with manageable scope. Good for newcomers learning to contribute to open source.
                </p>
                <div className="mt-2 text-xs font-mono bg-white dark:bg-black/30 p-2 rounded">
                  Combined Score ≤ 35
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🟡</span>
                  <span className="font-bold text-amber-900 dark:text-amber-100">Intermediate (36-60)</span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Medium complexity project requiring some experience. Good for developers with prior contribution experience.
                </p>
                <div className="mt-2 text-xs font-mono bg-white dark:bg-black/30 p-2 rounded">
                  36 ≤ Combined Score ≤ 60
                </div>
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🔴</span>
                  <span className="font-bold text-rose-900 dark:text-rose-100">Advanced (61-100)</span>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-200">
                  Large, complex codebase requiring significant experience. Best for expert developers.
                </p>
                <div className="mt-2 text-xs font-mono bg-white dark:bg-black/30 p-2 rounded">
                  Combined Score &gt; 60
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-xs text-green-900 dark:text-green-200">
                💡 <strong>Why 60/40 weighting?</strong> Complexity is the primary factor in learning difficulty—a complex codebase 
                is inherently harder to understand. Activity matters secondarily—fast-moving projects require keeping up with changes, 
                but are still easier than inherently complex code.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NormalizationSection({ expanded, onToggle }) {
  return (
    <div className="Box">
      <button
        onClick={onToggle}
        className="w-full Box-header flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
      >
        <h3 className="font-bold flex items-center gap-2">
          📐 Normalization Methods
          <Info className="h-4 w-4 text-orange-500" />
        </h3>
        {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {expanded && (
        <div className="Box-body space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Raw metrics need to be normalized to a [0,1] range so they can be fairly combined. Different normalization 
            strategies are used based on the statistical distribution of each metric:
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
              <h4 className="font-semibold text-sm mb-2">📊 Logarithmic Normalization</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Used for: Stars, Forks, Contributors, Issues, File Count
              </p>
              <div className="text-xs font-mono bg-white dark:bg-black/40 p-2 rounded mb-2">
                norm = log₁₀(value + 1) / log₁₀(cap + 1)
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Why:</strong> These metrics follow power-law distribution. The jump from 10 to 100 stars is 
                more significant than 100k to 100.1k. Logarithmic scaling handles extreme differences better.
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
              <h4 className="font-semibold text-sm mb-2">📏 Linear Normalization</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Used for: Recent Commits (30d), Dependencies
              </p>
              <div className="text-xs font-mono bg-white dark:bg-black/40 p-2 rounded mb-2">
                norm = min(value / cap, 1.0)
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Why:</strong> These have natural upper bounds. Each additional commit/dependency has roughly 
                equal significance. Simple linear scaling is most appropriate.
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
              <h4 className="font-semibold text-sm mb-2">√ Square Root Normalization</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Used for: Language Diversity
              </p>
              <div className="text-xs font-mono bg-white dark:bg-black/40 p-2 rounded mb-2">
                norm = √(value / cap)
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Why:</strong> Diminishing returns beyond 3-4 languages. Adding a 10th language is less 
                impactful than adding a 2nd. Square root reflects this sublinear relationship.
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-xs text-orange-900 dark:text-orange-200">
              💡 <strong>Key Insight:</strong> All raw metrics are normalized to [0,1] before weighting/summing. 
              This ensures each component contributes fairly regardless of its native scale.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
