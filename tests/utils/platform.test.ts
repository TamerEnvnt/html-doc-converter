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

    it('returns macOS for darwin platform', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });
      try {
        expect(getPlatformName()).toBe('macOS');
      } finally {
        Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
      }
    });

    it('returns Windows for win32 platform', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
      try {
        expect(getPlatformName()).toBe('Windows');
      } finally {
        Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
      }
    });

    it('returns Linux for linux platform', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
      try {
        expect(getPlatformName()).toBe('Linux');
      } finally {
        Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
      }
    });

    it('returns raw platform string for unknown platform', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'aix', configurable: true });
      try {
        expect(getPlatformName()).toBe('aix');
      } finally {
        Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
      }
    });
  });
});
