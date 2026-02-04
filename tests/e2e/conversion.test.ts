/**
 * E2E Conversion Tests
 *
 * Tests full document conversion pipeline with real HTML files.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { convertToPDF, closeBrowser } from '../../src/converters/pdf-converter.js';
import { convertToDOCX, verifyLibreOffice } from '../../src/converters/docx-converter.js';
import * as fs from 'fs/promises';
import * as path from 'path';

const SRS_PATH = '/Users/tamer/Work/AI/Claude/InfraSizingCalculator/docs/srs/SRS_InfraSizingCalculator.html';
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

    it('converts SRS document to PDF', async () => {
      // Skip if SRS file doesn't exist
      try {
        await fs.access(SRS_PATH);
      } catch {
        console.log('Skipping SRS test: File not found at', SRS_PATH);
        return;
      }

      const outputPath = path.join(OUTPUT_DIR, 'srs.pdf');
      const result = await convertToPDF(SRS_PATH, outputPath);

      expect(result.buffer).toBeDefined();
      expect(result.buffer.length).toBeGreaterThan(0);

      const stats = await fs.stat(outputPath);
      expect(stats.size).toBeGreaterThan(10000); // Real document should be larger
    }, 60000);
  });

  describe('DOCX Conversion', () => {
    let hasLibreOffice: boolean;

    beforeAll(async () => {
      hasLibreOffice = await verifyLibreOffice();
      if (!hasLibreOffice) {
        console.log('LibreOffice not installed - DOCX tests will be skipped');
      }
    });

    it('converts simple HTML to DOCX', async () => {
      if (!hasLibreOffice) {
        console.log('Skipping: LibreOffice not installed');
        return;
      }

      const inputPath = path.join(FIXTURES_DIR, 'simple.html');
      const outputPath = path.join(OUTPUT_DIR, 'simple.docx');

      const result = await convertToDOCX(inputPath, outputPath);

      expect(result.success).toBe(true);
      expect(result.outputPath).toBe(outputPath);

      const stats = await fs.stat(outputPath);
      expect(stats.size).toBeGreaterThan(1000);
    }, 60000);

    it('converts document with chapters to DOCX', async () => {
      if (!hasLibreOffice) {
        console.log('Skipping: LibreOffice not installed');
        return;
      }

      const inputPath = path.join(FIXTURES_DIR, 'with-chapters.html');
      const outputPath = path.join(OUTPUT_DIR, 'with-chapters.docx');

      const result = await convertToDOCX(inputPath, outputPath);

      expect(result.success).toBe(true);

      const stats = await fs.stat(outputPath);
      expect(stats.size).toBeGreaterThan(1000);
    }, 60000);

    it('converts document with tables to DOCX', async () => {
      if (!hasLibreOffice) {
        console.log('Skipping: LibreOffice not installed');
        return;
      }

      const inputPath = path.join(FIXTURES_DIR, 'with-tables.html');
      const outputPath = path.join(OUTPUT_DIR, 'with-tables.docx');

      const result = await convertToDOCX(inputPath, outputPath);

      expect(result.success).toBe(true);

      const stats = await fs.stat(outputPath);
      expect(stats.size).toBeGreaterThan(1000);
    }, 60000);

    it('converts SRS document to DOCX', async () => {
      if (!hasLibreOffice) {
        console.log('Skipping: LibreOffice not installed');
        return;
      }

      // Skip if SRS file doesn't exist
      try {
        await fs.access(SRS_PATH);
      } catch {
        console.log('Skipping SRS test: File not found at', SRS_PATH);
        return;
      }

      const outputPath = path.join(OUTPUT_DIR, 'srs.docx');
      const result = await convertToDOCX(SRS_PATH, outputPath);

      expect(result.success).toBe(true);

      const stats = await fs.stat(outputPath);
      expect(stats.size).toBeGreaterThan(1000);
    }, 60000);

    it('returns error when LibreOffice not found', async () => {
      // This test verifies error handling when soffice isn't available
      // We can't easily mock this, so we just verify the function signature works
      const result = await convertToDOCX(
        path.join(FIXTURES_DIR, 'simple.html'),
        path.join(OUTPUT_DIR, 'test-lo-check.docx')
      );

      // Should either succeed (if LO is installed) or return proper error
      if (!hasLibreOffice) {
        expect(result.success).toBe(false);
        expect(result.error).toContain('LibreOffice');
      } else {
        expect(result.success).toBe(true);
      }
    }, 60000);
  });
});
