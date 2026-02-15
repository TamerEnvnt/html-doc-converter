import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ConversionError,
  ErrorCodes,
  formatError,
  createError,
  colors,
} from '../../src/utils/errors.js';

describe('errors', () => {
  describe('ConversionError', () => {
    it('sets message, code, and suggestion', () => {
      const err = new ConversionError('test message', ErrorCodes.PDF_FAILED, 'try again');
      expect(err.message).toBe('test message');
      expect(err.code).toBe('PDF_FAILED');
      expect(err.suggestion).toBe('try again');
    });

    it('sets name to ConversionError', () => {
      const err = new ConversionError('msg', ErrorCodes.UNKNOWN);
      expect(err.name).toBe('ConversionError');
    });

    it('is instanceof Error', () => {
      const err = new ConversionError('msg', ErrorCodes.UNKNOWN);
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(ConversionError);
    });

    it('captures stack trace', () => {
      const err = new ConversionError('msg', ErrorCodes.UNKNOWN);
      expect(err.stack).toBeDefined();
      expect(err.stack).toContain('errors.test.ts');
    });

    it('works without suggestion', () => {
      const err = new ConversionError('msg', ErrorCodes.UNKNOWN);
      expect(err.suggestion).toBeUndefined();
    });
  });

  describe('formatError', () => {
    it('formats ConversionError with suggestion', () => {
      const err = new ConversionError('bad input', ErrorCodes.INVALID_FORMAT, 'use .html');
      const formatted = formatError(err);
      expect(formatted).toContain('bad input');
      expect(formatted).toContain('INVALID_FORMAT');
      expect(formatted).toContain('use .html');
    });

    it('formats ConversionError without suggestion', () => {
      const err = new ConversionError('something broke', ErrorCodes.UNKNOWN);
      const formatted = formatError(err);
      expect(formatted).toContain('something broke');
      expect(formatted).toContain('UNKNOWN');
      expect(formatted).not.toContain('Suggestion');
    });

    it('formats regular Error', () => {
      const err = new Error('generic error');
      const formatted = formatError(err);
      expect(formatted).toContain('generic error');
    });
  });

  describe('createError', () => {
    it('creates INPUT_NOT_FOUND with path detail', () => {
      const err = createError(ErrorCodes.INPUT_NOT_FOUND, '/foo/bar.html');
      expect(err.code).toBe('INPUT_NOT_FOUND');
      expect(err.message).toContain('/foo/bar.html');
      expect(err.suggestion).toBeDefined();
    });

    it('creates INVALID_FORMAT with detail', () => {
      const err = createError(ErrorCodes.INVALID_FORMAT, 'got .txt');
      expect(err.code).toBe('INVALID_FORMAT');
      expect(err.message).toContain('got .txt');
    });

    it('creates EMPTY_INPUT', () => {
      const err = createError(ErrorCodes.EMPTY_INPUT);
      expect(err.code).toBe('EMPTY_INPUT');
      expect(err.message).toContain('empty');
    });

    it('creates LIBREOFFICE_MISSING with install hint', () => {
      const err = createError(ErrorCodes.LIBREOFFICE_MISSING);
      expect(err.code).toBe('LIBREOFFICE_MISSING');
      expect(err.suggestion).toContain('libreoffice.org');
    });

    it('creates OUTPUT_DIR_FAILED', () => {
      const err = createError(ErrorCodes.OUTPUT_DIR_FAILED, '/bad/dir');
      expect(err.code).toBe('OUTPUT_DIR_FAILED');
      expect(err.message).toContain('/bad/dir');
    });

    it('creates PDF_FAILED', () => {
      const err = createError(ErrorCodes.PDF_FAILED, 'timeout');
      expect(err.code).toBe('PDF_FAILED');
      expect(err.message).toContain('timeout');
    });

    it('creates DOCX_FAILED', () => {
      const err = createError(ErrorCodes.DOCX_FAILED, 'crash');
      expect(err.code).toBe('DOCX_FAILED');
      expect(err.message).toContain('crash');
    });

    it('creates TIMEOUT', () => {
      const err = createError(ErrorCodes.TIMEOUT, '60s exceeded');
      expect(err.code).toBe('TIMEOUT');
      expect(err.suggestion).toContain('--timeout');
    });

    it('creates PATH_TRAVERSAL', () => {
      const err = createError(ErrorCodes.PATH_TRAVERSAL, '/etc/passwd');
      expect(err.code).toBe('PATH_TRAVERSAL');
      expect(err.message).toContain('/etc/passwd');
      expect(err.suggestion).toContain('working directory');
    });

    it('creates INVALID_TIMEOUT', () => {
      const err = createError(ErrorCodes.INVALID_TIMEOUT, 'abc');
      expect(err.code).toBe('INVALID_TIMEOUT');
      expect(err.message).toContain('abc');
      expect(err.suggestion).toContain('positive integer');
    });

    it('creates FILE_EXISTS', () => {
      const err = createError(ErrorCodes.FILE_EXISTS, 'output.pdf');
      expect(err.code).toBe('FILE_EXISTS');
      expect(err.message).toContain('output.pdf');
      expect(err.suggestion).toContain('--force');
    });

    it('creates UNKNOWN for default case', () => {
      const err = createError(ErrorCodes.UNKNOWN, 'mystery');
      expect(err.code).toBe('UNKNOWN');
      expect(err.message).toContain('mystery');
    });

    it('handles missing detail gracefully', () => {
      const err = createError(ErrorCodes.PDF_FAILED);
      expect(err.code).toBe('PDF_FAILED');
      expect(err.message).toContain('unknown error');
    });

    it('createError handles all ErrorCode values', () => {
      for (const code of Object.values(ErrorCodes)) {
        const error = createError(code, 'test detail');
        expect(error).toBeInstanceOf(ConversionError);
        expect(error.code).toBe(code);
      }
    });
  });

  describe('colors', () => {
    it('exports color functions', () => {
      expect(typeof colors.red).toBe('function');
      expect(typeof colors.green).toBe('function');
      expect(typeof colors.yellow).toBe('function');
      expect(typeof colors.blue).toBe('function');
      expect(typeof colors.dim).toBe('function');
      expect(typeof colors.bold).toBe('function');
    });

    it('color functions return strings', () => {
      expect(typeof colors.red('test')).toBe('string');
      expect(colors.red('test')).toContain('test');
    });
  });
});
