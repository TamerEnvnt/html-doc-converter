/**
 * HTML Parser Module
 *
 * Parses HTML documents and extracts structural information.
 */

import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';
import type { Element } from 'domhandler';
import { readFile } from 'fs/promises';

export interface Chapter {
  id: string;
  title: string;
  level: number;
  content: string;
  children: Chapter[];
}

export interface DocumentMetadata {
  author?: string;
  version?: string;
  date?: string;
  customFields: Record<string, string>;
}

export interface ParsedDocument {
  title: string;
  chapters: Chapter[];
  metadata: DocumentMetadata;
  rawHTML: string;
}

/**
 * Load HTML from file path
 * @param filePath - Path to HTML file
 */
export async function loadHTML(filePath: string): Promise<CheerioAPI> {
  try {
    const html = await readFile(filePath, 'utf-8');
    return cheerio.load(html);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`HTML file not found: ${filePath}`);
    }
    throw new Error(`Failed to load HTML file: ${(error as Error).message}`);
  }
}

/**
 * Load HTML from string
 * @param html - HTML string content
 */
export function loadHTMLFromString(html: string): CheerioAPI {
  return cheerio.load(html);
}

/**
 * Generate ID from heading text
 */
function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

/**
 * Extract chapters from parsed HTML
 * @param doc - Cheerio document instance
 */
export function extractChapters(doc: CheerioAPI): Chapter[] {
  const headings: { level: number; id: string; title: string; element: Element }[] = [];

  // Find all headings h1-h6
  doc('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const $el = doc(el);
    const tagName = el.tagName.toLowerCase();
    const level = parseInt(tagName.charAt(1), 10);
    const title = $el.text().trim();
    const id = $el.attr('id') || generateId(title);

    headings.push({ level, id, title, element: el });
  });

  if (headings.length === 0) return [];

  // Build hierarchical structure
  const rootChapters: Chapter[] = [];
  const stack: { chapter: Chapter; level: number }[] = [];

  for (let i = 0; i < headings.length; i++) {
    const { level, id, title, element } = headings[i];

    // Extract content between this heading and the next
    let content = '';
    const $el = doc(element);
    let $next = $el.next();
    while ($next.length > 0 && !$next.is('h1, h2, h3, h4, h5, h6')) {
      content += doc.html($next) || '';
      $next = $next.next();
    }

    const chapter: Chapter = {
      id,
      title,
      level,
      content: content.trim(),
      children: [],
    };

    // Find parent based on heading level
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      rootChapters.push(chapter);
    } else {
      stack[stack.length - 1].chapter.children.push(chapter);
    }

    stack.push({ chapter, level });
  }

  return rootChapters;
}

/**
 * Extract metadata from parsed HTML
 * @param doc - Cheerio document instance
 */
export function extractMetadata(doc: CheerioAPI): DocumentMetadata {
  // TODO: Implement in Phase 2
  return { customFields: {} };
}

/**
 * Parse HTML document and extract all structure
 * @param filePath - Path to HTML file
 */
export async function parseDocument(filePath: string): Promise<ParsedDocument> {
  // TODO: Implement in Phase 2
  throw new Error('Document parsing not yet implemented. See Phase 2.');
}
