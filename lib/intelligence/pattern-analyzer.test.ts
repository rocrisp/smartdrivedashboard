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
      expect(keywords).toEqual(['sales', 'report']);
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
      const keywords = PatternAnalyzer.extractKeywords('Q4 Budget at SF.doc');
      expect(keywords).toEqual(['budget']);
    });

    it('should normalize to lowercase', () => {
      const keywords = PatternAnalyzer.extractKeywords('BUDGET Report.doc');
      expect(keywords).toEqual(['budget', 'report']);
    });

    it('should remove stopwords like "copy", "the", "of"', () => {
      const keywords = PatternAnalyzer.extractKeywords('Copy of the Sales Report.doc');
      expect(keywords).toEqual(['sales', 'report']);
    });

    it('should remove "draft" as a stopword', () => {
      const keywords = PatternAnalyzer.extractKeywords('Copy of the final draft.doc');
      expect(keywords).toEqual([]);
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
      const keywords1 = ['budget', 'report', 'sales'];
      const keywords2 = ['budget', 'sheet', 'sales'];
      // Intersection: ['budget', 'sales'] = 2
      // Union: ['budget', 'report', 'sales', 'sheet'] = 4
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

  describe('detectFilenameProblems', () => {
    it('should detect generic names', () => {
      const problems = PatternAnalyzer.detectFilenameProblems('Untitled.doc');
      expect(problems).toContain('generic');
    });

    it('should detect messy versioning', () => {
      const problems = PatternAnalyzer.detectFilenameProblems('Report (1).pdf');
      expect(problems).toContain('messy-versioning');
    });

    it('should detect too many numbers', () => {
      const problems = PatternAnalyzer.detectFilenameProblems('20240315143052.xlsx');
      expect(problems).toContain('too-many-numbers');
    });

    it('should detect all caps', () => {
      const problems = PatternAnalyzer.detectFilenameProblems('DOCUMENT.PDF');
      expect(problems).toContain('all-caps');
    });

    it('should detect all lowercase', () => {
      const problems = PatternAnalyzer.detectFilenameProblems('mydocument.doc');
      expect(problems).toContain('all-lowercase');
    });

    it('should detect no delimiters', () => {
      const problems = PatternAnalyzer.detectFilenameProblems('mybudgetreport.doc');
      expect(problems).toContain('no-delimiters');
    });

    it('should detect multiple problems', () => {
      const problems = PatternAnalyzer.detectFilenameProblems('20240315143052.xlsx');
      expect(problems.length).toBeGreaterThan(1);
    });

    it('should return empty array for good filenames', () => {
      const problems = PatternAnalyzer.detectFilenameProblems('Q4 Budget Report.doc');
      expect(problems).toEqual([]);
    });

    it('should handle empty filenames', () => {
      const problems = PatternAnalyzer.detectFilenameProblems('');
      expect(problems).toEqual([]);
    });

    it('should detect "Copy of" copies', () => {
      const problems = PatternAnalyzer.detectFilenameProblems('Copy of Copy of doc.pdf');
      expect(problems).toContain('generic');
    });
  });

  describe('suggestBetterName', () => {
    it('should suggest removing "Copy of" prefix', () => {
      const suggestion = PatternAnalyzer.suggestBetterName('Copy of Budget.doc', ['budget']);
      expect(suggestion).toBe('Budget.doc');
    });

    it('should suggest removing version indicators', () => {
      const suggestion = PatternAnalyzer.suggestBetterName('Report (1).pdf', ['report']);
      expect(suggestion).toBe('Report.pdf');
    });

    it('should suggest better name from generic date filename with keywords', () => {
      const suggestion = PatternAnalyzer.suggestBetterName('Untitled 20240315.xlsx', ['budget', 'report']);
      expect(suggestion).toBeTruthy();
      expect(suggestion).toContain('Budget');
    });

    it('should return null when no improvement possible', () => {
      const suggestion = PatternAnalyzer.suggestBetterName('Budget Report.doc', ['budget', 'report']);
      expect(suggestion).toBeNull();
    });

    it('should return null for untitled with empty keywords', () => {
      const suggestion = PatternAnalyzer.suggestBetterName('Untitled.doc', []);
      expect(suggestion).toBeNull();
    });

    it('should preserve file extension', () => {
      const suggestion = PatternAnalyzer.suggestBetterName('Copy of Report.xlsx', ['report']);
      expect(suggestion).toContain('.xlsx');
    });
  });

  describe('hasGenericName', () => {
    it('should detect generic names', () => {
      expect(PatternAnalyzer.hasGenericName('Untitled.doc')).toBe(true);
      expect(PatternAnalyzer.hasGenericName('document.doc')).toBe(true);
      expect(PatternAnalyzer.hasGenericName('file.pdf')).toBe(true);
      expect(PatternAnalyzer.hasGenericName('new.xlsx')).toBe(true);
      expect(PatternAnalyzer.hasGenericName('Copy of Something.doc')).toBe(true);
    });

    it('should not flag good filenames', () => {
      expect(PatternAnalyzer.hasGenericName('Budget Report.doc')).toBe(false);
      expect(PatternAnalyzer.hasGenericName('Q4 Sales.xlsx')).toBe(false);
    });
  });

  describe('hasMessyVersioning', () => {
    it('should detect version indicators', () => {
      expect(PatternAnalyzer.hasMessyVersioning('Report (1).pdf')).toBe(true);
      expect(PatternAnalyzer.hasMessyVersioning('Document [2].doc')).toBe(true);
      expect(PatternAnalyzer.hasMessyVersioning('Copy 3 of file.xlsx')).toBe(true);
    });

    it('should not flag names without versions', () => {
      expect(PatternAnalyzer.hasMessyVersioning('Budget Report.doc')).toBe(false);
    });
  });

  describe('hasTooManyNumbers', () => {
    it('should detect too many numbers', () => {
      const result = PatternAnalyzer.hasTooManyNumbers('20240315143052.xlsx');
      expect(result).toBe(true);
    });

    it('should allow normal use of numbers', () => {
      expect(PatternAnalyzer.hasTooManyNumbers('Q4 2024 Report.doc')).toBe(false);
    });
  });

  describe('isAllCapsOrLowercase', () => {
    it('should detect all caps', () => {
      expect(PatternAnalyzer.isAllCapsOrLowercase('DOCUMENT.PDF')).toBe('all-caps');
    });

    it('should detect all lowercase', () => {
      expect(PatternAnalyzer.isAllCapsOrLowercase('mydocument.doc')).toBe('all-lowercase');
    });

    it('should not flag mixed case', () => {
      expect(PatternAnalyzer.isAllCapsOrLowercase('Budget Report.doc')).toBe(null);
    });
  });

  describe('lacksDelimiters', () => {
    it('should detect lack of delimiters', () => {
      expect(PatternAnalyzer.lacksDelimiters('mybudgetreport.doc')).toBe(true);
    });

    it('should allow camelCase', () => {
      expect(PatternAnalyzer.lacksDelimiters('myBudgetReport.doc')).toBe(false);
    });

    it('should allow space delimiters', () => {
      expect(PatternAnalyzer.lacksDelimiters('my budget report.doc')).toBe(false);
    });

    it('should allow underscore delimiters', () => {
      expect(PatternAnalyzer.lacksDelimiters('my_budget_report.doc')).toBe(false);
    });

    it('should allow hyphen delimiters', () => {
      expect(PatternAnalyzer.lacksDelimiters('my-budget-report.doc')).toBe(false);
    });
  });
});
