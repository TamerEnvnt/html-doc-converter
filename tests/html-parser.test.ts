/**
 * HTML Parser Unit Tests
 */

import { describe, it, expect, vi } from 'vitest';
import {
  loadHTMLFromString,
  extractChapters,
  extractMetadata,
  parseDocument,
  isHeadingLevel,
} from '../src/parsers/html-parser.js';
import * as path from 'path';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

describe('HTML Parser', () => {
  describe('loadHTMLFromString', () => {
    it('parses valid HTML', () => {
      const doc = loadHTMLFromString('<html><body><h1>Title</h1></body></html>');
      expect(doc('h1').text()).toBe('Title');
    });

    it('parses HTML with multiple elements', () => {
      const doc = loadHTMLFromString(`
        <html>
          <body>
            <h1>Main Title</h1>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
          </body>
        </html>
      `);
      expect(doc('h1').text()).toBe('Main Title');
      expect(doc('p').length).toBe(2);
    });

    it('handles malformed HTML gracefully', () => {
      const doc = loadHTMLFromString('<div><p>Unclosed paragraph</div>');
      expect(doc('p').text()).toBe('Unclosed paragraph');
    });
  });

  describe('extractChapters', () => {
    it('extracts h1 as top-level chapters', () => {
      const doc = loadHTMLFromString(`
        <h1>Chapter 1</h1>
        <p>Content 1</p>
        <h1>Chapter 2</h1>
        <p>Content 2</p>
      `);
      const chapters = extractChapters(doc);

      expect(chapters.length).toBe(2);
      expect(chapters[0].title).toBe('Chapter 1');
      expect(chapters[0].level).toBe(1);
      expect(chapters[1].title).toBe('Chapter 2');
      expect(chapters[1].level).toBe(1);
    });

    it('nests h2 under h1', () => {
      const doc = loadHTMLFromString(`
        <h1>Chapter 1</h1>
        <p>Intro</p>
        <h2>Section 1.1</h2>
        <p>Section content</p>
        <h2>Section 1.2</h2>
        <p>More content</p>
      `);
      const chapters = extractChapters(doc);

      expect(chapters.length).toBe(1);
      expect(chapters[0].title).toBe('Chapter 1');
      expect(chapters[0].children.length).toBe(2);
      expect(chapters[0].children[0].title).toBe('Section 1.1');
      expect(chapters[0].children[0].level).toBe(2);
      expect(chapters[0].children[1].title).toBe('Section 1.2');
    });

    it('handles documents without h1', () => {
      const doc = loadHTMLFromString(`
        <h2>Section A</h2>
        <p>Content A</p>
        <h2>Section B</h2>
        <p>Content B</p>
      `);
      const chapters = extractChapters(doc);

      expect(chapters.length).toBe(2);
      expect(chapters[0].title).toBe('Section A');
      expect(chapters[0].level).toBe(2);
    });

    it('handles deeply nested headings', () => {
      const doc = loadHTMLFromString(`
        <h1>Level 1</h1>
        <h2>Level 2</h2>
        <h3>Level 3</h3>
        <p>Deep content</p>
      `);
      const chapters = extractChapters(doc);

      expect(chapters.length).toBe(1);
      expect(chapters[0].children.length).toBe(1);
      expect(chapters[0].children[0].children.length).toBe(1);
      expect(chapters[0].children[0].children[0].title).toBe('Level 3');
    });

    it('extracts content between headings', () => {
      const doc = loadHTMLFromString(`
        <h1>Title</h1>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
        <h1>Next</h1>
      `);
      const chapters = extractChapters(doc);

      expect(chapters[0].content).toContain('Paragraph 1');
      expect(chapters[0].content).toContain('Paragraph 2');
    });

    it('uses existing id or generates one', () => {
      const doc = loadHTMLFromString(`
        <h1 id="custom-id">With ID</h1>
        <h1>Without ID</h1>
      `);
      const chapters = extractChapters(doc);

      expect(chapters[0].id).toBe('custom-id');
      expect(chapters[1].id).toBe('without-id');
    });

    it('returns empty array for no headings', () => {
      const doc = loadHTMLFromString('<p>Just a paragraph</p>');
      const chapters = extractChapters(doc);

      expect(chapters).toEqual([]);
    });
  });

  describe('extractMetadata', () => {
    it('extracts title from head', () => {
      const doc = loadHTMLFromString(`
        <html>
          <head>
            <title>Document Title</title>
          </head>
          <body></body>
        </html>
      `);
      expect(doc('title').text()).toBe('Document Title');
    });

    it('extracts author from meta tag', () => {
      const doc = loadHTMLFromString(`
        <html>
          <head>
            <meta name="author" content="John Doe">
          </head>
          <body></body>
        </html>
      `);
      const metadata = extractMetadata(doc);

      expect(metadata.author).toBe('John Doe');
    });

    it('extracts version from meta tag', () => {
      const doc = loadHTMLFromString(`
        <html>
          <head>
            <meta name="version" content="2.0.0">
          </head>
          <body></body>
        </html>
      `);
      const metadata = extractMetadata(doc);

      expect(metadata.version).toBe('2.0.0');
    });

    it('extracts date from meta tag', () => {
      const doc = loadHTMLFromString(`
        <html>
          <head>
            <meta name="date" content="2026-02-04">
          </head>
          <body></body>
        </html>
      `);
      const metadata = extractMetadata(doc);

      expect(metadata.date).toBe('2026-02-04');
    });

    it('extracts custom meta tags', () => {
      const doc = loadHTMLFromString(`
        <html>
          <head>
            <meta name="keywords" content="testing, vitest">
            <meta name="description" content="A test document">
          </head>
          <body></body>
        </html>
      `);
      const metadata = extractMetadata(doc);

      expect(metadata.customFields['keywords']).toBe('testing, vitest');
      expect(metadata.customFields['description']).toBe('A test document');
    });

    it('extracts version from body text pattern', () => {
      const doc = loadHTMLFromString(`
        <html>
          <body>
            <p>Version: 1.5.0</p>
          </body>
        </html>
      `);
      const metadata = extractMetadata(doc);

      expect(metadata.version).toBe('1.5.0');
    });

    it('extracts author from body text pattern', () => {
      const doc = loadHTMLFromString(`
        <html>
          <body>
            <p>Author: Jane Smith</p>
          </body>
        </html>
      `);
      const metadata = extractMetadata(doc);

      expect(metadata.author).toBe('Jane Smith');
    });

    it('prefers meta tag over body text', () => {
      const doc = loadHTMLFromString(`
        <html>
          <head>
            <meta name="author" content="Meta Author">
          </head>
          <body>
            <p>Author: Body Author</p>
          </body>
        </html>
      `);
      const metadata = extractMetadata(doc);

      expect(metadata.author).toBe('Meta Author');
    });
  });

  describe('parseDocument', () => {
    it('parses simple fixture file', async () => {
      const result = await parseDocument(path.join(FIXTURES_DIR, 'simple.html'));

      expect(result.title).toBe('Simple Document');
      expect(result.chapters.length).toBe(1);
      expect(result.chapters[0].title).toBe('Simple Title');
      expect(result.rawHTML).toContain('Simple Title');
    });

    it('parses document with chapters', async () => {
      const result = await parseDocument(path.join(FIXTURES_DIR, 'with-chapters.html'));

      expect(result.title).toBe('Document with Chapters');
      expect(result.chapters.length).toBe(2);
      expect(result.chapters[0].title).toBe('Chapter 1: Introduction');
      expect(result.chapters[0].children.length).toBe(2);
      expect(result.chapters[1].title).toBe('Chapter 2: Main Content');
      expect(result.metadata.author).toBe('Test Author');
      expect(result.metadata.version).toBe('1.0.0');
    });

    it('parses document with tables', async () => {
      const result = await parseDocument(path.join(FIXTURES_DIR, 'with-tables.html'));

      expect(result.title).toBe('Document with Tables');
      expect(result.rawHTML).toContain('<table');
      expect(result.rawHTML).toContain('Item 1');
    });

    it('throws error for non-existent file', async () => {
      await expect(parseDocument('/nonexistent/file.html')).rejects.toThrow('Input file not found');
    });
  });

  describe('loadHTML - non-ENOENT errors', () => {
    it('throws "Failed to load HTML file" for non-ENOENT errors (e.g., EACCES)', async () => {
      const eaccesError = new Error('EACCES: permission denied') as NodeJS.ErrnoException;
      eaccesError.code = 'EACCES';

      // Reset module registry so dynamic import gets fresh module with mock
      vi.resetModules();

      vi.doMock('fs/promises', () => ({
        readFile: vi.fn().mockRejectedValue(eaccesError),
      }));

      // Dynamic import to get a fresh module using the mocked fs/promises
      const { loadHTML } = await import('../src/parsers/html-parser.js');

      await expect(loadHTML('/tmp/unreadable.html')).rejects.toThrow('Failed to load HTML file');

      vi.doUnmock('fs/promises');
    });
  });

  describe('isHeadingLevel', () => {
    it('returns true for valid heading levels 1-6', () => {
      for (let i = 1; i <= 6; i++) {
        expect(isHeadingLevel(i)).toBe(true);
      }
    });

    it('returns false for 0', () => {
      expect(isHeadingLevel(0)).toBe(false);
    });

    it('returns false for 7', () => {
      expect(isHeadingLevel(7)).toBe(false);
    });

    it('returns false for negative numbers', () => {
      expect(isHeadingLevel(-1)).toBe(false);
    });

    it('returns false for non-integer numbers', () => {
      expect(isHeadingLevel(1.5)).toBe(false);
      expect(isHeadingLevel(2.7)).toBe(false);
    });

    it('returns false for NaN', () => {
      expect(isHeadingLevel(NaN)).toBe(false);
    });
  });
});
