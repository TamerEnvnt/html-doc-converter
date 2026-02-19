import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import { mkdtempSync, existsSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import {
  resolveOutputPaths,
  ensureOutputDirectory,
  validatePath,
} from '../../src/utils/output-handler.js';

describe('output-handler', () => {
  describe('resolveOutputPaths', () => {
    it('uses input filename and directory when no output specified', () => {
      const result = resolveOutputPaths('/home/user/doc.html');
      expect(result.pdf).toBe('/home/user/doc.pdf');
      expect(result.docx).toBe('/home/user/doc.docx');
      expect(result.baseName).toBe('doc');
      expect(result.outputDir).toBe('/home/user');
    });

    it('uses specified output path without extension', () => {
      const result = resolveOutputPaths('/home/user/doc.html', '/out/report');
      expect(result.pdf).toContain('/out/report.pdf');
      expect(result.docx).toContain('/out/report.docx');
    });

    it('strips .pdf extension from output and adds both', () => {
      const result = resolveOutputPaths('/home/user/doc.html', '/out/report.pdf');
      expect(result.pdf).toContain('/out/report.pdf');
      expect(result.docx).toContain('/out/report.docx');
    });

    it('strips .docx extension from output and adds both', () => {
      const result = resolveOutputPaths('/home/user/doc.html', '/out/report.docx');
      expect(result.pdf).toContain('/out/report.pdf');
      expect(result.docx).toContain('/out/report.docx');
    });

    it('resolves relative output path to absolute', () => {
      const result = resolveOutputPaths('/home/user/doc.html', 'output/result');
      expect(path.isAbsolute(result.pdf)).toBe(true);
      expect(path.isAbsolute(result.docx)).toBe(true);
    });

    it('handles .htm extension', () => {
      const result = resolveOutputPaths('/home/user/doc.htm');
      expect(result.pdf).toBe('/home/user/doc.pdf');
      expect(result.docx).toBe('/home/user/doc.docx');
    });
  });

  describe('ensureOutputDirectory', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = mkdtempSync(path.join(tmpdir(), 'test-output-'));
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('succeeds for existing directory', async () => {
      await expect(ensureOutputDirectory(tempDir)).resolves.toBeUndefined();
    });

    it('creates non-existing directory', async () => {
      const newDir = path.join(tempDir, 'new-dir');
      await ensureOutputDirectory(newDir);
      expect(existsSync(newDir)).toBe(true);
    });

    it('creates nested non-existing directories', async () => {
      const nestedDir = path.join(tempDir, 'a', 'b', 'c');
      await ensureOutputDirectory(nestedDir);
      expect(existsSync(nestedDir)).toBe(true);
    });
  });

  describe('validatePath', () => {
    it('allows path within cwd', () => {
      const cwd = process.cwd();
      const safePath = path.join(cwd, 'subdir', 'file.html');
      expect(() => validatePath(safePath)).not.toThrow();
    });

    it('throws for path outside cwd', () => {
      expect(() => validatePath('/etc/passwd')).toThrow();
    });

    it('throws with PATH_TRAVERSAL code', () => {
      try {
        validatePath('/etc/passwd');
      } catch (err: unknown) {
        const convErr = err as { code: string };
        expect(convErr.code).toBe('PATH_TRAVERSAL');
      }
    });

    it('allows path within custom allowedRoot', () => {
      const root = '/home/user/projects';
      const safe = '/home/user/projects/app/file.ts';
      expect(() => validatePath(safe, root)).not.toThrow();
    });

    it('throws for path outside custom allowedRoot', () => {
      const root = '/home/user/projects';
      const outside = '/home/user/other/file.ts';
      expect(() => validatePath(outside, root)).toThrow();
    });

    it('detects normalized .. traversal', () => {
      const cwd = process.cwd();
      const traversal = path.normalize(path.join(cwd, '..', '..', 'etc', 'passwd'));
      expect(() => validatePath(traversal)).toThrow();
    });

    it('allows the root directory itself', () => {
      const cwd = process.cwd();
      expect(() => validatePath(cwd)).not.toThrow();
    });
  });
});
