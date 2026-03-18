'use client';

import { useMemo } from 'react';
import { Star, GitFork, TrendingUp, BookOpen, Zap, Flame } from 'lucide-react';

export default function Recommendations({ results, skillLevel }) {
  const recommendations = useMemo(() => {
    const successful = results.filter(r => !r.error);
    if (successful.length === 0) return null;

    // Group by difficulty
    const beginner = successful.filter(r => r.difficulty.level === 'Beginner');
    const intermediate = successful.filter(r => r.difficulty.level === 'Intermediate');
    const advanced = successful.filter(r => r.difficulty.level === 'Advanced');

    // Find best repo for each use case
    const mostActive = [...successful].sort((a, b) => b.activityScore.total - a.activityScore.total)[0];
    const leastComplex = [...successful].sort((a, b) => a.complexityScore.total - b.complexityScore.total)[0];
    const mostPopular = [...successful].sort((a, b) => b.metrics.stars - a.metrics.stars)[0];

    // Suggestion based on skill level
    let suggested = null;
    if (skillLevel === 'beginner' && beginner.length > 0) {
      suggested = beginner.sort((a, b) => b.activityScore.total - a.activityScore.total)[0];
    } else if (skillLevel === 'intermediate' && intermediate.length > 0) {
      suggested = intermediate.sort((a, b) => b.activityScore.total - a.activityScore.total)[0];
    } else if (skillLevel === 'advanced' && advanced.length > 0) {
      suggested = advanced.sort((a, b) => b.activityScore.total - a.activityScore.total)[0];
    }

    return {
      mostActive,
      leastComplex,
      mostPopular,
      suggested,
      counts: {
        beginner: beginner.length,
        intermediate: intermediate.length,
        advanced: advanced.length,
      },
    };
  }, [results, skillLevel]);

  if (!recommendations) return null;

  return (
    <div className="Box">
      <div className="Box-header">
        <h3 className="font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Recommendations
        </h3>
      </div>
      <div className="Box-body">
        {/* Skill level distribution */}
        <div className="mb-6">
          <p className="text-sm text-[var(--muted-foreground)] mb-3">Difficulty distribution:</p>
          <div className="flex gap-4">
            <DifficultyCount icon={BookOpen} label="Beginner" count={recommendations.counts.beginner} color="success" />
            <DifficultyCount icon={Zap} label="Intermediate" count={recommendations.counts.intermediate} color="warning" />
            <DifficultyCount icon={Flame} label="Advanced" count={recommendations.counts.advanced} color="danger" />
          </div>
        </div>

        {/* Suggested repo based on filter */}
        {recommendations.suggested && skillLevel !== 'all' && (
          <div className="mb-6 p-4 bg-[var(--accent)] border border-[var(--primary)] rounded-md">
            <p className="text-sm font-medium text-[var(--primary)] mb-2">
              Recommended for {skillLevel} level:
            </p>
            <RepoSuggestion repo={recommendations.suggested} />
          </div>
        )}

        {/* Quick insights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InsightCard
            icon={TrendingUp}
            title="Most Active"
            repo={recommendations.mostActive}
            metric={`Activity: ${recommendations.mostActive.activityScore.total}`}
          />
          <InsightCard
            icon={BookOpen}
            title="Easiest to Learn"
            repo={recommendations.leastComplex}
            metric={`Complexity: ${recommendations.leastComplex.complexityScore.total}`}
          />
          <InsightCard
            icon={Star}
            title="Most Popular"
            repo={recommendations.mostPopular}
            metric={`${recommendations.mostPopular.metrics.stars.toLocaleString()} stars`}
          />
        </div>
      </div>
    </div>
  );
}

function DifficultyCount({ icon: Icon, label, count, color }) {
  const colors = {
    success: 'text-[var(--success)]',
    warning: 'text-[var(--warning)]',
    danger: 'text-[var(--danger)]',
  };

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${colors[color]}`} />
      <span className="text-sm">
        <span className="font-semibold">{count}</span>
        <span className="text-[var(--muted-foreground)] ml-1">{label}</span>
      </span>
    </div>
  );
}

function RepoSuggestion({ repo }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between hover:bg-[var(--muted)] p-2 -m-2 rounded-md transition-colors"
    >
      <div>
        <p className="font-semibold">{repo.name}</p>
        <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            {repo.metrics.stars.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5" />
            {repo.metrics.forks.toLocaleString()}
          </span>
        </div>
      </div>
      <div className={`label label-${repo.difficulty.level.toLowerCase() === 'beginner' ? 'success' : repo.difficulty.level.toLowerCase() === 'intermediate' ? 'warning' : 'danger'}`}>
        {repo.difficulty.level}
      </div>
    </a>
  );
}

function InsightCard({ icon: Icon, title, repo, metric }) {
  return (
    <div className="p-3 border border-[var(--border)] rounded-md">
      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-2">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <a
        href={repo.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-[var(--primary)] hover:underline block truncate"
      >
        {repo.name}
      </a>
      <p className="text-sm text-[var(--muted-foreground)]">{metric}</p>
    </div>
  );
}
