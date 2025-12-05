import { ToolContext, AuditLogger, MetricsCollector } from '../lib/agent-framework';

interface ToolCall {
  toolName: string;
  agentId: string;
  parameters: Record<string, any>;
  timestamp: Date;
}

export async function onToolCall(call: ToolCall): Promise<void> {
  const logger = new AuditLogger();
  const metrics = new MetricsCollector();
  
  // STEP 1: Log invocation
  await logger.log({
    event: 'tool_call',
    toolName: call.toolName,
    agentId: call.agentId,
    timestamp: call.timestamp,
    parameters: sanitizeParameters(call.parameters)
  });
  
  // STEP 2: Validate parameters
  const validation = await validateToolParameters(call.toolName, call.parameters);
  if (!validation.valid) {
    throw new Error(`Invalid parameters for ${call.toolName}: ${validation.errors.join(', ')}`);
  }
  
  // STEP 3: Start metrics collection
  metrics.startTimer(`tool.${call.toolName}.duration`);
  metrics.increment(`tool.${call.toolName}.invocations`);
  
  // STEP 4: Set up completion hook
  process.on('toolComplete', (result) => {
    metrics.stopTimer(`tool.${call.toolName}.duration`);
    metrics.gauge(`tool.${call.toolName}.success_rate`, result.success ? 1 : 0);
  });
}

function sanitizeParameters(params: Record<string, any>): Record<string, any> {
  // STEP 5: Remove sensitive data from logs
  const sanitized = { ...params };
  const sensitiveKeys = ['password', 'token', 'apiKey', 'secret'];
  
  for (const key of sensitiveKeys) {
    if (key in sanitized) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

async function validateToolParameters(
  toolName: string,
  parameters: Record<string, any>
): Promise<{ valid: boolean; errors: string[] }> {
  // STEP 6: Tool-specific validation logic
  const errors: string[] = [];
  
  switch (toolName) {
    case 'legacy_parser':
      if (!parameters.sourceFile) errors.push('sourceFile required');
      if (!parameters.language) errors.push('language required');
      break;
      
    case 'code_translator':
      if (!parameters.sourceCode) errors.push('sourceCode required');
      if (!parameters.targetLanguage) errors.push('targetLanguage required');
      break;
      
    case 'test_generator':
      if (!parameters.translatedCode) errors.push('translatedCode required');
      break;
      
    case 'risk_evaluator':
      if (!parameters.originalCode) errors.push('originalCode required');
      if (!parameters.translatedCode) errors.push('translatedCode required');
      break;
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}