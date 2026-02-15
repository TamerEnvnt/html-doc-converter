import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Browser } from 'puppeteer';

// Store disconnect handlers registered by getBrowser
let disconnectHandlers: Array<() => void> = [];

// Create mock objects
function createMockPage() {
  return {
    setViewport: vi.fn().mockResolvedValue(undefined),
    setContent: vi.fn().mockResolvedValue(undefined),
    goto: vi.fn().mockResolvedValue(undefined),
    addStyleTag: vi.fn().mockResolvedValue(undefined),
    pdf: vi.fn().mockResolvedValue(Buffer.from('fake-pdf')),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockBrowser() {
  const browser = {
    close: vi.fn().mockResolvedValue(undefined),
    isConnected: vi.fn().mockReturnValue(true),
    on: vi.fn((event: string, handler: () => void) => {
      if (event === 'disconnected') {
        disconnectHandlers.push(handler);
      }
    }),
    newPage: vi.fn().mockResolvedValue(createMockPage()),
  };
  return browser;
}

// Mock puppeteer at module level
vi.mock('puppeteer', () => {
  const mockBrowser = createMockBrowser();
  return {
    default: {
      launch: vi.fn().mockResolvedValue(mockBrowser),
    },
  };
});

// Mock html-parser at module level for convertHTMLFileToPDF tests
vi.mock('../src/parsers/html-parser.js', () => ({
  parseDocument: vi.fn().mockResolvedValue({
    title: 'Mock Title',
    chapters: [],
    metadata: { customFields: {} },
    rawHTML: '<html><body>mock</body></html>',
  }),
}));

// Import after mock setup
import puppeteer from 'puppeteer';
import { getBrowser, closeBrowser, convertToPDF, convertHTMLFileToPDF, convertHTMLStringToPDF } from '../src/converters/pdf-converter.js';
import { ConversionError, ErrorCodes } from '../src/utils/errors.js';
import { parseDocument } from '../src/parsers/html-parser.js';

describe('browser management', () => {
  let mockBrowser: ReturnType<typeof createMockBrowser>;

  beforeEach(async () => {
    // Reset all state between tests
    disconnectHandlers = [];
    await closeBrowser();
    vi.clearAllMocks();

    // Create fresh mock browser for each test
    mockBrowser = createMockBrowser();
    vi.mocked(puppeteer.launch).mockResolvedValue(mockBrowser as unknown as Browser);
  });

  it('returns same instance on sequential calls', async () => {
    const browser1 = await getBrowser();
    const browser2 = await getBrowser();

    expect(browser1).toBe(browser2);
    expect(puppeteer.launch).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent calls (launch lock)', async () => {
    // Fire two calls concurrently without awaiting
    const [browser1, browser2] = await Promise.all([
      getBrowser(),
      getBrowser(),
    ]);

    expect(browser1).toBe(browser2);
    expect(puppeteer.launch).toHaveBeenCalledTimes(1);
  });

  it('closeBrowser is safe when no browser exists', async () => {
    // closeBrowser was already called in beforeEach, call again on clean state
    await expect(closeBrowser()).resolves.toBeUndefined();
  });

  it('closeBrowser nulls instance even if close() throws', async () => {
    // Launch a browser first
    await getBrowser();

    // Make close() throw
    mockBrowser.close.mockRejectedValueOnce(new Error('close failed'));

    // Should not throw
    await expect(closeBrowser()).resolves.toBeUndefined();

    // Next getBrowser() should launch a new browser (proving instance was nulled)
    const newMockBrowser = createMockBrowser();
    vi.mocked(puppeteer.launch).mockResolvedValue(newMockBrowser as unknown as Browser);

    const browser = await getBrowser();
    expect(browser).toBe(newMockBrowser);
    expect(puppeteer.launch).toHaveBeenCalledTimes(2);
  });

  it('launches new browser after disconnect event', async () => {
    await getBrowser();

    // Simulate Chromium crash/disconnect
    expect(disconnectHandlers.length).toBeGreaterThan(0);
    disconnectHandlers[0]();

    // Next call should launch a new browser
    const newMockBrowser = createMockBrowser();
    vi.mocked(puppeteer.launch).mockResolvedValue(newMockBrowser as unknown as Browser);

    const browser = await getBrowser();
    expect(browser).toBe(newMockBrowser);
    expect(puppeteer.launch).toHaveBeenCalledTimes(2);
  });

  it('retries after failed launch', async () => {
    // First launch fails
    vi.mocked(puppeteer.launch).mockRejectedValueOnce(new Error('launch failed'));

    await expect(getBrowser()).rejects.toThrow('launch failed');

    // Second launch succeeds (promise lock was cleared on failure)
    const newMockBrowser = createMockBrowser();
    vi.mocked(puppeteer.launch).mockResolvedValue(newMockBrowser as unknown as Browser);

    const browser = await getBrowser();
    expect(browser).toBe(newMockBrowser);
    expect(puppeteer.launch).toHaveBeenCalledTimes(2);
  });

  it('launches new browser when existing one reports disconnected', async () => {
    // Launch browser, then make isConnected return false
    const browser1 = await getBrowser();
    mockBrowser.isConnected.mockReturnValue(false);

    // Next call should detect stale reference and launch new browser
    const newMockBrowser = createMockBrowser();
    vi.mocked(puppeteer.launch).mockResolvedValue(newMockBrowser as unknown as Browser);

    const browser2 = await getBrowser();
    expect(browser2).not.toBe(browser1);
    expect(browser2).toBe(newMockBrowser);
    expect(puppeteer.launch).toHaveBeenCalledTimes(2);
  });
});

describe('convertToPDF', () => {
  let mockBrowser: ReturnType<typeof createMockBrowser>;
  let mockPage: ReturnType<typeof createMockPage>;

  beforeEach(async () => {
    disconnectHandlers = [];
    await closeBrowser();
    vi.clearAllMocks();

    mockPage = createMockPage();
    mockBrowser = createMockBrowser();
    mockBrowser.newPage.mockResolvedValue(mockPage);
    vi.mocked(puppeteer.launch).mockResolvedValue(mockBrowser as unknown as Browser);
  });

  it('returns a buffer on success', async () => {
    const fakeBuffer = Buffer.from('%PDF-fake-content');
    mockPage.pdf.mockResolvedValue(fakeBuffer);

    const result = await convertToPDF('/tmp/test.html', '/tmp/test.pdf');

    expect(result).toHaveProperty('buffer');
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(mockPage.goto).toHaveBeenCalledWith(
      expect.stringContaining('file://'),
      expect.any(Object)
    );
  });

  it('passes custom options to page.pdf', async () => {
    mockPage.pdf.mockResolvedValue(Buffer.from('pdf'));

    await convertToPDF('/tmp/test.html', '/tmp/test.pdf', {
      format: 'Letter',
      landscape: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      scale: 0.8,
    });

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'Letter',
        landscape: true,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
        scale: 0.8,
      })
    );
  });

  it('applies default options when none provided', async () => {
    mockPage.pdf.mockResolvedValue(Buffer.from('pdf'));

    await convertToPDF('/tmp/test.html', '/tmp/test.pdf');

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        landscape: false,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      })
    );
  });

  it('throws ConversionError with TIMEOUT code on navigation timeout', async () => {
    expect.assertions(2);
    const timeoutError = new Error('Navigation timeout');
    timeoutError.name = 'TimeoutError';
    mockPage.goto.mockRejectedValue(timeoutError);

    try {
      await convertToPDF('/tmp/test.html', '/tmp/test.pdf');
    } catch (error) {
      expect(error).toBeInstanceOf(ConversionError);
      expect((error as ConversionError).code).toBe(ErrorCodes.TIMEOUT);
    }
  });

  it('throws ConversionError with TIMEOUT code on PDF generation timeout', async () => {
    expect.assertions(2);
    const timeoutError = new Error('PDF generation timeout');
    timeoutError.name = 'TimeoutError';
    mockPage.pdf.mockRejectedValue(timeoutError);

    try {
      await convertToPDF('/tmp/test.html', '/tmp/test.pdf');
    } catch (error) {
      expect(error).toBeInstanceOf(ConversionError);
      expect((error as ConversionError).code).toBe(ErrorCodes.TIMEOUT);
    }
  });

  it('always closes the page even when PDF generation throws', async () => {
    mockPage.pdf.mockRejectedValue(new Error('PDF generation failed'));

    await expect(convertToPDF('/tmp/test.html', '/tmp/test.pdf')).rejects.toThrow();
    expect(mockPage.close).toHaveBeenCalled();
  });
});

describe('convertHTMLFileToPDF', () => {
  let mockBrowser: ReturnType<typeof createMockBrowser>;
  let mockPage: ReturnType<typeof createMockPage>;

  beforeEach(async () => {
    disconnectHandlers = [];
    await closeBrowser();
    vi.clearAllMocks();

    mockPage = createMockPage();
    mockBrowser = createMockBrowser();
    mockBrowser.newPage.mockResolvedValue(mockPage);
    vi.mocked(puppeteer.launch).mockResolvedValue(mockBrowser as unknown as Browser);
  });

  it('returns document and pdf result on success', async () => {
    const fakeBuffer = Buffer.from('%PDF-fake');
    mockPage.pdf.mockResolvedValue(fakeBuffer);

    const result = await convertHTMLFileToPDF('/tmp/test.html', '/tmp/test.pdf');

    expect(result).toHaveProperty('document');
    expect(result).toHaveProperty('pdf');
    expect(result.document).toHaveProperty('title', 'Mock Title');
    expect(result.document).toHaveProperty('chapters');
    expect(result.document).toHaveProperty('metadata');
    expect(result.document).toHaveProperty('rawHTML');
    expect(Buffer.isBuffer(result.pdf.buffer)).toBe(true);
    expect(parseDocument).toHaveBeenCalledWith('/tmp/test.html');
  });

  it('propagates parse errors from parseDocument', async () => {
    expect.assertions(1);
    vi.mocked(parseDocument).mockRejectedValueOnce(new Error('File not found'));

    try {
      await convertHTMLFileToPDF('/tmp/missing.html', '/tmp/test.pdf');
    } catch (error) {
      expect((error as Error).message).toBe('File not found');
    }
  });
});

describe('convertHTMLStringToPDF', () => {
  let mockBrowser: ReturnType<typeof createMockBrowser>;
  let mockPage: ReturnType<typeof createMockPage>;

  beforeEach(async () => {
    disconnectHandlers = [];
    await closeBrowser();
    vi.clearAllMocks();

    mockPage = createMockPage();
    mockBrowser = createMockBrowser();
    mockBrowser.newPage.mockResolvedValue(mockPage);
    vi.mocked(puppeteer.launch).mockResolvedValue(mockBrowser as unknown as Browser);
  });

  it('returns a buffer on success', async () => {
    const fakeBuffer = Buffer.from('%PDF-string-content');
    mockPage.pdf.mockResolvedValue(fakeBuffer);

    const result = await convertHTMLStringToPDF('<html><body>Hello</body></html>', '/tmp/test.pdf');

    expect(result).toHaveProperty('buffer');
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(mockPage.setContent).toHaveBeenCalledWith(
      '<html><body>Hello</body></html>',
      expect.objectContaining({ waitUntil: 'networkidle0' })
    );
  });

  it('passes timeout and format options correctly', async () => {
    mockPage.pdf.mockResolvedValue(Buffer.from('pdf'));

    await convertHTMLStringToPDF('<html><body>Test</body></html>', '/tmp/test.pdf', {
      timeout: 30000,
      format: 'Letter',
      margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
    });

    expect(mockPage.setContent).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ timeout: 30000 })
    );
    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'Letter',
        margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
        timeout: 30000,
      })
    );
  });

  it('throws ConversionError with TIMEOUT code on content loading timeout', async () => {
    expect.assertions(2);
    const timeoutError = new Error('Content loading timeout');
    timeoutError.name = 'TimeoutError';
    mockPage.setContent.mockRejectedValue(timeoutError);

    try {
      await convertHTMLStringToPDF('<html><body>Slow</body></html>', '/tmp/test.pdf');
    } catch (error) {
      expect(error).toBeInstanceOf(ConversionError);
      expect((error as ConversionError).code).toBe(ErrorCodes.TIMEOUT);
    }
  });

  it('always closes the page even when PDF generation throws', async () => {
    mockPage.pdf.mockRejectedValue(new Error('PDF generation failed'));

    await expect(
      convertHTMLStringToPDF('<html><body>Test</body></html>', '/tmp/test.pdf')
    ).rejects.toThrow();
    expect(mockPage.close).toHaveBeenCalled();
  });
});
