/**
 * DOCX Converter Unit Tests
 *
 * Verifies that the converter passes arguments safely as arrays
 * to the underlying process execution (no shell interpretation).
 */

import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ConversionError } from '../src/utils/errors.js';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

describe('DOCX Converter - Safe Argument Handling', () => {
  it('convertToDOCX throws ConversionError when LibreOffice not found or succeeds with outputPath', async () => {
    const { convertToDOCX } = await import('../src/converters/docx-converter.js');

    try {
      const result = await convertToDOCX(
        path.join(FIXTURES_DIR, 'simple.html'),
        '/tmp/test-safe-args.docx'
      );

      // If LibreOffice IS installed, verify result shape
      expect(result).toHaveProperty('outputPath');
      expect(typeof result.outputPath).toBe('string');
      // Should NOT have old success/error fields
      expect(result).not.toHaveProperty('success');
      expect(result).not.toHaveProperty('error');
    } catch (err) {
      // Should throw ConversionError (LIBREOFFICE_MISSING or DOCX_FAILED)
      expect(err).toBeInstanceOf(ConversionError);
      expect(['LIBREOFFICE_MISSING', 'DOCX_FAILED']).toContain((err as ConversionError).code);
    }
  });

  it('findSoffice returns string or null without shell interpretation', async () => {
    const { findSoffice } = await import('../src/utils/soffice.js');

    const result = await findSoffice();

    // Should be null (not found) or a valid path string
    if (result !== null) {
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // Should be a real path, not a shell command result
      expect(result).not.toContain('$');
      expect(result).not.toContain('`');
    }
  });

  it('verifyLibreOffice returns boolean', async () => {
    const { verifyLibreOffice } = await import('../src/utils/soffice.js');

    const result = await verifyLibreOffice();
    expect(typeof result).toBe('boolean');
  });

  it('source code uses execFile not shell-based execution', async () => {
    // Verify at the source level that execFile is used
    const sourceCode = await fs.readFile(
      path.join(__dirname, '..', 'src', 'converters', 'docx-converter.ts'),
      'utf-8'
    );

    // Should import execFile (safe, array-based)
    expect(sourceCode).toContain("import { execFile }");
    expect(sourceCode).toContain('execFileAsync');

    // Should NOT use shell string interpolation for commands
    expect(sourceCode).not.toMatch(/execAsync\(`/);
    expect(sourceCode).not.toMatch(/exec\(`/);
  });

  it('dependencies source code uses execFile', async () => {
    const sourceCode = await fs.readFile(
      path.join(__dirname, '..', 'src', 'utils', 'dependencies.ts'),
      'utf-8'
    );

    expect(sourceCode).toContain("import { execFile }");
    expect(sourceCode).toContain('execFileAsync');
    expect(sourceCode).not.toMatch(/execAsync\(`/);
    expect(sourceCode).not.toMatch(/exec\(`/);
  });
});
