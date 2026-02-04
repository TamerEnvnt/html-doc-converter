#!/usr/bin/env node
/**
 * HTML Document Converter CLI
 *
 * Command-line interface for converting HTML documents to PDF and DOCX.
 */

import { Command } from 'commander';
import { convertToPDF, closeBrowser } from './converters/pdf-converter.js';
import { convertToDOCX, verifyLibreOffice } from './converters/docx-converter.js';
import * as path from 'path';
import * as fs from 'fs/promises';

const program = new Command();

program
  .name('html-doc-converter')
  .description('Convert HTML documents to PDF and DOCX')
  .version('1.0.0')
  .argument('<input>', 'Input HTML file path')
  .option('-o, --output <path>', 'Output file path (without extension)')
  .option('-f, --format <format>', 'Output format: pdf, docx, or both', 'both')
  .option('--pdf-only', 'Generate PDF only')
  .option('--docx-only', 'Generate DOCX only')
  .addHelpText('after', `
Examples:
  $ html-doc-converter document.html
  $ html-doc-converter document.html -o output/report
  $ html-doc-converter document.html --pdf-only
  $ html-doc-converter document.html -f docx
`)
  .action(async (input: string, options: {
    output?: string;
    format?: string;
    pdfOnly?: boolean;
    docxOnly?: boolean;
  }) => {
    try {
      // Resolve and validate input path
      const inputPath = path.resolve(input);

      // 1. Check input file exists
      try {
        await fs.access(inputPath);
      } catch {
        console.error(`Error: Input file not found: ${inputPath}`);
        process.exit(1);
      }

      // 2. Check it's an HTML file
      const ext = path.extname(inputPath).toLowerCase();
      if (ext !== '.html' && ext !== '.htm') {
        console.error(`Error: Input must be an HTML file (got ${ext})`);
        process.exit(1);
      }

      // Determine output base path
      const outputBase = options.output
        ? path.resolve(options.output)
        : inputPath.replace(/\.[^.]+$/, '');

      // 3. Check output directory is writable
      const outputDir = path.dirname(outputBase);
      try {
        await fs.access(outputDir, fs.constants.W_OK);
      } catch {
        // Try to create it
        await fs.mkdir(outputDir, { recursive: true });
      }

      // Determine formats
      let generatePDF = true;
      let generateDOCX = true;

      if (options.pdfOnly) {
        generateDOCX = false;
      } else if (options.docxOnly) {
        generatePDF = false;
      } else if (options.format) {
        generatePDF = options.format === 'pdf' || options.format === 'both';
        generateDOCX = options.format === 'docx' || options.format === 'both';
      }

      // Check LibreOffice if DOCX needed
      if (generateDOCX) {
        const hasLO = await verifyLibreOffice();
        if (!hasLO) {
          console.error('Error: LibreOffice not found. Install it for DOCX conversion.');
          console.error('       Or use --pdf-only to generate PDF only.');
          process.exit(1);
        }
      }

      // Convert
      console.log(`Converting: ${inputPath}`);

      if (generatePDF) {
        const pdfPath = `${outputBase}.pdf`;
        console.log(`  -> PDF: ${pdfPath}`);
        await convertToPDF(inputPath, pdfPath);
        console.log('    Done: PDF created');
      }

      if (generateDOCX) {
        const docxPath = `${outputBase}.docx`;
        console.log(`  -> DOCX: ${docxPath}`);
        const result = await convertToDOCX(inputPath, docxPath);
        if (result.success) {
          console.log('    Done: DOCX created');
        } else {
          console.error(`    Failed: DOCX error - ${result.error}`);
        }
      }

      console.log('Conversion complete!');

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    } finally {
      await closeBrowser();
    }
  });

program.parse();
