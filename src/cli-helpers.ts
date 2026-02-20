/**
 * CLI Validation Helpers
 *
 * Extracted from cli.ts for testability. Pure validation logic with no side effects.
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { createError, ErrorCodes } from './utils/errors.js';
import { DEFAULT_TIMEOUT_MS } from './utils/constants.js';

/**
 * Determine which output formats to generate based on CLI options.
 */
export function determineFormats(options: {
  pdfOnly?: boolean;
  docxOnly?: boolean;
  format?: string;
}): { generatePDF: boolean; generateDOCX: boolean } {
  let generatePDF = true;
  let generateDOCX = true;

  if (options.pdfOnly) {
    generateDOCX = false;
  } else if (options.docxOnly) {
    generatePDF = false;
  } else if (options.format) {
    generatePDF = options.format === 'pdf' || options.format === 'both';
    generateDOCX = options.format === 'docx' || options.format === 'both';
  }

  if (!generatePDF && !generateDOCX) {
    throw createError(ErrorCodes.INVALID_FORMAT, `invalid format '${options.format}', expected: pdf, docx, or both`);
  }

  return { generatePDF, generateDOCX };
}

/**
 * Parse and validate the timeout string from CLI options.
 * Returns the validated timeout in milliseconds.
 * Throws ConversionError(INVALID_TIMEOUT) for invalid values.
 */
export function parseTimeout(timeoutStr: string | undefined): number {
  const timeoutRaw = parseInt(timeoutStr || String(DEFAULT_TIMEOUT_MS), 10);
  if (isNaN(timeoutRaw) || timeoutRaw <= 0) {
    throw createError(ErrorCodes.INVALID_TIMEOUT, timeoutStr || 'undefined');
  }
  return timeoutRaw;
}

/**
 * Validate that the input file exists, is HTML, and has content.
 * Returns file metadata for downstream use.
 */
export async function validateInputFile(inputPath: string): Promise<{
  fileSize: number;
  content: string;
  isLargeFile: boolean;
}> {
  const LARGE_FILE_THRESHOLD = 1_000_000; // 1MB

  // 1. Check it's an HTML file (pure validation, no I/O)
  const ext = path.extname(inputPath).toLowerCase();
  if (ext !== '.html' && ext !== '.htm') {
    throw createError(ErrorCodes.INVALID_FORMAT, `expected .html or .htm, got ${ext}`);
  }

  // 2. Read file (single I/O operation - no TOCTOU)
  let content: string;
  try {
    content = await fs.readFile(inputPath, 'utf-8');
  } catch (err) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw createError(ErrorCodes.INPUT_NOT_FOUND, inputPath);
    }
    throw err; // Permission errors, etc. propagate as-is
  }

  // 3. Validate content
  if (!content || !content.trim()) {
    throw createError(ErrorCodes.EMPTY_INPUT);
  }

  // 4. Derive size from content
  const fileSize = Buffer.byteLength(content, 'utf-8');
  const isLargeFile = fileSize > LARGE_FILE_THRESHOLD;

  return { fileSize, content, isLargeFile };
}
