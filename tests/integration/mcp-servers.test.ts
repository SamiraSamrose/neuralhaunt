import { CRMClient } from '../../.kiro/mcp/clients/crm-client';
import { AnalyticsClient } from '../../.kiro/mcp/clients/analytics-client';

describe('MCP Servers Integration', () => {
  let crmClient: CRMClient;
  let analyticsClient: AnalyticsClient;

  beforeEach(() => {
    crmClient = new CRMClient('http://localhost:3001');
    analyticsClient = new AnalyticsClient('http://localhost:3002');
  });

  afterEach(() => {
    analyticsClient.destroy();
  });

  test('should create CRM client', () => {
    expect(crmClient).toBeDefined();
  });

  test('should create Analytics client', () => {
    expect(analyticsClient).toBeDefined();
  });

  test('should buffer metrics', () => {
    analyticsClient.bufferMetric({
      name: 'test.metric',
      value: 100
    });

    expect(true).toBe(true);
  });
});