# Analytics MCP Server

## Purpose
Provides Model Context Protocol endpoints for collecting, analyzing, and visualizing legacy code modernization metrics.

## Endpoints

### Metrics
- POST /metrics - Ingest single metric
- POST /metrics/batch - Ingest multiple metrics

### Dashboards
- GET /dashboard/:projectId - Get project dashboard data

### Trends
- GET /trends - Get historical trend analysis
  - Query params: metric, timeRange (e.g., '24h', '7d'), projectId

### Alerts
- POST /alerts - Create alert rule
- GET /alerts/:projectId - List project alerts

### Health
- GET /health - Server health check

## Metric Types

### Translation Metrics
- translation.speed - Lines translated per minute
- translation.accuracy - Percentage of successful translations
- translation.errors - Number of translation failures

### Quality Metrics
- test.coverage - Percentage of code covered by tests
- test.pass_rate - Percentage of passing tests
- risk.score - Average risk score (0-100)

### Performance Metrics
- agent.response_time - Agent execution time in milliseconds
- system.memory_usage - Memory usage in MB
- system.cpu_usage - CPU usage percentage

## Configuration

### Environment Variables
```
ANALYTICS_SERVER_PORT=3002
DATABASE_URL=postgresql://localhost/neuralhaunt_metrics
LOG_LEVEL=info

#Usage Example

// Send single metric
await fetch('http://localhost:3002/metrics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'translation.speed',
    value: 1250,
    unit: 'lines/min',
    tags: {
      projectId: 'proj-123',
      agentId: 'translator-1',
      language: 'COBOL-to-Python'
    }
  })
});

// Get dashboard
const dashboard = await fetch('http://localhost:3002/dashboard/proj-123')
  .then(r => r.json());

// Create alert
await fetch('http://localhost:3002/alerts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Low test coverage',
    metric: 'test.coverage',
    condition: 'less_than',
    threshold: 80,
    projectId: 'proj-123'
  })
});
```

#Development

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build


