'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import apiClient from '@/lib/axios';
import { useTheme } from '@/components/ThemeProvider';
import RepoForm from './RepoForm';
import ResultsTable from './ResultsTable';
import RepoCard from './RepoCard';
import SummaryCard from './SummaryCard';
import LoadingState from './LoadingState';
import Recommendations from './Recommendations';
import {
  Github,
  Sun,
  Moon,
  Download,
  FileJson,
  Copy,
  Share2,
  BookOpen,
  Check,
  ExternalLink,
} from 'lucide-react';

export default function AnalyzerView() {
  const { theme, toggleTheme } = useTheme();
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState(null);
  const [urlCount, setUrlCount] = useState(0);
  const [shareUrl, setShareUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [skillLevel, setSkillLevel] = useState('all');
  const DOCS_URL = 'https://webiu-docs.vercel.app/';
  const REPO_URL = 'https://github.com/Bhav-ikkk/Webiu_Github';

  const openExternal = useCallback((url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  // Load from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('data');
    if (encoded) {
      try {
        const decoded = JSON.parse(atob(encoded));
        if (decoded.results && decoded.summary) {
          setResults(decoded.results);
          setSummary(decoded.summary);
          toast.success('Loaded shared analysis');
        }
      } catch {
        // Invalid data, ignore
      }
    }
  }, []);

  const handleAnalyze = async (urls) => {
    setIsLoading(true);
    setUrlCount(urls.length);
    setResults([]);
    setSummary(null);
    setShareUrl(null);
    try {
      const { data } = await apiClient.post('/api/analyze', { urls });
      if (data.success) {
        setResults(data.data);
        setSummary(data.summary);
        setRateLimit(data.rateLimit);
        const successCount = data.data.filter((r) => !r.error).length;
        toast.success(`Analyzed ${successCount} repositories`);
      }
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to analyze';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = useCallback(() => {
    if (!results.length) return;
    const shareData = {
      results: results.filter(r => !r.error).map(r => ({
        name: r.name,
        url: r.url,
        metrics: { stars: r.metrics.stars, forks: r.metrics.forks },
        activityScore: { total: r.activityScore.total },
        complexityScore: { total: r.complexityScore.total },
        difficulty: r.difficulty,
      })),
      summary: {
        totalAnalyzed: summary.totalAnalyzed,
        successCount: summary.successCount,
        averageActivity: summary.averageActivity,
        averageComplexity: summary.averageComplexity,
        difficultyDistribution: summary.difficultyDistribution,
      },
    };
    const encoded = btoa(JSON.stringify(shareData));
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    setShareUrl(url);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Share link copied to clipboard');
  }, [results, summary]);

  const handleExportJSON = useCallback(() => {
    if (!results.length) return;
    const report = {
      generatedAt: new Date().toISOString(),
      summary,
      repositories: results,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repo-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as JSON');
  }, [results, summary]);

  const handleExportCSV = useCallback(() => {
    if (!results.length) return;
    const successful = results.filter((r) => !r.error);
    if (!successful.length) return;
    const headers = ['Repository', 'Stars', 'Forks', 'Activity', 'Complexity', 'Difficulty'];
    const rows = successful.map((r) => [
      r.name,
      r.metrics.stars,
      r.metrics.forks,
      r.activityScore.total,
      r.complexityScore.total,
      r.difficulty.level,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repo-analysis-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as CSV');
  }, [results]);

  const handleCopyMarkdown = useCallback(() => {
    if (!results.length) return;
    const successful = results.filter((r) => !r.error);
    if (!successful.length) return;
    let md = `# Repository Analysis Report\n\n`;
    md += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    md += `| Repository | Stars | Activity | Complexity | Difficulty |\n`;
    md += `|------------|-------|----------|------------|------------|\n`;
    successful.forEach((r) => {
      md += `| [${r.name}](${r.url}) | ${r.metrics.stars.toLocaleString()} | ${r.activityScore.total} | ${r.complexityScore.total} | ${r.difficulty.level} |\n`;
    });
    navigator.clipboard.writeText(md);
    toast.success('Markdown copied to clipboard');
  }, [results]);

  // Filter results by skill level
  const filteredResults = results.filter(r => {
    if (r.error) return true;
    if (skillLevel === 'all') return true;
    return r.difficulty.level.toLowerCase() === skillLevel;
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => openExternal(REPO_URL)}
            className="flex items-center gap-3 rounded-md p-1 -m-1 hover:bg-[var(--muted)] transition-colors"
            aria-label="Open project GitHub repository"
          >
            <Github className="h-8 w-8" />
            <div>
              <h1 className="font-semibold text-lg leading-tight">Repository Analyzer</h1>
              <p className="text-xs text-[var(--muted-foreground)]">Analyze GitHub repos for GSoC</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openExternal(DOCS_URL)}
              className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-3 py-1.5 rounded-md hover:bg-[var(--muted)] transition-colors"
              aria-label="Open documentation"
            >
              <BookOpen className="h-4 w-4" />
              Docs
            </button>
            <button
              type="button"
              onClick={() => openExternal(REPO_URL)}
              className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-3 py-1.5 rounded-md hover:bg-[var(--muted)] transition-colors"
              aria-label="Open GitHub repository"
            >
              <Github className="h-4 w-4" />
              GitHub
            </button>
            {rateLimit && (
              <span className={`text-xs px-2 py-1 rounded-md ${
                rateLimit.remaining < 100 ? 'bg-[var(--warning-muted)] text-[var(--warning)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
              }`}>
                {rateLimit.remaining.toLocaleString()}/{rateLimit.limit.toLocaleString()}
              </span>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-[var(--muted)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* Hero section - simple and clean */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Analyze GitHub Repositories
          </h2>
          <p className="text-[var(--muted-foreground)]">
            Get activity scores, complexity metrics, and difficulty ratings to find the right open source project for your skill level.
          </p>
        </div>

        {/* Form */}
        <div className="mb-8">
          <RepoForm onSubmit={handleAnalyze} isLoading={isLoading} />
        </div>

        {/* Loading */}
        {isLoading && <LoadingState count={urlCount} />}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="space-y-6">
            {/* Actions bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--muted-foreground)]">Filter by difficulty:</span>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="form-control text-sm py-1 px-2 w-auto"
                >
                  <option value="all">All levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={handleShare} className="btn btn-secondary btn-sm">
                  {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Share'}
                </button>
                <button onClick={handleExportJSON} className="btn btn-secondary btn-sm">
                  <FileJson className="h-4 w-4" />
                  JSON
                </button>
                <button onClick={handleExportCSV} className="btn btn-secondary btn-sm">
                  <Download className="h-4 w-4" />
                  CSV
                </button>
                <button onClick={handleCopyMarkdown} className="btn btn-secondary btn-sm">
                  <Copy className="h-4 w-4" />
                  Markdown
                </button>
              </div>
            </div>

            {/* Share URL display */}
            {shareUrl && (
              <div className="p-3 bg-[var(--accent)] border border-[var(--primary)] rounded-md">
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="h-4 w-4 text-[var(--primary)]" />
                  <span className="text-[var(--primary)] font-medium">Share link:</span>
                  <code className="flex-1 text-xs bg-[var(--muted)] px-2 py-1 rounded truncate">
                    {shareUrl}
                  </code>
                </div>
              </div>
            )}

            {/* Summary */}
            <SummaryCard summary={summary} />

            {/* Recommendations */}
            <Recommendations results={results} skillLevel={skillLevel} />

            {/* Results Table */}
            <div className="Box">
              <div className="Box-header">
                <h3 className="font-semibold">
                  Analysis Results
                  <span className="ml-2 counter">{filteredResults.filter(r => !r.error).length}</span>
                </h3>
              </div>
              <ResultsTable results={filteredResults} />
            </div>

            {/* Detailed Cards */}
            <div>
              <h3 className="font-semibold mb-4">Detailed Breakdown</h3>
              <div className="space-y-4">
                {filteredResults.map((repo, idx) => (
                  <RepoCard key={repo.url || idx} repo={repo} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && results.length === 0 && (
          <div className="blankslate Box">
            <Github className="h-12 w-12 blankslate-icon mx-auto" />
            <h3 className="blankslate-heading">No repositories analyzed yet</h3>
            <p className="blankslate-description">
              Enter GitHub repository URLs above to analyze their activity, complexity, and get difficulty recommendations for your skill level.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 mt-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Built with Next.js, Octokit & Tailwind CSS
          </p>
          <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="link hover:text-[var(--foreground)]">
              GitHub
            </a>
            <span>•</span>
            <span>GSoC 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
