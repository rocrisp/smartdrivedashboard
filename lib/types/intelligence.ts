/**
 * Intelligence Types
 *
 * Complete type definitions for all 5 intelligence features:
 * - Smart Project Detection
 * - Smart Filename Suggestions
 * - Work Sessions
 * - Intelligent Labels
 * - Smart Collections
 *
 * All data is stored in localStorage under the INTELLIGENCE_KEYS namespace.
 */

// ============================================================================
// 1. SMART PROJECT DETECTION
// ============================================================================

export interface DetectedProject {
  /** Unique identifier for this detected project */
  id: string;

  /** Human-readable project name */
  name: string;

  /** Keywords that define this project (extracted from file names, owner names, etc.) */
  keywords: string[];

  /** File IDs that belong to this project */
  fileIds: string[];

  /** Confidence score (0-1) that this is a real project */
  confidence: number;

  /** Key people involved (email addresses) */
  keyPeople: string[];

  /** ISO 8601 timestamp of last activity on any file in this project */
  lastActivity: string;

  /** Whether user has dismissed this project suggestion */
  dismissed: boolean;
}

export interface ProjectsData {
  /** Array of detected projects */
  projects: DetectedProject[];

  /** ISO 8601 timestamp of last computation */
  lastComputed: string;

  /** Schema version for migrations */
  schemaVersion: number;
}

// ============================================================================
// 2. SMART FILENAME SUGGESTIONS
// ============================================================================

export interface FilenameSuggestion {
  /** File ID this suggestion applies to */
  fileId: string;

  /** Current filename */
  originalName: string;

  /** Proposed better filename */
  suggestedName: string;

  /** Human-readable reason for the suggestion */
  reason: string;

  /** Whether user dismissed this suggestion */
  dismissed: boolean;

  /** Whether user accepted this suggestion */
  accepted: boolean;
}

export interface SuggestionsData {
  /** Array of filename suggestions */
  suggestions: FilenameSuggestion[];

  /** ISO 8601 timestamp of last computation */
  lastComputed: string;

  /** Schema version for migrations */
  schemaVersion: number;
}

// ============================================================================
// 3. WORK SESSIONS
// ============================================================================

export interface ViewSession {
  /** ISO 8601 timestamp when the view started */
  startTime: string;

  /** ISO 8601 timestamp when the view ended (null if session still active) */
  endTime: string | null;

  /** Duration in seconds */
  durationSeconds: number;
}

export interface WorkSession {
  /** Unique identifier for this session */
  id: string;

  /** Human-readable session name (auto-generated or user-set) */
  name: string;

  /** File IDs accessed in this session */
  fileIds: string[];

  /** Total number of views in this session */
  viewCount: number;

  /** ISO 8601 timestamp of last access */
  lastAccessed: string;

  /** Whether user has pinned this session */
  isPinned: boolean;

  /** Detailed view history (optional, for deep analytics) */
  viewHistory?: ViewSession[];
}

export interface SessionsData {
  /** Array of detected work sessions */
  sessions: WorkSession[];

  /** ISO 8601 timestamp of last computation */
  lastComputed: string;

  /** Schema version for migrations */
  schemaVersion: number;
}

// ============================================================================
// 4. INTELLIGENT LABELS
// ============================================================================

export type LabelType = 'project' | 'session' | 'person' | 'status' | 'custom';

export interface Label {
  /** Type of label */
  type: LabelType;

  /** Display text for the label */
  text: string;

  /** Priority (1 = highest, determines sort order) */
  priority: number;
}

export interface SmartLabel {
  /** File ID this label set applies to */
  fileId: string;

  /** Array of computed labels for this file */
  labels: Label[];
}

export interface LabelsData {
  /** Array of smart labels keyed by file ID */
  labels: SmartLabel[];

  /** ISO 8601 timestamp of last computation */
  lastComputed: string;

  /** Schema version for migrations */
  schemaVersion: number;
}

// ============================================================================
// 5. SMART COLLECTIONS
// ============================================================================

export interface CollectionProfile {
  /** Collection theme/color (for UI) */
  theme: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'gray';

  /** User's custom note/description for the collection */
  note?: string;

  /** Whether the collection is currently collapsed in the sidebar */
  isCollapsed: boolean;
}

export interface SmartCollection {
  /** Unique identifier for this collection */
  id: string;

  /** Human-readable collection name */
  name: string;

  /** File IDs explicitly added to this collection */
  fileIds: string[];

  /** File IDs that the system suggests should be in this collection */
  suggestedFileIds: string[];

  /** ISO 8601 timestamp when the collection was created */
  createdAt: string;

  /** Whether user has bookmarked this collection */
  isBookmarked: boolean;

  /** Collection profile (theme, note, etc.) */
  profile?: CollectionProfile;
}

export interface CollectionsData {
  /** Array of smart collections */
  collections: SmartCollection[];

  /** ISO 8601 timestamp of last computation */
  lastComputed: string;

  /** Schema version for migrations */
  schemaVersion: number;
}

// ============================================================================
// GLOBAL STATE & KEYS
// ============================================================================

export interface IntelligenceState {
  /** Detected projects */
  projects: ProjectsData;

  /** Filename suggestions */
  suggestions: SuggestionsData;

  /** Work sessions */
  sessions: SessionsData;

  /** Intelligent labels */
  labels: LabelsData;

  /** Smart collections */
  collections: CollectionsData;
}

/**
 * Storage keys for localStorage
 * All intelligence data is stored under these keys
 */
export const INTELLIGENCE_KEYS = {
  PROJECTS: 'intelligence:projects',
  SUGGESTIONS: 'intelligence:suggestions',
  SESSIONS: 'intelligence:sessions',
  LABELS: 'intelligence:labels',
  COLLECTIONS: 'intelligence:collections',
} as const;

/**
 * Schema version for data migrations
 * Increment this whenever you change the data structure
 */
export const SCHEMA_VERSION = 1;
