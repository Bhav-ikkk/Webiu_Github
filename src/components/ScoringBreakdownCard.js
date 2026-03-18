'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Displays the detailed scoring breakdown for a single repository.
 * Shows exactly how each metric contributes to the final scores.
 */
export function ScoringBreakdownCard({ repo }) {
  const [expanded, setExpanded] = useState(false);

  if (!repo || repo.error) return null;

  const activity = repo.activityScore;
  const complexity = repo.complexityScore;
  const difficulty = repo.difficulty;

  // Calculate the weighted combined score
  const combinedScore = Math.round(
    complexity.total * 0.6 + activity.total * 0.4
  );

  return (
    <div className="Box">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full Box-header flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer"
      >
        <h3 className="font-bold">Scoring Breakdown</h3>
        {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {expanded && (
        <div className="Box-body space-y-6">
          {/* Activity Score Breakdown */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              📊 Activity Score: {activity.total}/100
              <span className={`text-xs px-2 py-1 rounded ${getScoreColor(activity.total)}`}>
                {getScoreLabel(activity.total)}
              </span>
            </h4>

            <div className="space-y-2">
              <ScoringRow
                label="Commits (35%)"
                value={activity.breakdown.commits}
                formula={`normalized_commits × 35`}
                color="blue"
              />
              <ScoringRow
                label="Contributors (25%)"
                value={activity.breakdown.contributors}
                formula={`normalized_contributors × 25`}
                color="green"
              />
              <ScoringRow
                label="Stars (20%)"
                value={activity.breakdown.stars}
                formula={`normalized_stars × 20`}
                color="amber"
              />
              <ScoringRow
                label="Forks (10%)"
                value={activity.breakdown.forks}
                formula={`normalized_forks × 10`}
                color="purple"
              />
              <ScoringRow
                label="Issues (10%)"
                value={activity.breakdown.openIssues}
                formula={`normalized_issues × 10`}
                color="rose"
              />
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs">
              <div className="font-mono text-gray-600 dark:text-gray-400">
                Activity = 100 × Σ(weights × normalized_metrics)
              </div>
              <div className="text-gray-500 dark:text-gray-500 mt-1">
                = 100 × (0.35×{activity.breakdown.commits/100} + 0.25×{activity.breakdown.contributors/100} + 0.20×{activity.breakdown.stars/100} + 0.10×{activity.breakdown.forks/100} + 0.10×{activity.breakdown.openIssues/100})
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-bold mt-1">
                = {activity.total}/100
              </div>
            </div>
          </div>

          {/* Complexity Score Breakdown */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              🧩 Complexity Score: {complexity.total}/100
              <span className={`text-xs px-2 py-1 rounded ${getScoreColor(complexity.total)}`}>
                {getScoreLabel(complexity.total)}
              </span>
            </h4>

            <div className="space-y-2">
              <ScoringRow
                label="Files (30 pts)"
                value={complexity.breakdown.fileCount}
                formula={`log_normalized_files × 30`}
                isPoints
                color="blue"
              />
              <ScoringRow
                label="Languages (25 pts)"
                value={complexity.breakdown.languageDiversity}
                formula={`sqrt_normalized_languages × 25`}
                isPoints
                color="green"
              />
              <ScoringRow
                label="Dependencies (25 pts)"
                value={complexity.breakdown.dependencyCount}
                formula={`linear_normalized_deps × 25`}
                isPoints
                color="amber"
              />
              <ScoringRow
                label="Dependency File (20 pts)"
                value={complexity.breakdown.hasDependencyFile}
                formula={`hasDependencyFile ? 20 : 0`}
                isPoints
                color="purple"
              />
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs">
              <div className="font-mono text-gray-600 dark:text-gray-400">
                Complexity = Σ(points_i × normalized_metric_i)
              </div>
              <div className="text-gray-500 dark:text-gray-500 mt-1">
                = {complexity.breakdown.fileCount} + {complexity.breakdown.languageDiversity} + {complexity.breakdown.dependencyCount} + {complexity.breakdown.hasDependencyFile}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-bold mt-1">
                = {complexity.total}/100
              </div>
            </div>
          </div>

          {/* Difficulty Classification */}
          <div>
            <h4 className="font-semibold text-sm mb-3">
              🎯 Difficulty Classification: <span className={getDifficultyColor(difficulty.level)}>{difficulty.level}</span>
            </h4>

            <div className="space-y-2">
              <div className="text-xs space-y-1">
                <div className="font-mono text-gray-600 dark:text-gray-400">
                  Combined = (Complexity × 0.60) + (Activity × 0.40)
                </div>
                <div className="text-gray-500 dark:text-gray-500">
                  = ({complexity.total} × 0.60) + ({activity.total} × 0.40)
                </div>
                <div className="text-gray-500 dark:text-gray-500">
                  = {Math.round(complexity.total * 0.6)} + {Math.round(activity.total * 0.4)}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-bold">
                  = {combinedScore}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-200 dark:border-emerald-800">
                <div className="font-semibold text-emerald-900 dark:text-emerald-100">Beginner</div>
                <div className="text-emerald-700 dark:text-emerald-200">0-35</div>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800">
                <div className="font-semibold text-amber-900 dark:text-amber-100">Intermediate</div>
                <div className="text-amber-700 dark:text-amber-200">36-60</div>
              </div>
              <div className="p-2 bg-rose-50 dark:bg-rose-950/30 rounded border border-rose-200 dark:border-rose-800">
                <div className="font-semibold text-rose-900 dark:text-rose-100">Advanced</div>
                <div className="text-rose-700 dark:text-rose-200">61-100</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoringRow({ label, value, formula, isPoints = false, color = 'gray' }) {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    amber: 'bg-amber-100 dark:bg-amber-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    rose: 'bg-rose-100 dark:bg-rose-900/30',
    gray: 'bg-gray-100 dark:bg-gray-900/30',
  };

  return (
    <div className={`p-2 rounded border border-${color}-200 dark:border-${color}-800 ${colors[color]}`}>
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs font-semibold">{label}</span>
        <span className="text-xs font-bold">{Math.round(value)}{isPoints ? ' pts' : ''}</span>
      </div>
      <div className="flex items-center h-1.5 bg-gray-300 dark:bg-gray-700 rounded overflow-hidden">
        <div
          className={`h-full bg-${color}-500 dark:bg-${color}-400 transition-all`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-mono">
        {formula}
      </div>
    </div>
  );
}

function getScoreColor(score) {
  if (score < 35) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200';
  if (score <= 65) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200';
  return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200';
}

function getScoreLabel(score) {
  if (score < 35) return 'Low';
  if (score <= 65) return 'Medium';
  return 'High';
}

function getDifficultyColor(level) {
  const colors = {
    Beginner: 'text-emerald-600 dark:text-emerald-400 font-bold',
    Intermediate: 'text-amber-600 dark:text-amber-400 font-bold',
    Advanced: 'text-rose-600 dark:text-rose-400 font-bold',
  };
  return colors[level] || 'text-gray-600 dark:text-gray-400 font-bold';
}
