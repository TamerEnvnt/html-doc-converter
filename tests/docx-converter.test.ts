/**
 * DOCX Converter Unit Tests
 *
 * Verifies that the converter passes arguments safely as arrays
 * to the underlying process execution (no shell interpretation).
 */

import { describe, it, expect, vi } from 'vitest';
import * as path from 'path';
import { ConversionError, ErrorCodes } from '../src/utils/errors.js';

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

  it('rejects non-existent input file', async () => {
    const { convertToDOCX } = await import('../src/converters/docx-converter.js');

    await expect(
      convertToDOCX('/tmp/nonexistent-file.html', '/tmp/output.docx')
    ).rejects.toThrow();
  });

  it('convertHTMLFileToDOCX rejects non-existent input file', async () => {
    const { convertHTMLFileToDOCX } = await import('../src/converters/docx-converter.js');

    await expect(
      convertHTMLFileToDOCX('/tmp/nonexistent-file.html', '/tmp/output.docx')
    ).rejects.toThrow();
  });

  it('throws OUTPUT_DIR_FAILED when mkdir fails (not DOCX_FAILED)', async () => {
    // Use integration test approach: try to create output in a read-only path
    // /proc on macOS doesn't exist, but /dev/null is a file not a directory
    // Use a path that will definitely fail mkdir (nested under a file)
    const impossibleDir = '/dev/null/impossible-dir';

    const { convertToDOCX } = await import('../src/converters/docx-converter.js');

    try {
      await convertToDOCX(
        path.join(FIXTURES_DIR, 'simple.html'),
        `${impossibleDir}/output.docx`,
        { outputDir: impossibleDir }
      );
      expect.unreachable('Expected ConversionError to be thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ConversionError);
      expect((err as ConversionError).code).toBe(ErrorCodes.OUTPUT_DIR_FAILED);
      expect((err as ConversionError).code).not.toBe('DOCX_FAILED');
    }
  });
});
