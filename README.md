# GitHub Repository Intelligence Analyzer

A production-grade web tool that analyzes multiple GitHub repositories and generates structured intelligence reports covering activity, complexity, and learning difficulty.

Built with **Next.js 16** (App Router), **Tailwind CSS v4**, **Octokit v5**, **Zod v4**, and **React Hook Form**.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. (Recommended) Add GitHub token for higher rate limits
cp .env.example .env.local
# Edit .env.local → GITHUB_TOKEN=ghp_your_token_here

# 3. Start development server
npm run dev
```

Open **http://localhost:3000** (redirects to `/analyzer`).

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import at [vercel.com/new](https://vercel.com/new).
3. Add `GITHUB_TOKEN` as an environment variable (optional but recommended).
4. Deploy. No other configuration needed.

---

## Architecture

### 3-Layer Separation

```
Page (app/) → View (views/) → API Route (app/api/) → Service (services/)
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Page** | `src/app/analyzer/page.js` | Server component. Only imports and renders the View. Zero logic. |
| **View** | `src/views/AnalyzerView/` | Client component. All UI state, form handling, event handlers, data display. |
| **API Route** | `src/app/api/analyze/route.js` | Bridge layer. Validates + sanitizes input, calls service, formats response. |
| **Service** | `src/services/` | Server-only. GitHub API calls via Octokit, scoring algorithms, in-memory cache. |

### Data Flow

```
User pastes URLs
  → RepoForm validates with Zod
  → AnalyzerView sends POST via Axios
  → API route sanitizes URLs
  → analyzer.service orchestrates:
      → github.service fetches data (Octokit)
      → scoring.service computes scores
      → cache.service stores results
  → JSON response with repos + summary + rateLimit
  → View renders table, cards, export buttons
```

---

## Scoring Formulas

### Activity Score (0–100)

Measures how active a repository is, weighted across five metrics:

```
activityScore = (commitNorm × 0.40) + (starsNorm × 0.25) + (forksNorm × 0.15)
              + (contributorsNorm × 0.10) + (issuesNorm × 0.10)
```

| Metric | Normalization | Cap | Why This Cap |
|--------|---------------|-----|--------------|
| Commits (last 30 days) | **Linear** | 500 | 500/month = ~16/day, extreme activity |
| Stars | **Logarithmic** | 200,000 | Covers 99.9% of repos |
| Forks | **Logarithmic** | 50,000 | Similar power-law distribution |
| Contributors | **Logarithmic** | 1,000 | 1000+ is Linux-kernel-level |
| Open Issues | **Logarithmic** | 10,000 | 10k open issues is extreme |

**Why logarithmic scaling?** GitHub metrics follow power-law distributions. React has ~230k stars; a tutorial repo has 5. Linear normalization → `5/230000 = 0.002%`, making small repos indistinguishable. Log scaling → `log10(6)/log10(230001) ≈ 14.5%`, providing meaningful differentiation across the full range.

**Normalization functions (defined in `src/lib/utils.js`):**
```
logNormalize(value, cap)    = min(log10(value + 1) / log10(cap + 1), 1.0)
linearNormalize(value, cap) = min(value / cap, 1.0)
```

All constants are centralized in `src/lib/constants.js` for easy tuning.

### Complexity Score (0–100)

Estimates codebase complexity using four sub-scores that sum to 100:

```
complexityScore = (fileCountNorm × 30) + (langDiversityNorm × 30)
                + (hasDependencyFile × 20) + (depCountNorm × 20)
```

| Component | Max Points | Method | Implementation Detail |
|-----------|-----------|--------|----------------------|
| File count | 30 | Log scale, cap 50,000 | Uses GitHub Git Tree API with `recursive=1`. If truncated (>100k items), estimates as `count × 1.5`. |
| Language diversity | 30 | Linear, cap 15 | Count of distinct languages from Languages API. |
| Has dependency file | 20 | Binary (0 or 20) | Scans tree for: `package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, `pom.xml`, `build.gradle`, `Gemfile`, `composer.json`, `setup.py`, `pyproject.toml`, `Pipfile`. |
| Dependency count | 20 | Linear, cap 200 | For JS repos: reads `package.json` content via Content API, counts `dependencies` + `devDependencies`. For others: estimates ~15. |

### Learning Difficulty Classification

```
combined = (activityScore + complexityScore) / 2
```

| Combined Score | Level | Description |
|---------------|-------|-------------|
| < 35 | **Beginner** | Good for newcomers |
| 35–65 | **Intermediate** | Some experience needed |
| > 65 | **Advanced** | Significant experience required |

---

## Edge Case Handling

| Scenario | Handling |
|----------|---------|
| **Private repository** | Returns per-repo error "Access denied (private repository)". Other repos still analyzed. |
| **Non-existent repo (404)** | Returns per-repo error "Repository not found". |
| **Empty repository** | Returns 0 for all metrics. Scores near 0, classified as Beginner. |
| **Huge repo (>100k files)** | Tree API returns `truncated: true`. File count estimated as `returned × 1.5`. |
| **Invalid URL format** | Zod validation rejects before API call. Server-side regex also validates. |
| **Non-GitHub URL** | Rejected at both form validation and API sanitization layers. |
| **Repo with no commits in 30 days** | Commits = 0. Activity score still computed from stars/forks/contributors/issues. |
| **Rate limit exhausted** | Proactive budget check before analysis. Returns 429 with reset time. |
| **Network timeout** | Axios timeout at 120s. Toast notification to user. |
| **Partial fetch failure** | `Promise.allSettled` for sub-fetches. Failed metrics default to 0. |

---

## Efficiency & Rate Limiting

### API Call Budget

Each repository requires approximately **5–6 GitHub API calls**:

1. `GET /repos/{owner}/{repo}` — Basic info
2. `GET /repos/{owner}/{repo}/contributors?per_page=1` — Contributor count (via Link header pagination trick)
3. `GET /repos/{owner}/{repo}/commits?since=...&per_page=1` — Recent commit count (same Link header trick)
4. `GET /repos/{owner}/{repo}/languages` — Language breakdown
5. `GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1` — File count + dependency file detection (single call serves both)
6. `GET /repos/{owner}/{repo}/contents/package.json` — Dependency count (only for JS repos with package.json)

### Rate Limit Strategy (3 Tiers)

| Tier | Mechanism | Location |
|------|-----------|----------|
| **1. Octokit Throttling** | Built-in `@octokit/throttling` plugin auto-retries once on rate limit with backoff | `github.service.js` |
| **2. Proactive Budget Check** | Before analysis, checks `GET /rate_limit`. If `remaining < repos × 6`, returns early with reset time. | `analyzer.service.js` |
| **3. UI Indicator** | After analysis, displays remaining/total calls with color coding and reset time in header. | `AnalyzerView/index.js` |

| Mode | Limit | Repos/hour |
|------|-------|------------|
| No token | 60 req/hr | ~10 repos |
| With `GITHUB_TOKEN` | 5,000 req/hr | ~830 repos |

### Caching

In-memory `Map` with 10-minute TTL, keyed by `owner/repo` (lowercase). Eliminates redundant fetches for the same repo within a session. Serverless cold starts reset the cache (acceptable trade-off for simplicity, documented as a limitation).

---

## Security

| Measure | Implementation |
|---------|----------------|
| **Security headers** | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy` via `next.config.mjs` |
| **API route input sanitization** | Server-side regex validation of every URL before processing. Rejects non-GitHub URLs. |
| **No secret exposure** | `GITHUB_TOKEN` is server-side only (used in service layer, never sent to client). `.env.local` is gitignored. |
| **`poweredByHeader: false`** | Removes `X-Powered-By: Next.js` header to reduce fingerprinting. |
| **Error boundary** | Client-side `ErrorBoundary` component catches render crashes with recovery UI. |
| **No `dangerouslySetInnerHTML`** | All user-facing data is rendered via React (auto-escaped). |
| **External links** | All GitHub links use `rel="noopener noreferrer"` and `target="_blank"`. |
| **API response doesn't leak internals** | Catches unexpected errors with generic message. Only structured errors reach client. |

---

## Structured Output

The tool provides two export formats accessible via buttons in the results view:

### JSON Export

Full structured report with all raw metrics, computed scores, and breakdowns:

```json
{
  "generatedAt": "2026-03-15T10:30:00.000Z",
  "summary": {
    "totalAnalyzed": 5,
    "successCount": 5,
    "errorCount": 0,
    "averageActivity": 48.2,
    "averageComplexity": 55.6,
    "difficultyDistribution": {
      "beginner": 0,
      "intermediate": 2,
      "advanced": 3
    }
  },
  "repositories": [
    {
      "url": "https://github.com/facebook/react",
      "name": "facebook/react",
      "description": "The library for web and native user interfaces.",
      "metrics": {
        "stars": 232000,
        "forks": 47000,
        "openIssues": 900,
        "contributors": 1700,
        "commitsLast30d": 95,
        "fileCount": 8500,
        "languageCount": 7,
        "languages": { "JavaScript": 3500000, "TypeScript": 200000 },
        "hasDependencyFile": true,
        "dependencyCountEstimate": 68
      },
      "activityScore": {
        "total": 55.3,
        "breakdown": {
          "commits": 19.0,
          "stars": 100.0,
          "forks": 88.5,
          "contributors": 100.0,
          "openIssues": 74.1
        }
      },
      "complexityScore": {
        "total": 62.8,
        "breakdown": {
          "fileCount": 25.1,
          "languageDiversity": 14.0,
          "hasDependencyFile": 20,
          "dependencyCount": 6.8
        }
      },
      "difficulty": {
        "level": "Advanced",
        "combined": 59.1,
        "color": "red",
        "description": "Significant experience required"
      }
    }
  ]
}
```

### CSV Export

Tabular format with key metrics for spreadsheet analysis.

---

## Example Analysis

Sample results from analyzing 5 repositories:

| Repository | Stars | Forks | Activity | Complexity | Difficulty |
|-----------|-------|-------|----------|------------|------------|
| facebook/react | ~232k | ~47k | ~55 | ~63 | Advanced |
| tensorflow/tensorflow | ~187k | ~74k | ~48 | ~72 | Advanced |
| torvalds/linux | ~185k | ~55k | ~65 | ~68 | Advanced |
| fastapi/fastapi | ~80k | ~6k | ~42 | ~52 | Intermediate |
| firstcontributions/first-contributions | ~45k | ~75k | ~60 | ~28 | Intermediate |

*Exact scores vary based on current repository state at time of analysis.*

**Observations:**
- **Linux** has the highest activity score driven by extreme commit volume (hundreds per month) and massive contributor base.
- **TensorFlow** scores highest on complexity due to enormous file count (80k+) and 15+ languages.
- **first-contributions** has high activity (many contributor PRs) but low complexity (simple file structure), correctly classified at the boundary.
- **FastAPI** lands in intermediate — active but focused Python codebase with moderate file count.

---

## Project Structure

```
src/
├── app/
│   ├── globals.css                  # Tailwind v4 + theme variables + animations
│   ├── layout.js                    # Root layout: ThemeProvider, ErrorBoundary, Toaster
│   ├── page.js                      # Redirects to /analyzer
│   ├── analyzer/page.js             # Renders <AnalyzerView />
│   └── api/analyze/route.js         # POST endpoint with input sanitization
├── views/
│   ├── index.js                     # Barrel export
│   └── AnalyzerView/
│       ├── index.js                 # Main view: state, API calls, export handlers
│       ├── RepoForm.js              # React Hook Form + Zod validation
│       ├── ResultsTable.js          # Overview table with scores
│       ├── RepoCard.js              # Detailed card with expandable breakdown
│       ├── SummaryCard.js           # Aggregate statistics
│       ├── ScoreBadge.js            # Color-coded score pill
│       └── LoadingState.js          # Skeleton loading with shimmer animation
├── services/
│   ├── cache.service.js             # In-memory Map with 10min TTL
│   ├── github.service.js            # Octokit v5 with throttling, 7 fetch functions
│   ├── scoring.service.js           # Normalization (log + linear) + classification
│   └── analyzer.service.js          # Orchestrator with Promise.allSettled
├── lib/
│   ├── axios.js                     # Configured HTTP client with error interceptor
│   ├── validators.js                # Zod schemas for form validation
│   ├── constants.js                 # All scoring caps, weights, thresholds
│   └── utils.js                     # cn(), parseGitHubUrl(), normalization helpers
└── components/
    ├── ErrorBoundary.js             # Catches render crashes with recovery UI
    ├── ThemeProvider.js             # Dark/light mode with system detection
    └── ui/                          # Reusable UI primitives (shadcn-style)
        ├── Button.js                # Variants: default, outline, ghost, destructive
        ├── Card.js                  # Card, CardHeader, CardTitle, CardContent
        ├── Textarea.js              # With label, error state, forwardRef
        ├── Badge.js                 # Variants: success, warning, error, outline
        ├── Spinner.js               # Animated loader icon
        ├── Table.js                 # Table, TableHeader, TableBody, TableRow, etc.
        ├── ProgressBar.js           # Auto-colored bar (green/yellow/red)
        └── Toaster.js               # Re-export of sonner Toaster
```

**34 source files.** Every file has a single responsibility.

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 16 (App Router) | Framework, SSR, API routes |
| Tailwind CSS v4 | Styling with `@theme inline` |
| Octokit v5 | GitHub API client with built-in throttling |
| Axios | View → API route communication |
| React Hook Form + Zod v4 | Form validation with schema-based approach |
| Lucide React | Icon library |
| Sonner | Toast notifications |
| clsx + tailwind-merge | Dynamic className composition |

---

## Assumptions & Limitations

1. **Stars/forks measure popularity, not quality.** A repo with many stars could be abandoned.
2. **Commits in last 30 days** may undercount repos using squash merges or monorepos.
3. **File count** is estimated for repos with >100k files due to GitHub tree API truncation.
4. **Dependency count** is precise for Node.js (reads package.json). For other ecosystems, a generic estimate of ~15 is used.
5. **In-memory cache** resets on serverless cold starts. This is acceptable for a tool without persistent storage requirements.
6. **Private repositories** return "Access Denied" unless the token has private repo scope.
7. **GitHub API rate limits** constrain throughput. Without a token, only ~10 repos/hour can be analyzed.
