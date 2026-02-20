/**
 * HTML Document Converter
 *
 * Convert HTML documents to PDF and DOCX with high fidelity.
 */

// PDF converter (public API)
export {
  convertToPDF,
  convertHTMLFileToPDF,
  convertHTMLStringToPDF,
  closeBrowser,
} from './converters/pdf-converter.js';
export type { PDFOptions, PDFResult } from './converters/pdf-converter.js';

// DOCX converter (public API)
export {
  convertToDOCX,
  convertHTMLFileToDOCX,
} from './converters/docx-converter.js';
export type { DOCXOptions, DOCXResult } from './converters/docx-converter.js';

// HTML parser (public API)
export {
  loadHTML,
  loadHTMLFromString,
  extractChapters,
  extractMetadata,
  parseDocument,
  isHeadingLevel,
} from './parsers/html-parser.js';
export type {
  HeadingLevel,
  Chapter,
  DocumentMetadata,
  ParsedDocument,
} from './parsers/html-parser.js';

// Error types (public API - consumers need these to catch ConversionError)
export { ConversionError, ErrorCodes, createError } from './utils/errors.js';
export type { ErrorCode } from './utils/errors.js';
