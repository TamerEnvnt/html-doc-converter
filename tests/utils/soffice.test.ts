/**
 * soffice.ts - Unit Tests
 *
 * Tests for findSoffice() and verifyLibreOffice() with mocked
 * fs/promises, exec, and platform modules.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// Mocks (vitest hoists these to the top of the file)
// ============================================================================

vi.mock('fs/promises', () => ({
  access: vi.fn(),
  constants: { X_OK: 1 },
}));

vi.mock('../../src/utils/platform.js', () => ({
  getPlatform: vi.fn(),
  getPlatformName: vi.fn(),
}));

vi.mock('../../src/utils/exec.js', () => ({
  execFileAsync: vi.fn(),
}));

// ============================================================================
// Import mocked modules (after vi.mock declarations)
// ============================================================================

import * as fs from 'fs/promises';
import { getPlatform } from '../../src/utils/platform.js';
import { execFileAsync } from '../../src/utils/exec.js';
import { findSoffice, verifyLibreOffice } from '../../src/utils/soffice.js';

const mockedAccess = vi.mocked(fs.access);
const mockedGetPlatform = vi.mocked(getPlatform);
const mockedExecFileAsync = vi.mocked(execFileAsync);

// ============================================================================
// Tests
// ============================================================================

describe('findSoffice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: darwin platform
    mockedGetPlatform.mockReturnValue('darwin');
  });

  it('throws Error with "lacks execute permission" on EACCES', async () => {
    const eaccesError = new Error('EACCES') as NodeJS.ErrnoException;
    eaccesError.code = 'EACCES';
    mockedAccess.mockRejectedValueOnce(eaccesError);

    await expect(findSoffice()).rejects.toThrow('lacks execute permission');
  });

  it('continues to next path on ENOENT and returns the first accessible path', async () => {
    // First path: ENOENT
    const enoentError = new Error('ENOENT') as NodeJS.ErrnoException;
    enoentError.code = 'ENOENT';
    mockedAccess.mockRejectedValueOnce(enoentError);
    // Second path: success
    mockedAccess.mockResolvedValueOnce(undefined);

    const result = await findSoffice();

    // Darwin has 2 known paths; first fails, second succeeds
    expect(result).toBe('/opt/homebrew/bin/soffice');
    expect(mockedAccess).toHaveBeenCalledTimes(2);
  });

  it('falls back to which/where and returns discovered path on success', async () => {
    // All known darwin paths fail with ENOENT
    const enoentError = new Error('ENOENT') as NodeJS.ErrnoException;
    enoentError.code = 'ENOENT';
    mockedAccess.mockRejectedValue(enoentError);

    // which succeeds
    mockedExecFileAsync.mockResolvedValueOnce({
      stdout: '/usr/local/bin/soffice\n',
      stderr: '',
    } as any);

    const result = await findSoffice();

    expect(result).toBe('/usr/local/bin/soffice');
    expect(mockedExecFileAsync).toHaveBeenCalledWith('which', ['soffice']);
  });

  it('returns null when which/where fallback also fails', async () => {
    // All known paths fail
    const enoentError = new Error('ENOENT') as NodeJS.ErrnoException;
    enoentError.code = 'ENOENT';
    mockedAccess.mockRejectedValue(enoentError);

    // which fails
    mockedExecFileAsync.mockRejectedValueOnce(new Error('not found'));

    const result = await findSoffice();

    expect(result).toBeNull();
  });

  it('uses "where" binary on win32 platform', async () => {
    mockedGetPlatform.mockReturnValue('win32');

    // All win32 paths fail
    const enoentError = new Error('ENOENT') as NodeJS.ErrnoException;
    enoentError.code = 'ENOENT';
    mockedAccess.mockRejectedValue(enoentError);

    // where succeeds
    mockedExecFileAsync.mockResolvedValueOnce({
      stdout: 'C:\\Program Files\\LibreOffice\\program\\soffice.exe\n',
      stderr: '',
    } as any);

    const result = await findSoffice();

    expect(mockedExecFileAsync).toHaveBeenCalledWith('where', ['soffice']);
    expect(result).toBe('C:\\Program Files\\LibreOffice\\program\\soffice.exe');
  });

  it('returns first known path when fs.access succeeds immediately', async () => {
    mockedAccess.mockResolvedValueOnce(undefined);

    const result = await findSoffice();

    expect(result).toBe('/Applications/LibreOffice.app/Contents/MacOS/soffice');
    expect(mockedAccess).toHaveBeenCalledTimes(1);
  });
});

describe('verifyLibreOffice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetPlatform.mockReturnValue('darwin');
  });

  it('returns true when findSoffice finds a path', async () => {
    mockedAccess.mockResolvedValueOnce(undefined);

    const result = await verifyLibreOffice();

    expect(result).toBe(true);
  });

  it('returns false when findSoffice returns null', async () => {
    const enoentError = new Error('ENOENT') as NodeJS.ErrnoException;
    enoentError.code = 'ENOENT';
    mockedAccess.mockRejectedValue(enoentError);
    mockedExecFileAsync.mockRejectedValueOnce(new Error('not found'));

    const result = await verifyLibreOffice();

    expect(result).toBe(false);
  });
});
