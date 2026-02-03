#!/usr/bin/env node
/**
 * CLI entry point for HTML Document Converter
 */

import { Command } from 'commander';

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
  .action(async (input: string, options) => {
    // TODO: Implement conversion logic in Phase 5
    console.log('HTML Document Converter');
    console.log(`Input: ${input}`);
    console.log(`Options:`, options);
    console.log('\nConversion not yet implemented. See Phase 3-5.');
  });

program.parse();
