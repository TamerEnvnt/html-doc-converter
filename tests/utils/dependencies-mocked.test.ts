/**
 * Dependencies - Mocked Version Extraction Tests
 *
 * Tests checkChromium and checkLibreOffice version parsing
 * with mocked system calls for deterministic behavior.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('puppeteer', () => ({
  default: {
    executablePath: vi.fn(),
  },
}));

vi.mock('../../src/utils/soffice.js', () => ({
  findSoffice: vi.fn(),
}));

vi.mock('../../src/utils/exec.js', () => ({
  execFileAsync: vi.fn(),
}));

// Suppress verbose logging in tests
vi.mock('../../src/utils/logger.js', () => ({
  verbose: vi.fn(),
}));

// Mock platform for install instructions
vi.mock('../../src/utils/platform.js', () => ({
  getPlatform: vi.fn(() => 'darwin'),
  getPlatformName: vi.fn(() => 'macOS'),
}));

import puppeteer from 'puppeteer';
import { findSoffice } from '../../src/utils/soffice.js';
import { execFileAsync } from '../../src/utils/exec.js';
import { checkDependencies } from '../../src/utils/dependencies.js';

const mockedPuppeteer = vi.mocked(puppeteer);
const mockedFindSoffice = vi.mocked(findSoffice);
const mockedExecFileAsync = vi.mocked(execFileAsync);

describe('checkDependencies - mocked version extraction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Chromium version extraction', () => {
    beforeEach(() => {
      // Default: LibreOffice found (focus tests on Chromium)
      mockedFindSoffice.mockResolvedValue('/usr/bin/soffice');
    });

    it('extracts Google Chrome version from --version output', async () => {
      mockedPuppeteer.executablePath.mockReturnValue('/usr/bin/chrome');
      mockedExecFileAsync.mockImplementation(async (cmd: any) => {
        if (String(cmd).includes('chrome')) {
          return { stdout: 'Google Chrome 120.0.6099.130', stderr: '' } as any;
        }
        return { stdout: 'LibreOffice 7.5.3', stderr: '' } as any;
      });

      const result = await checkDependencies();
      const chromium = result.dependencies.find(d => d.name.includes('Chromium'));

      expect(chromium?.found).toBe(true);
      if (chromium?.found) {
        expect(chromium.version).toBe('120.0.6099.130');
      }
    });

    it('extracts Chromium version from --version output', async () => {
      mockedPuppeteer.executablePath.mockReturnValue('/usr/bin/chromium');
      mockedExecFileAsync.mockImplementation(async (cmd: any) => {
        if (String(cmd).includes('chromium')) {
          return { stdout: 'Chromium 119.0.5962.0', stderr: '' } as any;
        }
        return { stdout: 'LibreOffice 7.5.3', stderr: '' } as any;
      });

      const result = await checkDependencies();
      const chromium = result.dependencies.find(d => d.name.includes('Chromium'));

      expect(chromium?.found).toBe(true);
      if (chromium?.found) {
        expect(chromium.version).toBe('119.0.5962.0');
      }
    });

    it('returns found=true with undefined version when --version fails', async () => {
      mockedPuppeteer.executablePath.mockReturnValue('/usr/bin/chrome');
      mockedExecFileAsync.mockImplementation(async (cmd: any) => {
        if (String(cmd).includes('chrome')) {
          throw new Error('--version not supported');
        }
        return { stdout: 'LibreOffice 7.5.3', stderr: '' } as any;
      });

      const result = await checkDependencies();
      const chromium = result.dependencies.find(d => d.name.includes('Chromium'));

      expect(chromium?.found).toBe(true);
      if (chromium?.found) {
        expect(chromium.version).toBeUndefined();
      }
    });

    it('returns found=false when puppeteer.executablePath() throws', async () => {
      mockedPuppeteer.executablePath.mockImplementation(() => {
        throw new Error('Could not find Chromium');
      });
      mockedExecFileAsync.mockResolvedValue({ stdout: 'LibreOffice 7.5.3', stderr: '' } as any);

      const result = await checkDependencies();
      const chromium = result.dependencies.find(d => d.name.includes('Chromium'));

      expect(chromium?.found).toBe(false);
    });
  });

  describe('LibreOffice version extraction', () => {
    beforeEach(() => {
      // Default: Chromium found (focus tests on LibreOffice)
      mockedPuppeteer.executablePath.mockReturnValue('/usr/bin/chrome');
    });

    it('extracts 3-part version', async () => {
      mockedFindSoffice.mockResolvedValue('/usr/bin/soffice');
      mockedExecFileAsync.mockImplementation(async (cmd: any) => {
        if (String(cmd).includes('soffice')) {
          return { stdout: 'LibreOffice 7.5.3 abc123', stderr: '' } as any;
        }
        return { stdout: 'Google Chrome 120.0.0', stderr: '' } as any;
      });

      const result = await checkDependencies();
      const lo = result.dependencies.find(d => d.name === 'LibreOffice');

      expect(lo?.found).toBe(true);
      if (lo?.found) {
        expect(lo.version).toBe('7.5.3');
      }
    });

    it('extracts 4-part version', async () => {
      mockedFindSoffice.mockResolvedValue('/usr/bin/soffice');
      mockedExecFileAsync.mockImplementation(async (cmd: any) => {
        if (String(cmd).includes('soffice')) {
          return { stdout: 'LibreOffice 24.2.0.3', stderr: '' } as any;
        }
        return { stdout: 'Google Chrome 120.0.0', stderr: '' } as any;
      });

      const result = await checkDependencies();
      const lo = result.dependencies.find(d => d.name === 'LibreOffice');

      expect(lo?.found).toBe(true);
      if (lo?.found) {
        expect(lo.version).toBe('24.2.0.3');
      }
    });

    it('returns found=true with undefined version when --version fails', async () => {
      mockedFindSoffice.mockResolvedValue('/usr/bin/soffice');
      mockedExecFileAsync.mockImplementation(async (cmd: any) => {
        if (String(cmd).includes('soffice')) {
          throw new Error('soffice --version failed');
        }
        return { stdout: 'Google Chrome 120.0.0', stderr: '' } as any;
      });

      const result = await checkDependencies();
      const lo = result.dependencies.find(d => d.name === 'LibreOffice');

      expect(lo?.found).toBe(true);
      if (lo?.found) {
        expect(lo.version).toBeUndefined();
      }
    });

    it('returns found=false when soffice not found', async () => {
      mockedFindSoffice.mockResolvedValue(null);
      mockedExecFileAsync.mockResolvedValue({ stdout: 'Google Chrome 120.0.0', stderr: '' } as any);

      const result = await checkDependencies();
      const lo = result.dependencies.find(d => d.name === 'LibreOffice');

      expect(lo?.found).toBe(false);
    });
  });
});
