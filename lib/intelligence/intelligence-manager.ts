import { IntelligenceStorage } from '../storage/intelligence-storage';

/**
 * High-level manager for intelligence features
 * Handles initialization, status, and coordination
 *
 * This class provides a clean API for the dashboard to initialize
 * and interact with the intelligence system. All methods are static
 * and stateless (state is stored in localStorage).
 */
export class IntelligenceManager {
  private static initialized = false;

  /**
   * Initialize intelligence system
   * Call once on app startup (idempotent)
   * Safe to call multiple times - only initializes once
   */
  static initialize(): void {
    if (this.initialized) return;

    try {
      IntelligenceStorage.initialize();
      this.initialized = true;

      console.log('[Intelligence] System initialized');
    } catch (error) {
      console.error('[Intelligence] Failed to initialize:', error);
      // Don't re-throw; allow app to continue without intelligence features
    }
  }

  /**
   * Check if manager has been initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if intelligence features are enabled
   */
  static isEnabled(): boolean {
    const state = IntelligenceStorage.getState();
    return state?.analysisEnabled ?? true;
  }

  /**
   * Enable intelligence features
   */
  static enable(): void {
    try {
      const state = IntelligenceStorage.getState();
      if (state) {
        state.analysisEnabled = true;
        IntelligenceStorage.saveState(state);
      }
    } catch (error) {
      console.error('[Intelligence] Failed to enable:', error);
    }
  }

  /**
   * Disable intelligence features
   */
  static disable(): void {
    try {
      const state = IntelligenceStorage.getState();
      if (state) {
        state.analysisEnabled = false;
        IntelligenceStorage.saveState(state);
      }
    } catch (error) {
      console.error('[Intelligence] Failed to disable:', error);
    }
  }

  /**
   * Get storage information and statistics
   */
  static getStorageInfo() {
    try {
      const sizeBytes = IntelligenceStorage.getStorageSize();
      const state = IntelligenceStorage.getState();

      return {
        sizeBytes,
        sizeKB: Math.round(sizeBytes / 1024),
        sizeMB: Math.round((sizeBytes / (1024 * 1024)) * 100) / 100,
        lastAnalysis: state?.lastAnalysisRun,
        enabled: state?.analysisEnabled ?? true,
      };
    } catch (error) {
      console.error('[Intelligence] Failed to get storage info:', error);
      return {
        sizeBytes: 0,
        sizeKB: 0,
        sizeMB: 0,
        lastAnalysis: undefined,
        enabled: true,
      };
    }
  }

  /**
   * Reset all intelligence data
   * Clears localStorage and resets initialized flag
   */
  static reset(): void {
    try {
      const storage = new IntelligenceStorage();
      storage.clearAll();

      // Also clear the state key
      localStorage.removeItem('intelligent-drive:state');

      this.initialized = false;

      console.log('[Intelligence] System reset');
    } catch (error) {
      console.error('[Intelligence] Failed to reset:', error);
    }
  }
}
