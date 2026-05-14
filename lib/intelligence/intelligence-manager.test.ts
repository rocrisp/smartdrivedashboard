import { IntelligenceManager } from './intelligence-manager';
import { IntelligenceStorage } from '../storage/intelligence-storage';

describe('IntelligenceManager', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset the manager state for each test
    IntelligenceManager.reset();
  });

  describe('initialize', () => {
    it('should initialize storage on first call', () => {
      IntelligenceManager.initialize();

      const state = IntelligenceStorage.getState();
      expect(state).not.toBeNull();
      expect(state?.version).toBe('1.0.0');
    });

    it('should be idempotent - safe to call multiple times', () => {
      IntelligenceManager.initialize();
      IntelligenceManager.initialize();
      IntelligenceManager.initialize();

      const state = IntelligenceStorage.getState();
      expect(state).not.toBeNull();
      expect(state?.version).toBe('1.0.0');
    });

    it('should set enabled flag to true', () => {
      IntelligenceManager.initialize();

      expect(IntelligenceManager.isEnabled()).toBe(true);
    });
  });

  describe('isInitialized', () => {
    it('should return false before initialization', () => {
      expect(IntelligenceManager.isInitialized()).toBe(false);
    });

    it('should return true after initialization', () => {
      IntelligenceManager.initialize();

      expect(IntelligenceManager.isInitialized()).toBe(true);
    });
  });

  describe('disable/enable', () => {
    it('should disable intelligence features', () => {
      IntelligenceManager.initialize();
      IntelligenceManager.disable();

      expect(IntelligenceManager.isEnabled()).toBe(false);
    });

    it('should enable intelligence features', () => {
      IntelligenceManager.initialize();
      IntelligenceManager.disable();
      IntelligenceManager.enable();

      expect(IntelligenceManager.isEnabled()).toBe(true);
    });

    it('should handle enable/disable without prior initialization', () => {
      // Should not throw
      IntelligenceManager.disable();
      IntelligenceManager.enable();

      expect(IntelligenceManager.isInitialized()).toBe(false);
    });
  });

  describe('getStorageInfo', () => {
    it('should return storage statistics', () => {
      IntelligenceManager.initialize();

      const info = IntelligenceManager.getStorageInfo();
      expect(info).toHaveProperty('sizeBytes');
      expect(info).toHaveProperty('sizeKB');
      expect(info).toHaveProperty('sizeMB');
      expect(info).toHaveProperty('lastAnalysis');
      expect(info).toHaveProperty('enabled');
    });

    it('should return numeric values', () => {
      IntelligenceManager.initialize();

      const info = IntelligenceManager.getStorageInfo();
      expect(typeof info.sizeBytes).toBe('number');
      expect(typeof info.sizeKB).toBe('number');
      expect(typeof info.sizeMB).toBe('number');
      expect(typeof info.enabled).toBe('boolean');
    });

    it('should return valid timestamps', () => {
      IntelligenceManager.initialize();

      const info = IntelligenceManager.getStorageInfo();
      if (info.lastAnalysis) {
        expect(() => new Date(info.lastAnalysis)).not.toThrow();
      }
    });
  });

  describe('reset', () => {
    it('should clear all intelligence data', () => {
      IntelligenceManager.initialize();

      IntelligenceManager.reset();

      const state = IntelligenceStorage.getState();
      expect(state).toBeNull();
    });

    it('should reset initialized flag', () => {
      IntelligenceManager.initialize();
      expect(IntelligenceManager.isInitialized()).toBe(true);

      IntelligenceManager.reset();

      expect(IntelligenceManager.isInitialized()).toBe(false);
    });

    it('should allow re-initialization after reset', () => {
      IntelligenceManager.initialize();
      IntelligenceManager.reset();
      IntelligenceManager.initialize();

      const state = IntelligenceStorage.getState();
      expect(state).not.toBeNull();
      expect(state?.version).toBe('1.0.0');
    });
  });

  describe('handleStorageError', () => {
    it('should handle localStorage quota exceeded gracefully', () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = Storage.prototype.setItem;
      let callCount = 0;

      Storage.prototype.setItem = jest.fn((key: string, value: string) => {
        callCount++;
        // First call throws, second succeeds (after pruning)
        if (callCount === 1) {
          const error = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        }
        // On retry, use original implementation
        originalSetItem.call(localStorage, key, value);
      });

      // Should not throw
      expect(() => {
        IntelligenceManager.initialize();
      }).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
    });
  });
});
