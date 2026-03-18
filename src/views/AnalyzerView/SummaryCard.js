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

export default function SummaryCard({ summary }) {
  const [showFormulas, setShowFormulas] = useState(false);

  if (!summary) return null;

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
        <div className="mb-4 p-3" style={{ background: 'var(--muted)', borderRadius: 6 }}>
          <p className="text-small text-bold mb-2">Difficulty Distribution</p>
          <div className="d-flex gap-3">
            <span className="label label-success">
              {summary.difficultyDistribution.beginner} Beginner
            </span>
            <span className="label label-warning">
              {summary.difficultyDistribution.intermediate} Intermediate
            </span>
            <span className="label label-danger">
              {summary.difficultyDistribution.advanced} Advanced
            </span>
          </div>
        </div>

        {/* Top performers */}
        {(summary.highestActivity || summary.highestComplexity) && (
          <div className="d-flex flex-wrap gap-4 mb-4">
            {summary.highestActivity && (
              <div>
                <p className="text-small text-muted">Highest Activity</p>
                <p className="text-bold">{summary.highestActivity.name}</p>
                <p className="text-small text-muted">Score: {summary.highestActivity.score}</p>
              </div>
            )}
            {summary.highestComplexity && (
              <div>
                <p className="text-small text-muted">Most Complex</p>
                <p className="text-bold">{summary.highestComplexity.name}</p>
                <p className="text-small text-muted">Score: {summary.highestComplexity.score}</p>
              </div>
            )}
          </div>
        )}

        {/* Toggle formulas */}
        <button
          onClick={() => setShowFormulas(!showFormulas)}
          className="d-flex flex-items-center gap-1 text-small text-muted"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <Info className="h-4 w-4" />
          {showFormulas ? 'Hide' : 'Show'} scoring methodology
          {showFormulas ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {/* Formula explanation */}
        {showFormulas && (
          <div className="mt-4 p-4" style={{ background: 'var(--muted)', borderRadius: 6 }}>
            <h4 className="text-bold text-small mb-3">Scoring Methodology</h4>

            <div className="mb-4">
              <p className="text-bold text-small">Activity Score (0-100)</p>
              <p className="text-small text-muted mb-2">
                Measures how active the repository development is.
              </p>
              <code className="text-mono text-small" style={{ display: 'block', padding: 8, background: 'var(--card)', borderRadius: 4 }}>
                Activity = 35% Commits + 25% Contributors + 20% Stars + 10% Forks + 10% Issues
              </code>
            </div>

            <div className="mb-4">
              <p className="text-bold text-small">Complexity Score (0-100)</p>
              <p className="text-small text-muted mb-2">
                Estimates codebase complexity for new contributors.
              </p>
              <code className="text-mono text-small" style={{ display: 'block', padding: 8, background: 'var(--card)', borderRadius: 4 }}>
                Complexity = Files (30) + Languages (30) + Has Deps (20) + Dep Count (20)
              </code>
            </div>

            <div>
              <p className="text-bold text-small">Difficulty Classification</p>
              <p className="text-small text-muted mb-2">
                Combined = (Activity + Complexity) / 2
              </p>
              <div className="d-flex gap-3 text-small">
                <span><span className="label label-success">Beginner</span> &lt;35</span>
                <span><span className="label label-warning">Intermediate</span> 35-65</span>
                <span><span className="label label-danger">Advanced</span> &gt;65</span>
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
