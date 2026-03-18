import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with conflict resolution
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Parse a GitHub URL and extract owner/repo
 * @param {string} url - GitHub repository URL
 * @returns {{ owner: string, repo: string } | null}
 */
export function parseGitHubUrl(url) {
  try {
    const trimmed = url.trim();
    const parsed = new URL(trimmed);
    if (parsed.hostname !== 'github.com') return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return {
      owner: parts[0],
      repo: parts[1].replace(/\.git$/, ''),
    };
  } catch {
    return null;
  }
}

/**
 * Logarithmic normalization for power-law distributed metrics
 *
 * Used for: stars, forks, contributors, file count
 *
 * Why logarithmic?
 * - Stars/forks follow power-law distribution (few repos have millions, most have few)
 * - The difference between 0 and 100 stars is more significant than 100k to 100.1k
 * - log10 smooths out the extreme values while preserving relative differences
 *
 * Formula: log10(value + 1) / log10(cap + 1)
 * - Adding 1 handles zero values (log(0) is undefined)
 * - Dividing by log(cap) normalizes to [0, 1] range
 *
 * @param {number} value - Raw metric value
 * @param {number} cap - Maximum expected value (100% threshold)
 * @returns {number} Normalized value in [0, 1]
 */
export function logNormalize(value, cap) {
  if (value <= 0) return 0;
  if (cap <= 0) return 0;
  return Math.min(Math.log10(value + 1) / Math.log10(cap + 1), 1);
}

/**
 * Linear normalization for bounded metrics
 *
 * Used for: commits (bounded by time), dependencies
 *
 * Why linear?
 * - These metrics have natural upper bounds
 * - Each additional unit has roughly equal significance
 *
 * Formula: value / cap, clamped to [0, 1]
 *
 * @param {number} value - Raw metric value
 * @param {number} cap - Maximum expected value (100% threshold)
 * @returns {number} Normalized value in [0, 1]
 */
export function linearNormalize(value, cap) {
  if (value <= 0) return 0;
  if (cap <= 0) return 0;
  return Math.min(value / cap, 1);
}

/**
 * Square root normalization for diminishing returns metrics
 *
 * Used for: language count
 *
 * Why square root?
 * - Going from 1 to 2 languages is a bigger jump than 8 to 9
 * - Captures diminishing complexity returns of additional languages
 *
 * Formula: sqrt(value) / sqrt(cap)
 *
 * @param {number} value - Raw metric value
 * @param {number} cap - Maximum expected value (100% threshold)
 * @returns {number} Normalized value in [0, 1]
 */
export function sqrtNormalize(value, cap) {
  if (value <= 0) return 0;
  if (cap <= 0) return 0;
  return Math.min(Math.sqrt(value) / Math.sqrt(cap), 1);
}

/**
 * Format large numbers for display (e.g., 1.5k, 2.3M)
 * @param {number} num - Number to format
 * @returns {string} Formatted string
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'k';
  return num.toString();
}

/**
 * Round to specified decimal places
 * @param {number} value - Number to round
 * @param {number} decimals - Decimal places (default: 1)
 * @returns {number} Rounded value
 */
export function round(value, decimals = 1) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Safely get a number with a default fallback
 * Handles null, undefined, NaN
 * @param {any} value - Value to check
 * @param {number} defaultValue - Fallback value
 * @returns {number}
 */
export function safeNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return defaultValue;
  }
  return Number(value);
}
