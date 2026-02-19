/**
 * Terminal Colors Utility
 *
 * ANSI color helpers for terminal output. Respects NO_COLOR environment variable.
 */

const supportsColor = process.stdout.isTTY && process.env.NO_COLOR === undefined;

export const colors = {
  red: (s: string): string => supportsColor ? `\x1b[31m${s}\x1b[0m` : s,
  green: (s: string): string => supportsColor ? `\x1b[32m${s}\x1b[0m` : s,
  yellow: (s: string): string => supportsColor ? `\x1b[33m${s}\x1b[0m` : s,
  blue: (s: string): string => supportsColor ? `\x1b[34m${s}\x1b[0m` : s,
  dim: (s: string): string => supportsColor ? `\x1b[2m${s}\x1b[0m` : s,
  bold: (s: string): string => supportsColor ? `\x1b[1m${s}\x1b[0m` : s,
};
