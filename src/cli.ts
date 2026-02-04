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
import {
  resolveOutputPaths,
  ensureOutputDirectory,
} from './utils/output-handler.js';
import {
  ConversionError,
  ErrorCodes,
  formatError,
  createError,
} from './utils/errors.js';
import {
  checkDependencies,
  formatDependencyReport,
} from './utils/dependencies.js';

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
    let successCount = 0;
    let errorCount = 0;
    const createdFiles: string[] = [];

    try {
      // Resolve and validate input path
      const inputPath = path.resolve(input);

      // 1. Check input file exists
      try {
        await fs.access(inputPath);
      } catch {
        throw createError(ErrorCodes.INPUT_NOT_FOUND, inputPath);
      }

      // 2. Check it's an HTML file
      const ext = path.extname(inputPath).toLowerCase();
      if (ext !== '.html' && ext !== '.htm') {
        throw createError(ErrorCodes.INVALID_FORMAT, `expected .html or .htm, got ${ext}`);
      }

      // Resolve output paths using output handler
      const outputPaths = resolveOutputPaths(inputPath, options.output);

      // 3. Ensure output directory exists
      try {
        await ensureOutputDirectory(outputPaths.outputDir);
      } catch (err) {
        throw createError(
          ErrorCodes.OUTPUT_DIR_FAILED,
          `${outputPaths.outputDir}: ${err instanceof Error ? err.message : 'unknown error'}`
        );
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
          throw createError(ErrorCodes.LIBREOFFICE_MISSING);
        }
      }

      // Progress: Start
      console.log('');
      console.log('Converting HTML to documents...');
      console.log(`  Input: ${inputPath}`);
      console.log('');

      // Convert PDF
      if (generatePDF) {
        process.stdout.write('  [PDF]  Generating...');
        try {
          await convertToPDF(inputPath, outputPaths.pdf);
          console.log(' Done');
          console.log(`         -> ${outputPaths.pdf}`);
          successCount++;
          createdFiles.push(outputPaths.pdf);
        } catch (err) {
          console.log(' FAILED');
          errorCount++;
          const pdfError = createError(
            ErrorCodes.PDF_FAILED,
            err instanceof Error ? err.message : 'unknown error'
          );
          console.error(`         ${formatError(pdfError)}`);
        }
      }

      // Convert DOCX
      if (generateDOCX) {
        process.stdout.write('  [DOCX] Generating...');
        try {
          const result = await convertToDOCX(inputPath, outputPaths.docx);
          if (result.success) {
            console.log(' Done');
            console.log(`         -> ${outputPaths.docx}`);
            successCount++;
            createdFiles.push(outputPaths.docx);
          } else {
            console.log(' FAILED');
            errorCount++;
            const docxError = createError(ErrorCodes.DOCX_FAILED, result.error);
            console.error(`         ${formatError(docxError)}`);
          }
        } catch (err) {
          console.log(' FAILED');
          errorCount++;
          const docxError = createError(
            ErrorCodes.DOCX_FAILED,
            err instanceof Error ? err.message : 'unknown error'
          );
          console.error(`         ${formatError(docxError)}`);
        }
      }

      // Summary
      console.log('');
      console.log('Summary:');
      if (successCount > 0) {
        console.log(`  ${successCount} file(s) created successfully`);
        createdFiles.forEach(f => console.log(`    - ${f}`));
      }
      if (errorCount > 0) {
        console.log(`  ${errorCount} error(s) encountered`);
      }
      console.log('');

      // Exit with error code if any failures
      if (errorCount > 0 && successCount === 0) {
        process.exit(1);
      }

    } catch (error) {
      console.error('');
      if (error instanceof ConversionError) {
        console.error(formatError(error));
      } else {
        console.error('Error:', error instanceof Error ? error.message : error);
      }
      console.error('');
      process.exit(1);
    } finally {
      await closeBrowser();
    }
  });

// Check dependencies command
program
  .command('check')
  .description('Check system dependencies (LibreOffice, Chromium)')
  .action(async () => {
    console.log('');
    console.log('Checking dependencies...');
    console.log('');

    const result = await checkDependencies();
    console.log(formatDependencyReport(result));
    console.log('');

    process.exit(result.allFound ? 0 : 1);
  });

program.parse();
