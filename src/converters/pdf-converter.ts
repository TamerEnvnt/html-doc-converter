/**
 * PDF Converter Module
 *
 * Converts HTML documents to PDF using Puppeteer with full CSS support.
 */

import puppeteer, { Browser } from 'puppeteer';
import path from 'path';
import { parseDocument, ParsedDocument } from '../parsers/html-parser.js';
import { createError, ErrorCodes } from '../utils/errors.js';

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
  readonly buffer: Buffer;
}

// ============================================================================
// Browser Management (Singleton)
// ============================================================================

let browserInstance: Browser | null = null;
let browserLaunchPromise: Promise<Browser> | null = null;

/**
 * Get or create browser instance (singleton pattern).
 * Uses a promise-based lock to prevent concurrent launches.
 */
export async function getBrowser(): Promise<Browser> {
  // If a launch is already in progress, wait for it
  if (browserLaunchPromise) {
    return browserLaunchPromise;
  }

  // If we have a connected browser, reuse it
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  // Clear stale reference if disconnected
  browserInstance = null;

  // Launch new browser with promise lock
  browserLaunchPromise = puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const browser = await browserLaunchPromise;
    browserInstance = browser;

    // Auto-clear stale references on crash/disconnect
    browser.on('disconnected', () => {
      browserInstance = null;
      browserLaunchPromise = null;
    });

    return browser;
  } catch (error) {
    // Clear promise so next call retries instead of caching a rejected promise
    throw error;
  } finally {
    browserLaunchPromise = null;
  }
}

/**
 * Close browser instance and cleanup.
 * Safe to call in finally blocks - never throws.
 */
export async function closeBrowser(): Promise<void> {
  const instance = browserInstance;
  // Always clear references first, even before close() attempt
  browserInstance = null;
  browserLaunchPromise = null;

  if (instance) {
    try {
      await instance.close();
    } catch {
      // Silently discard close errors - this is cleanup code
      // and must be safe for use in finally blocks
    }
  }
}


// ============================================================================
// Internal Helpers (shared between convertToPDF and convertHTMLStringToPDF)
// ============================================================================

/** Check if an error is a Puppeteer timeout error */
function isTimeoutError(error: unknown): boolean {
  return error instanceof Error &&
    (error.name === 'TimeoutError' || error.message.includes('timeout'));
}

/** Build merged PDF options from user options + defaults */
function buildPdfOptions(outputPath: string, options: PDFOptions, timeout: number) {
  // Library-level validation: catch invalid values at the boundary
  if (options.scale !== undefined && (options.scale < 0.1 || options.scale > 2)) {
    throw createError(ErrorCodes.INVALID_FORMAT,
      `PDF scale must be between 0.1 and 2, got ${options.scale}`);
  }
  if (timeout <= 0) {
    throw createError(ErrorCodes.INVALID_TIMEOUT, String(timeout));
  }

  return {
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
    timeout,
  };
}

/** Generate PDF with timeout detection. Returns raw Buffer. */
async function generatePdf(
  page: import('puppeteer').Page,
  pdfOptions: ReturnType<typeof buildPdfOptions>,
): Promise<Buffer> {
  try {
    const pdfBuffer = await page.pdf(pdfOptions);
    return Buffer.from(pdfBuffer);
  } catch (error) {
    if (isTimeoutError(error)) {
      throw createError(ErrorCodes.TIMEOUT, `PDF generation timed out after ${pdfOptions.timeout}ms`);
    }
    throw error;
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
    // Set wide viewport to capture all content before printing
    await page.setViewport({ width: 1200, height: 800 });

    // Load HTML file with file:// protocol
    const absolutePath = path.resolve(htmlPath);
    const navigationTimeout = options.timeout ?? 60000;
    try {
      await page.goto(`file://${absolutePath}`, {
        waitUntil: 'networkidle0', // Wait for all resources
        timeout: navigationTimeout,
      });
    } catch (error) {
      if (isTimeoutError(error)) {
        throw createError(ErrorCodes.TIMEOUT, `PDF navigation timed out after ${navigationTimeout}ms`);
      }
      throw error;
    }

    // Inject CSS for print optimization
    try {
      await page.addStyleTag({
        content: `
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Tables: force fit within page width */
          table {
            table-layout: fixed !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          td, th {
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            word-break: break-word !important;
            hyphens: auto !important;
          }

          /* ASCII diagrams: preserve monospace alignment, use smaller font to fit */
          .diagram, pre {
            overflow: visible !important;
            white-space: pre !important;
            font-size: 7pt !important;
            line-height: 1.15 !important;
          }

          /* Hide scrollbars */
          ::-webkit-scrollbar {
            display: none !important;
          }

          /* Prevent hidden/auto overflow from clipping */
          [style*="overflow-x"], .overflow-x-auto {
            overflow-x: visible !important;
          }

          /* Ensure containers don't clip */
          div, section, article {
            overflow: visible !important;
          }
        `,
      });
    } catch (error) {
      throw createError(ErrorCodes.PDF_FAILED,
        `Failed to inject print CSS: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }

    // Generate PDF with merged options
    const pdfTimeout = options.timeout ?? 60000;
    const pdfOptions = buildPdfOptions(outputPath, options, pdfTimeout);
    const buffer = await generatePdf(page, pdfOptions);

    return { buffer };
  } finally {
    try {
      await page.close();
    } catch {
      // Silently discard close errors - cleanup must not mask conversion errors
    }
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
    const contentTimeout = options.timeout ?? 60000;
    try {
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: contentTimeout });
    } catch (error) {
      if (isTimeoutError(error)) {
        throw createError(ErrorCodes.TIMEOUT, `PDF content loading timed out after ${contentTimeout}ms`);
      }
      throw error;
    }

    // Inject CSS for print optimization
    try {
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
    } catch (error) {
      throw createError(ErrorCodes.PDF_FAILED,
        `Failed to inject print CSS: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }

    // Generate PDF with merged options
    const pdfTimeout = options.timeout ?? 60000;
    const pdfOptions = buildPdfOptions(outputPath, options, pdfTimeout);
    const buffer = await generatePdf(page, pdfOptions);

    return { buffer };
  } finally {
    try {
      await page.close();
    } catch {
      // Silently discard close errors - cleanup must not mask conversion errors
    }
  }
}
