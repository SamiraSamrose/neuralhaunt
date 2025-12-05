# CRM MCP Server

## Purpose
Provides Model Context Protocol endpoints for integrating legacy code modernization with Customer Relationship Management systems.

## Endpoints

### Requirements
- GET /requirements/:id - Retrieve requirement details
- POST /requirements - Create new requirement

### Traceability
- POST /traceability - Create code-to-requirement link
- GET /traceability/module/:moduleId - Get links for module

### Stakeholders
- GET /stakeholders/:projectId - List project stakeholders
- POST /stakeholders/:projectId - Add stakeholder to project

### Notifications
- POST /notifications - Send notification to stakeholders

### Health
- GET /health - Server health check

## Configuration

### Environment Variables
```
CRM_SERVER_PORT=3001
DATABASE_URL=postgresql://localhost/neuralhaunt
LOG_LEVEL=info


#Usage Example

// Create requirement
const requirement = await fetch('http://localhost:3001/requirements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Modernize COBOL payroll module',
    description: 'Convert COBOL payroll calculation to Python',
    acceptanceCriteria: [
      'All salary calculations produce identical results',
      'Tax computations match legacy system',
      'Performance within 10% of original'
    ],
    priority: 'high'
  })
});

// Create traceability link
const link = await fetch('http://localhost:3001/traceability', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requirementId: requirement.id,
    moduleId: 'payroll-calc',
    sourceFile: 'PAYROLL.COB',
    translatedFile: 'payroll.py',
    confidence: 0.95,
    reviewStatus: 'pending'
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
```

