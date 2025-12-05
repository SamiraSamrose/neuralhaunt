import { Agent, AgentConfig, AgentMessage } from './agent-base';
import { AnalyticsClient } from '../../.kiro/mcp/clients/analytics-client';
import { ParseResult } from './legacy-parser-agent';

export interface TranslationRequest {
  parseResult: ParseResult;
  sourceFile: string;
  language: string;
  targetLanguage: 'Python' | 'Java' | 'TypeScript' | 'Go';
}

export interface TranslationResult {
  translatedCode: string;
  targetFile: string;
  mappings: Array<{
    sourceLine: number;
    targetLine: number;
    confidence: number;
  }>;
  warnings: string[];
}

export class CodeTranslatorAgent extends Agent {
  private analytics: AnalyticsClient;
  
  constructor(config: AgentConfig) {
    super(config);
    this.analytics = new AnalyticsClient();
  }
  
  protected async onStart(): Promise<void> {
    console.log(`[${this.config.name}] Starting code translator agent`);
    this.setMemory('translatedFiles', []);
    this.setMemory('totalLinesTranslated', 0);
  }
  
  protected async onStop(): Promise<void> {
    console.log(`[${this.config.name}] Stopping code translator agent`);
    await this.analytics.flush();
  }
  
  // STEP 1: Handle translation requests
  protected async onRequest(message: AgentMessage): Promise<void> {
    const request = message.payload as TranslationRequest;
    const startTime = Date.now();
    
    try {
      // STEP 2: Perform translation
      const result = await this.translateCode(request);
      
      // STEP 3: Track metrics
      const duration = Date.now() - startTime;
      const linesPerMinute = (request.parseResult.metadata.linesOfCode / duration) * 60000;
      
      await this.analytics.sendMetric({
        name: 'translation.speed',
        value: linesPerMinute,
        unit: 'lines/min',
        tags: {
          sourceLanguage: request.language,
          targetLanguage: request.targetLanguage,
          agentId: this.config.id
        }
      });
      
      // STEP 4: Update memory
      const translatedFiles = this.getMemory('translatedFiles') || [];
      translatedFiles.push(result.targetFile);
      this.setMemory('translatedFiles', translatedFiles);
      
      // STEP 5: Send to test generator
      await this.sendMessage('test-generator', 'request', {
        translationResult: result,
        parseResult: request.parseResult,
        sourceFile: request.sourceFile
      });
      
      // STEP 6: Send to risk evaluator
      await this.sendMessage('risk-evaluator', 'request', {
        translationResult: result,
        parseResult: request.parseResult
      });
      
    } catch (error: any) {
      this.emit('error', {
        error,
        agentId: this.config.id,
        toolName: 'translate',
        context: { sourceFile: request.sourceFile }
      });
    }
  }
  
  protected async onNotification(message: AgentMessage): Promise<void> {
    console.log(`[${this.config.name}] Received notification:`, message.payload);
  }
  
  // STEP 7: Main translation logic
  private async translateCode(request: TranslationRequest): Promise<TranslationResult> {
    const { parseResult, sourceFile, language, targetLanguage } = request;
    
    // Determine target file extension
    const ext = this.getFileExtension(targetLanguage);
    const targetFile = sourceFile.replace(/\.[^.]+$/, ext);
    
    // Translate based on source and target languages
    let translatedCode = '';
    const mappings: TranslationResult['mappings'] = [];
    const warnings: string[] = [];
    
    if (language === 'COBOL' && targetLanguage === 'Python') {
      ({ translatedCode, mappings, warnings } = await this.translateCOBOLToPython(parseResult));
    } else if (language === 'Pascal' && targetLanguage === 'Python') {
      ({ translatedCode, mappings, warnings } = await this.translatePascalToPython(parseResult));
    } else if (language === 'VB6' && targetLanguage === 'TypeScript') {
      ({ translatedCode, mappings, warnings } = await this.translateVB6ToTypeScript(parseResult));
    } else {
      throw new Error(`Translation from ${language} to ${targetLanguage} not yet supported`);
    }
    
    return {
      translatedCode,
      targetFile,
      mappings,
      warnings
    };
  }
  
  // STEP 8: COBOL to Python translation
  private async translateCOBOLToPython(parseResult: ParseResult): Promise<{
    translatedCode: string;
    mappings: TranslationResult['mappings'];
    warnings: string[];
  }> {
    const warnings: string[] = [];
    const mappings: TranslationResult['mappings'] = [];
    
    let translatedCode = '"""Translated from COBOL"""\n\n';
    translatedCode += 'from typing import Any, List, Dict\n';
    translatedCode += 'from decimal import Decimal\n\n';
    
    // STEP 9: Translate functions
    parseResult.functions.forEach((func, index) => {
      const pythonFuncName = func.name.toLowerCase().replace(/-/g, '_');
      translatedCode += `def ${pythonFuncName}():\n`;
      translatedCode += `    """${func.name} procedure"""\n`;
      translatedCode += `    pass\n\n`;
      
      mappings.push({
        sourceLine: func.lineStart,
        targetLine: index * 4 + 4,
        confidence: 0.85
      });
    });
    
    // STEP 10: Add main execution
    translatedCode += 'if __name__ == "__main__":\n';
    translatedCode += '    # Main execution\n';
    translatedCode += '    pass\n';
    
    // STEP 11: Check for deprecated patterns
    if (parseResult.metadata.deprecatedPatterns.length > 0) {
      warnings.push(`Deprecated patterns found: ${parseResult.metadata.deprecatedPatterns.join(', ')}`);
    }
    
    return { translatedCode, mappings, warnings };
  }
  
  // STEP 12: Pascal to Python translation
  private async translatePascalToPython(parseResult: ParseResult): Promise<{
    translatedCode: string;
    mappings: TranslationResult['mappings'];
    warnings: string[];
  }> {
    const warnings: string[] = [];
    const mappings: TranslationResult['mappings'] = [];
    
    let translatedCode = '"""Translated from Pascal"""\n\n';
    translatedCode += 'from typing import Any, List\n\n';
    
    // Translate functions and procedures
    parseResult.functions.forEach((func, index) => {
      const pythonFuncName = func.name.toLowerCase();
      translatedCode += `def ${pythonFuncName}():\n`;
      translatedCode += `    """${func.name}"""\n`;
      translatedCode += `    pass\n\n`;
      
      mappings.push({
        sourceLine: func.lineStart,
        targetLine: index * 4 + 3,
        confidence: 0.9
      });
    });
    
    translatedCode += 'if __name__ == "__main__":\n';
    translatedCode += '    pass\n';
    
    return { translatedCode, mappings, warnings };
  }
  
  // STEP 13: VB6 to TypeScript translation
  private async translateVB6ToTypeScript(parseResult: ParseResult): Promise<{
    translatedCode: string;
    mappings: TranslationResult['mappings'];
    warnings: string[];
  }> {
    const warnings: string[] = [];
    const mappings: TranslationResult['mappings'] = [];
    
    let translatedCode = '// Translated from Visual Basic 6.0\n\n';
    
    // Translate subs and functions
    parseResult.functions.forEach((func, index) => {
      const tsFuncName = func.name.charAt(0).toLowerCase() + func.name.slice(1);
      translatedCode += `function ${tsFuncName}(): void {\n`;
      translatedCode += `  // ${func.name}\n`;
      translatedCode += `}\n\n`;
      
      mappings.push({
        sourceLine: func.lineStart,
        targetLine: index * 4 + 1,
        confidence: 0.88
      });
    });
    
    translatedCode += 'export {};\n';
    
    return { translatedCode, mappings, warnings };
  }
  
  // STEP 14: Get file extension for target language
  private getFileExtension(language: string): string {
    const extensions: Record<string, string> = {
      'Python': '.py',
      'Java': '.java',
      'TypeScript': '.ts',
      'Go': '.go'
    };
    return extensions[language] || '.txt';
  }
}