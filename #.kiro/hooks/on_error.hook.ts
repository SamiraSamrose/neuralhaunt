import { ErrorContext, EscalationManager, NotificationService } from '../lib/agent-framework';

interface AgentError {
  error: Error;
  agentId: string;
  toolName?: string;
  context: Record<string, any>;
  timestamp: Date;
}

export async function onError(errorEvent: AgentError): Promise<void> {
  const escalation = new EscalationManager();
  const notifier = new NotificationService();
  
  // STEP 1: Capture detailed error information
  const errorDetails = {
    message: errorEvent.error.message,
    stack: errorEvent.error.stack,
    agentId: errorEvent.agentId,
    toolName: errorEvent.toolName,
    context: errorEvent.context,
    timestamp: errorEvent.timestamp
  };
  
  // STEP 2: Classify severity
  const severity = classifyErrorSeverity(errorEvent.error, errorEvent.context);
  
  // STEP 3: Log to error tracking system
  await logError({
    ...errorDetails,
    severity
  });
  
  // STEP 4: Determine escalation path
  const shouldEscalate = severity === 'critical' || severity === 'high';
  
  if (shouldEscalate) {
    // STEP 5: Create escalation ticket
    const ticket = await escalation.createTicket({
      severity,
      title: `Agent Error: ${errorEvent.agentId} - ${errorEvent.error.message}`,
      description: formatErrorDescription(errorDetails),
      context: errorEvent.context
    });
    
    // STEP 6: Notify relevant stakeholders
    await notifier.sendAlert({
      channel: severity === 'critical' ? 'immediate' : 'standard',
      severity,
      message: `Agent ${errorEvent.agentId} encountered ${severity} error`,
      ticketId: ticket.id,
      actionRequired: true
    });
  }
  
  // STEP 7: Attempt recovery if possible
  if (errorEvent.context.retryable) {
    await attemptRecovery(errorEvent);
  }
}

function classifyErrorSeverity(
  error: Error,
  context: Record<string, any>
): 'critical' | 'high' | 'medium' | 'low' {
  // STEP 8: Severity classification logic
  const errorMessage = error.message.toLowerCase();
  
  // Critical: Data loss, corruption, security breach
  if (
    errorMessage.includes('data loss') ||
    errorMessage.includes('corruption') ||
    errorMessage.includes('security') ||
    context.affectsProduction
  ) {
    return 'critical';
  }
  
  // High: Translation failure, test failure, deployment blocked
  if (
    errorMessage.includes('translation failed') ||
    errorMessage.includes('test failed') ||
    context.blocksProgress
  ) {
    return 'high';
  }
  
  // Medium: Performance degradation, warnings
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('performance') ||
    errorMessage.includes('warning')
  ) {
    return 'medium';
  }
  
  // Low: Informational, recoverable
  return 'low';
}

function formatErrorDescription(details: any): string {
  return `
Agent: ${details.agentId}
Tool: ${details.toolName || 'N/A'}
Message: ${details.message}
Timestamp: ${details.timestamp}
Context: ${JSON.stringify(details.context, null, 2)}
Stack Trace:
${details.stack}
  `.trim();
}

async function attemptRecovery(errorEvent: AgentError): Promise<void> {
  // STEP 9: Implement retry logic with exponential backoff
  const maxRetries = 3;
  const baseDelay = 1000; // ms
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const delay = baseDelay * Math.pow(2, attempt - 1);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      // Retry the failed operation
      // Implementation depends on error context
      console.log(`Retry attempt ${attempt} for ${errorEvent.agentId}`);
      break; // Success
    } catch (retryError) {
      if (attempt === maxRetries) {
        // All retries failed, escalate
        console.error(`All retry attempts failed for ${errorEvent.agentId}`);
      }
    }
  }
}

async function logError(errorDetails: any): Promise<void> {
  // STEP 10: Persist error to database for analysis
  // Implementation would write to error logging system
  console.error('[ERROR]', JSON.stringify(errorDetails, null, 2));
}