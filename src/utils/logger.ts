/**
 * Logger Utility
 *
 * Provides verbose logging support for debugging and progress tracking.
 */

import { colors } from './errors.js';

// ============================================================================
// State
// ============================================================================

let verboseMode = false;

// ============================================================================
// Configuration
// ============================================================================

/**
 * Enable or disable verbose logging
 */
export function setVerbose(enabled: boolean): void {
  verboseMode = enabled;
}

// ============================================================================
// Logging Functions
// ============================================================================

/**
 * Log a verbose message (only shown in verbose mode)
 */
export function verbose(...args: unknown[]): void {
  if (verboseMode) {
    console.log(colors.dim('  [verbose]'), ...args);
  }
}
