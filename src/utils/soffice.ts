/**
 * LibreOffice (soffice) Detection Utilities
 *
 * Extracted from docx-converter to break circular dependency:
 * utils/dependencies.ts needs findSoffice, which was previously in converters/docx-converter.ts.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import { getPlatform } from './platform.js';
import type { Platform } from './platform.js';

const execFileAsync = promisify(execFile);

// ============================================================================
// LibreOffice Detection
// ============================================================================

const SOFFICE_PATHS: Record<Platform, string[]> = {
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
  const platform = getPlatform();
  const paths = SOFFICE_PATHS[platform] || [];

  for (const p of paths) {
    try {
      await fs.access(p, fs.constants.X_OK);
      return p;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'EACCES') {
        throw new Error(`LibreOffice found at ${p} but lacks execute permission`);
      }
      // ENOENT or other: try next path
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
