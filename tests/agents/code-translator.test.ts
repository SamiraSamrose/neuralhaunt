import { CodeTranslatorAgent } from '../../src/agents/code-translator-agent';

describe('CodeTranslatorAgent', () => {
  let agent: CodeTranslatorAgent;

  beforeEach(() => {
    agent = new CodeTranslatorAgent({
      id: 'test-translator',
      name: 'Test Translator Agent',
      capabilities: ['translation']
    });
  });

  afterEach(async () => {
    if (agent.isRunning()) {
      await agent.stop();
    }
  });

  test('should start successfully', async () => {
    await agent.start();
    expect(agent.isRunning()).toBe(true);
  });

  test('should have correct capabilities', () => {
    expect(agent.getCapabilities()).toContain('translation');
  });

  test('should translate code', async () => {
    await agent.start();

    const parseResult = {
      ast: {},
      dependencies: [],
      functions: [{
        name: 'TEST-FUNCTION',
        parameters: [],
        lineStart: 1,
        lineEnd: 10
      }],
      metadata: {
        linesOfCode: 10,
        complexity: 5,
        deprecatedPatterns: []
      }
    };

    const message = {
      id: 'msg-1',
      from: 'test',
      to: 'test-translator',
      type: 'request' as const,
      payload: {
        parseResult,
        sourceFile: 'test.cob',
        language: 'COBOL',
        targetLanguage: 'Python'
      },
      timestamp: new Date()
    };

    await expect(agent.handleMessage(message)).resolves.not.toThrow();
  });
});