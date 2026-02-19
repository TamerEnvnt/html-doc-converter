/**
 * Platform Detection Utilities
 *
 * Cross-platform utilities for detecting OS.
 */

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
