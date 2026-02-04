/**
 * Custom Error Types and Handling
 *
 * Provides structured errors with codes and suggestions for actionable feedback.
 */

// ============================================================================
// ANSI Colors for Terminal Output
// ============================================================================

const supportsColor = process.stdout.isTTY && process.env.NO_COLOR === undefined;

export const colors = {
  red: (s: string): string => supportsColor ? `\x1b[31m${s}\x1b[0m` : s,
  green: (s: string): string => supportsColor ? `\x1b[32m${s}\x1b[0m` : s,
  yellow: (s: string): string => supportsColor ? `\x1b[33m${s}\x1b[0m` : s,
  blue: (s: string): string => supportsColor ? `\x1b[34m${s}\x1b[0m` : s,
  dim: (s: string): string => supportsColor ? `\x1b[2m${s}\x1b[0m` : s,
  bold: (s: string): string => supportsColor ? `\x1b[1m${s}\x1b[0m` : s,
};

// ============================================================================
// Error Codes
// ============================================================================

/**
 * Error codes for different conversion failure scenarios.
 */
export const ErrorCodes = {
  INPUT_NOT_FOUND: 'INPUT_NOT_FOUND',
  INVALID_FORMAT: 'INVALID_FORMAT',
  EMPTY_INPUT: 'EMPTY_INPUT',
  LIBREOFFICE_MISSING: 'LIBREOFFICE_MISSING',
  OUTPUT_DIR_FAILED: 'OUTPUT_DIR_FAILED',
  PDF_FAILED: 'PDF_FAILED',
  DOCX_FAILED: 'DOCX_FAILED',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Custom error class for conversion errors with helpful suggestions.
 */
export class ConversionError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly suggestion?: string
  ) {
    super(message);
    this.name = 'ConversionError';

    // Maintain proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConversionError);
    }
  }
}

/**
 * Format an error for display with optional suggestion (with colors).
 */
export function formatError(error: ConversionError | Error): string {
  if (error instanceof ConversionError) {
    const errorPrefix = colors.red('Error');
    const codeText = colors.dim(`[${error.code}]`);
    let msg = `${errorPrefix} ${codeText}: ${error.message}`;
    if (error.suggestion) {
      const suggestionLabel = colors.yellow('Suggestion:');
      msg += `\n  ${suggestionLabel} ${error.suggestion}`;
    }
    return msg;
  }

  return `${colors.red('Error')}: ${error.message}`;
}

/**
 * Create a ConversionError for common scenarios with pre-defined suggestions.
 */
export function createError(
  code: ErrorCode,
  detail?: string
): ConversionError {
  switch (code) {
    case ErrorCodes.INPUT_NOT_FOUND:
      return new ConversionError(
        `Input file not found: ${detail || 'unknown'}`,
        code,
        'Check the file path and ensure the file exists.'
      );

    case ErrorCodes.INVALID_FORMAT:
      return new ConversionError(
        `Invalid file format: ${detail || 'expected .html or .htm'}`,
        code,
        'Provide an HTML file (.html or .htm) as input.'
      );

    case ErrorCodes.LIBREOFFICE_MISSING:
      return new ConversionError(
        'LibreOffice not found on this system.',
        code,
        'Install LibreOffice (https://www.libreoffice.org/download/) or use --pdf-only to skip DOCX generation.'
      );

    case ErrorCodes.OUTPUT_DIR_FAILED:
      return new ConversionError(
        `Cannot create output directory: ${detail || 'unknown'}`,
        code,
        'Check write permissions for the output directory.'
      );

    case ErrorCodes.PDF_FAILED:
      return new ConversionError(
        `PDF generation failed: ${detail || 'unknown error'}`,
        code,
        'Check that the HTML file is valid and try again.'
      );

    case ErrorCodes.DOCX_FAILED:
      return new ConversionError(
        `DOCX conversion failed: ${detail || 'unknown error'}`,
        code,
        'Ensure LibreOffice is properly installed and the HTML is valid.'
      );

    case ErrorCodes.EMPTY_INPUT:
      return new ConversionError(
        'Input HTML file is empty or contains only whitespace.',
        code,
        'Provide an HTML file with actual content to convert.'
      );

    case ErrorCodes.TIMEOUT:
      return new ConversionError(
        `Operation timed out: ${detail || 'conversion took too long'}`,
        code,
        'Try with a smaller file or increase the timeout with --timeout option.'
      );

    default:
      return new ConversionError(
        detail || 'An unknown error occurred.',
        ErrorCodes.UNKNOWN,
        'Please report this issue with details.'
      );
  }
}
