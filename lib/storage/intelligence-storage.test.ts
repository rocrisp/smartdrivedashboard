/**
 * Intelligence Storage Tests
 *
 * TDD test suite for IntelligenceStorage class
 * Tests CRUD operations for all 5 intelligence features with localStorage
 */

import { IntelligenceStorage } from './intelligence-storage';
import {
  ProjectsData,
  SuggestionsData,
  SessionsData,
  LabelsData,
  CollectionsData,
  SCHEMA_VERSION,
} from '@/lib/types/intelligence';

describe('IntelligenceStorage', () => {
  let storage: IntelligenceStorage;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Create a fresh instance
    storage = new IntelligenceStorage();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ============================================================================
  // PROJECTS TESTS
  // ============================================================================

  describe('Projects', () => {
    it('should return empty array when no projects exist', () => {
      const projects = storage.getProjects();
      expect(projects.projects).toEqual([]);
      expect(projects.schemaVersion).toBe(SCHEMA_VERSION);
    });

    it('should persist and retrieve projects', () => {
      const projectsData: ProjectsData = {
        projects: [
          {
            id: 'proj-1',
            name: 'Test Project',
            keywords: ['test', 'project'],
            fileIds: ['file-1', 'file-2'],
            confidence: 0.8,
            keyPeople: ['alice@example.com'],
            lastActivity: new Date().toISOString(),
            dismissed: false,
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      storage.saveProjects(projectsData);
      const retrieved = storage.getProjects();

      expect(retrieved.projects).toHaveLength(1);
      expect(retrieved.projects[0].id).toBe('proj-1');
      expect(retrieved.projects[0].name).toBe('Test Project');
    });

    it('should overwrite existing projects', () => {
      const projectsData1: ProjectsData = {
        projects: [
          {
            id: 'proj-1',
            name: 'First Project',
            keywords: ['first'],
            fileIds: ['file-1'],
            confidence: 0.5,
            keyPeople: [],
            lastActivity: new Date().toISOString(),
            dismissed: false,
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      const projectsData2: ProjectsData = {
        projects: [
          {
            id: 'proj-2',
            name: 'Second Project',
            keywords: ['second'],
            fileIds: ['file-2'],
            confidence: 0.7,
            keyPeople: ['bob@example.com'],
            lastActivity: new Date().toISOString(),
            dismissed: false,
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      storage.saveProjects(projectsData1);
      storage.saveProjects(projectsData2);

      const retrieved = storage.getProjects();
      expect(retrieved.projects).toHaveLength(1);
      expect(retrieved.projects[0].id).toBe('proj-2');
    });

    it('should return empty data if stored data is corrupted', () => {
      localStorage.setItem(
        'intelligence:projects',
        'invalid json {{{['
      );

      const projects = storage.getProjects();
      expect(projects.projects).toEqual([]);
      expect(projects.schemaVersion).toBe(SCHEMA_VERSION);
    });
  });

  // ============================================================================
  // SUGGESTIONS TESTS
  // ============================================================================

  describe('Suggestions', () => {
    it('should return empty array when no suggestions exist', () => {
      const suggestions = storage.getSuggestions();
      expect(suggestions.suggestions).toEqual([]);
      expect(suggestions.schemaVersion).toBe(SCHEMA_VERSION);
    });

    it('should persist and retrieve suggestions', () => {
      const suggestionsData: SuggestionsData = {
        suggestions: [
          {
            fileId: 'file-1',
            originalName: 'Copy of Copy of doc.pdf',
            suggestedName: 'Document (Copy 2)',
            reason: 'Removed duplicate "Copy of" prefixes',
            dismissed: false,
            accepted: false,
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      storage.saveSuggestions(suggestionsData);
      const retrieved = storage.getSuggestions();

      expect(retrieved.suggestions).toHaveLength(1);
      expect(retrieved.suggestions[0].fileId).toBe('file-1');
      expect(retrieved.suggestions[0].suggestedName).toBe('Document (Copy 2)');
    });

    it('should overwrite existing suggestions', () => {
      const suggestionsData1: SuggestionsData = {
        suggestions: [
          {
            fileId: 'file-1',
            originalName: 'Old Name',
            suggestedName: 'Better Name',
            reason: 'Old suggestion',
            dismissed: false,
            accepted: false,
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      const suggestionsData2: SuggestionsData = {
        suggestions: [
          {
            fileId: 'file-2',
            originalName: 'Another Old Name',
            suggestedName: 'Another Better Name',
            reason: 'New suggestion',
            dismissed: false,
            accepted: false,
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      storage.saveSuggestions(suggestionsData1);
      storage.saveSuggestions(suggestionsData2);

      const retrieved = storage.getSuggestions();
      expect(retrieved.suggestions).toHaveLength(1);
      expect(retrieved.suggestions[0].fileId).toBe('file-2');
    });

    it('should return empty data if stored data is corrupted', () => {
      localStorage.setItem(
        'intelligence:suggestions',
        'invalid json {{{['
      );

      const suggestions = storage.getSuggestions();
      expect(suggestions.suggestions).toEqual([]);
      expect(suggestions.schemaVersion).toBe(SCHEMA_VERSION);
    });
  });

  // ============================================================================
  // SESSIONS TESTS
  // ============================================================================

  describe('Sessions', () => {
    it('should return empty array when no sessions exist', () => {
      const sessions = storage.getSessions();
      expect(sessions.sessions).toEqual([]);
      expect(sessions.schemaVersion).toBe(SCHEMA_VERSION);
    });

    it('should persist and retrieve sessions', () => {
      const sessionsData: SessionsData = {
        sessions: [
          {
            id: 'session-1',
            name: 'Test Session',
            fileIds: ['file-1', 'file-2'],
            viewCount: 5,
            lastAccessed: new Date().toISOString(),
            isPinned: false,
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      storage.saveSessions(sessionsData);
      const retrieved = storage.getSessions();

      expect(retrieved.sessions).toHaveLength(1);
      expect(retrieved.sessions[0].id).toBe('session-1');
      expect(retrieved.sessions[0].viewCount).toBe(5);
    });

    it('should overwrite existing sessions', () => {
      const sessionsData1: SessionsData = {
        sessions: [
          {
            id: 'session-1',
            name: 'Old Session',
            fileIds: [],
            viewCount: 1,
            lastAccessed: new Date().toISOString(),
            isPinned: false,
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      const sessionsData2: SessionsData = {
        sessions: [
          {
            id: 'session-2',
            name: 'New Session',
            fileIds: ['file-1'],
            viewCount: 3,
            lastAccessed: new Date().toISOString(),
            isPinned: true,
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      storage.saveSessions(sessionsData1);
      storage.saveSessions(sessionsData2);

      const retrieved = storage.getSessions();
      expect(retrieved.sessions).toHaveLength(1);
      expect(retrieved.sessions[0].id).toBe('session-2');
    });

    it('should return empty data if stored data is corrupted', () => {
      localStorage.setItem(
        'intelligence:sessions',
        'invalid json {{{['
      );

      const sessions = storage.getSessions();
      expect(sessions.sessions).toEqual([]);
      expect(sessions.schemaVersion).toBe(SCHEMA_VERSION);
    });
  });

  // ============================================================================
  // LABELS TESTS
  // ============================================================================

  describe('Labels', () => {
    it('should return empty array when no labels exist', () => {
      const labels = storage.getLabels();
      expect(labels.labels).toEqual([]);
      expect(labels.schemaVersion).toBe(SCHEMA_VERSION);
    });

    it('should persist and retrieve labels', () => {
      const labelsData: LabelsData = {
        labels: [
          {
            fileId: 'file-1',
            labels: [
              { type: 'project', text: 'Part of Test Project', priority: 1 },
              { type: 'person', text: 'Alice', priority: 2 },
            ],
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      storage.saveLabels(labelsData);
      const retrieved = storage.getLabels();

      expect(retrieved.labels).toHaveLength(1);
      expect(retrieved.labels[0].fileId).toBe('file-1');
      expect(retrieved.labels[0].labels).toHaveLength(2);
    });

    it('should overwrite existing labels', () => {
      const labelsData1: LabelsData = {
        labels: [
          {
            fileId: 'file-1',
            labels: [{ type: 'custom', text: 'Old Label', priority: 1 }],
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      const labelsData2: LabelsData = {
        labels: [
          {
            fileId: 'file-2',
            labels: [{ type: 'custom', text: 'New Label', priority: 1 }],
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      storage.saveLabels(labelsData1);
      storage.saveLabels(labelsData2);

      const retrieved = storage.getLabels();
      expect(retrieved.labels).toHaveLength(1);
      expect(retrieved.labels[0].fileId).toBe('file-2');
    });

    it('should return empty data if stored data is corrupted', () => {
      localStorage.setItem(
        'intelligence:labels',
        'invalid json {{{['
      );

      const labels = storage.getLabels();
      expect(labels.labels).toEqual([]);
      expect(labels.schemaVersion).toBe(SCHEMA_VERSION);
    });
  });

  // ============================================================================
  // COLLECTIONS TESTS
  // ============================================================================

  describe('Collections', () => {
    it('should return empty array when no collections exist', () => {
      const collections = storage.getCollections();
      expect(collections.collections).toEqual([]);
      expect(collections.schemaVersion).toBe(SCHEMA_VERSION);
    });

    it('should persist and retrieve collections', () => {
      const collectionsData: CollectionsData = {
        collections: [
          {
            id: 'coll-1',
            name: 'My Collection',
            fileIds: ['file-1', 'file-2'],
            suggestedFileIds: ['file-3'],
            createdAt: new Date().toISOString(),
            isBookmarked: false,
            profile: {
              theme: 'blue',
              isCollapsed: false,
            },
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      storage.saveCollections(collectionsData);
      const retrieved = storage.getCollections();

      expect(retrieved.collections).toHaveLength(1);
      expect(retrieved.collections[0].id).toBe('coll-1');
      expect(retrieved.collections[0].name).toBe('My Collection');
      expect(retrieved.collections[0].profile?.theme).toBe('blue');
    });

    it('should overwrite existing collections', () => {
      const collectionsData1: CollectionsData = {
        collections: [
          {
            id: 'coll-1',
            name: 'Old Collection',
            fileIds: [],
            suggestedFileIds: [],
            createdAt: new Date().toISOString(),
            isBookmarked: false,
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      const collectionsData2: CollectionsData = {
        collections: [
          {
            id: 'coll-2',
            name: 'New Collection',
            fileIds: ['file-1'],
            suggestedFileIds: [],
            createdAt: new Date().toISOString(),
            isBookmarked: true,
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      storage.saveCollections(collectionsData1);
      storage.saveCollections(collectionsData2);

      const retrieved = storage.getCollections();
      expect(retrieved.collections).toHaveLength(1);
      expect(retrieved.collections[0].id).toBe('coll-2');
    });

    it('should return empty data if stored data is corrupted', () => {
      localStorage.setItem(
        'intelligence:collections',
        'invalid json {{{['
      );

      const collections = storage.getCollections();
      expect(collections.collections).toEqual([]);
      expect(collections.schemaVersion).toBe(SCHEMA_VERSION);
    });
  });

  // ============================================================================
  // SCHEMA VERSION VALIDATION TESTS
  // ============================================================================

  describe('Schema Version Validation', () => {
    it('should include schema version in retrieved data', () => {
      const projectsData: ProjectsData = {
        projects: [],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      storage.saveProjects(projectsData);
      const retrieved = storage.getProjects();

      expect(retrieved.schemaVersion).toBe(SCHEMA_VERSION);
    });

    it('should add schema version to data without it', () => {
      const invalidData = {
        projects: [
          {
            id: 'proj-1',
            name: 'Test',
            keywords: [],
            fileIds: [],
            confidence: 0.5,
            keyPeople: [],
            lastActivity: new Date().toISOString(),
            dismissed: false,
          },
        ],
        lastComputed: new Date().toISOString(),
      };

      localStorage.setItem('intelligence:projects', JSON.stringify(invalidData));

      const retrieved = storage.getProjects();
      expect(retrieved.schemaVersion).toBe(SCHEMA_VERSION);
    });

    it('should validate schema version on incompatible data', () => {
      const futureVersionData = {
        projects: [],
        lastComputed: new Date().toISOString(),
        schemaVersion: '2.0.0', // Future version
      };

      localStorage.setItem(
        'intelligence:projects',
        JSON.stringify(futureVersionData)
      );

      // Should handle gracefully - return empty data or migrate
      const retrieved = storage.getProjects();
      // For now, we'll accept it, but this could be enhanced for migrations
      expect(retrieved.schemaVersion).toBe('2.0.0');
    });
  });

  // ============================================================================
  // ERROR HANDLING & EDGE CASES
  // ============================================================================

  describe('Error Handling & Edge Cases', () => {
    it('should handle missing localStorage key gracefully', () => {
      expect(() => storage.getProjects()).not.toThrow();
      expect(() => storage.getSuggestions()).not.toThrow();
      expect(() => storage.getSessions()).not.toThrow();
      expect(() => storage.getLabels()).not.toThrow();
      expect(() => storage.getCollections()).not.toThrow();
    });

    it('should handle empty string in localStorage', () => {
      localStorage.setItem('intelligence:projects', '');

      const projects = storage.getProjects();
      expect(projects.projects).toEqual([]);
      expect(projects.schemaVersion).toBe(SCHEMA_VERSION);
    });

    it('should handle null value in localStorage', () => {
      localStorage.setItem('intelligence:suggestions', 'null');

      const suggestions = storage.getSuggestions();
      expect(suggestions.suggestions).toEqual([]);
      expect(suggestions.schemaVersion).toBe(SCHEMA_VERSION);
    });

    it('should handle partial data in localStorage', () => {
      const partialData = {
        projects: [
          {
            id: 'proj-1',
            name: 'Test Project',
            keywords: [],
            fileIds: [],
            confidence: 0.5,
            keyPeople: [],
            lastActivity: new Date().toISOString(),
            dismissed: false,
          },
        ],
        // Missing lastComputed and schemaVersion
      };

      localStorage.setItem('intelligence:projects', JSON.stringify(partialData));

      const projects = storage.getProjects();
      expect(projects.projects).toHaveLength(1);
      expect(projects.schemaVersion).toBe(SCHEMA_VERSION);
    });

    it('should handle multiple save operations in sequence', () => {
      const projectsData1: ProjectsData = {
        projects: [
          {
            id: 'proj-1',
            name: 'Project 1',
            keywords: [],
            fileIds: [],
            confidence: 0.5,
            keyPeople: [],
            lastActivity: new Date().toISOString(),
            dismissed: false,
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      const projectsData2: ProjectsData = {
        projects: [
          ...projectsData1.projects,
          {
            id: 'proj-2',
            name: 'Project 2',
            keywords: [],
            fileIds: [],
            confidence: 0.7,
            keyPeople: [],
            lastActivity: new Date().toISOString(),
            dismissed: false,
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      storage.saveProjects(projectsData1);
      storage.saveProjects(projectsData2);

      const retrieved = storage.getProjects();
      expect(retrieved.projects).toHaveLength(2);
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Multi-feature Integration', () => {
    it('should handle saving and retrieving all data types independently', () => {
      const projectsData: ProjectsData = {
        projects: [
          {
            id: 'proj-1',
            name: 'Project',
            keywords: [],
            fileIds: [],
            confidence: 0.5,
            keyPeople: [],
            lastActivity: new Date().toISOString(),
            dismissed: false,
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      const suggestionsData: SuggestionsData = {
        suggestions: [
          {
            fileId: 'file-1',
            originalName: 'Old',
            suggestedName: 'New',
            reason: 'Better',
            dismissed: false,
            accepted: false,
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      storage.saveProjects(projectsData);
      storage.saveSuggestions(suggestionsData);

      const projects = storage.getProjects();
      const suggestions = storage.getSuggestions();

      expect(projects.projects).toHaveLength(1);
      expect(suggestions.suggestions).toHaveLength(1);
      expect(projects.projects[0].name).toBe('Project');
      expect(suggestions.suggestions[0].suggestedName).toBe('New');
    });

    it('should not leak data between different data types', () => {
      const projectsData: ProjectsData = {
        projects: [
          {
            id: 'proj-1',
            name: 'Project',
            keywords: [],
            fileIds: [],
            confidence: 0.5,
            keyPeople: [],
            lastActivity: new Date().toISOString(),
            dismissed: false,
          },
        ],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      storage.saveProjects(projectsData);

      const suggestions = storage.getSuggestions();
      const sessions = storage.getSessions();
      const labels = storage.getLabels();
      const collections = storage.getCollections();

      expect(suggestions.suggestions).toEqual([]);
      expect(sessions.sessions).toEqual([]);
      expect(labels.labels).toEqual([]);
      expect(collections.collections).toEqual([]);
    });
  });
});
