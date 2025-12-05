export class Validators {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidLanguage(language: string): boolean {
    const validLanguages = ['COBOL', 'Pascal', 'VB6', 'Fortran', 'Python', 'Java', 'TypeScript', 'Go'];
    return validLanguages.includes(language);
  }

  static isValidFilePath(path: string): boolean {
    return path.length > 0 && !path.includes('..') && !path.startsWith('/');
  }

  static isValidRiskScore(score: number): boolean {
    return score >= 0 && score <= 100;
  }

  static isValidCoverage(coverage: number): boolean {
    return coverage >= 0 && coverage <= 100;
  }

  static validateTranslationRequest(request: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.sourceFile) errors.push('sourceFile is required');
    if (!request.sourceCode) errors.push('sourceCode is required');
    if (!request.language) errors.push('language is required');
    
    if (request.language && !this.isValidLanguage(request.language)) {
      errors.push('Invalid source language');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateTestSuite(testSuite: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!testSuite.unitTests) errors.push('unitTests is required');
    if (!testSuite.integrationTests) errors.push('integrationTests is required');
    if (!testSuite.regressionTests) errors.push('regressionTests is required');
    if (!testSuite.coverage) errors.push('coverage is required');

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }
}