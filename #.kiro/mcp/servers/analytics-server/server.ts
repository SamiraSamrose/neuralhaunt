import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.ANALYTICS_SERVER_PORT || 3002;

// STEP 1: Middleware setup
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[Analytics Server] ${req.method} ${req.path}`);
  next();
});

// In-memory storage (use time-series DB in production like InfluxDB or TimescaleDB)
const metrics: any[] = [];
const alerts: any[] = [];
const dashboards = new Map();

// STEP 2: Metrics ingestion endpoint
app.post('/metrics', (req: Request, res: Response) => {
  // STEP 3: Validate and store metric
  const metric = {
    id: uuidv4(),
    timestamp: new Date(),
    ...req.body
  };
  
  // Validate required fields
  if (!metric.name || metric.value === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: name, value'
    });
  }
  
  metrics.push(metric);
  
  // STEP 4: Check if metric triggers any alerts
  checkAlertThresholds(metric);
  
  res.status(201).json({ received: true, id: metric.id });
});

// STEP 5: Batch metrics ingestion
app.post('/metrics/batch', (req: Request, res: Response) => {
  // STEP 6: Process multiple metrics at once
  const { metrics: batchMetrics } = req.body;
  
  if (!Array.isArray(batchMetrics)) {
    return res.status(400).json({ error: 'metrics must be an array' });
  }
  
  const processed = batchMetrics.map(m => ({
    id: uuidv4(),
    timestamp: new Date(),
    ...m
  }));
  
  metrics.push(...processed);
  
  res.status(201).json({
    received: processed.length,
    ids: processed.map(m => m.id)
  });
});

// STEP 7: Dashboard data endpoint
app.get('/dashboard/:projectId', (req: Request, res: Response) => {
  // STEP 8: Aggregate metrics for dashboard view
  const projectId = req.params.projectId;
  const projectMetrics = metrics.filter(m => m.tags?.projectId === projectId);
  
  if (projectMetrics.length === 0) {
    return res.status(404).json({ error: 'No metrics found for project' });
  }
  
  // STEP 9: Calculate overview statistics
  const overview = {
    totalFiles: getLatestMetric(projectMetrics, 'files.total'),
    translatedFiles: getLatestMetric(projectMetrics, 'files.translated'),
    testCoverage: getLatestMetric(projectMetrics, 'test.coverage'),
    averageRiskScore: calculateAverage(projectMetrics, 'risk.score')
  };
  
  // STEP 10: Generate trend data
  const trends = [
    generateTrend(projectMetrics, 'translation.speed'),
    generateTrend(projectMetrics, 'test.coverage'),
    generateTrend(projectMetrics, 'risk.score')
  ];
  
  // STEP 11: Get active alerts
  const projectAlerts = alerts.filter(a => a.projectId === projectId && a.status === 'active');
  
  const dashboard = {
    projectId,
    overview,
    trends,
    alerts: projectAlerts,
    generatedAt: new Date()
  };
  
  dashboards.set(projectId, dashboard);
  res.json(dashboard);
});

// STEP 12: Trends endpoint
app.get('/trends', (req: Request, res: Response) => {
  // STEP 13: Get historical trend analysis
  const { metric, timeRange, projectId } = req.query;
  
  let filtered = metrics;
  
  if (projectId) {
    filtered = filtered.filter(m => m.tags?.projectId === projectId);
  }
  
  if (metric) {
    filtered = filtered.filter(m => m.name === metric);
  }
  
  if (timeRange) {
    const now = new Date();
    const rangeMs = parseTimeRange(timeRange as string);
    const startTime = new Date(now.getTime() - rangeMs);
    filtered = filtered.filter(m => new Date(m.timestamp) >= startTime);
  }
  
  // STEP 14: Group by time buckets and aggregate
  const trend = generateTrend(filtered, metric as string);
  
  res.json(trend);
});

// STEP 15: Alert configuration endpoint
app.post('/alerts', (req: Request, res: Response) => {
  // STEP 16: Create new alert rule
  const alert = {
    id: uuidv4(),
    ...req.body,
    status: 'active',
    createdAt: new Date()
  };
  
  alerts.push(alert);
  
  res.status(201).json(alert);
});

app.get('/alerts/:projectId', (req: Request, res: Response) => {
  // STEP 17: Get alerts for project
  const projectAlerts = alerts.filter(a => a.projectId === req.params.projectId);
  res.json(projectAlerts);
});

// STEP 18: Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    metricsCount: metrics.length,
    alertsCount: alerts.length,
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// STEP 19: Helper functions
function getLatestMetric(metrics: any[], name: string): number {
  const matching = metrics.filter(m => m.name === name);
  if (matching.length === 0) return 0;
  
  matching.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return matching[0].value;
}

function calculateAverage(metrics: any[], name: string): number {
  const matching = metrics.filter(m => m.name === name);
  if (matching.length === 0) return 0;
  
  const sum = matching.reduce((acc, m) => acc + m.value, 0);
  return sum / matching.length;
}

function generateTrend(metrics: any[], name: string): any {
  const matching = metrics.filter(m => m.name === name);
  
  // Group by hour
  const hourly = new Map();
  matching.forEach(m => {
    const hour = new Date(m.timestamp).setMinutes(0, 0, 0);
    if (!hourly.has(hour)) {
      hourly.set(hour, []);
    }
    hourly.get(hour).push(m.value);
  });
  
  const dataPoints = Array.from(hourly.entries()).map(([timestamp, values]) => ({
    timestamp: new Date(timestamp),
    value: values.reduce((a: number, b: number) => a + b, 0) / values.length
  }));
  
  return {
    metric: name,
    dataPoints: dataPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  };
}

function checkAlertThresholds(metric: any): void {
  // STEP 20: Check if metric triggers any alert rules
  const activeAlerts = alerts.filter(a => a.status === 'active' && a.metric === metric.name);
  
  activeAlerts.forEach(alert => {
    let triggered = false;
    
    switch (alert.condition) {
      case 'greater_than':
        triggered = metric.value > alert.threshold;
        break;
      case 'less_than':
        triggered = metric.value < alert.threshold;
        break;
      case 'equals':
        triggered = metric.value === alert.threshold;
        break;
    }
    
    if (triggered) {
      console.log(`[Alert Triggered] ${alert.name}: ${metric.name} = ${metric.value}`);
      // In production, send notification
    }
  });
}

function parseTimeRange(range: string): number {
  // Convert time range string to milliseconds
  const units: Record<string, number> = {
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000
  };
  
  const match = range.match(/^(\d+)([hdw])$/);
  if (!match) return 24 * 60 * 60 * 1000; // Default to 24 hours
  
  const [, value, unit] = match;
  return parseInt(value) * units[unit];
}

// STEP 21: Error handling
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('[Analytics Server Error]', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// STEP 22: Start server
app.listen(PORT, () => {
  console.log(`Analytics MCP Server running on port ${PORT}`);
});

export default app;
