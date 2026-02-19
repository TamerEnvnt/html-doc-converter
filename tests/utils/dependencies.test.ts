import { describe, it, expect } from 'vitest';
import {
  getInstallInstructions,
  formatDependencyReport,
  checkDependencies,
} from '../../src/utils/dependencies.js';
import type { DependencyCheckResult, DependencyStatus, FoundDependency, MissingDependency } from '../../src/utils/dependencies.js';

describe('dependencies', () => {
  describe('getInstallInstructions', () => {
    it('returns instructions for libreoffice', () => {
      const instructions = getInstallInstructions('libreoffice');
      expect(instructions).toContain('LibreOffice');
      expect(instructions.length).toBeGreaterThan(10);
    });

    it('returns instructions for chromium', () => {
      const instructions = getInstallInstructions('chromium');
      expect(instructions).toContain('Puppeteer');
    });

    it('returns fallback for unknown dependency', () => {
      const instructions = getInstallInstructions('unknown-dep');
      expect(instructions).toContain('install');
    });
  });

  describe('formatDependencyReport', () => {
    it('formats all-found result with success message', () => {
      const result: DependencyCheckResult = {
        allFound: true,
        dependencies: [
          { name: 'TestDep', required: true, found: true as const, version: '1.0', path: '/usr/bin/test' },
        ],
      };

      const report = formatDependencyReport(result);
      expect(report).toContain('TestDep');
      expect(report).toContain('1.0');
      expect(report).toContain('/usr/bin/test');
      expect(report).toContain('All required');
    });

    it('formats missing dependency with install hint', () => {
      const result: DependencyCheckResult = {
        allFound: false,
        dependencies: [
          {
            name: 'MissingDep',
            required: true,
            found: false as const,
            installHint: 'Run: apt install missing-dep',
          },
        ],
      };

      const report = formatDependencyReport(result);
      expect(report).toContain('MissingDep');
      expect(report).toContain('apt install');
      expect(report).toContain('missing');
    });

    it('includes System header', () => {
      const result: DependencyCheckResult = {
        allFound: true,
        dependencies: [],
      };

      const report = formatDependencyReport(result);
      expect(report).toContain('System');
    });

    it('shows found dep without version', () => {
      const result: DependencyCheckResult = {
        allFound: true,
        dependencies: [
          { name: 'BasicDep', required: true, found: true as const, path: '/usr/bin/basic' },
        ],
      };

      const report = formatDependencyReport(result);
      expect(report).toContain('BasicDep');
      expect(report).toContain('/usr/bin/basic');
    });
  });

  describe('checkDependencies', () => {
    it('returns DependencyCheckResult structure', async () => {
      const result = await checkDependencies();
      expect(result).toHaveProperty('allFound');
      expect(result).toHaveProperty('dependencies');
      expect(Array.isArray(result.dependencies)).toBe(true);
    });

    it('checks at least 2 dependencies', async () => {
      const result = await checkDependencies();
      expect(result.dependencies.length).toBeGreaterThanOrEqual(2);
    });

    it('each dependency has required structure', async () => {
      const result = await checkDependencies();
      for (const dep of result.dependencies) {
        expect(dep).toHaveProperty('name');
        expect(dep).toHaveProperty('required');
        expect(dep).toHaveProperty('found');
        expect(typeof dep.name).toBe('string');
        expect(typeof dep.required).toBe('boolean');
        expect(typeof dep.found).toBe('boolean');
      }
    });

    it('allFound reflects dependency states', async () => {
      const result = await checkDependencies();
      const allRequiredFound = result.dependencies.every(
        (d) => d.found || !d.required
      );
      expect(result.allFound).toBe(allRequiredFound);
    });
  });
});
