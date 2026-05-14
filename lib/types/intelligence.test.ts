import {
  DetectedProject,
  WorkSession,
  SmartLabel,
  FilenameSuggestion,
  SmartCollection,
  IntelligenceState
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
