import { describe, it, expect, beforeEach, afterEach, vi, type MockInstance } from 'vitest';
import {
  setVerbose,
  verbose,
} from '../../src/utils/logger.js';

describe('logger', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let logSpy: MockInstance<any[], any>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    setVerbose(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setVerbose(false);
  });

  describe('setVerbose', () => {
    it('can enable verbose mode', () => {
      setVerbose(true);
      verbose('test');
      expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it('can disable verbose mode', () => {
      setVerbose(true);
      setVerbose(false);
      verbose('test');
      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('verbose', () => {
    it('does not log when verbose is disabled', () => {
      verbose('should not appear');
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('logs when verbose is enabled', () => {
      setVerbose(true);
      verbose('test message');
      expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it('includes [verbose] prefix', () => {
      setVerbose(true);
      verbose('test');
      const firstArg = logSpy.mock.calls[0][0] as string;
      expect(firstArg).toContain('[verbose]');
    });
  });
});
