/**
 * PDF Converter Module
 *
 * Converts HTML documents to PDF using Puppeteer with full CSS support.
 */

import puppeteer, { Browser } from 'puppeteer';
import path from 'path';
import { parseDocument, ParsedDocument } from '../parsers/html-parser.js';

// ============================================================================
// Types
// ============================================================================

export interface PDFOptions {
  format?: 'A4' | 'Letter' | 'Legal';
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  preferCSSPageSize?: boolean;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  scale?: number;
  timeout?: number;
}

export interface PDFResult {
  buffer: Buffer;
  pageCount?: number;
}

// ============================================================================
// Browser Management (Singleton)
// ============================================================================

let browserInstance: Browser | null = null;

/**
 * Get or create browser instance (singleton pattern)
 */
async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserInstance;
}

/**
 * Close browser instance and cleanup
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

// ============================================================================
// PDF Generation
// ============================================================================

/**
 * Convert HTML file to PDF with full CSS support
 * @param htmlPath - Path to HTML file
 * @param outputPath - Path for output PDF
 * @param options - PDF generation options
 */
export async function convertToPDF(
  htmlPath: string,
  outputPath: string,
  options: PDFOptions = {}
): Promise<PDFResult> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Load HTML file with file:// protocol
    const absolutePath = path.resolve(htmlPath);
    const navigationTimeout = options.timeout || 60000;
    await page.goto(`file://${absolutePath}`, {
      waitUntil: 'networkidle0', // Wait for all resources
      timeout: navigationTimeout,
    });

    // Inject CSS for print optimization
    await page.addStyleTag({
      content: `
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Force tables to fit within page width */
        table {
          max-width: 100% !important;
          width: 100% !important;
          table-layout: fixed !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }

        /* Prevent cell overflow - wrap text */
        td, th {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          max-width: 100% !important;
        }

        /* Hide scrollbars - content should fit */
        ::-webkit-scrollbar {
          display: none !important;
        }

        /* Ensure no horizontal overflow */
        body, html, div {
          max-width: 100% !important;
          overflow-x: hidden !important;
        }

        /* Handle overflow containers */
        [style*="overflow"], .overflow-auto, .overflow-x-auto {
          overflow: visible !important;
        }
      `,
    });

    // Generate PDF with merged options
    const pdfTimeout = options.timeout || 60000;
    const pdfOptions = {
      path: outputPath,
      format: options.format || 'A4',
      printBackground: options.printBackground ?? true, // Default TRUE for gradients
      preferCSSPageSize: options.preferCSSPageSize ?? true, // Respect @page CSS
      landscape: options.landscape ?? false,
      margin: options.margin || {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
      displayHeaderFooter: options.displayHeaderFooter ?? false,
      headerTemplate: options.headerTemplate || '',
      footerTemplate: options.footerTemplate || '',
      scale: options.scale || 1,
      timeout: pdfTimeout,
    };

    const pdfBuffer = await page.pdf(pdfOptions);

    return {
      buffer: Buffer.from(pdfBuffer),
    };
  } finally {
    await page.close(); // Always close page, keep browser
  }
}

/**
 * Convert HTML file to PDF with document parsing
 * @param htmlPath - Path to HTML file
 * @param outputPath - Path for output PDF
 * @param options - PDF generation options
 */
export async function convertHTMLFileToPDF(
  htmlPath: string,
  outputPath: string,
  options?: PDFOptions
): Promise<{ document: ParsedDocument; pdf: PDFResult }> {
  // Parse document for metadata (optional enrichment)
  const document = await parseDocument(htmlPath);

  // Generate PDF
  const pdf = await convertToPDF(htmlPath, outputPath, options);

  return { document, pdf };
}

/**
 * Convert HTML string to PDF
 * @param html - HTML content string
 * @param outputPath - Path for output PDF
 * @param options - PDF generation options
 */
export async function convertHTMLStringToPDF(
  html: string,
  outputPath: string,
  options: PDFOptions = {}
): Promise<PDFResult> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Inject CSS for print optimization
    await page.addStyleTag({
      content: `
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Force tables to fit within page width */
        table {
          max-width: 100% !important;
          width: 100% !important;
          table-layout: fixed !important;
          word-wrap: break-word !important;
        }

        td, th {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }

        body, html, div {
          max-width: 100% !important;
          overflow-x: hidden !important;
        }
      `,
    });

    // Generate PDF with merged options
    const pdfOptions = {
      path: outputPath,
      format: options.format || 'A4',
      printBackground: options.printBackground ?? true,
      preferCSSPageSize: options.preferCSSPageSize ?? true,
      landscape: options.landscape ?? false,
      margin: options.margin || {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
      displayHeaderFooter: options.displayHeaderFooter ?? false,
      headerTemplate: options.headerTemplate || '',
      footerTemplate: options.footerTemplate || '',
      scale: options.scale || 1,
    };

    const pdfBuffer = await page.pdf(pdfOptions);

    return {
      buffer: Buffer.from(pdfBuffer),
    };
  } finally {
    await page.close();
  }
}
