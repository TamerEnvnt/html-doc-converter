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

// Import after mock setup
import puppeteer from 'puppeteer';
import { getBrowser, closeBrowser } from '../src/converters/pdf-converter.js';

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
