import { describe, it, expect } from 'vitest';
import {
  getPlatform,
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
