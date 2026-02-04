/**
 * CLI Tests
 *
 * Tests command-line interface behavior using execFileSync for security.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';

const CLI_PATH = path.join(__dirname, '..', 'dist', 'cli.js');
const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const OUTPUT_DIR = path.join(__dirname, 'output');

describe('CLI', () => {
  beforeAll(async () => {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  });

  describe('Help and Version', () => {
    it('shows help with --help', () => {
      const output = execFileSync('node', [CLI_PATH, '--help'], {
        encoding: 'utf-8',
      });

      expect(output).toContain('html-doc-converter');
      expect(output).toContain('--format');
      expect(output).toContain('--output');
      expect(output).toContain('pdf');
      expect(output).toContain('docx');
    });

    it('shows version with --version', () => {
      const output = execFileSync('node', [CLI_PATH, '--version'], {
        encoding: 'utf-8',
      });

      expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('shows help text with examples', () => {
      const output = execFileSync('node', [CLI_PATH, '--help'], {
        encoding: 'utf-8',
      });

      expect(output).toContain('Examples:');
      expect(output).toContain('document.html');
    });
  });

  describe('Check Command', () => {
    it('runs check command and reports dependencies', () => {
      // Check command may exit with 1 if some dependencies are missing
      // We just need to verify it runs and provides output
      let output: string;
      try {
        output = execFileSync('node', [CLI_PATH, 'check'], {
          encoding: 'utf-8',
        });
      } catch (error: unknown) {
        // Command exits 1 when dependencies missing, but stdout still has output
        const execError = error as { stdout?: string };
        output = execError.stdout || '';
      }

      expect(output).toContain('Checking dependencies');
      expect(output).toContain('LibreOffice');
      expect(output).toContain('Chromium');
    });
  });

  describe('Error Handling', () => {
    it('errors on missing input file', () => {
      expect(() => {
        execFileSync('node', [CLI_PATH, 'nonexistent.html'], {
          encoding: 'utf-8',
          stdio: 'pipe',
        });
      }).toThrow();
    });

    it('errors on non-HTML file', () => {
      // Create a temp non-HTML file
      const tempFile = path.join(OUTPUT_DIR, 'test.txt');
      fs.writeFile(tempFile, 'test content');

      expect(() => {
        execFileSync('node', [CLI_PATH, tempFile], {
          encoding: 'utf-8',
          stdio: 'pipe',
        });
      }).toThrow();
    });

    it('errors with helpful message for missing input', () => {
      try {
        execFileSync('node', [CLI_PATH, '/path/to/missing.html'], {
          encoding: 'utf-8',
          stdio: 'pipe',
        });
      } catch (error: unknown) {
        const execError = error as { stderr?: string; message?: string };
        const stderr = execError.stderr || execError.message || '';
        expect(stderr).toMatch(/not found|INPUT_NOT_FOUND/i);
      }
    });
  });

  describe('Conversion Options', () => {
    it('accepts --pdf-only flag', () => {
      const output = execFileSync('node', [CLI_PATH, '--help'], {
        encoding: 'utf-8',
      });

      expect(output).toContain('--pdf-only');
    });

    it('accepts --docx-only flag', () => {
      const output = execFileSync('node', [CLI_PATH, '--help'], {
        encoding: 'utf-8',
      });

      expect(output).toContain('--docx-only');
    });

    it('accepts -f/--format option', () => {
      const output = execFileSync('node', [CLI_PATH, '--help'], {
        encoding: 'utf-8',
      });

      expect(output).toContain('-f, --format');
    });

    it('accepts -o/--output option', () => {
      const output = execFileSync('node', [CLI_PATH, '--help'], {
        encoding: 'utf-8',
      });

      expect(output).toContain('-o, --output');
    });
  });

  describe('Full Conversion', () => {
    it('converts HTML file to PDF with --pdf-only', async () => {
      const inputPath = path.join(FIXTURES_DIR, 'simple.html');
      const outputBase = path.join(OUTPUT_DIR, 'cli-test');

      try {
        const output = execFileSync(
          'node',
          [CLI_PATH, inputPath, '-o', outputBase, '--pdf-only'],
          {
            encoding: 'utf-8',
            timeout: 60000,
          }
        );

        expect(output).toContain('Converting');
        expect(output).toContain('Done');

        // Verify PDF was created
        const pdfPath = outputBase + '.pdf';
        const stats = await fs.stat(pdfPath);
        expect(stats.size).toBeGreaterThan(0);
      } catch (error: unknown) {
        const execError = error as { message?: string };
        // If error, make sure it's not a missing input file error
        expect(execError.message).not.toContain('INPUT_NOT_FOUND');
        throw error;
      }
    }, 60000);
  });
});
