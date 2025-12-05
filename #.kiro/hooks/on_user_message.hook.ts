// STEP 1: Parse user intent and route to appropriate agent

import { MessageContext, AgentRouter } from '../lib/agent-framework';

interface UserMessage {
  content: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
}

export async function onUserMessage(message: UserMessage): Promise<void> {
  const router = new AgentRouter();
  
  // STEP 2: Classify message intent
  const intent = await classifyIntent(message.content);
  
  // STEP 3: Route to appropriate handler
  switch (intent.type) {
    case 'translation_query':
      await router.route('support-assistant', {
        query: message.content,
        context: intent.context,
        userId: message.userId
      });
      break;
      
    case 'technical_question':
      await router.route('dev-assistant', {
        query: message.content,
        userId: message.userId
      });
      break;
      
    case 'status_check':
      await router.route('status-agent', {
        projectId: intent.context.projectId,
        userId: message.userId
      });
      break;
      
    default:
      await router.route('support-assistant', {
        query: message.content,
        userId: message.userId
      });
  }
}

async function classifyIntent(content: string): Promise<{
  type: string;
  context: Record<string, any>;
}> {
  // STEP 4: Use NLP to classify user intent
  // Simplified implementation - production would use trained model
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('translate') || lowerContent.includes('convert')) {
    return { type: 'translation_query', context: {} };
  }
  
  if (lowerContent.includes('status') || lowerContent.includes('progress')) {
    return { type: 'status_check', context: {} };
  }
  
  if (lowerContent.includes('how to') || lowerContent.includes('implement')) {
    return { type: 'technical_question', context: {} };
  }
  
  return { type: 'general_query', context: {} };
}