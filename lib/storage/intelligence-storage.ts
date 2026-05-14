/**
 * Intelligence Storage Manager
 *
 * Manages persistent storage of intelligence data to localStorage.
 * Handles CRUD operations for all 5 intelligence features with error handling
 * and schema version validation.
 */

import {
  ProjectsData,
  SuggestionsData,
  SessionsData,
  LabelsData,
  CollectionsData,
  SmartCollection,
  Label,
  INTELLIGENCE_KEYS,
  SCHEMA_VERSION,
} from '@/lib/types/intelligence';

/**
 * Global intelligence state
 */
interface IntelligenceState {
  version: string;
  lastAnalysisRun: string;
  analysisEnabled: boolean;
}

const STATE_KEY = 'intelligent-drive:state';

/**
 * Generic error handler for localStorage operations
 * Returns a default empty data structure if parsing fails
 */
function safeJsonParse<T>(
  jsonString: string | null,
  defaultValue: T
): T {
  if (!jsonString) {
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed) {
      return defaultValue;
    }
    return parsed;
  } catch (error) {
    // Silently handle parse errors and return default
    return defaultValue;
  }
}

/**
 * Ensures data has required fields and schema version
 */
function ensureSchemaVersion<T extends { schemaVersion?: string }>(
  data: T,
  schemaVersion: string = SCHEMA_VERSION
): T {
  return {
    ...data,
    schemaVersion: data.schemaVersion || schemaVersion,
  };
}

/**
 * IntelligenceStorage - localStorage manager for intelligence features
 *
 * Provides get/save operations for:
 * - Projects: detected projects from file organization
 * - Suggestions: filename suggestions
 * - Sessions: work sessions tracking
 * - Labels: intelligent labels for files
 * - Collections: smart file collections
 */
export class IntelligenceStorage {
  // ============================================================================
  // STATIC METHODS - Global State Management
  // ============================================================================

  /**
   * Initialize empty data structures if not present
   */
  static initialize(): void {
    const existing = this.getState();
    if (!existing) {
      const initialState: IntelligenceState = {
        version: SCHEMA_VERSION,
        lastAnalysisRun: new Date().toISOString(),
        analysisEnabled: true,
      };
      this.saveState(initialState);
    }
  }

  /**
   * Get complete IntelligenceState
   */
  static getState(): IntelligenceState | null {
    try {
      const item = localStorage.getItem(STATE_KEY);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading intelligence state:', error);
      return null;
    }
  }

  /**
   * Save complete IntelligenceState
   */
  static saveState(state: IntelligenceState): void {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, attempting to prune old data');
        this.pruneOldData();

        // Retry once after pruning
        try {
          localStorage.setItem(STATE_KEY, JSON.stringify(state));
        } catch (retryError) {
          console.error('Failed to save state even after pruning:', retryError);
        }
      } else {
        console.error('Error writing intelligence state:', error);
      }
    }
  }

  /**
   * Update lastComputed timestamps
   */
  static updateLastAnalysis(): void {
    const state = this.getState();
    if (state) {
      state.lastAnalysisRun = new Date().toISOString();
      this.saveState(state);
    }
  }

  /**
   * Prune old data to free up storage space
   * Removes entries older than 90 days
   */
  static pruneOldData(): void {
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);

    // Prune old sessions
    const storage = new IntelligenceStorage();
    const sessions = storage.getSessions();
    const recentSessions = sessions.sessions.filter(s =>
      new Date(s.lastAccessed).getTime() > ninetyDaysAgo
    );
    if (recentSessions.length < sessions.sessions.length) {
      storage.saveSessions({
        ...sessions,
        sessions: recentSessions,
      });
    }

    // Note: Labels pruning would require knowing file age,
    // which we don't track in labels themselves
    // This could be enhanced in the future
  }

  /**
   * Get estimated storage usage in bytes
   */
  static getStorageSize(): number {
    let total = 0;

    // Add state key
    const stateItem = localStorage.getItem(STATE_KEY);
    if (stateItem) {
      total += stateItem.length * 2; // UTF-16 encoding
    }

    // Add all intelligence keys
    Object.values(INTELLIGENCE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        total += item.length * 2; // UTF-16 encoding
      }
    });

    return total;
  }

  // ============================================================================
  // PROJECT METHODS
  // ============================================================================

  /**
   * Dismiss a project (mark as false positive)
   */
  static dismissProject(projectId: string): void {
    const storage = new IntelligenceStorage();
    const data = storage.getProjects();

    data.projects = data.projects.map(p =>
      p.id === projectId ? { ...p, dismissed: true } : p
    );

    storage.saveProjects(data);
  }

  // ============================================================================
  // SUGGESTION METHODS
  // ============================================================================

  /**
   * Accept a suggestion and set personal nickname
   */
  static acceptSuggestion(fileId: string, nickname: string): void {
    const storage = new IntelligenceStorage();
    const data = storage.getSuggestions();

    data.suggestions = data.suggestions.map(s =>
      s.fileId === fileId
        ? { ...s, accepted: true, personalNickname: nickname }
        : s
    );

    storage.saveSuggestions(data);
  }

  /**
   * Dismiss a suggestion
   */
  static dismissSuggestion(fileId: string): void {
    const storage = new IntelligenceStorage();
    const data = storage.getSuggestions();

    data.suggestions = data.suggestions.map(s =>
      s.fileId === fileId ? { ...s, dismissed: true } : s
    );

    storage.saveSuggestions(data);
  }

  /**
   * Get personal nickname for a file
   */
  static getPersonalNickname(fileId: string): string | undefined {
    const storage = new IntelligenceStorage();
    const data = storage.getSuggestions();

    const suggestion = data.suggestions.find(s => s.fileId === fileId);
    return suggestion?.personalNickname;
  }

  // ============================================================================
  // SESSION METHODS
  // ============================================================================

  /**
   * Pin a session for quick access
   */
  static pinSession(sessionId: string): void {
    const storage = new IntelligenceStorage();
    const data = storage.getSessions();

    data.sessions = data.sessions.map(s =>
      s.id === sessionId ? { ...s, isPinned: true } : s
    );

    storage.saveSessions(data);
  }

  /**
   * Unpin a session
   */
  static unpinSession(sessionId: string): void {
    const storage = new IntelligenceStorage();
    const data = storage.getSessions();

    data.sessions = data.sessions.map(s =>
      s.id === sessionId ? { ...s, isPinned: false } : s
    );

    storage.saveSessions(data);
  }

  // ============================================================================
  // LABEL METHODS (Updated Signatures)
  // ============================================================================

  /**
   * Get labels for a specific file
   */
  static getLabels(fileId: string): Label[] {
    const storage = new IntelligenceStorage();
    const data = storage.getAllLabels();

    const smartLabel = data.labels.find(l => l.fileId === fileId);
    return smartLabel?.labels || [];
  }

  /**
   * Save labels for a specific file
   */
  static saveLabels(fileId: string, labels: Label[]): void {
    const storage = new IntelligenceStorage();
    const data = storage.getAllLabels();

    // Find existing or add new
    const existingIndex = data.labels.findIndex(l => l.fileId === fileId);

    if (existingIndex >= 0) {
      // Update existing
      data.labels[existingIndex] = { fileId, labels };
    } else {
      // Add new
      data.labels.push({ fileId, labels });
    }

    data.lastComputed = new Date().toISOString();
    storage.saveAllLabels(data);
  }

  // ============================================================================
  // COLLECTION METHODS
  // ============================================================================

  /**
   * Add a new collection
   */
  static addCollection(collection: SmartCollection): void {
    const storage = new IntelligenceStorage();
    const data = storage.getCollections();

    data.collections.push(collection);
    storage.saveCollections(data);
  }

  /**
   * Update an existing collection
   */
  static updateCollection(collectionId: string, updates: Partial<SmartCollection>): void {
    const storage = new IntelligenceStorage();
    const data = storage.getCollections();

    data.collections = data.collections.map(c =>
      c.id === collectionId ? { ...c, ...updates } : c
    );

    storage.saveCollections(data);
  }

  /**
   * Delete a collection
   */
  static deleteCollection(collectionId: string): void {
    const storage = new IntelligenceStorage();
    const data = storage.getCollections();

    data.collections = data.collections.filter(c => c.id !== collectionId);

    storage.saveCollections(data);
  }

  // ============================================================================
  // INSTANCE METHODS - Basic CRUD Operations
  // ============================================================================

  /**
   * Get projects from localStorage
   * Returns empty data structure if nothing stored or on parse error
   */
  getProjects(): ProjectsData {
    const defaultValue: ProjectsData = {
      projects: [],
      lastComputed: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
    };

    const stored = localStorage.getItem(INTELLIGENCE_KEYS.PROJECTS);
    const data = safeJsonParse<ProjectsData>(stored, defaultValue);

    return ensureSchemaVersion(data, SCHEMA_VERSION);
  }

  /**
   * Save projects to localStorage
   */
  saveProjects(data: ProjectsData): void {
    const toStore = ensureSchemaVersion(data, SCHEMA_VERSION);
    this.setItemWithQuotaHandling(INTELLIGENCE_KEYS.PROJECTS, toStore);
  }

  /**
   * Get suggestions from localStorage
   * Returns empty data structure if nothing stored or on parse error
   */
  getSuggestions(): SuggestionsData {
    const defaultValue: SuggestionsData = {
      suggestions: [],
      lastComputed: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
    };

    const stored = localStorage.getItem(INTELLIGENCE_KEYS.SUGGESTIONS);
    const data = safeJsonParse<SuggestionsData>(stored, defaultValue);

    return ensureSchemaVersion(data, SCHEMA_VERSION);
  }

  /**
   * Save suggestions to localStorage
   */
  saveSuggestions(data: SuggestionsData): void {
    const toStore = ensureSchemaVersion(data, SCHEMA_VERSION);
    this.setItemWithQuotaHandling(INTELLIGENCE_KEYS.SUGGESTIONS, toStore);
  }

  /**
   * Get sessions from localStorage
   * Returns empty data structure if nothing stored or on parse error
   */
  getSessions(): SessionsData {
    const defaultValue: SessionsData = {
      sessions: [],
      lastComputed: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
    };

    const stored = localStorage.getItem(INTELLIGENCE_KEYS.SESSIONS);
    const data = safeJsonParse<SessionsData>(stored, defaultValue);

    return ensureSchemaVersion(data, SCHEMA_VERSION);
  }

  /**
   * Save sessions to localStorage
   */
  saveSessions(data: SessionsData): void {
    const toStore = ensureSchemaVersion(data, SCHEMA_VERSION);
    this.setItemWithQuotaHandling(INTELLIGENCE_KEYS.SESSIONS, toStore);
  }

  /**
   * Get all labels from localStorage
   * Returns empty data structure if nothing stored or on parse error
   */
  getAllLabels(): LabelsData {
    const defaultValue: LabelsData = {
      labels: [],
      lastComputed: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
    };

    const stored = localStorage.getItem(INTELLIGENCE_KEYS.LABELS);
    const data = safeJsonParse<LabelsData>(stored, defaultValue);

    return ensureSchemaVersion(data, SCHEMA_VERSION);
  }

  /**
   * Save all labels to localStorage
   */
  saveAllLabels(data: LabelsData): void {
    const toStore = ensureSchemaVersion(data, SCHEMA_VERSION);
    this.setItemWithQuotaHandling(INTELLIGENCE_KEYS.LABELS, toStore);
  }

  /**
   * Get collections from localStorage
   * Returns empty data structure if nothing stored or on parse error
   */
  getCollections(): CollectionsData {
    const defaultValue: CollectionsData = {
      collections: [],
      lastComputed: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
    };

    const stored = localStorage.getItem(INTELLIGENCE_KEYS.COLLECTIONS);
    const data = safeJsonParse<CollectionsData>(stored, defaultValue);

    return ensureSchemaVersion(data, SCHEMA_VERSION);
  }

  /**
   * Save collections to localStorage
   */
  saveCollections(data: CollectionsData): void {
    const toStore = ensureSchemaVersion(data, SCHEMA_VERSION);
    this.setItemWithQuotaHandling(INTELLIGENCE_KEYS.COLLECTIONS, toStore);
  }

  /**
   * Clear all intelligence data from localStorage
   * Useful for reset operations
   */
  clearAll(): void {
    Object.values(INTELLIGENCE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Clear specific data type
   */
  clearProjects(): void {
    localStorage.removeItem(INTELLIGENCE_KEYS.PROJECTS);
  }

  clearSuggestions(): void {
    localStorage.removeItem(INTELLIGENCE_KEYS.SUGGESTIONS);
  }

  clearSessions(): void {
    localStorage.removeItem(INTELLIGENCE_KEYS.SESSIONS);
  }

  clearLabels(): void {
    localStorage.removeItem(INTELLIGENCE_KEYS.LABELS);
  }

  clearCollections(): void {
    localStorage.removeItem(INTELLIGENCE_KEYS.COLLECTIONS);
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Save to localStorage with quota exceeded handling
   * Auto-prunes old data and retries once if quota exceeded
   */
  private setItemWithQuotaHandling<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, attempting to prune old data');
        IntelligenceStorage.pruneOldData();

        // Retry once after pruning
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (retryError) {
          console.error('Failed to save even after pruning:', retryError);
        }
      } else {
        console.error(`Error writing to localStorage (${key}):`, error);
      }
    }
  }
}
