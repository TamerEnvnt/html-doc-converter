import { describe, it, expect, vi } from 'vitest';
import * as path from 'path';
import {
  getPlatform,
  isWindows,
  isMacOS,
  isLinux,
  normalizePath,
  toForwardSlashes,
  getPathSeparator,
  joinPaths,
  resolvePath,
  getPlatformName,
} from '../../src/utils/platform.js';

describe('platform', () => {
  describe('getPlatform', () => {
    it('returns a known platform string', () => {
      const platform = getPlatform();
      expect(['darwin', 'linux', 'win32']).toContain(platform);
    });

    it('falls back to linux for unrecognized platform', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'freebsd', configurable: true });
      try {
        expect(getPlatform()).toBe('linux');
      } finally {
        Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
      }
    });
  });

  describe('platform checks', () => {
    it('exactly one platform check returns true', () => {
      const checks = [isWindows(), isMacOS(), isLinux()];
      const trueCount = checks.filter(Boolean).length;
      expect(trueCount).toBe(1);
    });

    it('isWindows matches process.platform', () => {
      expect(isWindows()).toBe(process.platform === 'win32');
    });

    it('isMacOS matches process.platform', () => {
      expect(isMacOS()).toBe(process.platform === 'darwin');
    });

    it('isLinux matches process.platform', () => {
      expect(isLinux()).toBe(process.platform === 'linux');
    });
  });

  describe('path utilities', () => {
    it('normalizePath normalizes separators', () => {
      const result = normalizePath('/foo//bar/../baz');
      expect(result).toBe(path.normalize('/foo//bar/../baz'));
    });

    it('toForwardSlashes converts backslashes', () => {
      expect(toForwardSlashes('foo\\bar\\baz')).toBe('foo/bar/baz');
    });

    it('toForwardSlashes preserves forward slashes', () => {
      expect(toForwardSlashes('foo/bar/baz')).toBe('foo/bar/baz');
    });

    it('getPathSeparator returns / or \\', () => {
      expect(['/', '\\']).toContain(getPathSeparator());
    });

    it('joinPaths joins correctly', () => {
      const result = joinPaths('foo', 'bar', 'baz.txt');
      expect(result).toBe(path.join('foo', 'bar', 'baz.txt'));
    });

    it('resolvePath returns absolute path', () => {
      const result = resolvePath('relative/path');
      expect(path.isAbsolute(result)).toBe(true);
    });
  });

  describe('getPlatformName', () => {
    it('returns human-readable name', () => {
      const name = getPlatformName();
      expect(['macOS', 'Linux', 'Windows']).toContain(name);
    });

    it('matches getPlatform value', () => {
      const platform = getPlatform();
      const name = getPlatformName();
      const expected: Record<string, string> = {
        darwin: 'macOS',
        linux: 'Linux',
        win32: 'Windows',
      };
      expect(name).toBe(expected[platform]);
    });
  });
});
