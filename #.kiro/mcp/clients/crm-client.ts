export interface Requirement {
  id?: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  stakeholders: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface TraceabilityLink {
  id?: string;
  requirementId: string;
  moduleId: string;
  sourceFile: string;
  translatedFile: string;
  confidence?: number;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
}

export class CRMClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }
  
  // STEP 1: Requirement methods
  async getRequirement(id: string): Promise<Requirement> {
    const response = await fetch(`${this.baseUrl}/requirements/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch requirement: ${response.statusText}`);
    }
    return response.json();
  }
  
  async createRequirement(requirement: Requirement): Promise<Requirement> {
    const response = await fetch(`${this.baseUrl}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requirement)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create requirement: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // STEP 2: Traceability methods
  async createTraceabilityLink(link: TraceabilityLink): Promise<TraceabilityLink> {
    const response = await fetch(`${this.baseUrl}/traceability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(link)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create traceability link: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async getModuleTraceability(moduleId: string): Promise<TraceabilityLink[]> {
    const response = await fetch(`${this.baseUrl}/traceability/module/${moduleId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch traceability: ${response.statusText}`);
    }
    return response.json();
  }
  
  // STEP 3: Stakeholder methods
  async getStakeholders(projectId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/stakeholders/${projectId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stakeholders: ${response.statusText}`);
    }
    return response.json();
  }
  
  async addStakeholder(projectId: string, stakeholder: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/stakeholders/${projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stakeholder)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add stakeholder: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // STEP 4: Notification methods
  async sendNotification(notification: {
    projectId: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    recipients: string[];
  }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send notification: ${response.statusText}`);
    }
  }
}
