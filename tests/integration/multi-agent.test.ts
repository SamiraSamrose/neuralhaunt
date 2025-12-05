import { AgentOrchestrator } from '../../src/lib/agent-framework';
import { LegacyParserAgent } from '../../src/agents/legacy-parser-agent';
import { CodeTranslatorAgent } from '../../src/agents/code-translator-agent';

describe('Multi-Agent Integration', () => {
  let orchestrator: AgentOrchestrator;
  let parserAgent: LegacyParserAgent;
  let translatorAgent: CodeTranslatorAgent;

  beforeEach(() => {
    orchestrator = new AgentOrchestrator();
    
    parserAgent = new LegacyParserAgent({
      id: 'parser',
      name: 'Parser Agent',
      capabilities: ['parsing']
    });

    translatorAgent = new CodeTranslatorAgent({
      id: 'translator',
      name: 'Translator Agent',
      capabilities: ['translation']
    });

    orchestrator.registerAgent(parserAgent);
    orchestrator.registerAgent(translatorAgent);
  });

  afterEach(async () => {
    await orchestrator.stopAll();
  });

  test('should register multiple agents', () => {
    expect(orchestrator.getAgentIds()).toContain('parser');
    expect(orchestrator.getAgentIds()).toContain('translator');
  });

  test('should start all agents', async () => {
    await orchestrator.startAll();
    expect(parserAgent.isRunning()).toBe(true);
    expect(translatorAgent.isRunning()).toBe(true);
  });

  test('should stop all agents', async () => {
    await orchestrator.startAll();
    await orchestrator.stopAll();
    expect(parserAgent.isRunning()).toBe(false);
    expect(translatorAgent.isRunning()).toBe(false);
  });
});