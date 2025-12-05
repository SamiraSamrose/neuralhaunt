# Technical Constraints

## Supported Source Languages
- COBOL (COBOL-85, COBOL-2002)
- Pascal (Turbo Pascal, Free Pascal)
- Visual Basic 6.0
- Fortran 77/90

## Target Languages
- Python 3.10+
- Java 17+
- TypeScript 5.0+
- Go 1.21+

## Performance Requirements
- Parse 10,000 LOC per minute
- Translate 5,000 LOC per minute per agent
- Generate 100 test cases per minute
- Risk analysis: 1,000 LOC per second

## Scalability Targets
- Horizontal scaling: up to 50 parallel agents
- Maximum codebase size: 5 million LOC
- Concurrent projects: 100+

## Data Retention
- Translation history: 2 years
- Test results: 1 year
- Risk assessments: permanent
- Dependency graphs: permanent

## Security Constraints
- No code uploaded to external services
- All processing on-premises or private cloud
- Encrypted storage for source code
- Audit logs for all translations