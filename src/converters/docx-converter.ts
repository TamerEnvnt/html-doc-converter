/**
 * DOCX Converter Module
 *
 * Converts HTML documents to DOCX using LibreOffice CLI.
 * Produces real document structure (headings, tables, paragraphs) that can be edited in Word.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { parseDocument, ParsedDocument } from '../parsers/html-parser.js';
import { ConversionError, createError, ErrorCodes } from '../utils/errors.js';

const execFileAsync = promisify(execFile);

// ============================================================================
// Types
// ============================================================================

export interface DOCXOptions {
  outputDir?: string;
  preserveStyles?: boolean;
  timeout?: number;
}

export interface DOCXResult {
  outputPath: string;
}

// ============================================================================
// LibreOffice Detection
// ============================================================================

const SOFFICE_PATHS = {
  darwin: [
    '/Applications/LibreOffice.app/Contents/MacOS/soffice',
    '/opt/homebrew/bin/soffice',
  ],
  linux: [
    '/usr/bin/soffice',
    '/usr/lib/libreoffice/program/soffice',
    '/snap/bin/libreoffice',
  ],
  win32: [
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
  ],
};

/**
 * Find the soffice executable path on the current system
 * @returns Path to soffice executable, or null if not found
 */
export async function findSoffice(): Promise<string | null> {
  const platform = process.platform as keyof typeof SOFFICE_PATHS;
  const paths = SOFFICE_PATHS[platform] || [];

  for (const p of paths) {
    try {
      await fs.access(p, fs.constants.X_OK);
      return p;
    } catch {
      continue;
    }
  }

  // Try which/where as fallback
  try {
    const binary = platform === 'win32' ? 'where' : 'which';
    const { stdout } = await execFileAsync(binary, ['soffice']);
    return stdout.trim().split('\n')[0];
  } catch {
    return null;
  }
}

/**
 * Verify that LibreOffice is installed and accessible
 * @returns True if LibreOffice is available
 */
export async function verifyLibreOffice(): Promise<boolean> {
  const sofficePath = await findSoffice();
  return sofficePath !== null;
}

// ============================================================================
// DOCX Conversion
// ============================================================================

/**
 * Convert an HTML file to DOCX using LibreOffice
 * @param htmlPath - Path to the input HTML file
 * @param outputPath - Path for the output DOCX file
 * @param options - Conversion options
 * @returns Object with output path
 * @throws {ConversionError} When LibreOffice is missing or conversion fails
 */
export async function convertToDOCX(
  htmlPath: string,
  outputPath: string,
  options: DOCXOptions = {}
): Promise<DOCXResult> {
  // Find LibreOffice
  const sofficePath = await findSoffice();
  if (!sofficePath) {
    throw createError(ErrorCodes.LIBREOFFICE_MISSING);
  }

  // Resolve paths
  const absoluteHtmlPath = path.resolve(htmlPath);
  const absoluteOutputPath = path.resolve(outputPath);
  const outputDir = options.outputDir || path.dirname(absoluteOutputPath);
  const expectedOutputName = path.basename(htmlPath, path.extname(htmlPath)) + '.docx';

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Build command arguments as array (execFile - no shell interpretation)
  const args = [
    '--headless',
    '--convert-to', 'docx:MS Word 2007 XML',
    '--outdir', outputDir,
    absoluteHtmlPath
  ];

  try {
    // Apply timeout (default 60 seconds)
    const execTimeout = options.timeout || 60000;
    await execFileAsync(sofficePath, args, { timeout: execTimeout });

    // LibreOffice outputs to: outputDir/originalName.docx
    const generatedPath = path.join(outputDir, expectedOutputName);

    // Verify output file was created
    try {
      await fs.access(generatedPath);
    } catch {
      throw createError(ErrorCodes.DOCX_FAILED, 'LibreOffice completed but output file not found: ' + generatedPath);
    }

    // Rename if different output path requested
    if (generatedPath !== absoluteOutputPath) {
      try {
        await fs.rename(generatedPath, absoluteOutputPath);
      } catch (renameError) {
        throw createError(ErrorCodes.DOCX_FAILED, 'Failed to rename output file: ' + (renameError instanceof Error ? renameError.message : String(renameError)));
      }
    }

    return { outputPath: absoluteOutputPath };
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    }
    throw createError(ErrorCodes.DOCX_FAILED, error instanceof Error ? error.message : String(error));
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Convert an HTML file to DOCX with document parsing
 * @param htmlPath - Path to the input HTML file
 * @param outputPath - Path for the output DOCX file
 * @param options - Conversion options
 * @returns Object containing parsed document and DOCX result
 */
export async function convertHTMLFileToDOCX(
  htmlPath: string,
  outputPath: string,
  options?: DOCXOptions
): Promise<{ document: ParsedDocument; docx: DOCXResult }> {
  const document = await parseDocument(htmlPath);
  const docx = await convertToDOCX(htmlPath, outputPath, options);
  return { document, docx };
}
