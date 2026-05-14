/**
 * Pattern Analysis for File Intelligence
 * Extracts keywords, detects patterns, calculates similarity
 */

export class PatternAnalyzer {
  /**
   * Stopwords to remove from keywords
   * Common words that don't contribute to file organization
   */
  private static readonly STOPWORDS = new Set([
    'copy', 'of', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
    'for', 'with', 'from', 'by', 'final', 'new', 'old', 'temp',
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

        // Remove short tokens (< 3 chars) unless they contain both letters and digits (like q4, v2)
        if (token.length < 3 && !/[a-z].*\d|\d.*[a-z]/.test(token)) return false;

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
}
