/**
 * DOCX Converter - Mocked Unit Tests
 *
 * Deterministic tests using vi.mock to isolate convertToDOCX and
 * convertHTMLFileToDOCX from external dependencies (LibreOffice, filesystem).
 *
 * Separated from docx-converter.test.ts because vi.mock is file-scoped
 * and would interfere with the existing integration-style tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as path from 'path';
import { ConversionError, ErrorCodes } from '../src/utils/errors.js';

// ============================================================================
// Mocks (vitest hoists these to the top of the file)
// ============================================================================

vi.mock('../src/utils/soffice.js', () => ({
  findSoffice: vi.fn(),
}));

vi.mock('child_process', () => ({
  execFile: vi.fn((cmd: string, args: string[], opts: unknown, cb: Function) => {
    cb(null, { stdout: '', stderr: '' });
  }),
}));

vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs/promises')>();
  return {
    ...actual,
    mkdir: vi.fn(async () => undefined),
    access: vi.fn(async () => undefined),
    rename: vi.fn(async () => undefined),
    readFile: actual.readFile,
  };
});

vi.mock('../src/parsers/html-parser.js', () => ({
  parseDocument: vi.fn(),
}));

// ============================================================================
// Import mocked modules (after vi.mock declarations)
// ============================================================================

import { findSoffice } from '../src/utils/soffice.js';
import { execFile } from 'child_process';
import * as fs from 'fs/promises';
import { parseDocument } from '../src/parsers/html-parser.js';
import { convertToDOCX, convertHTMLFileToDOCX } from '../src/converters/docx-converter.js';

const mockedFindSoffice = vi.mocked(findSoffice);
const mockedExecFile = vi.mocked(execFile);
const mockedMkdir = vi.mocked(fs.mkdir);
const mockedAccess = vi.mocked(fs.access);
const mockedRename = vi.mocked(fs.rename);
const mockedParseDocument = vi.mocked(parseDocument);

// ============================================================================
// convertToDOCX - Mocked Tests
// ============================================================================

describe('convertToDOCX - mocked', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default happy-path setup
    mockedFindSoffice.mockResolvedValue('/usr/bin/soffice');
    mockedMkdir.mockResolvedValue(undefined);
    mockedAccess.mockResolvedValue(undefined);
    mockedRename.mockResolvedValue(undefined);

    // execFile: standard node callback signature for promisify compatibility
    mockedExecFile.mockImplementation(
      (cmd: any, args: any, opts: any, cb: any) => {
        if (typeof cb === 'function') {
          cb(null, '', '');
        }
        return undefined as any;
      }
    );
  });

  it('succeeds when generated path matches output path (no rename)', async () => {
    // htmlPath basename = test, so generatedPath = /tmp/test.docx
    // outputPath = /tmp/test.docx => no rename needed
    const result = await convertToDOCX('/tmp/test.html', '/tmp/test.docx');

    expect(result).toEqual({ outputPath: path.resolve('/tmp/test.docx') });
    expect(mockedFindSoffice).toHaveBeenCalledOnce();
    expect(mockedExecFile).toHaveBeenCalledOnce();
    expect(mockedAccess).toHaveBeenCalledOnce();
    expect(mockedRename).not.toHaveBeenCalled();
  });

  it('succeeds and renames when output path differs from generated path', async () => {
    // htmlPath basename = input, so generatedPath = /tmp/input.docx
    // outputPath = /tmp/output.docx => rename fires
    const result = await convertToDOCX('/tmp/input.html', '/tmp/output.docx');

    expect(result).toEqual({ outputPath: path.resolve('/tmp/output.docx') });
    expect(mockedRename).toHaveBeenCalledOnce();
    expect(mockedRename).toHaveBeenCalledWith(
      path.resolve('/tmp/input.docx'),
      path.resolve('/tmp/output.docx')
    );
  });

  it('throws LIBREOFFICE_MISSING when soffice not found', async () => {
    expect.assertions(2);
    mockedFindSoffice.mockResolvedValue(null);

    try {
      await convertToDOCX('/tmp/test.html', '/tmp/test.docx');
    } catch (err) {
      expect(err).toBeInstanceOf(ConversionError);
      expect((err as ConversionError).code).toBe(ErrorCodes.LIBREOFFICE_MISSING);
    }
  });

  it('throws DOCX_FAILED when LibreOffice execution fails', async () => {
    expect.assertions(2);
    mockedExecFile.mockImplementation(
      (cmd: any, args: any, opts: any, cb: any) => {
        if (typeof cb === 'function') {
          cb(new Error('soffice crashed'), '', '');
        }
        return undefined as any;
      }
    );

    try {
      await convertToDOCX('/tmp/test.html', '/tmp/test.docx');
    } catch (err) {
      expect(err).toBeInstanceOf(ConversionError);
      expect((err as ConversionError).code).toBe(ErrorCodes.DOCX_FAILED);
    }
  });

  it('throws DOCX_FAILED when output file is missing after conversion', async () => {
    expect.assertions(2);
    mockedAccess.mockRejectedValue(new Error('ENOENT'));

    try {
      await convertToDOCX('/tmp/test.html', '/tmp/test.docx');
    } catch (err) {
      expect(err).toBeInstanceOf(ConversionError);
      expect((err as ConversionError).code).toBe(ErrorCodes.DOCX_FAILED);
    }
  });

  it('throws DOCX_FAILED when rename fails', async () => {
    expect.assertions(2);
    mockedRename.mockRejectedValue(new Error('EACCES: permission denied'));

    try {
      // Different name to trigger rename path
      await convertToDOCX('/tmp/input.html', '/tmp/output.docx');
    } catch (err) {
      expect(err).toBeInstanceOf(ConversionError);
      expect((err as ConversionError).code).toBe(ErrorCodes.DOCX_FAILED);
    }
  });

  it('throws DOCX_FAILED with String(error) message for non-Error throws', async () => {
    expect.assertions(3);
    // Simulate execFile rejecting with a non-Error value (string)
    mockedExecFile.mockImplementation(
      (cmd: any, args: any, opts: any, cb: any) => {
        if (typeof cb === 'function') {
          cb('string-error-from-process' as any, '', '');
        }
        return undefined as any;
      }
    );

    try {
      await convertToDOCX('/tmp/test.html', '/tmp/test.docx');
    } catch (err) {
      expect(err).toBeInstanceOf(ConversionError);
      expect((err as ConversionError).code).toBe(ErrorCodes.DOCX_FAILED);
      expect((err as ConversionError).message).toContain('string-error-from-process');
    }
  });
});

// ============================================================================
// convertHTMLFileToDOCX - Mocked Tests
// ============================================================================

describe('convertHTMLFileToDOCX - mocked', () => {
  const fakeParsedDocument = {
    title: 'Test',
    chapters: [],
    metadata: { title: 'Test', customFields: {} },
    rawHTML: '<html><body>Test</body></html>',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default happy-path setup
    mockedFindSoffice.mockResolvedValue('/usr/bin/soffice');
    mockedMkdir.mockResolvedValue(undefined);
    mockedAccess.mockResolvedValue(undefined);
    mockedRename.mockResolvedValue(undefined);
    mockedParseDocument.mockResolvedValue(fakeParsedDocument as any);

    mockedExecFile.mockImplementation(
      (cmd: any, args: any, opts: any, cb: any) => {
        if (typeof cb === 'function') {
          cb(null, '', '');
        }
        return undefined as any;
      }
    );
  });

  it('returns parsed document and DOCX result on success', async () => {
    const result = await convertHTMLFileToDOCX('/tmp/test.html', '/tmp/test.docx');

    expect(result.document).toEqual(fakeParsedDocument);
    expect(result.docx).toEqual({ outputPath: path.resolve('/tmp/test.docx') });
    expect(mockedParseDocument).toHaveBeenCalledWith('/tmp/test.html');
  });

  it('propagates parse errors', async () => {
    expect.assertions(1);
    mockedParseDocument.mockRejectedValue(new Error('HTML parse failure'));

    try {
      await convertHTMLFileToDOCX('/tmp/test.html', '/tmp/test.docx');
    } catch (err) {
      expect((err as Error).message).toBe('HTML parse failure');
    }
  });

  it('propagates conversion errors when soffice missing', async () => {
    expect.assertions(2);
    mockedFindSoffice.mockResolvedValue(null);

    try {
      await convertHTMLFileToDOCX('/tmp/test.html', '/tmp/test.docx');
    } catch (err) {
      expect(err).toBeInstanceOf(ConversionError);
      expect((err as ConversionError).code).toBe(ErrorCodes.LIBREOFFICE_MISSING);
    }
  });
});
