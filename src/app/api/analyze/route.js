import { NextResponse } from 'next/server';
import { analyzeRepositories } from '@/services/analyzer.service';
import { MAX_REPOS_PER_REQUEST } from '@/lib/constants';

const GITHUB_URL_PATTERN = /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;

function sanitizeUrl(url) {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!GITHUB_URL_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body.' },
        { status: 400 }
      );
    }

    const { urls } = body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please provide an array of GitHub repository URLs.' },
        { status: 400 }
      );
    }

    if (urls.length > MAX_REPOS_PER_REQUEST) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_REPOS_PER_REQUEST} repositories per request.` },
        { status: 400 }
      );
    }

    const sanitized = urls.map(sanitizeUrl);
    const invalid = sanitized.findIndex((u) => u === null);
    if (invalid !== -1) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid GitHub URL at position ${invalid + 1}: "${String(urls[invalid]).slice(0, 100)}". Expected format: https://github.com/owner/repo`,
        },
        { status: 400 }
      );
    }

    const results = await analyzeRepositories(sanitized);

    return NextResponse.json({
      success: true,
      data: results.repositories,
      summary: results.summary,
      rateLimit: results.rateLimit,
    });
  } catch (error) {
    if (error.status === 429) {
      return NextResponse.json(
        { success: false, error: error.message || 'GitHub API rate limit exceeded.' },
        { status: 429 }
      );
    }
    console.error('[analyze] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
