'use client';

import { Github, Loader2 } from 'lucide-react';

export default function LoadingState({ count }) {
  return (
    <div className="Box">
      <div className="Box-body">
        <div className="text-center py-8">
          <div className="d-inline-flex flex-items-center gap-3 mb-4">
            <Loader2 className="h-6 w-6" style={{ animation: 'spin 1s linear infinite' }} />
            <span className="text-bold">Analyzing {count} {count === 1 ? 'repository' : 'repositories'}...</span>
          </div>
          <p className="text-muted text-small">Fetching data from GitHub API</p>
        </div>

        {/* Skeleton rows */}
        <div className="mt-6 space-y-3">
          {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
            <div key={i} className="d-flex flex-items-center gap-3 p-3 border border-[var(--border)] rounded-md">
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 6 }} />
              <div className="flex-1">
                <div className="skeleton mb-2" style={{ height: 14, width: '60%' }} />
                <div className="skeleton" style={{ height: 12, width: '40%' }} />
              </div>
              <div className="skeleton" style={{ height: 24, width: 80, borderRadius: 9999 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
