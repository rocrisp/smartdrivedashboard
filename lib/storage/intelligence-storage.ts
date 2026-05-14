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
  INTELLIGENCE_KEYS,
  SCHEMA_VERSION,
} from '@/lib/types/intelligence';

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
    localStorage.setItem(INTELLIGENCE_KEYS.PROJECTS, JSON.stringify(toStore));
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
    localStorage.setItem(
      INTELLIGENCE_KEYS.SUGGESTIONS,
      JSON.stringify(toStore)
    );
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
    localStorage.setItem(INTELLIGENCE_KEYS.SESSIONS, JSON.stringify(toStore));
  }

  /**
   * Get labels from localStorage
   * Returns empty data structure if nothing stored or on parse error
   */
  getLabels(): LabelsData {
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
   * Save labels to localStorage
   */
  saveLabels(data: LabelsData): void {
    const toStore = ensureSchemaVersion(data, SCHEMA_VERSION);
    localStorage.setItem(INTELLIGENCE_KEYS.LABELS, JSON.stringify(toStore));
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
    localStorage.setItem(
      INTELLIGENCE_KEYS.COLLECTIONS,
      JSON.stringify(toStore)
    );
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
}
