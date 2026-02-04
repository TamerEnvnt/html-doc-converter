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

/**
 * Check if verbose mode is enabled
 */
export function isVerbose(): boolean {
  return verboseMode;
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

/**
 * Log an info message (always shown)
 */
export function info(...args: unknown[]): void {
  console.log(...args);
}

/**
 * Log an error message (always shown)
 */
export function error(...args: unknown[]): void {
  console.error(...args);
}

/**
 * Log a warning message (always shown)
 */
export function warn(...args: unknown[]): void {
  console.warn(colors.yellow('Warning:'), ...args);
}

/**
 * Log a success message (always shown)
 */
export function success(...args: unknown[]): void {
  console.log(colors.green('Success:'), ...args);
}

/**
 * Log a debug message with timestamp (only in verbose mode)
 */
export function debug(label: string, ...args: unknown[]): void {
  if (verboseMode) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(colors.dim(`  [${timestamp}] ${label}:`), ...args);
  }
}
