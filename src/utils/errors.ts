/**
 * Custom Error Types and Handling
 *
 * Provides structured errors with codes and suggestions for actionable feedback.
 */

/**
 * Error codes for different conversion failure scenarios.
 */
export const ErrorCodes = {
  INPUT_NOT_FOUND: 'INPUT_NOT_FOUND',
  INVALID_FORMAT: 'INVALID_FORMAT',
  LIBREOFFICE_MISSING: 'LIBREOFFICE_MISSING',
  OUTPUT_DIR_FAILED: 'OUTPUT_DIR_FAILED',
  PDF_FAILED: 'PDF_FAILED',
  DOCX_FAILED: 'DOCX_FAILED',
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
 * Format an error for display with optional suggestion.
 */
export function formatError(error: ConversionError | Error): string {
  if (error instanceof ConversionError) {
    let msg = `Error [${error.code}]: ${error.message}`;
    if (error.suggestion) {
      msg += `\n  Suggestion: ${error.suggestion}`;
    }
    return msg;
  }

  return `Error: ${error.message}`;
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

    default:
      return new ConversionError(
        detail || 'An unknown error occurred.',
        ErrorCodes.UNKNOWN,
        'Please report this issue with details.'
      );
  }
}
