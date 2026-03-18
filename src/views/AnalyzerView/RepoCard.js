'use client';

import { useState } from 'react';
import { formatNumber } from '@/lib/utils';
import {
  Star,
  GitFork,
  Users,
  GitCommit,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Circle,
} from 'lucide-react';

export default function RepoCard({ repo }) {
  const [expanded, setExpanded] = useState(false);

  if (repo.error) {
    return (
      <div className="Box flash-error">
        <div className="Box-body d-flex flex-items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="text-mono text-small">{repo.url}</p>
            <p className="text-small mt-1">{repo.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const langEntries = Object.entries(repo.metrics.languages || {});
  const totalBytes = langEntries.reduce((sum, [, bytes]) => sum + bytes, 0);

  return (
    <div className="Box">
      {/* Header */}
      <div className="Box-header d-flex flex-items-center flex-justify-between">
        <div className="d-flex flex-items-center gap-2">
          <h4 className="text-bold">{repo.name}</h4>
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link"
            title="Open repository"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <DifficultyLabel level={repo.difficulty.level} />
      </div>

      <div className="Box-body">
        {/* Description */}
        {repo.description && (
          <p className="text-muted mb-4" style={{ lineHeight: 1.5 }}>
            {repo.description}
          </p>
        )}

        {/* Metrics grid */}
        <div className="d-flex flex-wrap gap-4 mb-4">
          <Metric icon={Star} label="Stars" value={repo.metrics.stars} />
          <Metric icon={GitFork} label="Forks" value={repo.metrics.forks} />
          <Metric icon={Users} label="Contributors" value={repo.metrics.contributors} />
          <Metric icon={GitCommit} label="Commits (30d)" value={repo.metrics.commitsLast30d} />
          <Metric icon={AlertCircle} label="Open Issues" value={repo.metrics.openIssues} />
        </div>

        {/* Scores */}
        <div className="d-flex gap-6 mb-4">
          <ScoreBar label="Activity" value={repo.activityScore.total} />
          <ScoreBar label="Complexity" value={repo.complexityScore.total} />
        </div>

        {/* Languages */}
        {langEntries.length > 0 && (
          <div className="mb-4">
            <div className="progress mb-2" style={{ height: 8 }}>
              {langEntries.slice(0, 6).map(([lang, bytes]) => (
                <div
                  key={lang}
                  className="progress-bar"
                  style={{
                    width: `${(bytes / totalBytes) * 100}%`,
                    backgroundColor: LANG_COLORS[lang] || '#8b8b8b',
                  }}
                  title={`${lang}: ${((bytes / totalBytes) * 100).toFixed(1)}%`}
                />
              ))}
            </div>
            <div className="d-flex flex-wrap gap-3">
              {langEntries.slice(0, 5).map(([lang, bytes]) => (
                <span key={lang} className="d-inline-flex flex-items-center gap-1 text-small">
                  <Circle
                    className="h-2.5 w-2.5"
                    style={{ fill: LANG_COLORS[lang] || '#8b8b8b', stroke: 'none' }}
                  />
                  <span className="text-muted">{lang}</span>
                  <span className="text-muted">{((bytes / totalBytes) * 100).toFixed(0)}%</span>
                </span>
              ))}
              {langEntries.length > 5 && (
                <span className="text-muted text-small">+{langEntries.length - 5} more</span>
              )}
            </div>
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="d-flex flex-items-center gap-1 text-small text-muted"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? 'Hide' : 'Show'} score breakdown
        </button>

        {/* Expanded breakdown */}
        {expanded && (
          <div className="mt-4 p-4" style={{ background: 'var(--muted)', borderRadius: 6 }}>
            <div className="d-flex flex-wrap gap-6">
              <div style={{ flex: 1, minWidth: 200 }}>
                <p className="text-bold text-small mb-3">Activity Breakdown</p>
                <BreakdownRow label="Commits (40%)" value={repo.activityScore.breakdown.commits} max={40} />
                <BreakdownRow label="Stars (25%)" value={repo.activityScore.breakdown.stars} max={25} />
                <BreakdownRow label="Forks (15%)" value={repo.activityScore.breakdown.forks} max={15} />
                <BreakdownRow label="Contributors (10%)" value={repo.activityScore.breakdown.contributors} max={10} />
                <BreakdownRow label="Issues (10%)" value={repo.activityScore.breakdown.openIssues} max={10} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p className="text-bold text-small mb-3">Complexity Breakdown</p>
                <BreakdownRow label="File count (30)" value={repo.complexityScore.breakdown.fileCount} max={30} />
                <BreakdownRow label="Languages (30)" value={repo.complexityScore.breakdown.languageDiversity} max={30} />
                <BreakdownRow label="Has deps (20)" value={repo.complexityScore.breakdown.hasDependencyFile} max={20} />
                <BreakdownRow label="Dep count (20)" value={repo.complexityScore.breakdown.dependencyCount} max={20} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="d-flex flex-items-center gap-2">
      <Icon className="h-4 w-4 text-muted" />
      <span className="text-small">
        <span className="text-bold tabular-nums">{formatNumber(value)}</span>
        <span className="text-muted ml-1">{label}</span>
      </span>
    </div>
  );
}

function ScoreBar({ label, value }) {
  const getColor = () => {
    if (value < 35) return 'var(--success)';
    if (value <= 65) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div style={{ flex: 1 }}>
      <div className="d-flex flex-justify-between text-small mb-1">
        <span>{label}</span>
        <span className="text-bold tabular-nums" style={{ color: getColor() }}>{value}</span>
      </div>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${value}%`, backgroundColor: getColor() }} />
      </div>
    </div>
  );
}

function BreakdownRow({ label, value, max }) {
  return (
    <div className="d-flex flex-items-center gap-2 mb-2 text-small">
      <span className="text-muted" style={{ flex: 1 }}>{label}</span>
      <span className="tabular-nums">{value}/{max}</span>
    </div>
  );
}

function DifficultyLabel({ level }) {
  const variant = {
    Beginner: 'success',
    Intermediate: 'warning',
    Advanced: 'danger',
  }[level] || 'neutral';

  return <span className={`label label-${variant}`}>{level}</span>;
}

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  Scala: '#c22d40',
  Dart: '#00B4AB',
  Lua: '#000080',
  R: '#198CE7',
  Perl: '#0298c3',
  Haskell: '#5e5086',
  Elixir: '#6e4a7e',
  Clojure: '#db5855',
};
