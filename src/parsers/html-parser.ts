/**
 * HTML Parser Module
 *
 * Parses HTML documents and extracts structural information.
 */

import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';
import type { Element } from 'domhandler';
import { readFile } from 'fs/promises';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Type guard for HeadingLevel — validates that a number is an integer 1-6 */
export function isHeadingLevel(n: number): n is HeadingLevel {
  return Number.isInteger(n) && n >= 1 && n <= 6;
}

export interface Chapter {
  id: string;
  title: string;
  level: HeadingLevel;
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
      throw new Error(`HTML file not found: ${filePath}`, { cause: error });
    }
    throw new Error(`Failed to load HTML file: ${(error as Error).message}`, { cause: error });
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
  const headings: { level: HeadingLevel; id: string; title: string; element: Element }[] = [];

  // Find all headings h1-h6
  doc('h1, h2, h3, h4, h5, h6').each((i, el) => {
    const $el = doc(el);
    const tagName = el.tagName.toLowerCase();
    const parsed = parseInt(tagName.charAt(1), 10);
    const level: HeadingLevel = isHeadingLevel(parsed) ? parsed : 1;
    const title = $el.text().trim();
    const id = $el.attr('id') || generateId(title) || `heading-${i}`;

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
  const customFields: Record<string, string> = {};

  // Extract from <head> meta tags
  const author = doc('meta[name="author"]').attr('content');
  const version = doc('meta[name="version"]').attr('content');
  const date = doc('meta[name="date"]').attr('content');

  // Extract all other meta tags as custom fields
  doc('meta[name]').each((_, el) => {
    const name = doc(el).attr('name');
    const content = doc(el).attr('content');
    if (name && content && !['author', 'version', 'date', 'viewport', 'charset'].includes(name)) {
      customFields[name] = content;
    }
  });

  // Try to extract from document body patterns
  const bodyText = doc('body').text();

  // Look for "Version: X.X" pattern
  if (!version) {
    const versionMatch = bodyText.match(/Version:\s*([0-9.]+)/i);
    if (versionMatch) customFields['version'] = versionMatch[1];
  }

  // Look for "Author: Name" pattern
  if (!author) {
    const authorMatch = bodyText.match(/Author:\s*([^\n]+)/i);
    if (authorMatch) customFields['author'] = authorMatch[1].trim();
  }

  // Look for date patterns
  if (!date) {
    const dateMatch = bodyText.match(/Date:\s*([^\n]+)/i);
    if (dateMatch) customFields['date'] = dateMatch[1].trim();
  }

  return {
    author: author || customFields['author'],
    version: version || customFields['version'],
    date: date || customFields['date'],
    customFields,
  };
}

/**
 * Parse HTML document and extract all structure
 * @param filePath - Path to HTML file
 */
export async function parseDocument(filePath: string): Promise<ParsedDocument> {
  const doc = await loadHTML(filePath);

  // Get title from <title> tag or first h1
  const title = doc('title').text().trim() || doc('h1').first().text().trim() || 'Untitled';

  // Get raw HTML
  const rawHTML = doc.html() || '';

  return {
    title,
    chapters: extractChapters(doc),
    metadata: extractMetadata(doc),
    rawHTML,
  };
}
