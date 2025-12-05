import { Agent, AgentConfig, AgentMessage } from './agent-base';
import { AnalyticsClient } from '../../.kiro/mcp/clients/analytics-client';

export interface ParseRequest {
  sourceFile: string;
  sourceCode: string;
  language: 'COBOL' | 'Pascal' | 'VB6' | 'Fortran';
}

export interface ParseResult {
  ast: any;
  dependencies: string[];
  functions: Array<{
    name: string;
    parameters: any[];
    returnType?: string;
    lineStart: number;
    lineEnd: number;
  }>;
  metadata: {
    linesOfCode: number;
    complexity: number;
    deprecatedPatterns: string[];
  };
}

export class LegacyParserAgent extends Agent {
  private analytics: AnalyticsClient;
  
  constructor(config: AgentConfig) {
    super(config);
    this.analytics = new AnalyticsClient();
  }
  
  // STEP 1: Initialize parser agent
  protected async onStart(): Promise<void> {
    console.log(`[${this.config.name}] Starting legacy parser agent`);
    this.setMemory('parsedFiles', []);
    this.setMemory('totalLinesProcessed', 0);
  }
  
  protected async onStop(): Promise<void> {
    console.log(`[${this.config.name}] Stopping legacy parser agent`);
    await this.analytics.flush();
  }
  
  // STEP 2: Handle parse requests
  protected async onRequest(message: AgentMessage): Promise<void> {
    const { sourceFile, sourceCode, language } = message.payload as ParseRequest;
    
    const startTime = Date.now();
    
    try {
      // STEP 3: Parse based on language
      const result = await this.parseCode(sourceFile, sourceCode, language);
      
      // STEP 4: Update metrics
      const duration = Date.now() - startTime;
      const linesPerMinute = (result.metadata.linesOfCode / duration) * 60000;
      
      await this.analytics.sendMetric({
        name: 'parser.speed',
        value: linesPerMinute,
        unit: 'lines/min',
        tags: {
          language,
          agentId: this.config.id
        }
      });
      
      // STEP 5: Update memory
      const parsedFiles = this.getMemory('parsedFiles') || [];
      parsedFiles.push(sourceFile);
      this.setMemory('parsedFiles', parsedFiles);
      
      const totalLines = this.getMemory('totalLinesProcessed') || 0;
      this.setMemory('totalLinesProcessed', totalLines + result.metadata.linesOfCode);
      
      // STEP 6: Send result to translator
      await this.sendMessage('code-translator', 'request', {
        parseResult: result,
        sourceFile,
        language
      });
      
    } catch (error: any) {
      this.emit('error', {
        error,
        agentId: this.config.id,
        toolName: 'parse',
        context: { sourceFile, language }
      });
    }
  }
  
  protected async onNotification(message: AgentMessage): Promise<void> {
    // Handle notifications (e.g., configuration updates)
    console.log(`[${this.config.name}] Received notification:`, message.payload);
  }
  
  // STEP 7: Language-specific parsing logic
  private async parseCode(
    sourceFile: string,
    sourceCode: string,
    language: string
  ): Promise<ParseResult> {
    switch (language) {
      case 'COBOL':
        return this.parseCOBOL(sourceFile, sourceCode);
      case 'Pascal':
        return this.parsePascal(sourceFile, sourceCode);
      case 'VB6':
        return this.parseVB6(sourceFile, sourceCode);
      case 'Fortran':
        return this.parseFortran(sourceFile, sourceCode);
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }
  
  // STEP 8: COBOL parser implementation
  private async parseCOBOL(sourceFile: string, sourceCode: string): Promise<ParseResult> {
    // Simplified COBOL parsing logic
    const lines = sourceCode.split('\n');
    const linesOfCode = lines.filter(line => line.trim() && !line.trim().startsWith('*')).length;
    
    // Extract procedure division functions
    const functions: ParseResult['functions'] = [];
    const procedureStart = lines.findIndex(line => line.includes('PROCEDURE DIVISION'));
    
    if (procedureStart >= 0) {
      for (let i = procedureStart; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.match(/^[A-Z0-9-]+\./)) {
          const name = line.replace('.', '');
          functions.push({
            name,
            parameters: [],
            lineStart: i + 1,
            lineEnd: i + 1
          });
        }
      }
    }
    
    // Extract dependencies (CALL statements)
    const dependencies: string[] = [];
    lines.forEach(line => {
      const match = line.match(/CALL\s+'([^']+)'/i);
      if (match) {
        dependencies.push(match[1]);
      }
    });
    
    // Detect deprecated patterns
    const deprecatedPatterns: string[] = [];
    if (sourceCode.includes('ALTER')) deprecatedPatterns.push('ALTER statement');
    if (sourceCode.includes('GO TO')) deprecatedPatterns.push('GO TO statement');
    
    return {
      ast: { type: 'COBOL_PROGRAM', divisions: [] }, // Simplified AST
      dependencies: [...new Set(dependencies)],
      functions,
      metadata: {
        linesOfCode,
        complexity: this.calculateComplexity(sourceCode),
        deprecatedPatterns
      }
    };
  }
  
  // STEP 9: Pascal parser implementation
  private async parsePascal(sourceFile: string, sourceCode: string): Promise<ParseResult> {
    const lines = sourceCode.split('\n');
    const linesOfCode = lines.filter(line => line.trim() && !line.trim().startsWith('//')).length;
    
    // Extract functions and procedures
    const functions: ParseResult['functions'] = [];
    const functionRegex = /(function|procedure)\s+(\w+)\s*(\([^)]*\))?/gi;
    let match;
    
    while ((match = functionRegex.exec(sourceCode)) !== null) {
      functions.push({
        name: match[2],
        parameters: [], // Parse parameters from match[3]
        lineStart: sourceCode.substring(0, match.index).split('\n').length,
        lineEnd: sourceCode.substring(0, match.index).split('\n').length
      });
    }
    
    return {
      ast: { type: 'PASCAL_PROGRAM', declarations: [] },
      dependencies: [],
      functions,
      metadata: {
        linesOfCode,
        complexity: this.calculateComplexity(sourceCode),
        deprecatedPatterns: []
      }
    };
  }
  
  // STEP 10: VB6 parser implementation
  private async parseVB6(sourceFile: string, sourceCode: string): Promise<ParseResult> {
    const lines = sourceCode.split('\n');
    const linesOfCode = lines.filter(line => line.trim() && !line.trim().startsWith("'")).length;
    
    // Extract subs and functions
    const functions: ParseResult['functions'] = [];
    const functionRegex = /(sub|function)\s+(\w+)\s*(\([^)]*\))?/gi;
    let match;
    
    while ((match = functionRegex.exec(sourceCode)) !== null) {
      functions.push({
        name: match[2],
        parameters: [],
        lineStart: sourceCode.substring(0, match.index).split('\n').length,
        lineEnd: sourceCode.substring(0, match.index).split('\n').length
      });
    }
    
    return {
      ast: { type: 'VB6_MODULE', declarations: [] },
      dependencies: [],
      functions,
      metadata: {
        linesOfCode,
        complexity: this.calculateComplexity(sourceCode),
        deprecatedPatterns: []
      }
    };
  }
  
  // STEP 11: Fortran parser implementation
  private async parseFortran(sourceFile: string, sourceCode: string): Promise<ParseResult> {
    const lines = sourceCode.split('\n');
    const linesOfCode = lines.filter(line => line.trim() && !line.trim().startsWith('!')).length;
    
    const functions: ParseResult['functions'] = [];
    const functionRegex = /(subroutine|function)\s+(\w+)\s*(\([^)]*\))?/gi;
    let match;
    
    while ((match = functionRegex.exec(sourceCode)) !== null) {
      functions.push({
        name: match[2],
        parameters: [],
        lineStart: sourceCode.substring(0, match.index).split('\n').length,
        lineEnd: sourceCode.substring(0, match.index).split('\n').length
      });
    }
    
    return {
      ast: { type: 'FORTRAN_PROGRAM', declarations: [] },
      dependencies: [],
      functions,
      metadata: {
        linesOfCode,
        complexity: this.calculateComplexity(sourceCode),
        deprecatedPatterns: []
      }
    };
  }
  
  // STEP 12: Calculate cyclomatic complexity
  private calculateComplexity(sourceCode: string): number {
    // Simplified complexity calculation
    const controlStructures = [
      /\bif\b/gi,
      /\bwhile\b/gi,
      /\bfor\b/gi,
      /\bcase\b/gi,
      /\bswitch\b/gi
    ];
    
    let complexity = 1; // Base complexity
    
    for (const pattern of controlStructures) {
      const matches = sourceCode.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }
    
    return complexity;
  }
}
