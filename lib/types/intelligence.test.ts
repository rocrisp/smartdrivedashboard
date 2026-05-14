import {
  DetectedProject,
  WorkSession,
  SmartLabel,
  FilenameSuggestion,
  SmartCollection,
  IntelligenceState,
  ProjectsData,
  SuggestionsData,
  SessionsData,
  LabelsData,
  CollectionsData,
  SCHEMA_VERSION
} from './intelligence';

describe('Intelligence Types', () => {
  it('should create a valid DetectedProject', () => {
    const project: DetectedProject = {
      id: 'proj-1',
      name: 'Test Project',
      keywords: ['test', 'project'],
      fileIds: ['file-1', 'file-2'],
      confidence: 0.8,
      keyPeople: ['alice@example.com'],
      lastActivity: new Date().toISOString(),
      dismissed: false,
    };

    expect(project.id).toBe('proj-1');
    expect(project.fileIds).toHaveLength(2);
  });

  it('should create a valid WorkSession', () => {
    const session: WorkSession = {
      id: 'session-1',
      name: 'Test Session',
      fileIds: ['file-1'],
      viewCount: 5,
      lastAccessed: new Date().toISOString(),
      isPinned: false,
    };

    expect(session.viewCount).toBe(5);
  });

  it('should create a valid SmartLabel', () => {
    const label: SmartLabel = {
      fileId: 'file-1',
      labels: [
        { type: 'project', text: 'Part of Test Project', priority: 1 },
      ],
    };

    expect(label.labels[0].type).toBe('project');
  });

  it('should create a valid FilenameSuggestion', () => {
    const suggestion: FilenameSuggestion = {
      fileId: 'file-1',
      originalName: 'Copy of Copy of doc.pdf',
      suggestedName: 'Document (Copy 2)',
      reason: 'Removed duplicate "Copy of" prefixes',
      dismissed: false,
      accepted: false,
    };

    expect(suggestion.originalName).toContain('Copy of');
  });

  it('should create a valid SmartCollection', () => {
    const collection: SmartCollection = {
      id: 'coll-1',
      name: 'My Collection',
      fileIds: ['file-1'],
      suggestedFileIds: ['file-2'],
      createdAt: new Date().toISOString(),
      isBookmarked: false,
    };

    expect(collection.suggestedFileIds).toHaveLength(1);
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe('Intelligence Types - Edge Cases', () => {
  describe('Confidence Range Validation', () => {
    it('should accept confidence at minimum boundary (0)', () => {
      const project: DetectedProject = {
        id: 'proj-1',
        name: 'Low Confidence Project',
        keywords: ['test'],
        fileIds: [],
        confidence: 0,
        keyPeople: [],
        lastActivity: new Date().toISOString(),
        dismissed: false,
      };

      expect(project.confidence).toBe(0);
    });

    it('should accept confidence at maximum boundary (1)', () => {
      const project: DetectedProject = {
        id: 'proj-2',
        name: 'High Confidence Project',
        keywords: ['test'],
        fileIds: [],
        confidence: 1,
        keyPeople: [],
        lastActivity: new Date().toISOString(),
        dismissed: false,
      };

      expect(project.confidence).toBe(1);
    });

    it('should accept confidence in mid-range (0.5)', () => {
      const project: DetectedProject = {
        id: 'proj-3',
        name: 'Medium Confidence Project',
        keywords: ['test'],
        fileIds: [],
        confidence: 0.5,
        keyPeople: [],
        lastActivity: new Date().toISOString(),
        dismissed: false,
      };

      expect(project.confidence).toBe(0.5);
    });
  });

  describe('Theme Literal Type Validation', () => {
    it('should accept all valid theme values', () => {
      const themes: Array<'blue' | 'purple' | 'green' | 'red' | 'orange' | 'gray'> = [
        'blue',
        'purple',
        'green',
        'red',
        'orange',
        'gray',
      ];

      themes.forEach((theme) => {
        const collection: SmartCollection = {
          id: `coll-${theme}`,
          name: `${theme} collection`,
          fileIds: [],
          suggestedFileIds: [],
          createdAt: new Date().toISOString(),
          isBookmarked: false,
          profile: {
            theme,
            isCollapsed: false,
          },
        };

        expect(collection.profile?.theme).toBe(theme);
      });
    });
  });

  describe('Empty Arrays Handling', () => {
    it('should handle empty project files', () => {
      const projectsData: ProjectsData = {
        projects: [],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      expect(projectsData.projects).toHaveLength(0);
    });

    it('should handle empty suggestions', () => {
      const suggestionsData: SuggestionsData = {
        suggestions: [],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      expect(suggestionsData.suggestions).toHaveLength(0);
    });

    it('should handle empty sessions', () => {
      const sessionsData: SessionsData = {
        sessions: [],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      expect(sessionsData.sessions).toHaveLength(0);
    });

    it('should handle empty labels', () => {
      const labelsData: LabelsData = {
        labels: [],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      expect(labelsData.labels).toHaveLength(0);
    });

    it('should handle empty collections', () => {
      const collectionsData: CollectionsData = {
        collections: [],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      expect(collectionsData.collections).toHaveLength(0);
    });
  });

  describe('Schema Version Type Consistency', () => {
    it('should use string schema version in all data types', () => {
      expect(typeof SCHEMA_VERSION).toBe('string');

      const projectsData: ProjectsData = {
        projects: [],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      const suggestionsData: SuggestionsData = {
        suggestions: [],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      const sessionsData: SessionsData = {
        sessions: [],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      const labelsData: LabelsData = {
        labels: [],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      const collectionsData: CollectionsData = {
        collections: [],
        lastComputed: new Date().toISOString(),
        schemaVersion: SCHEMA_VERSION,
      };

      expect(projectsData.schemaVersion).toBe('1.0.0');
      expect(suggestionsData.schemaVersion).toBe('1.0.0');
      expect(sessionsData.schemaVersion).toBe('1.0.0');
      expect(labelsData.schemaVersion).toBe('1.0.0');
      expect(collectionsData.schemaVersion).toBe('1.0.0');
    });
  });
});
