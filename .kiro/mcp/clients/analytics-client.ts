export interface Metric {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface Dashboard {
  projectId: string;
  overview: {
    totalFiles: number;
    translatedFiles: number;
    testCoverage: number;
    averageRiskScore: number;
  };
  trends: Array<{
    metric: string;
    dataPoints: Array<{
      timestamp: Date;
      value: number;
    }>;
  }>;
  alerts: any[];
}

export class AnalyticsClient {
  private baseUrl: string;
  private metricsBuffer: Metric[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  
  constructor(baseUrl: string = 'http://localhost:3002') {
    this.baseUrl = baseUrl;
    this.startAutoFlush();
  }
  
  // STEP 1: Metrics methods
  async sendMetric(metric: Metric): Promise<void> {
    const response = await fetch(`${this.baseUrl}/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send metric: ${response.statusText}`);
    }
  }
  
  // STEP 2: Buffered metrics for batch sending
  bufferMetric(metric: Metric): void {
    this.metricsBuffer.push(metric);
    
    // Auto-flush if buffer gets large
    if (this.metricsBuffer.length >= 100) {
      this.flush();
    }
  }
  
  async flush(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;
    
    const batch = [...this.metricsBuffer];
    this.metricsBuffer = [];
    
    const response = await fetch(`${this.baseUrl}/metrics/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics: batch })
    });
    
    if (!response.ok) {
      // Re-add to buffer on failure
      this.metricsBuffer.push(...batch);
      throw new Error(`Failed to send batch metrics: ${response.statusText}`);
    }
  }
  // STEP 3: Auto-flush every 5 seconds
private startAutoFlush(): void {
this.flushInterval = setInterval(() => {
this.flush().catch(err => console.error('Auto-flush failed:', err));
}, 5000);
}
// STEP 4: Dashboard methods
async getDashboard(projectId: string): Promise<Dashboard> {
const response = await fetch(${this.baseUrl}/dashboard/${projectId});
if (!response.ok) {
throw new Error(Failed to fetch dashboard: ${response.statusText});
}
return response.json();
}
// STEP 5: Trends methods
async getTrends(options: {
metric?: string;
timeRange?: string;
projectId?: string;
}): Promise<any> {
const params = new URLSearchParams();
if (options.metric) params.set('metric', options.metric);
if (options.timeRange) params.set('timeRange', options.timeRange);
if (options.projectId) params.set('projectId', options.projectId);
const response = await fetch(`${this.baseUrl}/trends?${params}`);
if (!response.ok) {
  throw new Error(`Failed to fetch trends: ${response.statusText}`);
}
return response.json();
}
// STEP 6: Alert methods
async createAlert(alert: {
name: string;
metric: string;
condition: 'greater_than' | 'less_than' | 'equals';
threshold: number;
projectId: string;
}): Promise<any> {
const response = await fetch(${this.baseUrl}/alerts, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(alert)
});
if (!response.ok) {
  throw new Error(`Failed to create alert: ${response.statusText}`);
}

return response.json();
}
async getAlerts(projectId: string): Promise<any[]> {
const response = await fetch(${this.baseUrl}/alerts/${projectId});
if (!response.ok) {
throw new Error(Failed to fetch alerts: ${response.statusText});
}
return response.json();
}
// STEP 7: Cleanup
destroy(): void {
if (this.flushInterval) {
clearInterval(this.flushInterval);
}
this.flush().catch(err => console.error('Final flush failed:', err));
}
}