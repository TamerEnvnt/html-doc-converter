/**
 * CLI Helpers Unit Tests
 *
 * Deterministic tests for validation logic extracted from cli.ts.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConversionError, ErrorCodes } from '../src/utils/errors.js';

// Mock fs/promises before importing the module under test
vi.mock('fs/promises', () => ({
  access: vi.fn(),
  stat: vi.fn(),
  readFile: vi.fn(),
}));

import { determineFormats, parseTimeout, validateInputFile } from '../src/cli-helpers.js';
import * as fs from 'fs/promises';

// ============================================================================
// determineFormats
// ============================================================================

describe('determineFormats', () => {
  it('defaults to both PDF and DOCX when no flags set', () => {
    const result = determineFormats({});
    expect(result).toEqual({ generatePDF: true, generateDOCX: true });
  });

  it('generates PDF only when pdfOnly is true', () => {
    const result = determineFormats({ pdfOnly: true });
    expect(result).toEqual({ generatePDF: true, generateDOCX: false });
  });

  it('generates DOCX only when docxOnly is true', () => {
    const result = determineFormats({ docxOnly: true });
    expect(result).toEqual({ generatePDF: false, generateDOCX: true });
  });

  it('generates PDF only when format is "pdf"', () => {
    const result = determineFormats({ format: 'pdf' });
    expect(result).toEqual({ generatePDF: true, generateDOCX: false });
  });

  it('generates DOCX only when format is "docx"', () => {
    const result = determineFormats({ format: 'docx' });
    expect(result).toEqual({ generatePDF: false, generateDOCX: true });
  });

  it('generates both when format is "both"', () => {
    const result = determineFormats({ format: 'both' });
    expect(result).toEqual({ generatePDF: true, generateDOCX: true });
  });

  it('pdfOnly takes precedence over format', () => {
    const result = determineFormats({ pdfOnly: true, format: 'both' });
    expect(result).toEqual({ generatePDF: true, generateDOCX: false });
  });
});

// ============================================================================
// parseTimeout
// ============================================================================

describe('parseTimeout', () => {
  it('parses valid string "30000" to number', () => {
    expect(parseTimeout('30000')).toBe(30000);
  });

  it('defaults to 60000 when undefined', () => {
    expect(parseTimeout(undefined)).toBe(60000);
  });

  it('throws INVALID_TIMEOUT for non-numeric string', () => {
    expect.assertions(2);
    try {
      parseTimeout('abc');
    } catch (err) {
      expect(err).toBeInstanceOf(ConversionError);
      expect((err as ConversionError).code).toBe(ErrorCodes.INVALID_TIMEOUT);
    }
  });

  it('throws INVALID_TIMEOUT for zero', () => {
    expect.assertions(2);
    try {
      parseTimeout('0');
    } catch (err) {
      expect(err).toBeInstanceOf(ConversionError);
      expect((err as ConversionError).code).toBe(ErrorCodes.INVALID_TIMEOUT);
    }
  });

  it('throws INVALID_TIMEOUT for negative value', () => {
    expect.assertions(2);
    try {
      parseTimeout('-5000');
    } catch (err) {
      expect(err).toBeInstanceOf(ConversionError);
      expect((err as ConversionError).code).toBe(ErrorCodes.INVALID_TIMEOUT);
    }
  });

  it('truncates float via parseInt ("30000.5" -> 30000)', () => {
    expect(parseTimeout('30000.5')).toBe(30000);
  });
});

// ============================================================================
// validateInputFile
// ============================================================================

describe('validateInputFile', () => {
  const mockedAccess = vi.mocked(fs.access);
  const mockedStat = vi.mocked(fs.stat);
  const mockedReadFile = vi.mocked(fs.readFile);

  beforeEach(() => {
    vi.resetAllMocks();

    // Happy-path defaults
    mockedAccess.mockResolvedValue(undefined);
    mockedStat.mockResolvedValue({ size: 1000 } as import('fs').Stats);
    mockedReadFile.mockResolvedValue('<html><body>Hello</body></html>');
  });

  it('throws INPUT_NOT_FOUND when file does not exist', async () => {
    expect.assertions(2);
    mockedAccess.mockRejectedValue(new Error('ENOENT'));

    try {
      await validateInputFile('/path/to/missing.html');
    } catch (err) {
      expect(err).toBeInstanceOf(ConversionError);
      expect((err as ConversionError).code).toBe(ErrorCodes.INPUT_NOT_FOUND);
    }
  });

  it('throws INVALID_FORMAT for non-HTML extension', async () => {
    expect.assertions(2);

    try {
      await validateInputFile('/path/to/file.txt');
    } catch (err) {
      expect(err).toBeInstanceOf(ConversionError);
      expect((err as ConversionError).code).toBe(ErrorCodes.INVALID_FORMAT);
    }
  });

  it('throws EMPTY_INPUT for zero-byte file', async () => {
    expect.assertions(2);
    mockedStat.mockResolvedValue({ size: 0 } as import('fs').Stats);

    try {
      await validateInputFile('/path/to/empty.html');
    } catch (err) {
      expect(err).toBeInstanceOf(ConversionError);
      expect((err as ConversionError).code).toBe(ErrorCodes.EMPTY_INPUT);
    }
  });

  it('throws EMPTY_INPUT for whitespace-only content', async () => {
    expect.assertions(2);
    mockedStat.mockResolvedValue({ size: 5 } as import('fs').Stats);
    mockedReadFile.mockResolvedValue('   \n  ');

    try {
      await validateInputFile('/path/to/whitespace.html');
    } catch (err) {
      expect(err).toBeInstanceOf(ConversionError);
      expect((err as ConversionError).code).toBe(ErrorCodes.EMPTY_INPUT);
    }
  });

  it('returns file info for valid HTML file', async () => {
    const result = await validateInputFile('/path/to/valid.html');
    expect(result).toEqual({
      fileSize: 1000,
      content: '<html><body>Hello</body></html>',
      isLargeFile: false,
    });
  });

  it('flags large files (>1MB) with isLargeFile: true', async () => {
    mockedStat.mockResolvedValue({ size: 2_000_000 } as import('fs').Stats);
    mockedReadFile.mockResolvedValue('<html>large content</html>');

    const result = await validateInputFile('/path/to/large.html');
    expect(result.isLargeFile).toBe(true);
    expect(result.fileSize).toBe(2_000_000);
  });
});
