import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '../utils/logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('info', () => {
    it('should log info messages', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.info('test message');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('success', () => {
    it('should log success messages', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.success('test message');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('error', () => {
    it('should log error messages to stderr', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      logger.error('test error');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('setVerbose', () => {
    it('should enable verbose mode', () => {
      logger.setVerbose(true);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.debug('debug message');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should disable verbose mode', () => {
      logger.setVerbose(false);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.debug('debug message');
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
