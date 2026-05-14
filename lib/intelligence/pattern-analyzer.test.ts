import { PatternAnalyzer } from './pattern-analyzer';

describe('PatternAnalyzer', () => {
  describe('extractKeywords', () => {
    it('should extract keywords from PascalCase filename', () => {
      const keywords = PatternAnalyzer.extractKeywords('UserProfile.tsx');
      expect(keywords).toEqual(['user', 'profile']);
    });

    it('should remove version indicators', () => {
      const keywords = PatternAnalyzer.extractKeywords('user_profile_v2.tsx');
      expect(keywords).toEqual(['user', 'profile']);
    });

    it('should handle complex filename with quarters and dates', () => {
      const keywords = PatternAnalyzer.extractKeywords('Q4-2024-Sales-Report.pdf');
      expect(keywords).toEqual(['q4', 'sales', 'report']);
    });

    it('should handle camelCase', () => {
      const keywords = PatternAnalyzer.extractKeywords('myBudgetReport.doc');
      expect(keywords).toEqual(['budget', 'report']);
    });

    it('should handle kebab-case', () => {
      const keywords = PatternAnalyzer.extractKeywords('budget-report-summary.doc');
      expect(keywords).toEqual(['budget', 'report', 'summary']);
    });

    it('should handle snake_case', () => {
      const keywords = PatternAnalyzer.extractKeywords('budget_report_summary.doc');
      expect(keywords).toEqual(['budget', 'report', 'summary']);
    });

    it('should filter short pure-letter keywords', () => {
      const keywords = PatternAnalyzer.extractKeywords('Q4 Budget at SF office.doc');
      expect(keywords).toEqual(['q4', 'budget', 'office']);
    });

    it('should normalize to lowercase', () => {
      const keywords = PatternAnalyzer.extractKeywords('BUDGET Report.doc');
      expect(keywords).toEqual(['budget', 'report']);
    });

    it('should remove stopwords like "copy", "the", "of"', () => {
      const keywords = PatternAnalyzer.extractKeywords('Copy of the Sales Report.doc');
      expect(keywords).toEqual(['sales', 'report']);
    });

    it('should handle empty filenames', () => {
      const keywords = PatternAnalyzer.extractKeywords('');
      expect(keywords).toEqual([]);
    });

    it('should handle filenames with only stopwords', () => {
      const keywords = PatternAnalyzer.extractKeywords('Copy of the new.doc');
      expect(keywords).toEqual([]);
    });
  });

  describe('calculateSimilarity', () => {
    it('should return 1.0 for identical keyword sets', () => {
      const keywords1 = ['budget', 'report'];
      const keywords2 = ['budget', 'report'];
      const similarity = PatternAnalyzer.calculateSimilarity(keywords1, keywords2);
      expect(similarity).toBe(1.0);
    });

    it('should return 0.0 for completely different keyword sets', () => {
      const keywords1 = ['budget', 'report'];
      const keywords2 = ['meeting', 'notes'];
      const similarity = PatternAnalyzer.calculateSimilarity(keywords1, keywords2);
      expect(similarity).toBe(0.0);
    });

    it('should calculate Jaccard similarity correctly', () => {
      const keywords1 = ['q4', 'budget', 'report'];
      const keywords2 = ['q4', 'budget', 'sheet'];
      // Intersection: ['q4', 'budget'] = 2
      // Union: ['q4', 'budget', 'report', 'sheet'] = 4
      // Jaccard: 2/4 = 0.5
      const similarity = PatternAnalyzer.calculateSimilarity(keywords1, keywords2);
      expect(similarity).toBeCloseTo(0.5);
    });

    it('should handle empty keyword sets', () => {
      const keywords1: string[] = [];
      const keywords2 = ['budget'];
      const similarity = PatternAnalyzer.calculateSimilarity(keywords1, keywords2);
      expect(similarity).toBe(0.0);
    });
  });

  describe('splitCamelCase', () => {
    it('should split camelCase words', () => {
      const result = PatternAnalyzer.splitCamelCase('myBudgetReport');
      expect(result).toBe('my budget report');
    });

    it('should handle consecutive capitals', () => {
      const result = PatternAnalyzer.splitCamelCase('XMLParser');
      expect(result).toBe('xml parser');
    });

    it('should handle single word', () => {
      const result = PatternAnalyzer.splitCamelCase('budget');
      expect(result).toBe('budget');
    });
  });

  describe('extractCommonKeywords', () => {
    it('should extract common keywords from multiple filenames', () => {
      const filenames = ['Q4_Budget_Report.xlsx', 'Q4_Budget_Summary.doc', 'Budget_Analysis.pdf'];
      const common = PatternAnalyzer.extractCommonKeywords(filenames, 2);
      expect(common).toContain('budget');
    });

    it('should handle empty filenames array', () => {
      const common = PatternAnalyzer.extractCommonKeywords([], 2);
      expect(common).toEqual([]);
    });

    it('should sort by frequency descending', () => {
      const filenames = [
        'budget_report.doc',
        'budget_summary.doc',
        'budget_analysis.doc',
        'report_q4.doc'
      ];
      const common = PatternAnalyzer.extractCommonKeywords(filenames, 2);
      expect(common[0]).toBe('budget');
    });
  });

  describe('generateNameFromKeywords', () => {
    it('should generate name from keywords', () => {
      const keywords = ['q4', 'budget', 'report'];
      const name = PatternAnalyzer.generateNameFromKeywords(keywords);
      expect(name).toBe('Q4 Budget Report');
    });

    it('should return Unnamed for empty keywords', () => {
      const keywords: string[] = [];
      const name = PatternAnalyzer.generateNameFromKeywords(keywords);
      expect(name).toBe('Unnamed');
    });

    it('should handle single keyword', () => {
      const keywords = ['budget'];
      const name = PatternAnalyzer.generateNameFromKeywords(keywords);
      expect(name).toBe('Budget');
    });
  });
});
