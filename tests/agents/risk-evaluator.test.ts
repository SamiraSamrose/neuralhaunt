import { RiskEvaluatorAgent } from '../../src/agents/risk-evaluator-agent';

describe('RiskEvaluatorAgent', () => {
  let agent: RiskEvaluatorAgent;

  beforeEach(() => {
    agent = new RiskEvaluatorAgent({
      id: 'test-risk-evaluator',
      name: 'Test Risk Evaluator Agent',
      capabilities: ['risk-scoring']
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

  test('should evaluate risk', async () => {
    await agent.start();

    const translationResult = {
      translatedCode: 'def test_function():\n    pass',
      targetFile: 'test.py',
      mappings: [{ sourceLine: 1, targetLine: 1, confidence: 0.9 }],
      warnings: []
    };

    const parseResult = {
      ast: {},
      dependencies: [],
      functions: [],
      metadata: {
        linesOfCode: 2,
        complexity: 1,
        deprecatedPatterns: []
      }
    };

    const message = {
      id: 'msg-1',
      from: 'test',
      to: 'test-risk-evaluator',
      type: 'request' as const,
      payload: {
        translationResult,
        parseResult
      },
      timestamp: new Date()
    };

    await expect(agent.handleMessage(message)).resolves.not.toThrow();
  });
});