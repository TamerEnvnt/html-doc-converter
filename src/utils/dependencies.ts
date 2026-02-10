/**
 * Dependency Verification Module
 *
 * Checks for required external dependencies (LibreOffice, Chromium)
 * and provides platform-specific installation guidance.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import puppeteer from 'puppeteer';
import { findSoffice } from './soffice.js';
import { getPlatform, getPlatformName, Platform } from './platform.js';
import { colors } from './errors.js';

const execFileAsync = promisify(execFile);

// ============================================================================
// Types
// ============================================================================

export interface DependencyStatus {
  name: string;
  required: boolean;
  found: boolean;
  path?: string;
  version?: string;
  installHint?: string;
}

export interface DependencyCheckResult {
  allFound: boolean;
  dependencies: DependencyStatus[];
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
  const status: DependencyStatus = {
    name: 'Chromium (Puppeteer)',
    required: true,
    found: false,
    installHint: getInstallInstructions('chromium'),
  };

  try {
    // Get Puppeteer's bundled browser path
    const browserPath = puppeteer.executablePath();

    if (browserPath) {
      status.found = true;
      status.path = browserPath;

      // Try to get version
      try {
        const { stdout } = await execFileAsync(browserPath, ['--version']);
        status.version = stdout.trim().replace(/^(Chromium|Google Chrome)\s+/i, '');
      } catch {
        // Version detection failed, but browser exists
      }
    }
  } catch {
    status.found = false;
  }

  return status;
}

/**
 * Check if LibreOffice is installed
 */
async function checkLibreOffice(): Promise<DependencyStatus> {
  const status: DependencyStatus = {
    name: 'LibreOffice',
    required: true,
    found: false,
    installHint: getInstallInstructions('libreoffice'),
  };

  const sofficePath = await findSoffice();

  if (sofficePath) {
    status.found = true;
    status.path = sofficePath;

    // Try to get version
    try {
      const { stdout } = await execFileAsync(sofficePath, ['--version']);
      const match = stdout.match(/LibreOffice\s+(\d+\.\d+\.\d+)/);
      if (match) {
        status.version = match[1];
      }
    } catch {
      // Version detection failed, but soffice exists
    }
  }

  return status;
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
      if (dep.path) {
        lines.push(`       ${colors.dim('Path:')} ${dep.path}`);
      }
    } else {
      lines.push('');
      // Indent install hint
      const hint = dep.installHint || 'No installation instructions available.';
      const indentedHint = hint
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
