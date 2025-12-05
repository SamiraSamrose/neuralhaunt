import { TestGeneratorAgent } from '../../src/agents/test-generator-agent';

describe('TestGeneratorAgent', () => {
  let agent: TestGeneratorAgent;

  beforeEach(() => {
    agent = new TestGeneratorAgent({
      id: 'test-generator',
      name: 'Test Generator Agent',
      capabilities: ['test-generation']
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

  test('should generate tests', async () => {
    await agent.start();

    const translationResult = {
      translatedCode: 'def test_function():\n    pass',
      targetFile: 'test.py',
      mappings: [],
      warnings: []
    };

    const parseResult = {
      ast: {},
      dependencies: [],
      functions: [{
        name: 'test_function',
        parameters: [],
        lineStart: 1,
        lineEnd: 2
      }],
      metadata: {
        linesOfCode: 2,
        complexity: 1,
        deprecatedPatterns: []
      }
    };

    const message = {
      id: 'msg-1',
      from: 'test',
      to: 'test-generator',
      type: 'request' as const,
      payload: {
        translationResult,
        parseResult,
        sourceFile: 'test.cob'
      },
      timestamp: new Date()
    };

    await expect(agent.handleMessage(message)).resolves.not.toThrow();
  });
});