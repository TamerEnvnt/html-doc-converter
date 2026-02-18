/**
 * Platform Detection Utilities
 *
 * Cross-platform utilities for detecting OS and normalizing paths.
 */

import * as path from 'path';
import { verbose } from './logger.js';

// ============================================================================
// Types
// ============================================================================

export type Platform = 'darwin' | 'linux' | 'win32';

// ============================================================================
// Platform Detection
// ============================================================================

/**
 * Get the current platform identifier
 */
export function getPlatform(): Platform {
  const p = process.platform;
  if (p === 'darwin' || p === 'linux' || p === 'win32') {
    return p;
  }
  verbose('Unknown platform:', p, '- falling back to linux');
  return 'linux';
}

/**
 * Check if running on Windows
 */
export function isWindows(): boolean {
  return process.platform === 'win32';
}

/**
 * Check if running on macOS
 */
export function isMacOS(): boolean {
  return process.platform === 'darwin';
}

/**
 * Check if running on Linux
 */
export function isLinux(): boolean {
  return process.platform === 'linux';
}

// ============================================================================
// Path Utilities
// ============================================================================

/**
 * Normalize a file path for the current platform.
 * Handles Windows path separators and drive letters.
 */
export function normalizePath(p: string): string {
  return path.normalize(p);
}

/**
 * Convert a path to use forward slashes (for display or URL purposes)
 */
export function toForwardSlashes(p: string): string {
  return p.replace(/\\/g, '/');
}

/**
 * Get the platform-specific path separator
 */
export function getPathSeparator(): string {
  return path.sep;
}

/**
 * Join paths using platform-appropriate separator
 */
export function joinPaths(...paths: string[]): string {
  return path.join(...paths);
}

/**
 * Resolve a path to an absolute path
 */
export function resolvePath(p: string): string {
  return path.resolve(p);
}

// ============================================================================
// Platform Name (Human-readable)
// ============================================================================

/**
 * Get human-readable platform name
 */
export function getPlatformName(): string {
  switch (process.platform) {
    case 'darwin':
      return 'macOS';
    case 'linux':
      return 'Linux';
    case 'win32':
      return 'Windows';
    default:
      return process.platform;
  }
}
