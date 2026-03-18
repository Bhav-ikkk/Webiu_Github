'use client';

import { useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  ACTIVITY_WEIGHTS,
  COMPLEXITY_POINTS,
  DIFFICULTY_WEIGHTS,
  DIFFICULTY_THRESHOLDS,
} from '@/lib/constants';

export default function SummaryCard({ summary }) {
  const [showFormulas, setShowFormulas] = useState(false);

  if (!summary) return null;

  const activityRows = [
    { key: 'commits', label: 'Commits', normalization: 'Linear' },
    { key: 'contributors', label: 'Contributors', normalization: 'Log' },
    { key: 'stars', label: 'Stars', normalization: 'Log' },
    { key: 'forks', label: 'Forks', normalization: 'Log' },
    { key: 'openIssues', label: 'Issues', normalization: 'Log' },
  ];

  const complexityRows = [
    { key: 'fileCount', label: 'Files' },
    { key: 'languageDiversity', label: 'Languages' },
    { key: 'dependencyCount', label: 'Dependency Count' },
    { key: 'hasDependencyFile', label: 'Has Dependency File' },
  ];

  const pct = (value) => Math.round(value * 100);

  return (
    <div className="Box">
      <div className="Box-header d-flex flex-items-center gap-2">
        <BarChart3 className="h-4 w-4" />
        <h3 className="text-bold">Analysis Summary</h3>
      </div>
      <div className="Box-body">
        {/* Stats row */}
        <div className="d-flex flex-wrap gap-6 mb-4">
          <Stat label="Total Analyzed" value={summary.totalAnalyzed} />
          <Stat label="Successful" value={summary.successCount} icon={CheckCircle} color="success" />
          {summary.errorCount > 0 && (
            <Stat label="Failed" value={summary.errorCount} icon={XCircle} color="danger" />
          )}
          <Stat label="Avg Activity" value={summary.averageActivity} suffix="/100" />
          <Stat label="Avg Complexity" value={summary.averageComplexity} suffix="/100" />
        </div>

        {/* Difficulty distribution */}
        <div className="mb-4 p-4" style={{ background: 'var(--muted)', borderRadius: 10 }}>
          <p className="text-small text-bold mb-2">Difficulty Distribution</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="label label-success d-flex flex-items-center flex-justify-between">
              <span>Beginner</span>
              <strong>{summary.difficultyDistribution.beginner}</strong>
            </span>
            <span className="label label-warning d-flex flex-items-center flex-justify-between">
              <span>Intermediate</span>
              <strong>{summary.difficultyDistribution.intermediate}</strong>
            </span>
            <span className="label label-danger d-flex flex-items-center flex-justify-between">
              <span>Advanced</span>
              <strong>{summary.difficultyDistribution.advanced}</strong>
            </span>
          </div>
        </div>

        {/* Top performers */}
        {(summary.highestActivity || summary.highestComplexity) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {summary.highestActivity && (
              <div className="p-3 rounded-lg border border-[var(--border)]/70 bg-[var(--card)]">
                <p className="text-small text-muted">Highest Activity</p>
                <p className="text-bold" style={{ lineHeight: 1.3 }}>{summary.highestActivity.name}</p>
                <p className="text-small text-muted">Score: {summary.highestActivity.score}/100</p>
              </div>
            )}
            {summary.highestComplexity && (
              <div className="p-3 rounded-lg border border-[var(--border)]/70 bg-[var(--card)]">
                <p className="text-small text-muted">Most Complex</p>
                <p className="text-bold" style={{ lineHeight: 1.3 }}>{summary.highestComplexity.name}</p>
                <p className="text-small text-muted">Score: {summary.highestComplexity.score}/100</p>
              </div>
            )}
          </div>
        )}

        {/* Toggle formulas */}
        <div className="d-flex gap-3 flex-wrap">
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="d-flex flex-items-center gap-1 text-small"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              padding: '8px 10px',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            <Info className="h-4 w-4" />
            {showFormulas ? 'Hide' : 'Show'} scoring formulas
            {showFormulas ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <a
            href="/scoring"
            className="text-small link d-inline-flex flex-items-center gap-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            View detailed methodology →
          </a>
        </div>

        {/* Formula explanation */}
        {showFormulas && (
          <div className="mt-4 p-4 rounded-xl" style={{ background: 'linear-gradient(180deg, var(--muted), color-mix(in oklab, var(--muted), var(--background) 18%))' }}>
            <h4 className="text-bold mb-3" style={{ fontSize: 15 }}>Scoring Formulas</h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg border border-[var(--border)]/70 bg-[var(--card)]">
                <p className="text-small text-bold mb-2">Activity Score (0-100)</p>
                <code className="text-mono text-small" style={{ display: 'block', overflow: 'auto' }}>
                  Activity = 100 × Σ(weight × normalizedMetric)
                </code>
                <div className="mt-3 space-y-1">
                  {activityRows.map((row) => (
                    <div key={row.key} className="d-flex flex-items-center flex-justify-between text-small">
                      <span>{row.label}</span>
                      <span className="text-muted">{pct(ACTIVITY_WEIGHTS[row.key])}% • {row.normalization}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-[var(--border)]/70 bg-[var(--card)]">
                <p className="text-small text-bold mb-2">Complexity Score (0-100)</p>
                <code className="text-mono text-small" style={{ display: 'block', overflow: 'auto' }}>
                  Complexity = Σ(points × normalizedMetric)
                </code>
                <div className="mt-3 space-y-1">
                  {complexityRows.map((row) => (
                    <div key={row.key} className="d-flex flex-items-center flex-justify-between text-small">
                      <span>{row.label}</span>
                      <span className="text-muted">{COMPLEXITY_POINTS[row.key]} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-[var(--border)]/70 bg-[var(--card)]">
              <p className="text-small text-bold mb-2">Difficulty Classification</p>
              <code className="text-mono text-small" style={{ display: 'block', overflow: 'auto' }}>
                Combined = (Complexity × {DIFFICULTY_WEIGHTS.complexity.toFixed(2)}) + (Activity × {DIFFICULTY_WEIGHTS.activity.toFixed(2)})
              </code>
              <div className="mt-3 d-flex flex-wrap gap-2 text-small">
                <span className="label label-success">Beginner ≤ {DIFFICULTY_THRESHOLDS.BEGINNER_MAX}</span>
                <span className="label label-warning">Intermediate {DIFFICULTY_THRESHOLDS.BEGINNER_MAX + 1}-{DIFFICULTY_THRESHOLDS.INTERMEDIATE_MAX}</span>
                <span className="label label-danger">Advanced ≥ {DIFFICULTY_THRESHOLDS.INTERMEDIATE_MAX + 1}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, suffix, icon: Icon, color }) {
  const colorClass = color ? `text-${color}` : '';

  return (
    <div>
      <p className="text-small text-muted d-flex flex-items-center gap-1">
        {Icon && <Icon className="h-3.5 w-3.5" style={{ color: color === 'success' ? 'var(--success)' : color === 'danger' ? 'var(--danger)' : undefined }} />}
        {label}
      </p>
      <p className={`text-bold tabular-nums ${colorClass}`} style={{ fontSize: 20 }}>
        {value}
        {suffix && <span className="text-muted text-small">{suffix}</span>}
      </p>
    </div>
  );
}
