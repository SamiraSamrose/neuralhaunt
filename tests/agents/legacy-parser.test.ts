import { LegacyParserAgent } from '../../src/agents/legacy-parser-agent';

describe('LegacyParserAgent', () => {
  let agent: LegacyParserAgent;

  beforeEach(() => {
    agent = new LegacyParserAgent({
      id: 'test-parser',
      name: 'Test Parser Agent',
      capabilities: ['parsing']
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

  test('should stop successfully', async () => {
    await agent.start();
    await agent.stop();
    expect(agent.isRunning()).toBe(false);
  });

  test('should have correct capabilities', () => {
    expect(agent.getCapabilities()).toContain('parsing');
  });

  test('should parse COBOL code', async () => {
    await agent.start();

    const message = {
      id: 'msg-1',
      from: 'test',
      to: 'test-parser',
      type: 'request' as const,
      payload: {
        sourceFile: 'test.cob',
        sourceCode: 'IDENTIFICATION DIVISION.\nPROGRAM-ID. TEST.',
        language: 'COBOL'
      },
      timestamp: new Date()
    };

    await expect(agent.handleMessage(message)).resolves.not.toThrow();
  });
});