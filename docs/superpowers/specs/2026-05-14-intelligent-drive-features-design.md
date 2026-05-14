# Intelligent Drive Dashboard Features - Design Spec

**Date**: May 14, 2026  
**Status**: Draft - Pending User Review  
**Author**: Claude (Brainstorming Session)

## Problem Statement

The current Google Drive dashboard mirrors Drive's data structure without adding intelligence. Users face two critical problems:

1. **No Structure**: Files are scattered across tabs with no project/topic organization
2. **Poor Naming**: Files have unclear names ("Copy of final_v3.xlsx") making them hard to identify

**User's Core Frustration**: "I can't find things because files have no structure and no good names"

## Solution Overview

Build a **Pattern-Based Intelligence Layer** that runs entirely client-side, analyzing file metadata to:
- Auto-detect projects by finding patterns in filenames and access behavior
- Suggest human-friendly names for poorly-named files
- Group files into work sessions based on temporal access patterns
- Generate contextual labels that make files easier to identify
- Create smart collections with auto-suggested related files

**Key Constraint**: Read-only Drive API access, no backend ML services, all processing in browser using localStorage.

---

## Architecture

### System Components

```
┌─────────────┐
│  Drive API  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Pattern Analyzer   │ ← Extracts keywords, detects patterns
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Intelligence Layer  │ ← Project detection, clustering, labeling
│  (localStorage)     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Enhanced UI       │ ← Projects tab, smart labels, collections
└─────────────────────┘
```

### File Structure

```
lib/
├── intelligence/
│   ├── pattern-analyzer.ts      # Keyword extraction, pattern detection
│   ├── project-detector.ts      # Auto-detect projects from patterns
│   ├── session-tracker.ts       # Track co-viewed files
│   ├── label-generator.ts       # Generate contextual labels
│   └── smart-suggestions.ts     # Filename improvement suggestions
├── intelligence-storage.ts      # localStorage persistence layer
└── types/intelligence.ts        # TypeScript interfaces

components/
├── Intelligence/
│   ├── ProjectsView.tsx         # Feature 1: Projects tab
│   ├── SmartFileCard.tsx        # Enhanced file card with labels
│   ├── WorkSessions.tsx         # Feature 3: Recent sessions widget
│   ├── SmartCollections.tsx     # Feature 5: User collections
│   └── FilenameSuggestion.tsx   # Feature 2: Name suggestion UI
```

### Data Models

```typescript
interface DetectedProject {
  id: string;                    // UUID
  name: string;                  // Auto-generated from keywords
  keywords: string[];            // Extracted common terms
  fileIds: string[];             // Member files
  confidence: number;            // 0-1 score
  keyPeople: string[];           // Emails of sharers/owners
  lastActivity: string;          // ISO date
  userRenamed?: string;          // User override
  dismissed: boolean;            // User rejected this project
}

interface WorkSession {
  id: string;
  name: string;                  // Auto or user-named
  fileIds: string[];
  viewCount: number;             // How many times accessed together
  lastAccessed: string;
  isPinned: boolean;
}

interface SmartLabel {
  fileId: string;
  labels: {
    type: 'project' | 'frequency' | 'social' | 'version' | 'family';
    text: string;
    priority: number;            // For display ordering
  }[];
}

interface FilenameSuggestion {
  fileId: string;
  originalName: string;
  suggestedName: string;
  reason: string;                // Why we're suggesting
  dismissed: boolean;
  accepted: boolean;
  personalNickname?: string;     // User-accepted name
}

interface SmartCollection {
  id: string;
  name: string;
  fileIds: string[];
  suggestedFileIds: string[];    // Auto-suggested additions
  createdAt: string;
  isBookmarked: boolean;
}
```

---

## Feature 1: Smart Project Detection

### Goal
Automatically discover projects by analyzing filename patterns and file relationships.

### Pattern Detection Algorithm

**Step 1: Keyword Extraction**
```
For each file:
  1. Parse filename into tokens (split on _, -, spaces, camelCase)
  2. Remove stopwords: "copy", "of", "final", "draft", "new", "the", "a", "and"
  3. Remove version indicators: "v1", "v2", "(2)", "[final]"
  4. Normalize to lowercase
  5. Keep tokens 3+ characters
  
Example:
  "Copy_of_Q4_Budget_Sheet_v3.xlsx"
  → ["copy", "of", "q4", "budget", "sheet", "v3"]
  → ["q4", "budget", "sheet"] (after filtering)
```

**Step 2: Similarity Clustering**
```
For each pair of files:
  - Calculate keyword overlap (Jaccard similarity)
  - If 2+ keywords match → potential project members
  - Boost score if files:
    * Shared by same person
    * Same MIME type
    * Viewed within same week
    
Threshold: 40% keyword overlap = same project
```

**Step 3: Project Naming**
```
For each cluster:
  - Find most common keywords across all member files
  - Generate name from top 2-3 keywords
  - Capitalize properly (Q4 Budget, Client Proposal)
  - If ambiguous, add context: "Budget (from Alice)"
```

**Step 4: Temporal Grouping**
```
Track view patterns:
  - Files opened within 5-minute window = co-viewed
  - Files co-viewed 2+ times = likely same project
  - Add to existing project or create new one
```

### Confidence Scoring

```typescript
function calculateConfidence(project: DetectedProject): number {
  let score = 0;
  
  // Keyword overlap strength
  score += avgKeywordOverlap * 0.4;
  
  // Number of files (3-10 is ideal)
  if (project.fileIds.length >= 3 && project.fileIds.length <= 10) {
    score += 0.2;
  }
  
  // Co-viewing evidence
  score += (coViewCount / project.fileIds.length) * 0.3;
  
  // Same sharer bonus
  if (allFromSameSharer) score += 0.1;
  
  return Math.min(score, 1.0);
}
```

Projects with confidence < 0.5 shown as "Possible Projects" requiring user confirmation.

### UI Implementation

**Projects Tab**:
- Replace or add alongside existing tabs
- Shows grid of project cards
- Each card:
  - Project name (editable inline)
  - File count and types (3 docs, 2 sheets)
  - Key people avatars
  - Last activity ("Active this week" / "2 months ago")
  - Confidence indicator for low-confidence projects
  - Quick actions: Rename, View Files, Dismiss

**Project Detail View**:
- Click project → see all member files
- Same file list component as other tabs
- Option to manually add/remove files
- "Why these files?" explanation (shows common keywords)

### User Actions

1. **Rename**: Click project name → inline edit → saves to localStorage
2. **Merge**: Drag one project onto another → confirms → combines
3. **Dismiss**: Hide false-positive projects
4. **Pin**: Keep important projects at top

### Storage Schema

```typescript
localStorage.setItem('intelligent-drive:projects', JSON.stringify({
  projects: DetectedProject[],
  lastAnalysis: string,
  userDismissals: string[],  // Project IDs user rejected
}));
```

---

## Feature 2: Smart Filename Suggestions

### Goal
Detect poorly-named files and suggest human-friendly alternatives.

### Problem Pattern Detection

**Regex Patterns**:
```typescript
const BAD_PATTERNS = [
  {
    regex: /^(Copy of )+(.+)$/i,
    handler: (match) => {
      const copies = match[0].match(/Copy of/gi).length;
      return `${match[2]} (Copy ${copies})`;
    }
  },
  {
    regex: /_(final|FINAL|Final)_v?\d+_?(final|FINAL)?/i,
    handler: (basename) => extractVersionOnly(basename)
  },
  {
    regex: /^Untitled (document|spreadsheet|presentation)( \(\d+\))?/i,
    handler: (_, type, num) => contextualNameFromProject(file)
  },
  {
    regex: /\d{8}_\w+_v\d+/,  // 20240115_doc_v2
    handler: (match) => humanizeDateVersion(match)
  }
];
```

**Heuristic Rules**:
```typescript
function isNamePoor(filename: string): boolean {
  // Too many underscores/hyphens
  if (filename.split(/[_-]/).length > 5) return true;
  
  // Multiple "final" or "copy"
  if (/(final|copy)/gi.test(filename) && 
      filename.match(/(final|copy)/gi).length > 2) return true;
  
  // Very long (50+ chars)
  if (filename.length > 50) return true;
  
  // Too short and generic
  if (filename.length < 10 && /^(doc|file|new)/i.test(filename)) return true;
  
  return false;
}
```

### Suggestion Generation

**Context-Based Naming**:
```typescript
function generateSuggestion(file: DriveFile): string {
  // If file belongs to detected project
  const project = findProjectForFile(file.id);
  if (project) {
    return `${project.name} - ${simplifyFilename(file.name)}`;
  }
  
  // Based on sharer
  if (file.sharingUser) {
    return `${simplifyFilename(file.name)} (from ${file.sharingUser.displayName})`;
  }
  
  // Based on date and type
  const type = getFileTypeLabel(file.mimeType);
  const date = new Date(file.modifiedTime);
  return `${type} - ${formatMonthYear(date)}`;
}
```

### UI Implementation

**Inline Badge**:
```tsx
{suggestion && !suggestion.dismissed && (
  <div className="absolute top-2 right-2 bg-yellow-100 px-2 py-1 rounded-full">
    <button onClick={() => showSuggestion(file.id)}>
      📝 Better name?
    </button>
  </div>
)}
```

**Suggestion Modal**:
```tsx
<SmartSuggestionPopover>
  <p className="text-sm text-gray-600">Current name:</p>
  <p className="font-mono text-red-600">{file.name}</p>
  
  <p className="text-sm text-gray-600 mt-3">Suggested:</p>
  <p className="font-mono text-green-600">{suggestion.suggestedName}</p>
  
  <p className="text-xs text-gray-500 mt-2">{suggestion.reason}</p>
  
  <div className="mt-4 flex gap-2">
    <button onClick={acceptSuggestion}>Use This</button>
    <button onClick={dismissSuggestion}>Dismiss</button>
  </div>
</SmartSuggestionPopover>
```

**Personal Nickname Display**:
- Once accepted, show suggested name in bold above original
- Original name in smaller gray text below
- Stored only in localStorage, doesn't modify Drive

### Storage Schema

```typescript
localStorage.setItem('intelligent-drive:suggestions', JSON.stringify({
  suggestions: FilenameSuggestion[],
  personalNicknames: Record<fileId, nickname>,
}));
```

---

## Feature 3: Work Sessions / Context Clusters

### Goal
Group files accessed together, creating temporal workspaces.

### Session Detection Algorithm

**Tracking Co-Views**:
```typescript
// In ViewHistoryManager
function trackView(file: DriveFile) {
  const now = Date.now();
  const currentSession = getCurrentSession();
  
  // If viewed within 30 minutes of last view → same session
  if (currentSession && (now - currentSession.lastView) < 30 * 60 * 1000) {
    currentSession.fileIds.push(file.id);
    currentSession.lastView = now;
  } else {
    // Start new session
    createSession([file.id], now);
  }
}
```

**Pattern Recognition**:
```typescript
function detectRecurringPatterns(): WorkSession[] {
  const sessions = getAllSessions();
  const patterns: Map<string, WorkSession> = new Map();
  
  // Group sessions with similar file sets
  for (const session of sessions) {
    const signature = session.fileIds.sort().join(',');
    
    if (patterns.has(signature)) {
      // Increment count for this pattern
      patterns.get(signature).viewCount++;
      patterns.get(signature).lastAccessed = session.timestamp;
    } else {
      patterns.set(signature, {
        id: generateId(),
        name: generateSessionName(session.fileIds),
        fileIds: session.fileIds,
        viewCount: 1,
        lastAccessed: session.timestamp,
        isPinned: false,
      });
    }
  }
  
  // Return patterns seen 2+ times
  return Array.from(patterns.values()).filter(p => p.viewCount >= 2);
}
```

**Session Naming**:
```typescript
function generateSessionName(fileIds: string[]): string {
  const files = fileIds.map(id => getFileById(id));
  
  // Try project-based name
  const projects = files.map(f => findProjectForFile(f.id)).filter(Boolean);
  if (projects.length > 0) {
    return `${projects[0].name} Work`;
  }
  
  // Try common keywords
  const keywords = extractCommonKeywords(files.map(f => f.name));
  if (keywords.length > 0) {
    return titleCase(keywords.slice(0, 2).join(' '));
  }
  
  // Fallback to temporal
  const day = new Date(files[0].viewedByMeTime).toLocaleDateString('en-US', {
    weekday: 'long'
  });
  return `${day} Work Session`;
}
```

### UI Implementation

**Recent Sessions Widget**:
```tsx
<Card>
  <CardHeader title="Recent Work Sessions" />
  <div className="space-y-2">
    {sessions.slice(0, 5).map(session => (
      <div key={session.id} className="p-3 border rounded hover:border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">{session.name}</h4>
            <p className="text-sm text-gray-500">
              {session.fileIds.length} files • Accessed {session.viewCount} times
            </p>
            <p className="text-xs text-gray-400">
              Last: {formatRelativeTime(session.lastAccessed)}
            </p>
          </div>
          <button onClick={() => openSession(session)}>
            Open All
          </button>
        </div>
      </div>
    ))}
  </div>
</Card>
```

**Session Detail View**:
- Shows all files in the session
- "Open all in new tabs" button
- Pin session for quick access
- Rename session
- View frequency chart (how often accessed over time)

### Storage Schema

```typescript
localStorage.setItem('intelligent-drive:sessions', JSON.stringify({
  rawSessions: ViewSession[],          // All recorded sessions
  detectedPatterns: WorkSession[],     // Recurring patterns
  pinnedSessions: string[],            // Session IDs
}));
```

---

## Feature 4: Intelligent File Labels

### Goal
Auto-generate contextual labels that make files easier to identify at a glance.

### Label Types

**1. Project Membership**
```typescript
function generateProjectLabel(file: DriveFile): Label | null {
  const project = findProjectForFile(file.id);
  if (!project) return null;
  
  return {
    type: 'project',
    text: `Part of ${project.name}`,
    priority: 1,
    color: 'blue'
  };
}
```

**2. Frequency Labels**
```typescript
function generateFrequencyLabel(file: DriveFile): Label | null {
  const views = getViewCount(file.id, 30); // Last 30 days
  
  if (views >= 10) {
    return { type: 'frequency', text: 'Frequently used', priority: 2, color: 'green' };
  } else if (views === 0 && daysSinceLastView(file.id) > 90) {
    return { type: 'frequency', text: 'Not used in 3 months', priority: 3, color: 'gray' };
  }
  
  return null;
}
```

**3. Social Context**
```typescript
function generateSocialLabel(file: DriveFile): Label | null {
  if (!file.shared) return null;
  
  // Count how many people have access
  const sharedWithCount = getSharedWithCount(file.id);
  
  if (sharedWithCount > 5) {
    return { type: 'social', text: `Shared with ${sharedWithCount} people`, priority: 4, color: 'purple' };
  } else if (file.sharingUser) {
    return { type: 'social', text: `From ${file.sharingUser.displayName}`, priority: 4, color: 'purple' };
  }
  
  return null;
}
```

**4. Version Indicators**
```typescript
function generateVersionLabel(file: DriveFile): Label | null {
  // Detect if part of version series
  const versions = findVersionSeries(file);
  if (!versions || versions.length < 2) return null;
  
  const index = versions.findIndex(v => v.id === file.id);
  if (index === 0) {
    return { type: 'version', text: 'Latest version', priority: 1, color: 'green' };
  } else {
    return { type: 'version', text: `V${versions.length - index} (Older)`, priority: 3, color: 'yellow' };
  }
}
```

**5. File Family**
```typescript
function generateFamilyLabel(file: DriveFile): Label | null {
  const related = findRelatedFiles(file); // Same name, different types
  if (related.length < 2) return null;
  
  return { type: 'family', text: `Part of ${related.length}-file set`, priority: 3, color: 'orange' };
}
```

### Label Priority System

```typescript
function selectLabelsForDisplay(file: DriveFile): Label[] {
  const allLabels = [
    generateProjectLabel(file),
    generateFrequencyLabel(file),
    generateSocialLabel(file),
    generateVersionLabel(file),
    generateFamilyLabel(file),
  ].filter(Boolean);
  
  // Sort by priority (1 = highest)
  allLabels.sort((a, b) => a.priority - b.priority);
  
  // Return top 2 labels
  return allLabels.slice(0, 2);
}
```

### UI Implementation

**Label Badges on File Cards**:
```tsx
<div className="flex gap-1 mt-2">
  {labels.map(label => (
    <span 
      key={label.type}
      className={`px-2 py-1 text-xs rounded-full bg-${label.color}-100 text-${label.color}-700`}
    >
      {label.text}
    </span>
  ))}
</div>
```

**Filterable Labels**:
```tsx
<div className="mb-4">
  <h3>Filter by label:</h3>
  <div className="flex gap-2">
    <button onClick={() => filterBy('frequently-used')}>
      Frequently Used
    </button>
    <button onClick={() => filterBy('stale')}>
      Not Used Recently
    </button>
    <button onClick={() => filterBy('latest-version')}>
      Latest Versions Only
    </button>
  </div>
</div>
```

---

## Feature 5: Smart Collections with Auto-Suggest

### Goal
Let users create custom collections, then auto-suggest related files to add.

### Collection Management

**Creating Collections**:
```typescript
interface SmartCollection {
  id: string;
  name: string;
  description?: string;
  fileIds: string[];
  createdAt: string;
  isBookmarked: boolean;
  autoSuggest: {
    enabled: boolean;
    lastUpdate: string;
    suggestedFileIds: string[];
  };
}

function createCollection(name: string, initialFiles: string[]): SmartCollection {
  return {
    id: generateId(),
    name,
    fileIds: initialFiles,
    createdAt: new Date().toISOString(),
    isBookmarked: false,
    autoSuggest: {
      enabled: true,
      lastUpdate: new Date().toISOString(),
      suggestedFileIds: [],
    },
  };
}
```

### Auto-Suggestion Algorithm

**Step 1: Extract Collection Characteristics**
```typescript
function analyzeCollection(collection: SmartCollection): CollectionProfile {
  const files = collection.fileIds.map(id => getFileById(id));
  
  return {
    commonKeywords: extractCommonKeywords(files.map(f => f.name)),
    mimeTypes: [...new Set(files.map(f => f.mimeType))],
    sharers: [...new Set(files.map(f => f.sharingUser?.email).filter(Boolean))],
    avgModifiedTime: avgDate(files.map(f => f.modifiedTime)),
  };
}
```

**Step 2: Find Matching Files**
```typescript
function suggestFilesForCollection(collection: SmartCollection): string[] {
  const profile = analyzeCollection(collection);
  const allFiles = getAllFiles();
  const suggestions: Array<{fileId: string, score: number}> = [];
  
  for (const file of allFiles) {
    // Skip if already in collection
    if (collection.fileIds.includes(file.id)) continue;
    
    let score = 0;
    
    // Keyword overlap
    const fileKeywords = extractKeywords(file.name);
    const overlap = fileKeywords.filter(k => profile.commonKeywords.includes(k)).length;
    score += overlap * 0.4;
    
    // Same MIME type
    if (profile.mimeTypes.includes(file.mimeType)) score += 0.2;
    
    // Same sharer
    if (profile.sharers.includes(file.sharingUser?.email)) score += 0.3;
    
    // Recent file (within 30 days of collection avg)
    const daysDiff = Math.abs(daysBetween(file.modifiedTime, profile.avgModifiedTime));
    if (daysDiff < 30) score += 0.1;
    
    if (score >= 0.4) {
      suggestions.push({ fileId: file.id, score });
    }
  }
  
  // Return top 5 suggestions, sorted by score
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.fileId);
}
```

### UI Implementation

**Collections Tab**:
```tsx
<div className="space-y-4">
  <button onClick={createNewCollection} className="btn-primary">
    + New Collection
  </button>
  
  {collections.map(collection => (
    <Card key={collection.id}>
      <CardHeader 
        title={collection.name}
        subtitle={`${collection.fileIds.length} files`}
      >
        <button onClick={() => editCollection(collection.id)}>Edit</button>
      </CardHeader>
      
      {/* Member files */}
      <DriveFileList files={getCollectionFiles(collection)} />
      
      {/* Auto-suggestions */}
      {collection.autoSuggest.suggestedFileIds.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <h4 className="font-medium mb-2">
            Suggested: {collection.autoSuggest.suggestedFileIds.length} files
          </h4>
          <div className="space-y-2">
            {collection.autoSuggest.suggestedFileIds.map(fileId => (
              <SuggestedFileRow 
                key={fileId}
                file={getFileById(fileId)}
                onAdd={() => addToCollection(collection.id, fileId)}
                onDismiss={() => dismissSuggestion(collection.id, fileId)}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  ))}
</div>
```

**Add to Collection UI**:
```tsx
// On any file card
<DropdownMenu>
  <DropdownMenuItem onClick={() => showCollectionPicker(file)}>
    Add to Collection...
  </DropdownMenuItem>
</DropdownMenu>

// Collection picker modal
<Modal>
  <h3>Add "{file.name}" to collection</h3>
  {collections.map(collection => (
    <button onClick={() => addToCollection(collection.id, file.id)}>
      {collection.name}
    </button>
  ))}
  <button onClick={createNewCollectionWithFile}>
    + Create New Collection
  </button>
</Modal>
```

### Storage Schema

```typescript
localStorage.setItem('intelligent-drive:collections', JSON.stringify({
  collections: SmartCollection[],
  dismissedSuggestions: Record<collectionId, fileId[]>,
}));
```

---

## Data Persistence Strategy

### localStorage Structure

All intelligence data stored under `intelligent-drive:` prefix:

```typescript
// Main intelligence state
localStorage.setItem('intelligent-drive:state', JSON.stringify({
  version: '1.0.0',
  lastAnalysisRun: string,
  analysisEnabled: boolean,
}));

// Feature-specific stores
localStorage.setItem('intelligent-drive:projects', projectsData);
localStorage.setItem('intelligent-drive:suggestions', suggestionsData);
localStorage.setItem('intelligent-drive:sessions', sessionsData);
localStorage.setItem('intelligent-drive:labels', labelsData);
localStorage.setItem('intelligent-drive:collections', collectionsData);
```

### Analysis Scheduling

**When to Run Analysis**:
1. On dashboard load (if not run in last hour)
2. After fetching new files from Drive
3. When user manually triggers "Refresh Intelligence"

**Incremental Updates**:
```typescript
function runIntelligenceAnalysis(mode: 'full' | 'incremental' = 'incremental') {
  const lastRun = getLastAnalysisTime();
  const newFiles = mode === 'full' ? getAllFiles() : getFilesSince(lastRun);
  
  // Process in batches to avoid blocking UI
  batchProcess(newFiles, 50, (batch) => {
    analyzeFileBatch(batch);
    updateProjects(batch);
    updateSessions(batch);
    generateLabels(batch);
    updateCollectionSuggestions(batch);
  });
  
  setLastAnalysisTime(Date.now());
}
```

### Performance Considerations

**Lazy Loading**:
- Don't analyze all files on initial load
- Process in background as user browses
- Cache analysis results per file

**Data Limits**:
- Store max 100 detected projects
- Keep last 50 work sessions
- Limit suggestions to 10 per file
- Auto-prune stale data (6+ months old)

---

## Error Handling

### Pattern Detection Failures

```typescript
try {
  const projects = detectProjects(files);
} catch (error) {
  console.warn('Project detection failed:', error);
  // Fallback: show files ungrouped
  return { projects: [], error: 'Pattern analysis unavailable' };
}
```

### localStorage Quota Exceeded

```typescript
function saveToLocalStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      // Prune old data
      pruneOldIntelligenceData();
      // Retry
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch {
        showError('Storage full. Some smart features disabled.');
      }
    }
  }
}
```

### Drive API Failures

```typescript
// Intelligence features degrade gracefully
if (!files || files.length === 0) {
  return <EmptyState message="Load files to see intelligent features" />;
}
```

---

## Testing Strategy

### Unit Tests

**Pattern Analyzer**:
```typescript
describe('extractKeywords', () => {
  it('removes stopwords', () => {
    expect(extractKeywords('Copy of Final Budget v3'))
      .toEqual(['budget']);
  });
  
  it('handles camelCase', () => {
    expect(extractKeywords('myBudgetSheet'))
      .toEqual(['budget', 'sheet']);
  });
});
```

**Project Detector**:
```typescript
describe('detectProjects', () => {
  it('groups files with shared keywords', () => {
    const files = [
      { name: 'Q4_budget_sheet.xlsx' },
      { name: 'Q4_budget_presentation.pptx' },
    ];
    const projects = detectProjects(files);
    expect(projects).toHaveLength(1);
    expect(projects[0].name).toContain('Q4 Budget');
  });
});
```

### Integration Tests

**End-to-End Flow**:
1. Load files from mock Drive API
2. Run intelligence analysis
3. Verify projects detected
4. Verify labels generated
5. Verify suggestions created

### User Testing

**Test Scenarios**:
1. User with messy filenames (lots of "Copy of...")
2. User with project-based work (marketing, engineering)
3. User who accesses files in patterns (Monday reports)
4. User with mostly shared files vs own files

---

## UI/UX Considerations

### Progressive Disclosure

**Initial State**:
- Show intelligence features after first analysis completes
- Display loading indicators during analysis
- Explain what each feature does on first use

**Onboarding**:
```tsx
<WelcomeModal feature="projects">
  <h3>Smart Projects Detected</h3>
  <p>We found {projectCount} projects based on your file names and access patterns.</p>
  <p>Click any project to see its files, or dismiss false positives.</p>
</WelcomeModal>
```

### Visual Hierarchy

**Priority Display**:
1. **Projects** - Most important discovery, show first
2. **Work Sessions** - Recent patterns, show in sidebar widget
3. **Smart Labels** - Inline on file cards
4. **Suggestions** - Subtle badges, don't overwhelm
5. **Collections** - Separate tab, power-user feature

### Performance UX

**Loading States**:
```tsx
{analyzing && (
  <div className="flex items-center gap-2 text-sm text-gray-500">
    <Spinner />
    Analyzing files for patterns...
  </div>
)}
```

**Background Processing**:
- Don't block UI during analysis
- Show progress for long operations
- Allow cancellation

---

## Privacy & Security

### Data Handling

**What's Stored Locally**:
- File metadata (already fetched from Drive)
- Detected patterns and projects
- User preferences (renamed projects, dismissed suggestions)
- View timestamps and session data

**What's NOT Stored**:
- File contents (never accessed)
- Full file bodies
- Sensitive user data beyond what Drive API provides

**User Control**:
```tsx
<Settings>
  <section>
    <h3>Intelligence Features</h3>
    <Toggle 
      label="Enable smart project detection"
      checked={settings.projectsEnabled}
      onChange={toggleProjects}
    />
    <Toggle 
      label="Track work sessions"
      checked={settings.sessionsEnabled}
      onChange={toggleSessions}
    />
    <button onClick={clearAllIntelligence} className="text-red-600">
      Clear All Intelligence Data
    </button>
  </section>
</Settings>
```

### localStorage Cleanup

```typescript
function clearIntelligenceData() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('intelligent-drive:'));
  keys.forEach(k => localStorage.removeItem(k));
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Pattern analyzer library
- [ ] Intelligence storage layer
- [ ] Basic keyword extraction
- [ ] localStorage schema

### Phase 2: Project Detection (Week 2)
- [ ] Project detection algorithm
- [ ] Projects tab UI
- [ ] User actions (rename, dismiss, merge)
- [ ] Confidence scoring

### Phase 3: Smart Suggestions (Week 3)
- [ ] Filename problem detection
- [ ] Suggestion generation
- [ ] Personal nicknames system
- [ ] Suggestion UI (badges, modal)

### Phase 4: Sessions & Labels (Week 4)
- [ ] Session tracking
- [ ] Pattern recognition for recurring sessions
- [ ] Label generation for all 5 types
- [ ] Work sessions widget
- [ ] Label display on file cards

### Phase 5: Collections (Week 5)
- [ ] Collection management (create, edit, delete)
- [ ] Auto-suggestion algorithm
- [ ] Collections tab UI
- [ ] Add-to-collection picker

### Phase 6: Polish & Testing (Week 6)
- [ ] Performance optimization
- [ ] Error handling
- [ ] User onboarding modals
- [ ] Settings panel
- [ ] Integration testing
- [ ] User testing with real data

---

## Success Metrics

### User Metrics
- **Discovery**: Users find 30%+ more files without search
- **Speed**: Time to find specific file reduced by 50%
- **Satisfaction**: Users rate organization 4+/5

### Technical Metrics
- **Accuracy**: 70%+ of detected projects accepted by users
- **Performance**: Analysis completes in < 5 seconds for 1000 files
- **Coverage**: 60%+ of files assigned to at least one project
- **Suggestions**: 50%+ filename suggestions accepted

### Quality Metrics
- **Precision**: < 20% false positive project detections
- **Recall**: Detect 80%+ of obvious project groupings
- **Relevance**: 70%+ of collection suggestions are useful

---

## Future Enhancements (Out of Scope)

### Advanced Pattern Detection
- Machine learning for better project detection
- Natural language processing for content analysis
- Cross-file relationship detection (linked docs)

### Collaboration Features
- Share collections with teammates
- Project templates for common workflows
- Team-wide project discovery

### Integration Features
- Calendar integration (files for upcoming meetings)
- Slack integration (files mentioned in channels)
- Email integration (attachments auto-added to collections)

### Visualization
- Timeline view of project activity
- Heatmap of file access patterns
- Network graph of file relationships

---

## Open Questions

1. **Project Size Limits**: What's the max files per project before it becomes unwieldy? (Proposed: 15 files)

2. **Session Window**: Is 30 minutes the right co-viewing window? (Test with 15, 30, 60 min)

3. **Label Limits**: Should we show max 2 labels or allow more? (UX testing needed)

4. **Suggestion Threshold**: What confidence score before showing suggestions? (Proposed: 60%)

5. **Collection Limit**: Max number of collections per user? (Proposed: 20)

---

## Dependencies

### New npm Packages
None required - all features use existing libraries:
- React hooks for state management
- localStorage Web API
- Existing Drive API client

### Browser Requirements
- localStorage support (all modern browsers)
- ES6+ JavaScript
- No special permissions needed

---

## Migration Strategy

### Existing Users
- Run initial analysis on first load after update
- Show "New Features" modal explaining intelligence features
- Allow opt-out in settings

### Data Migration
No data migration needed - intelligence is additive:
- Existing bookmarks remain
- View history preserved
- No breaking changes

---

## Appendix: Algorithm Examples

### Example 1: Project Detection

**Input Files**:
```
1. "Copy of Q4 Budget Planning Sheet v3.xlsx"
2. "Q4_Budget_Presentation_Final.pptx"
3. "Budget Q4 Notes.doc"
4. "Meeting_notes_2024.doc"
```

**Step-by-Step Analysis**:

1. **Extract Keywords**:
   - File 1: ["q4", "budget", "planning", "sheet"]
   - File 2: ["q4", "budget", "presentation"]
   - File 3: ["budget", "q4", "notes"]
   - File 4: ["meeting", "notes", "2024"]

2. **Calculate Similarity**:
   - Files 1 & 2: 2 shared keywords (q4, budget) → 66% overlap
   - Files 1 & 3: 2 shared keywords (q4, budget) → 66% overlap
   - Files 2 & 3: 2 shared keywords (q4, budget) → 66% overlap
   - Files 1 & 4: 0 shared keywords → 0% overlap

3. **Form Cluster**:
   - Project A: Files 1, 2, 3 (all share "q4 budget")
   - File 4: standalone

4. **Generate Name**:
   - Most common keywords: "q4" (3 times), "budget" (3 times)
   - Generated name: "Q4 Budget"
   - Confidence: 0.85 (high keyword overlap, 3+ files)

**Output**:
```json
{
  "id": "proj-1",
  "name": "Q4 Budget",
  "keywords": ["q4", "budget"],
  "fileIds": ["file-1", "file-2", "file-3"],
  "confidence": 0.85,
  "keyPeople": ["alice@company.com"],
  "lastActivity": "2024-05-14T10:30:00Z"
}
```

### Example 2: Filename Suggestion

**Input**: `Copy of Copy of Final_Budget_v3_FINAL.xlsx`

**Analysis**:
1. Detect pattern: 2× "Copy of" prefix
2. Detect pattern: Multiple "final" indicators
3. Extract version: v3
4. Belongs to project: "Q4 Budget"

**Suggestion**: `Q4 Budget Sheet - V3`

**Reason**: "Simplified from messy filename (removed duplicates, added project context)"

---

## Conclusion

This design adds genuine intelligence to the Google Drive dashboard by analyzing patterns in file metadata and user behavior. All features run client-side using localStorage, requiring no backend infrastructure. The pattern-based approach provides structure and context that Drive's default UI lacks, directly solving the user's core frustrations: "no structure, no names."

**Next Steps**:
1. User review and approval of this spec
2. Create detailed implementation plan (via writing-plans skill)
3. Begin Phase 1 development
