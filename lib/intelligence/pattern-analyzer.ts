/**
 * Pattern Analysis for File Intelligence
 * Extracts keywords, detects patterns, calculates similarity
 */

/**
 * Problem types for poorly-named files
 */
export type ProblemType =
  | 'generic'
  | 'messy-versioning'
  | 'too-many-numbers'
  | 'all-caps'
  | 'all-lowercase'
  | 'no-delimiters';

export class PatternAnalyzer {
  /**
   * Stopwords to remove from keywords
   * Common words that don't contribute to file organization
   */
  private static readonly STOPWORDS = new Set([
    'copy', 'of', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
    'for', 'with', 'from', 'by', 'final', 'new', 'old', 'temp', 'draft',
    'untitled', 'document', 'spreadsheet', 'presentation', 'file',
  ]);

  /**
   * Version indicator patterns to remove
   */
  private static readonly VERSION_PATTERNS = [
    /v\d+/gi,           // v1, v2, V3
    /\(\d+\)/g,         // (1), (2)
    /\[\d+\]/g,         // [1], [2]
    /version\s*\d+/gi,  // version 1, version 2
    /_\d+$/,            // trailing _1, _2
  ];

  /**
   * Extract meaningful keywords from a filename
   * Returns lowercase keywords 3+ characters, with stopwords and versions removed
   */
  static extractKeywords(filename: string): string[] {
    if (!filename) return [];

    // Remove file extension
    let name = filename.replace(/\.[^/.]+$/, '');

    // Split camelCase
    name = this.splitCamelCase(name);

    // Remove version indicators
    this.VERSION_PATTERNS.forEach(pattern => {
      name = name.replace(pattern, ' ');
    });

    // Split on common delimiters
    const tokens = name.split(/[\s_\-\.]+/);

    // Process tokens
    const keywords = tokens
      .map(token => token.toLowerCase().trim())
      .filter(token => {
        // Remove empty tokens
        if (!token) return false;

        // Remove stopwords
        if (this.STOPWORDS.has(token)) return false;

        // Remove pure numbers
        if (/^\d+$/.test(token)) return false;

        // Remove short tokens (< 3 chars)
        if (token.length < 3) return false;

        return true;
      });

    // Remove duplicates while preserving order
    return [...new Set(keywords)];
  }

  /**
   * Split camelCase words into separate tokens
   * "myBudgetReport" -> "my budget report"
   */
  static splitCamelCase(text: string): string {
    // Insert space before capital letters (but not at start)
    // Handle consecutive capitals (like "XMLParser" -> "XML Parser")
    return text
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/([a-z\d])([A-Z])/g, '$1 $2')
      .toLowerCase();
  }

  /**
   * Calculate Jaccard similarity between two keyword sets
   * Returns value between 0.0 (no overlap) and 1.0 (identical)
   */
  static calculateSimilarity(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 || keywords2.length === 0) {
      return 0.0;
    }

    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);

    // Intersection: keywords in both sets
    const intersection = new Set([...set1].filter(k => set2.has(k)));

    // Union: all unique keywords
    const union = new Set([...set1, ...set2]);

    // Jaccard similarity = |intersection| / |union|
    return intersection.size / union.size;
  }

  /**
   * Extract common keywords from multiple filenames
   * Returns keywords that appear in at least minFrequency of files
   */
  static extractCommonKeywords(filenames: string[], minFrequency = 2): string[] {
    if (filenames.length === 0) return [];

    // Count keyword occurrences
    const keywordCounts = new Map<string, number>();

    filenames.forEach(filename => {
      const keywords = this.extractKeywords(filename);
      keywords.forEach(keyword => {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      });
    });

    // Filter to keywords that appear in at least minFrequency files
    const common = Array.from(keywordCounts.entries())
      .filter(([_, count]) => count >= minFrequency)
      .map(([keyword, _]) => keyword);

    // Sort by frequency (descending)
    return common.sort((a, b) => {
      const countA = keywordCounts.get(a) || 0;
      const countB = keywordCounts.get(b) || 0;
      return countB - countA;
    });
  }

  /**
   * Generate a human-friendly name from keywords
   * Capitalizes properly and joins with spaces
   */
  static generateNameFromKeywords(keywords: string[]): string {
    if (keywords.length === 0) return 'Unnamed';

    // Take top 2-3 keywords
    const topKeywords = keywords.slice(0, 3);

    // Capitalize each word
    const capitalized = topKeywords.map(keyword => {
      // Handle special cases (Q1, Q2, etc.)
      if (/^q\d$/.test(keyword)) {
        return keyword.toUpperCase();
      }
      return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    });

    return capitalized.join(' ');
  }

  /**
   * Detect filename problems (poor naming patterns)
   * Returns array of problem types detected
   */
  static detectFilenameProblems(filename: string): ProblemType[] {
    if (!filename) return [];

    const problems: ProblemType[] = [];

    if (this.hasGenericName(filename)) {
      problems.push('generic');
    }

    if (this.hasMessyVersioning(filename)) {
      problems.push('messy-versioning');
    }

    if (this.hasTooManyNumbers(filename)) {
      problems.push('too-many-numbers');
    }

    const caseProblems = this.isAllCapsOrLowercase(filename);
    if (caseProblems === 'all-caps') {
      problems.push('all-caps');
    } else if (caseProblems === 'all-lowercase') {
      problems.push('all-lowercase');
    }

    if (this.lacksDelimiters(filename)) {
      problems.push('no-delimiters');
    }

    return problems;
  }

  /**
   * Check if filename has a generic name
   * Detects: document, file, untitled, new, copy patterns
   */
  static hasGenericName(filename: string): boolean {
    if (!filename) return false;

    const name = filename.replace(/\.[^/.]+$/, '');

    // Check for generic patterns: /^(document|file|untitled|new|copy)/i
    if (/^(document|file|untitled|new|copy)/i.test(name)) {
      return true;
    }

    return false;
  }

  /**
   * Check if filename has messy versioning
   * Detects: (1), [1], copy X patterns
   */
  static hasMessyVersioning(filename: string): boolean {
    if (!filename) return false;

    // Check for messy versioning patterns: /\(([\d]+)\)|\[[\d]+\]|copy\s*\d+/i
    if (/\([\d]+\)/.test(filename)) return true;
    if (/\[[\d]+\]/.test(filename)) return true;
    if (/copy\s*\d+/i.test(filename)) return true;

    return false;
  }

  /**
   * Check if filename has too many numbers
   * More than 50% of non-whitespace chars are digits
   */
  static hasTooManyNumbers(filename: string): boolean {
    if (!filename) return false;

    const name = filename.replace(/\.[^/.]+$/, '');
    const noSpaces = name.replace(/\s+/g, '');

    if (noSpaces.length === 0) return false;

    const digitCount = (noSpaces.match(/\d/g) || []).length;
    const digitRatio = digitCount / noSpaces.length;

    // More than 50% numbers
    return digitRatio > 0.5;
  }

  /**
   * Check if filename is all caps or all lowercase
   * Returns 'all-caps', 'all-lowercase', or null
   */
  static isAllCapsOrLowercase(filename: string): 'all-caps' | 'all-lowercase' | null {
    if (!filename) return null;

    const name = filename.replace(/\.[^/.]+$/, '');
    const noSpaces = name.replace(/\s+/g, '');

    if (noSpaces.length === 0) return null;

    // Filter out non-letter characters for case check
    const lettersOnly = noSpaces.replace(/[^a-zA-Z]/g, '');

    if (lettersOnly.length === 0) return null;

    if (lettersOnly === lettersOnly.toUpperCase()) {
      return 'all-caps';
    }

    if (lettersOnly === lettersOnly.toLowerCase()) {
      return 'all-lowercase';
    }

    return null;
  }

  /**
   * Check if filename lacks proper delimiters
   * No spaces, underscores, hyphens (except camelCase)
   */
  static lacksDelimiters(filename: string): boolean {
    if (!filename) return false;

    const name = filename.replace(/\.[^/.]+$/, '');

    // Has spaces, underscores, or hyphens
    if (/[\s_-]/.test(name)) {
      return false;
    }

    // Check for camelCase (has uppercase letters for word boundaries)
    if (/[a-z][A-Z]/.test(name)) {
      return false;
    }

    // No delimiters and not camelCase
    return true;
  }

  /**
   * Suggest a better filename based on detected problems
   * Uses keywords to generate improvements
   * Returns null if filename is already good
   */
  static suggestBetterName(filename: string, keywords: string[]): string | null {
    if (!filename) return null;

    const problems = this.detectFilenameProblems(filename);

    // If no problems detected, no suggestion needed
    if (problems.length === 0) return null;

    // Get extension
    const extension = filename.match(/\.[^/.]+$/)?.[0] || '';
    const name = filename.replace(/\.[^/.]+$/, '');

    let improved = name;
    let changed = false;

    // Handle "Copy of" prefix removal
    const beforeCopyRemoval = improved;
    improved = improved.replace(/^Copy of\s+/i, '');
    if (improved !== beforeCopyRemoval) {
      changed = true;
    }

    // Remove version indicators if detected
    if (problems.includes('messy-versioning')) {
      const beforeVersionRemoval = improved;
      improved = improved.replace(/\s*\(\d+\)/g, '');
      improved = improved.replace(/\s*\[\d+\]/g, '');
      improved = improved.replace(/\s*copy\s*\d+/i, '');
      if (improved !== beforeVersionRemoval) {
        changed = true;
      }
    }

    // If we have meaningful keywords and detected a generic name problem, use them
    if (keywords.length > 0 && problems.includes('generic')) {
      improved = this.generateNameFromKeywords(keywords);
      changed = true;
    }

    // If nothing changed or result is empty, return null
    if (!changed || !improved || improved === name) {
      return null;
    }

    return improved + extension;
  }
}
