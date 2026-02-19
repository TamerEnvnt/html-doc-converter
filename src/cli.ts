#!/usr/bin/env node
/**
 * HTML Document Converter CLI
 *
 * Command-line interface for converting HTML documents to PDF and DOCX.
 */

import { Command } from 'commander';
import { createRequire } from 'module';
import { convertToPDF, closeBrowser } from './converters/pdf-converter.js';
import { convertToDOCX } from './converters/docx-converter.js';
import { verifyLibreOffice } from './utils/soffice.js';
import * as path from 'path';
import * as fs from 'fs/promises';
import {
  resolveOutputPaths,
  ensureOutputDirectory,
  validatePath,
} from './utils/output-handler.js';
import {
  ConversionError,
  ErrorCodes,
  formatError,
  createError,
} from './utils/errors.js';
import { colors } from './utils/colors.js';
import {
  checkDependencies,
  formatDependencyReport,
} from './utils/dependencies.js';
import { setVerbose, verbose } from './utils/logger.js';
import { determineFormats, parseTimeout, validateInputFile } from './cli-helpers.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { version: string };

interface CLIOptions {
  output?: string;
  format?: string;
  pdfOnly?: boolean;
  docxOnly?: boolean;
  timeout?: string;
  landscape?: boolean;
  force?: boolean;
  verbose?: boolean;
}

const program = new Command();

program
  .name('html-doc-converter')
  .description('Convert HTML documents to PDF and DOCX')
  .version(pkg.version)
  .argument('<input>', 'Input HTML file path')
  .option('-o, --output <path>', 'Output file path (without extension)')
  .option('-f, --format <format>', 'Output format: pdf, docx, or both', 'both')
  .option('--pdf-only', 'Generate PDF only')
  .option('--docx-only', 'Generate DOCX only')
  .option('-t, --timeout <ms>', 'Conversion timeout in milliseconds', '60000')
  .option('-l, --landscape', 'Use landscape orientation for PDF (recommended for wide tables/diagrams)')
  .option('--force', 'Overwrite existing output files without prompting')
  .option('-v, --verbose', 'Show detailed output for debugging')
  .addHelpText('after', `
Examples:
  $ html-doc-converter document.html
  $ html-doc-converter document.html -o output/report
  $ html-doc-converter document.html --pdf-only
  $ html-doc-converter document.html -f docx
  $ html-doc-converter document.html --landscape  # For wide tables/diagrams
  $ html-doc-converter document.html --timeout 120000
  $ html-doc-converter document.html --verbose
`)
  .action(async (input: string, options: CLIOptions) => {
    // Enable verbose logging if requested
    if (options.verbose) {
      setVerbose(true);
    }

    let successCount = 0;
    let errorCount = 0;
    const createdFiles: string[] = [];

    try {
      // Resolve and validate input path
      const inputPath = path.resolve(input);
      validatePath(inputPath);
      verbose('Resolved input path:', inputPath);

      // Validate input file (exists, HTML extension, non-empty)
      const { fileSize, isLargeFile } = await validateInputFile(inputPath);
      verbose('File size:', fileSize, 'bytes', isLargeFile ? '(large)' : '');

      // Resolve output paths using output handler
      const outputPaths = resolveOutputPaths(inputPath, options.output);

      // Validate output paths stay within allowed directories
      if (options.output) {
        // User specified output: allow the output's parent directory
        const outputRoot = path.resolve(path.dirname(options.output));
        validatePath(outputPaths.pdf, outputRoot);
        validatePath(outputPaths.docx, outputRoot);
      } else {
        // Default output: must stay within cwd
        validatePath(outputPaths.pdf);
        validatePath(outputPaths.docx);
      }
      verbose('Output paths:', outputPaths);

      // Determine formats (before overwrite check so we know which files to check)
      const { generatePDF, generateDOCX } = determineFormats(options);

      // Check for existing output files (unless --force)
      // Note: Still check-then-act (inherent TOCTOU), but async fs.access reduces
      // the sync→async time gap. Real overwrite protection is in converters themselves
      // (Puppeteer writes atomically, LibreOffice uses tempdir + rename).
      if (!options.force) {
        const existing: string[] = [];
        if (generatePDF) {
          try { await fs.access(outputPaths.pdf); existing.push(outputPaths.pdf); } catch { /* doesn't exist - good */ }
        }
        if (generateDOCX) {
          try { await fs.access(outputPaths.docx); existing.push(outputPaths.docx); } catch { /* doesn't exist - good */ }
        }

        if (existing.length > 0) {
          throw createError(ErrorCodes.FILE_EXISTS, existing.join(', '));
        }
      }

      // Ensure output directory exists
      try {
        await ensureOutputDirectory(outputPaths.outputDir);
      } catch (err) {
        throw createError(
          ErrorCodes.OUTPUT_DIR_FAILED,
          `${outputPaths.outputDir}: ${err instanceof Error ? err.message : 'unknown error'}`
        );
      }

      // Check LibreOffice if DOCX needed
      if (generateDOCX) {
        verbose('Checking LibreOffice availability...');
        const hasLO = await verifyLibreOffice();
        if (!hasLO) {
          throw createError(ErrorCodes.LIBREOFFICE_MISSING);
        }
        verbose('LibreOffice found');
      }

      // Parse and validate timeout option
      const timeout = parseTimeout(options.timeout);
      verbose('Timeout set to:', timeout, 'ms');

      // Progress: Start
      console.log('');
      console.log('Converting HTML to documents...');
      console.log(`  Input: ${inputPath}`);
      if (isLargeFile) {
        const sizeMB = (fileSize / 1_000_000).toFixed(1);
        console.log(`  ${colors.yellow(`Large file detected (${sizeMB}MB). This may take a moment...`)}`);
      }
      console.log('');

      // Convert PDF
      if (generatePDF) {
        verbose('Starting PDF conversion...');
        process.stdout.write(`  ${colors.blue('[PDF]')}  Generating...`);
        try {
          await convertToPDF(inputPath, outputPaths.pdf, {
            timeout,
            landscape: options.landscape ?? false,
          });
          verbose('PDF conversion completed');
          console.log(` ${colors.green('Done')}`);
          console.log(`         ${colors.dim('->')} ${outputPaths.pdf}`);
          successCount++;
          createdFiles.push(outputPaths.pdf);
        } catch (err) {
          console.log(` ${colors.red('FAILED')}`);
          errorCount++;
          if (err instanceof ConversionError) {
            console.error(`         ${formatError(err)}`);
          } else {
            const pdfError = createError(
              ErrorCodes.PDF_FAILED,
              err instanceof Error ? err.message : 'unknown error'
            );
            console.error(`         ${formatError(pdfError)}`);
          }
        }
      }

      // Convert DOCX
      if (generateDOCX) {
        verbose('Starting DOCX conversion...');
        process.stdout.write(`  ${colors.blue('[DOCX]')} Generating...`);
        try {
          await convertToDOCX(inputPath, outputPaths.docx, { timeout });
          verbose('DOCX conversion completed');
          console.log(` ${colors.green('Done')}`);
          console.log(`         ${colors.dim('->')} ${outputPaths.docx}`);
          successCount++;
          createdFiles.push(outputPaths.docx);
        } catch (err) {
          console.log(` ${colors.red('FAILED')}`);
          errorCount++;
          if (err instanceof ConversionError) {
            console.error(`         ${formatError(err)}`);
          } else {
            const docxError = createError(
              ErrorCodes.DOCX_FAILED,
              err instanceof Error ? err.message : 'unknown error'
            );
            console.error(`         ${formatError(docxError)}`);
          }
        }
      }

      // Summary
      console.log('');
      console.log(colors.bold('Summary:'));
      if (successCount > 0) {
        console.log(`  ${colors.green(successCount.toString())} file(s) created successfully`);
        createdFiles.forEach(f => console.log(`    ${colors.dim('-')} ${f}`));
      }
      if (errorCount > 0) {
        console.log(`  ${colors.red(errorCount.toString())} error(s) encountered`);
      }
      console.log('');

      // Exit with appropriate code
      if (errorCount > 0 && successCount === 0) {
        process.exit(1);  // Complete failure
      } else if (errorCount > 0) {
        process.exit(2);  // Partial failure (some succeeded, some failed)
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
    try {
      console.log('');
      console.log('Checking dependencies...');
      console.log('');
      const result = await checkDependencies();
      console.log(formatDependencyReport(result));
      console.log('');
      process.exit(result.allFound ? 0 : 1);
    } catch (error) {
      console.error('');
      if (error instanceof ConversionError) {
        console.error(formatError(error));
      } else {
        console.error('Error checking dependencies:', error instanceof Error ? error.message : error);
      }
      console.error('');
      process.exit(1);
    }
  });

// Graceful cleanup on termination signals
const handleSignal = async (signal: string): Promise<void> => {
  verbose(`Received ${signal}, cleaning up...`);
  await closeBrowser();
  process.exit(128 + (signal === 'SIGINT' ? 2 : 15));
};

process.on('SIGINT', () => { handleSignal('SIGINT').catch(() => process.exit(130)); });
process.on('SIGTERM', () => { handleSignal('SIGTERM').catch(() => process.exit(143)); });

program.parse();
