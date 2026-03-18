'use client';

import { formatNumber } from '@/lib/utils';
import { ExternalLink, AlertCircle, CheckCircle, Star, GitFork } from 'lucide-react';

export default function ResultsTable({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Repository</th>
            <th className="text-right">Stars</th>
            <th className="text-right">Forks</th>
            <th className="text-right">Activity</th>
            <th className="text-right">Complexity</th>
            <th>Difficulty</th>
            <th className="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {results.map((repo, idx) => (
            <tr key={idx}>
              <td>
                {repo.error ? (
                  <span className="text-muted text-mono text-small">{repo.url}</span>
                ) : (
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link d-inline-flex flex-items-center gap-2"
                  >
                    {repo.name}
                    <ExternalLink className="h-3 w-3" style={{ opacity: 0.5 }} />
                  </a>
                )}
              </td>
              <td className="text-right tabular-nums">
                {repo.error ? '—' : (
                  <span className="d-inline-flex flex-items-center gap-1">
                    <Star className="h-3.5 w-3.5" style={{ color: 'var(--warning)' }} />
                    {formatNumber(repo.metrics.stars)}
                  </span>
                )}
              </td>
              <td className="text-right tabular-nums">
                {repo.error ? '—' : (
                  <span className="d-inline-flex flex-items-center gap-1">
                    <GitFork className="h-3.5 w-3.5" style={{ color: 'var(--muted-foreground)' }} />
                    {formatNumber(repo.metrics.forks)}
                  </span>
                )}
              </td>
              <td className="text-right">
                {repo.error ? '—' : <ScoreValue value={repo.activityScore.total} />}
              </td>
              <td className="text-right">
                {repo.error ? '—' : <ScoreValue value={repo.complexityScore.total} />}
              </td>
              <td>
                {repo.error ? '—' : <DifficultyLabel level={repo.difficulty.level} />}
              </td>
              <td className="text-center">
                {repo.error ? (
                  <span className="label label-danger d-inline-flex flex-items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Error
                  </span>
                ) : (
                  <span className="label label-success d-inline-flex flex-items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    OK
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScoreValue({ value }) {
  const getColor = () => {
    if (value < 35) return 'var(--success)';
    if (value <= 65) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <span className="text-bold tabular-nums" style={{ color: getColor() }}>
      {value}
    </span>
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
