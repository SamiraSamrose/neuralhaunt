import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.CRM_SERVER_PORT || 3001;

// STEP 1: Middleware setup
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[CRM Server] ${req.method} ${req.path}`);
  next();
});

// Mock database (in production, use real database)
const requirements = new Map();
const traceabilityLinks = new Map();
const stakeholders = new Map();

// STEP 2: Requirements endpoints
app.get('/requirements/:id', (req: Request, res: Response) => {
  // STEP 3: Fetch requirement by ID
  const requirement = requirements.get(req.params.id);
  
  if (!requirement) {
    return res.status(404).json({ error: 'Requirement not found' });
  }
  
  res.json(requirement);
});

app.post('/requirements', (req: Request, res: Response) => {
// STEP 4: Create new requirement
const id = uuidv4();
const requirement = {
id,
...req.body,
createdAt: new Date(),
updatedAt: new Date()
};
requirements.set(id, requirement);
res.status(201).json(requirement);
});
// STEP 5: Traceability endpoints
app.post('/traceability', (req: Request, res: Response) => {
// STEP 6: Create code-to-requirement link
const id = uuidv4();
const link = {
id,
...req.body,
createdAt: new Date()
};
traceabilityLinks.set(id, link);
res.status(201).json(link);
});
app.get('/traceability/module/:moduleId', (req: Request, res: Response) => {
// STEP 7: Get all traceability links for a module
const moduleLinks = Array.from(traceabilityLinks.values())
.filter(link => link.moduleId === req.params.moduleId);
res.json(moduleLinks);
});
// STEP 8: Stakeholder endpoints
app.get('/stakeholders/:projectId', (req: Request, res: Response) => {
// STEP 9: Get stakeholders for project
const projectStakeholders = stakeholders.get(req.params.projectId) || [];
res.json(projectStakeholders);
});
app.post('/stakeholders/:projectId', (req: Request, res: Response) => {
// STEP 10: Add stakeholder to project
const projectId = req.params.projectId;
const currentStakeholders = stakeholders.get(projectId) || [];
const newStakeholder = {
id: uuidv4(),
...req.body,
addedAt: new Date()
};
currentStakeholders.push(newStakeholder);
stakeholders.set(projectId, currentStakeholders);
res.status(201).json(newStakeholder);
});
// STEP 11: Notification endpoints
app.post('/notifications', (req: Request, res: Response) => {
// STEP 12: Send notification to stakeholders
const { projectId, message, severity, recipients } = req.body;
// In production, this would trigger email/Slack notifications
console.log([CRM Notification] Project: ${projectId}, Severity: ${severity});
console.log(Recipients: ${recipients.join(', ')});
console.log(Message: ${message});
res.status(200).json({
sent: true,
timestamp: new Date(),
recipients: recipients.length
});
});
// STEP 13: Health check endpoint
app.get('/health', (req: Request, res: Response) => {
res.json({
status: 'healthy',
timestamp: new Date(),
uptime: process.uptime()
});
});
// STEP 14: Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
console.error('[CRM Server Error]', err);
res.status(500).json({
error: 'Internal server error',
message: err.message
});
});
// STEP 15: Start server
app.listen(PORT, () => {
console.log(CRM MCP Server running on port ${PORT});
});
export default app;
