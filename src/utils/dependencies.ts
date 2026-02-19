/**
 * Dependency Verification Module
 *
 * Checks for required external dependencies (LibreOffice, Chromium)
 * and provides platform-specific installation guidance.
 */

import puppeteer from 'puppeteer';
import { findSoffice } from './soffice.js';
import { getPlatform, getPlatformName, Platform } from './platform.js';
import { colors } from './colors.js';
import { execFileAsync } from './exec.js';
import { verbose } from './logger.js';


// ============================================================================
// Types
// ============================================================================

interface DependencyBase {
  readonly name: string;
  readonly required: boolean;
}

export interface FoundDependency extends DependencyBase {
  readonly found: true;
  readonly path: string;
  readonly version?: string;
}

export interface MissingDependency extends DependencyBase {
  readonly found: false;
  readonly installHint: string;
}

export type DependencyStatus = FoundDependency | MissingDependency;

export interface DependencyCheckResult {
  readonly allFound: boolean;
  readonly dependencies: readonly DependencyStatus[];
}

// ============================================================================
// Installation Instructions
// ============================================================================

const INSTALL_INSTRUCTIONS: Record<string, Record<Platform, string>> = {
  libreoffice: {
    darwin: `Install LibreOffice:
  brew install --cask libreoffice

Or download from:
  https://www.libreoffice.org/download/`,

    linux: `Install LibreOffice:
  Ubuntu/Debian: sudo apt install libreoffice
  Fedora:        sudo dnf install libreoffice
  Arch:          sudo pacman -S libreoffice`,

    win32: `Install LibreOffice:
  Download from https://www.libreoffice.org/download/
  Or: winget install LibreOffice.LibreOffice`,
  },

  chromium: {
    darwin: `Chromium is bundled with Puppeteer.
If issues persist, try:
  npx puppeteer browsers install chrome`,

    linux: `Chromium is bundled with Puppeteer.
If issues persist, try:
  npx puppeteer browsers install chrome

For missing system libraries:
  Ubuntu/Debian: sudo apt install -y libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2`,

    win32: `Chromium is bundled with Puppeteer.
If issues persist, try:
  npx puppeteer browsers install chrome`,
  },
};

/**
 * Get platform-specific installation instructions for a dependency
 */
export function getInstallInstructions(dep: string): string {
  const platform = getPlatform();
  return (
    INSTALL_INSTRUCTIONS[dep]?.[platform] ||
    'Please install the required dependency.'
  );
}

// ============================================================================
// Dependency Checks
// ============================================================================

/**
 * Check if Chromium/Chrome is available via Puppeteer
 */
async function checkChromium(): Promise<DependencyStatus> {
  try {
    const browserPath = puppeteer.executablePath();

    if (browserPath) {
      let version: string | undefined;
      try {
        const { stdout } = await execFileAsync(browserPath, ['--version']);
        version = stdout.trim().replace(/^(Chromium|Google Chrome)\s+/i, '');
      } catch (err) {
        verbose('Chromium version detection failed:', err instanceof Error ? err.message : String(err));
      }

      return { name: 'Chromium (Puppeteer)', required: true, found: true, path: browserPath, version };
    }
  } catch (err) {
    verbose('Chromium detection error:', err instanceof Error ? err.message : String(err));
  }

  return { name: 'Chromium (Puppeteer)', required: true, found: false, installHint: getInstallInstructions('chromium') };
}

/**
 * Check if LibreOffice is installed
 */
async function checkLibreOffice(): Promise<DependencyStatus> {
  const sofficePath = await findSoffice();

  if (sofficePath) {
    let version: string | undefined;
    try {
      const { stdout } = await execFileAsync(sofficePath, ['--version']);
      const match = stdout.match(/LibreOffice\s+(\d+\.\d+\.\d+(?:\.\d+)?)/);
      if (match) {
        version = match[1];
      }
    } catch (err) {
      verbose('LibreOffice version detection failed:', err instanceof Error ? err.message : String(err));
    }

    return { name: 'LibreOffice', required: true, found: true, path: sofficePath, version };
  }

  return { name: 'LibreOffice', required: true, found: false, installHint: getInstallInstructions('libreoffice') };
}

// ============================================================================
// Main Check Function
// ============================================================================

/**
 * Check all system dependencies
 */
export async function checkDependencies(): Promise<DependencyCheckResult> {
  const dependencies = await Promise.all([
    checkChromium(),
    checkLibreOffice(),
  ]);

  const allFound = dependencies.every((dep) => dep.found || !dep.required);

  return { allFound, dependencies };
}

/**
 * Format dependency check results for console output (with colors)
 */
export function formatDependencyReport(result: DependencyCheckResult): string {
  const lines: string[] = [];
  const platform = getPlatformName();

  lines.push(`${colors.bold('System:')} ${platform}`);
  lines.push('');
  lines.push(colors.bold('Dependencies:'));
  lines.push('');

  for (const dep of result.dependencies) {
    const statusIcon = dep.found
      ? colors.green('[OK]')
      : colors.red('[MISSING]');
    const requiredLabel = dep.required
      ? colors.dim('(required)')
      : colors.dim('(optional)');

    lines.push(`  ${statusIcon} ${dep.name} ${requiredLabel}`);

    if (dep.found) {
      if (dep.version) {
        lines.push(`       ${colors.dim('Version:')} ${dep.version}`);
      }
      lines.push(`       ${colors.dim('Path:')} ${dep.path}`);
    } else {
      lines.push('');
      // Indent install hint
      const indentedHint = dep.installHint
        .split('\n')
        .map((line) => `       ${line}`)
        .join('\n');
      lines.push(colors.yellow(indentedHint));
    }

    lines.push('');
  }

  if (result.allFound) {
    lines.push(colors.green('All required dependencies are installed.'));
  } else {
    lines.push(colors.yellow('Some dependencies are missing. Install them to enable all features.'));
  }

  return lines.join('\n');
}
