# NeuralHaunt: RAG-based Multi-Agent AI Ghostwriter for Legacy Code

Resurrection for dead codebases. NeuralHaunt brings COBOL, Pascal, VB6 legacy languages into the modern era using AI-powered multi-agent translation.

## Features

### Resurrection
Brings dead codebases (COBOL, Pascal, VB6, Fortran) into modern languages with AI assistance.

## Links
- **Video Demo**: https://youtu.be/sC2qq0rFHCE

### Frankenstein Architecture
- AI code translation with pattern matching
- Static analysis for dependency mapping
- Automated test generation
- Risk evaluation and scoring
- Cloud deployment pipeline

### Skeleton Crew
Base template provides a complete legacy-to-modern language pipeline with demos for:
- Banking application modernization
- Retro game engine updates

### Costume Contest Theme
Dark, haunted IDE theme with spectral "code spirits" showing deprecated patterns and modern equivalents.

## Multi-Agent System

### Agent 1: Legacy Parser
Extracts logic and dependencies from legacy code.
- Lexical analysis and tokenization
- AST generation
- Dependency graph creation
- Complexity analysis

### Agent2: Code Translator
Generates modern language equivalents.

- Pattern-based transformation
- Idiomatic target language generation
- Library mapping (legacy to modern)
- Type system adaptation

### Agent 3: Test Generator
Creates comprehensive test suites.

- Unit test generation
- Integration test creation
- Regression test development
- Coverage analysis (target: 80%+)

### Agent 4: Risk Evaluator
Scores deprecated patterns and potential bugs.

- Deprecated pattern detection
- Security vulnerability scanning
- Performance regression analysis
- Confidence scoring

## Technology Stack

- **Languages**: TypeScript, JavaScript, Python, COBOL, Pascal, Visual Basic 6, Fortran, HTML5
- **Frameworks**: Express.js, React, Tailwind CSS
- **Technologies**: Node.js, REST API, WebSockets, Server-Sent Events
- **Libraries**: Chart.js, UUID, CORS
- **Tools**: Jest, ESLint, TypeScript Compiler, ts-node
- **Services**: Message Queue (Redis), Vector Database (Pinecone), PostgreSQL
- **APIs**: RESTful HTTP endpoints, Model Context Protocol
- **Agents**: Legacy Parser Agent, Code Translator Agent, Test Generator Agent, Risk Evaluator Agent
- **Models**: Pattern matching algorithms, AST parsers, Cyclomatic complexity calculator
- **AI**: RAG (Retrieval-Augmented Generation) for code pattern retrieval, semantic search
- **Data Integrations**: CRM system integration, Analytics platform integration
- **Datasets**: Legacy code patterns, translation mappings, deprecated pattern database, security vulnerability signatures

Installation

# Clone repository
git clone https://github.com/samirasamrose/neuralhaunt.git
cd neuralhaunt

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with configuration

# Build project
npm run build

Usage
Start All Services
# Terminal 1: Start main application
npm run dev

# Terminal 2: Start CRM MCP Server
npm run mcp:crm

# Terminal 3: Start Analytics MCP Server
npm run mcp:analytics

Translate Legacy Code
import { LegacyParserAgent } from './src/agents/legacy-parser-agent';
import { AgentOrchestrator } from './src/lib/agent-framework';

const orchestrator = new AgentOrchestrator();
// Register all agents...

// Submit translation request
await parserAgent.handleMessage({
  id: 'msg-1',
  from: 'user',
  to: 'legacy-parser',
  type: 'request',
  payload: {
    sourceFile: 'payroll.cob',
    sourceCode: cobolCode,
    language: 'COBOL'
  },
  timestamp: new Date()
});
```

MCP Servers
CRM Integration Server
Port: 3001

Requirements management
Traceability linking
Stakeholder communication

Analytics Server
Port: 3002

Metrics collection
Dashboard data aggregation
Trend analysis
Alert management

Metrics and Monitoring
Translation Metrics

Lines of code processed per hour
Translation accuracy rate
Time per module

Quality Metrics

Test coverage percentage
Regression test pass rate
Risk score distribution

Business Metrics

Projects completed
Technical debt reduced
Cost savings realized

Configuration
Environment Variables
# Database
DATABASE_URL=postgresql://localhost/neuralhaunt

# Redis
REDIS_URL=redis://localhost:6379

# MCP Servers
CRM_SERVER_PORT=3001
ANALYTICS_SERVER_PORT=3002

# RAG
RAG_API_KEY=your_pinecone_api_key
RAG_INDEX_NAME=neuralhaunt-code-patterns

# Logging
LOG_LEVEL=info

Development
# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
npm start
```

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Add tests
5. Submit a pull request

## License

MIT License - See LICENSE file for details



