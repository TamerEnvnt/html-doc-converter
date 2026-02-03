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
