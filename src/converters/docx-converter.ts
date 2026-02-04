/**
 * DOCX Converter Module
 *
 * Converts HTML documents to DOCX using LibreOffice CLI.
 * Produces real document structure (headings, tables, paragraphs) that can be edited in Word.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { parseDocument, ParsedDocument } from '../parsers/html-parser.js';

const execAsync = promisify(exec);

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
  success: boolean;
  error?: string;
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
    const cmd = platform === 'win32' ? 'where soffice' : 'which soffice';
    const { stdout } = await execAsync(cmd);
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
 * @returns Result object with success status and output path
 */
export async function convertToDOCX(
  htmlPath: string,
  outputPath: string,
  options: DOCXOptions = {}
): Promise<DOCXResult> {
  // Find LibreOffice
  const sofficePath = await findSoffice();
  if (!sofficePath) {
    return {
      outputPath: '',
      success: false,
      error: 'LibreOffice not found. Please install LibreOffice to convert to DOCX.',
    };
  }

  // Resolve paths
  const absoluteHtmlPath = path.resolve(htmlPath);
  const absoluteOutputPath = path.resolve(outputPath);
  const outputDir = options.outputDir || path.dirname(absoluteOutputPath);
  const expectedOutputName = path.basename(htmlPath, path.extname(htmlPath)) + '.docx';

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Build command
  // Quote paths for spaces
  const args = [
    '--headless',
    '--convert-to', 'docx',
    '--outdir', `"${outputDir}"`,
    `"${absoluteHtmlPath}"`
  ];

  try {
    // Apply timeout (default 60 seconds)
    const execTimeout = options.timeout || 60000;
    await execAsync(`"${sofficePath}" ${args.join(' ')}`, { timeout: execTimeout });

    // LibreOffice outputs to: outputDir/originalName.docx
    const generatedPath = path.join(outputDir, expectedOutputName);

    // Rename if different output path requested
    if (generatedPath !== absoluteOutputPath) {
      await fs.rename(generatedPath, absoluteOutputPath);
    }

    return {
      outputPath: absoluteOutputPath,
      success: true,
    };
  } catch (error) {
    return {
      outputPath: '',
      success: false,
      error: `LibreOffice conversion failed: ${error instanceof Error ? error.message : String(error)}`,
    };
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
