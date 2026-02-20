/**
 * DOCX Converter Module
 *
 * Converts HTML documents to DOCX using LibreOffice CLI.
 * Produces real document structure (headings, tables, paragraphs) that can be edited in Word.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { parseDocument, ParsedDocument } from '../parsers/html-parser.js';
import { ConversionError, createError, ErrorCodes } from '../utils/errors.js';
import { findSoffice } from '../utils/soffice.js';
import { DEFAULT_TIMEOUT_MS } from '../utils/constants.js';
import { execFileAsync } from '../utils/exec.js';


// ============================================================================
// Types
// ============================================================================

export interface DOCXOptions {
  outputDir?: string;
  timeout?: number;
}

export interface DOCXResult {
  readonly outputPath: string;
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
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (err) {
    throw createError(
      ErrorCodes.OUTPUT_DIR_FAILED,
      `${outputDir}: ${err instanceof Error ? err.message : 'unknown error'}`,
    );
  }

  // Build command arguments as array (execFile - no shell interpretation)
  const args = [
    '--headless',
    '--convert-to', 'docx:MS Word 2007 XML',
    '--outdir', outputDir,
    absoluteHtmlPath
  ];

  try {
    // Apply timeout (default 60 seconds)
    const execTimeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
    await execFileAsync(sofficePath, args, { timeout: execTimeout });

    // LibreOffice outputs to: outputDir/originalName.docx
    const generatedPath = path.join(outputDir, expectedOutputName);

    // Verify output file was created
    try {
      await fs.access(generatedPath);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'EACCES' || code === 'EPERM') {
        throw createError(ErrorCodes.DOCX_FAILED, 'Output file created but not accessible (permission denied): ' + generatedPath);
      }
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
