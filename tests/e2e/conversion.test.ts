/**
 * E2E Conversion Tests
 *
 * Tests full document conversion pipeline with real HTML files.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { convertToPDF, closeBrowser } from '../../src/converters/pdf-converter.js';
import { convertToDOCX, verifyLibreOffice } from '../../src/converters/docx-converter.js';
import { ConversionError } from '../../src/utils/errors.js';
import { existsSync } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';

// Module-level checks for conditional test execution
const hasLibreOffice = await verifyLibreOffice();
const SRS_PATH = process.env.SRS_TEST_PATH || '';
const hasSrsFile = SRS_PATH !== '' && existsSync(SRS_PATH);

const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');
const OUTPUT_DIR = path.join(__dirname, '..', 'output');

describe('E2E Conversion', () => {
  beforeAll(async () => {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  });

  afterAll(async () => {
    await closeBrowser();
  });

  describe('PDF Conversion', () => {
    it('converts simple HTML to PDF', async () => {
      const inputPath = path.join(FIXTURES_DIR, 'simple.html');
      const outputPath = path.join(OUTPUT_DIR, 'simple.pdf');

      const result = await convertToPDF(inputPath, outputPath);

      expect(result.buffer).toBeDefined();
      expect(result.buffer.length).toBeGreaterThan(0);

      const stats = await fs.stat(outputPath);
      expect(stats.size).toBeGreaterThan(1000);
    }, 60000);

    it('converts document with chapters to PDF', async () => {
      const inputPath = path.join(FIXTURES_DIR, 'with-chapters.html');
      const outputPath = path.join(OUTPUT_DIR, 'with-chapters.pdf');

      const result = await convertToPDF(inputPath, outputPath);

      expect(result.buffer).toBeDefined();
      expect(result.buffer.length).toBeGreaterThan(0);

      const stats = await fs.stat(outputPath);
      expect(stats.size).toBeGreaterThan(1000);
    }, 60000);

    it('converts document with tables to PDF', async () => {
      const inputPath = path.join(FIXTURES_DIR, 'with-tables.html');
      const outputPath = path.join(OUTPUT_DIR, 'with-tables.pdf');

      const result = await convertToPDF(inputPath, outputPath);

      expect(result.buffer).toBeDefined();

      const stats = await fs.stat(outputPath);
      expect(stats.size).toBeGreaterThan(1000);
    }, 60000);

    it.skipIf(!hasSrsFile)('converts SRS document to PDF', async () => {
      const outputPath = path.join(OUTPUT_DIR, 'srs.pdf');
      const result = await convertToPDF(SRS_PATH, outputPath);

      expect(result.buffer).toBeDefined();
      expect(result.buffer.length).toBeGreaterThan(0);

      const stats = await fs.stat(outputPath);
      expect(stats.size).toBeGreaterThan(10000);
    }, 60000);
  });

  describe.skipIf(!hasLibreOffice)('DOCX Conversion', () => {
    it('converts simple HTML to DOCX', async () => {
      const inputPath = path.join(FIXTURES_DIR, 'simple.html');
      const outputPath = path.join(OUTPUT_DIR, 'simple.docx');

      const result = await convertToDOCX(inputPath, outputPath);

      expect(result.outputPath).toBe(outputPath);

      const stats = await fs.stat(outputPath);
      expect(stats.size).toBeGreaterThan(1000);
    }, 60000);

    it('converts document with chapters to DOCX', async () => {
      const inputPath = path.join(FIXTURES_DIR, 'with-chapters.html');
      const outputPath = path.join(OUTPUT_DIR, 'with-chapters.docx');

      await convertToDOCX(inputPath, outputPath);

      const stats = await fs.stat(outputPath);
      expect(stats.size).toBeGreaterThan(1000);
    }, 60000);

    it('converts document with tables to DOCX', async () => {
      const inputPath = path.join(FIXTURES_DIR, 'with-tables.html');
      const outputPath = path.join(OUTPUT_DIR, 'with-tables.docx');

      await convertToDOCX(inputPath, outputPath);

      const stats = await fs.stat(outputPath);
      expect(stats.size).toBeGreaterThan(1000);
    }, 60000);

    it.skipIf(!hasSrsFile)('converts SRS document to DOCX', async () => {
      const outputPath = path.join(OUTPUT_DIR, 'srs.docx');
      await convertToDOCX(SRS_PATH, outputPath);

      const stats = await fs.stat(outputPath);
      expect(stats.size).toBeGreaterThan(1000);
    }, 60000);
  });

  describe('DOCX Error Handling', () => {
    it('throws ConversionError when LibreOffice not found or succeeds', async () => {
      if (!hasLibreOffice) {
        // Should throw ConversionError when LO is not installed
        await expect(
          convertToDOCX(
            path.join(FIXTURES_DIR, 'simple.html'),
            path.join(OUTPUT_DIR, 'test-lo-check.docx')
          )
        ).rejects.toThrow(ConversionError);
      } else {
        // Should succeed when LO is installed
        const result = await convertToDOCX(
          path.join(FIXTURES_DIR, 'simple.html'),
          path.join(OUTPUT_DIR, 'test-lo-check.docx')
        );
        expect(result.outputPath).toBeDefined();
        expect(result).not.toHaveProperty('success');
        expect(result).not.toHaveProperty('error');
      }
    }, 60000);
  });
});
