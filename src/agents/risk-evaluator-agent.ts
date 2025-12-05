import { Agent, AgentConfig, AgentMessage } from './agent-base';
import { AnalyticsClient } from '../../.kiro/mcp/clients/analytics-client';
import { TranslationResult } from './code-translator-agent';
import { ParseResult } from './legacy-parser-agent';

export interface RiskEvaluationRequest {
  translationResult: TranslationResult;
  parseResult: ParseResult;
}

export interface RiskReport {
  overallScore: number; // 0-100, higher = more risk
  riskFactors: Array<{
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    location: { file: string; line?: number };
    recommendation: string;
  }>;
  securityIssues: Array<{
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
  }>;
  performanceWarnings: string[];
  requiresHumanReview: boolean;
}

export class RiskEvaluatorAgent extends Agent {
  private analytics: AnalyticsClient;
  
  constructor(config: AgentConfig) {
    super(config);
    this.analytics = new AnalyticsClient();
  }
  
  protected async onStart(): Promise<void> {
    console.log(`[${this.config.name}] Starting risk evaluator agent`);
    this.setMemory('evaluatedFiles', []);
    this.setMemory('highRiskCount', 0);
  }
  
  protected async onStop(): Promise<void> {
    console.log(`[${this.config.name}] Stopping risk evaluator agent`);
    await this.analytics.flush();
  }
  
  // STEP 1: Handle risk evaluation requests
  protected async onRequest(message: AgentMessage): Promise<void> {
    const request = message.payload as RiskEvaluationRequest;
    const startTime = Date.now();
    
    try {
      // STEP 2: Perform risk evaluation
      const riskReport = await this.evaluateRisk(request);
      
      // STEP 3: Track metrics
      await this.analytics.sendMetric({
        name: 'risk.score',
        value: riskReport.overallScore,
        unit: 'score',
        tags: {
          agentId: this.config.id
        }
      });
      
      await this.analytics.sendMetric({
        name: 'risk.evaluation_time',
        value: Date.now() - startTime,
        unit: 'ms',
        tags: {
          agentId: this.config.id
        }
      });
      
      // STEP 4: Update memory
      const evaluatedFiles = this.getMemory('evaluatedFiles') || [];
      evaluatedFiles.push(request.translationResult.targetFile);
      this.setMemory('evaluatedFiles', evaluatedFiles);
      
      if (riskReport.overallScore > 70) {
        const highRiskCount = this.getMemory('highRiskCount') || 0;
        this.setMemory('highRiskCount', highRiskCount + 1);
      }
      
      // STEP 5: Escalate if high risk
      if (riskReport.requiresHumanReview) {
        await this.sendMessage('orchestrator', 'notification', {
          event: 'high_risk_detected',
          riskReport,
          targetFile: request.translationResult.targetFile,
          requiresReview: true
        });
      } else {
        await this.sendMessage('orchestrator', 'notification', {
          event: 'risk_evaluation_complete',
          riskReport,
          targetFile: request.translationResult.targetFile
        });
      }
      
    } catch (error: any) {
      this.emit('error', {
        error,
        agentId: this.config.id,
        toolName: 'evaluate_risk',
        context: { targetFile: request.translationResult.targetFile }
      });
    }
  }
  
  protected async onNotification(message: AgentMessage): Promise<void> {
    console.log(`[${this.config.name}] Received notification:`, message.payload);
  }
  
  // STEP 6: Perform comprehensive risk evaluation
  private async evaluateRisk(request: RiskEvaluationRequest): Promise<RiskReport> {
    const { translationResult, parseResult } = request;
    const riskFactors: RiskReport['riskFactors'] = [];
    
    // STEP 7: Check for deprecated patterns
    parseResult.metadata.deprecatedPatterns.forEach(pattern => {
      riskFactors.push({
        category: 'Deprecated Pattern',
        severity: 'high',
        description: `Legacy code uses ${pattern}`,
        location: { file: translationResult.targetFile },
        recommendation: 'Review translation to ensure modern equivalent is correct'
      });
    });
    
    // STEP 8: Check translation confidence
    const lowConfidenceMappings = translationResult.mappings.filter(m => m.confidence < 0.8);
    if (lowConfidenceMappings.length > 0) {
      riskFactors.push({
        category: 'Translation Confidence',
        severity: 'medium',
        description: `${lowConfidenceMappings.length} translations with confidence < 80%`,
        location: { file: translationResult.targetFile },
        recommendation: 'Manual review recommended for low-confidence translations'
      });
    }
    
    // STEP 9: Check code complexity
    if (parseResult.metadata.complexity > 20) {
      riskFactors.push({
        category: 'Code Complexity',
        severity: 'medium',
        description: `High cyclomatic complexity: ${parseResult.metadata.complexity}`,
        location: { file: translationResult.targetFile },
        recommendation: 'Consider refactoring to reduce complexity'
      });
    }
    
    // STEP 10: Evaluate security issues
    const securityIssues = this.detectSecurityIssues(translationResult);
    
    // STEP 11: Check for performance warnings
    const performanceWarnings = this.detectPerformanceIssues(translationResult, parseResult);
    
    // STEP 12: Calculate overall risk score
    const overallScore = this.calculateRiskScore(riskFactors, securityIssues, performanceWarnings);
    
    // STEP 13: Determine if human review required
    const requiresHumanReview = overallScore > 70 || 
                                securityIssues.some(i => i.severity === 'critical') ||
                                riskFactors.some(r => r.severity === 'critical');
    
    return {
      overallScore,
      riskFactors,
      securityIssues,
      performanceWarnings,
      requiresHumanReview
    };
  }
  
  // STEP 14: Detect security vulnerabilities
  private detectSecurityIssues(translation: TranslationResult): RiskReport['securityIssues'] {
    const issues: RiskReport['securityIssues'] = [];
    const code = translation.translatedCode.toLowerCase();
    
    // Check for SQL injection risks
    if (code.includes('execute(') && code.includes('+')) {
      issues.push({
        type: 'SQL Injection',
        severity: 'high',
        description: 'Potential SQL injection vulnerability detected'
      });
    }
    
    // Check for hardcoded credentials
    if (code.match(/password\s*=\s*["'][^"']+["']/i)) {
      issues.push({
        type: 'Hardcoded Credentials',
        severity: 'critical',
        description: 'Hardcoded credentials found in code'
      });
    }
    
    // Check for unsafe eval usage
    if (code.includes('eval(')) {
      issues.push({
        type: 'Unsafe Eval',
        severity: 'high',
        description: 'Use of eval() function detected'
      });
    }
    
    // Check for missing input validation
    if (code.includes('input(') && !code.includes('validate')) {
      issues.push({
        type: 'Missing Input Validation',
        severity: 'medium',
        description: 'User input without apparent validation'
      });
    }
    
    return issues;
  }
  
  // STEP 15: Detect performance issues
  private detectPerformanceIssues(
    translation: TranslationResult,
    parse: ParseResult
  ): string[] {
    const warnings: string[] = [];
    const code = translation.translatedCode.toLowerCase();
    
    // Check for nested loops
    const loopMatches = code.match(/for\s+/g);
    if (loopMatches && loopMatches.length > 2) {
      warnings.push('Multiple nested loops detected - may impact performance');
    }
    
    // Check for large string concatenations
    if (code.includes('+=') && code.includes('for')) {
      warnings.push('String concatenation in loop - consider using list and join()');
    }
    
    // Check for repeated database calls
    if (code.match(/execute\(/g)?.length && code.match(/execute\(/g)!.length > 5) {
      warnings.push('Multiple database calls detected - consider batching operations');
    }
    
    return warnings;
  }
  
  // STEP 16: Calculate overall risk score
  private calculateRiskScore(
    riskFactors: RiskReport['riskFactors'],
    securityIssues: RiskReport['securityIssues'],
    performanceWarnings: string[]
  ): number {
    let score = 0;
    
    // Weight risk factors by severity
    const severityWeights = {
      critical: 25,
      high: 15,
      medium: 8,
      low: 3
    };
    
    riskFactors.forEach(factor => {
      score += severityWeights[factor.severity];
    });
    
    securityIssues.forEach(issue => {
      score += severityWeights[issue.severity];
    });
    
    // Add points for performance warnings
    score += performanceWarnings.length * 2;
    
    // Cap at 100
    return Math.min(score, 100);
  }
}