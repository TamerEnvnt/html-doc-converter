/**
 * CLI Validation Helpers
 *
 * Extracted from cli.ts for testability. Pure validation logic with no side effects.
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { createError, ErrorCodes } from './utils/errors.js';

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
  const timeoutRaw = parseInt(timeoutStr || '60000', 10);
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

  // 1. Check input file exists
  try {
    await fs.access(inputPath);
  } catch {
    throw createError(ErrorCodes.INPUT_NOT_FOUND, inputPath);
  }

  // 2. Check it's an HTML file
  const ext = path.extname(inputPath).toLowerCase();
  if (ext !== '.html' && ext !== '.htm') {
    throw createError(ErrorCodes.INVALID_FORMAT, `expected .html or .htm, got ${ext}`);
  }

  // 3. Check file size and content
  const stats = await fs.stat(inputPath);
  const fileSize = stats.size;

  if (fileSize === 0) {
    throw createError(ErrorCodes.EMPTY_INPUT);
  }

  // Read and verify content is not just whitespace
  const content = await fs.readFile(inputPath, 'utf-8');
  if (!content.trim()) {
    throw createError(ErrorCodes.EMPTY_INPUT);
  }

  // Large file check
  const isLargeFile = fileSize > LARGE_FILE_THRESHOLD;

  return { fileSize, content, isLargeFile };
}
