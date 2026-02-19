/**
 * Output Handler Utility
 *
 * Manages output file naming, directory creation, and path resolution.
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { createError, ErrorCodes } from './errors.js';

/**
 * Validate that a resolved path stays within an allowed root directory.
 * Prevents path traversal attacks (e.g., ../../etc/passwd).
 *
 * @param resolvedPath - Absolute path to validate
 * @param allowedRoot - Root directory to restrict to (defaults to cwd)
 * @throws ConversionError with PATH_TRAVERSAL code if outside allowed root
 */
export function validatePath(resolvedPath: string, allowedRoot?: string): void {
  const root = path.normalize(allowedRoot || process.cwd()) + path.sep;
  const normalized = path.normalize(resolvedPath);

  // Allow exact match (the root itself) or child paths
  if (normalized !== root.slice(0, -1) && !normalized.startsWith(root)) {
    throw createError(ErrorCodes.PATH_TRAVERSAL, resolvedPath);
  }
}

export interface OutputPaths {
  readonly pdf: string;
  readonly docx: string;
  readonly baseName: string;
  readonly outputDir: string;
}

/**
 * Resolve output paths from input path and optional output option.
 *
 * Handles:
 * - Absolute and relative paths
 * - Paths with or without extensions
 * - Default to input filename in same directory
 */
export function resolveOutputPaths(
  inputPath: string,
  outputOption?: string
): OutputPaths {
  // Resolve input to absolute path
  const absoluteInput = path.resolve(inputPath);

  let basePath: string;

  if (outputOption) {
    // Output specified: resolve and use as base
    const absoluteOutput = path.resolve(outputOption);

    // Remove extension if provided
    const ext = path.extname(absoluteOutput);
    if (ext === '.pdf' || ext === '.docx') {
      basePath = absoluteOutput.slice(0, -ext.length);
    } else {
      basePath = absoluteOutput;
    }
  } else {
    // Not specified: use input filename in same directory
    const inputDir = path.dirname(absoluteInput);
    const inputBasename = path.basename(absoluteInput, path.extname(absoluteInput));
    basePath = path.join(inputDir, inputBasename);
  }

  const outputDir = path.dirname(basePath);
  const baseName = path.basename(basePath);

  return {
    pdf: `${basePath}.pdf`,
    docx: `${basePath}.docx`,
    baseName,
    outputDir,
  };
}

/**
 * Ensure output directory exists, creating it recursively if needed.
 */
export async function ensureOutputDirectory(dirPath: string): Promise<void> {
  // Single atomic call: recursive mkdir is idempotent (no error if dir exists)
  // Avoids TOCTOU race between access() check and mkdir() call
  await fs.mkdir(dirPath, { recursive: true });
}

