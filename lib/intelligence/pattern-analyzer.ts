/**
 * Pattern Analysis for File Intelligence
 * Extracts keywords, detects patterns, calculates similarity
 */

/**
 * Problem types for poorly-named files
 */
export type FilenameProblemType =
  | 'multiple-copies'
  | 'version-mess'
  | 'untitled'
  | 'date-version'
  | 'too-long'
  | 'too-generic'
  | null;

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
   * Check if a filename has quality issues
   */
  static isNamePoor(filename: string): boolean {
    if (!filename) return false;

    // Remove extension for analysis
    const name = filename.replace(/\.[^/.]+$/, '');

    // Too many underscores/hyphens (> 5 segments)
    if (name.split(/[_-]/).length > 5) return true;

    // Multiple "final" or "copy" keywords (>= 2 occurrences)
    const finalCopyCount = (name.match(/(final|copy)/gi) || []).length;
    if (finalCopyCount >= 2) return true;

    // Very long filename (50+ characters)
    if (name.length > 50) return true;

    // Too short and generic (< 10 chars and starts with common generic words)
    if (name.length < 10 && /^(doc|file|new|untitled)/i.test(name)) {
      return true;
    }

    return false;
  }

  /**
   * Detect specific problem pattern in filename
   * Returns problem type or null if filename is acceptable
   */
  static detectProblemPattern(filename: string): FilenameProblemType {
    if (!filename) return null;

    // Pattern 1: Multiple "Copy of" prefixes
    if (/^(Copy of )+/i.test(filename)) {
      const matches = filename.match(/Copy of/gi);
      if (matches && matches.length >= 2) {
        return 'multiple-copies';
      }
    }

    // Pattern 2: Version mess (multiple final/version indicators)
    // Check for multiple "final" keywords
    const finalMatches = filename.match(/final/gi);
    if (finalMatches && finalMatches.length >= 2) {
      return 'version-mess';
    }
    // Check for multiple version numbers
    if (/v\d+.*v\d+/i.test(filename)) {
      return 'version-mess';
    }

    // Pattern 3: Untitled documents
    if (/^Untitled (document|spreadsheet|presentation)/i.test(filename)) {
      return 'untitled';
    }

    // Pattern 4: Date-version pattern (20240115_doc_v2)
    if (/\d{8}_\w+_v\d+/.test(filename)) {
      return 'date-version';
    }

    // Pattern 5: Too long
    const name = filename.replace(/\.[^/.]+$/, '');
    if (name.length > 50) {
      return 'too-long';
    }

    // Pattern 6: Too generic
    if (name.length < 10 && /^(doc|file|new)/i.test(name)) {
      return 'too-generic';
    }

    return null;
  }

  /**
   * Get human-readable explanation for a problem pattern
   */
  static getProblemExplanation(problemType: FilenameProblemType): string {
    switch (problemType) {
      case 'multiple-copies':
        return 'Multiple "Copy of" prefixes make the name unclear';
      case 'version-mess':
        return 'Too many version indicators (final, v1, v2, etc.)';
      case 'untitled':
        return 'Generic "Untitled" name without context';
      case 'date-version':
        return 'Technical date-version format is hard to read';
      case 'too-long':
        return 'Filename is too long (50+ characters)';
      case 'too-generic':
        return 'Generic name like "doc" or "file" needs context';
      default:
        return 'Filename could be improved';
    }
  }
}
