# Escalation Rules

## Automatic Human Review Triggers

### Critical Risk Patterns
- Database transaction boundaries altered
- Financial calculation logic modified
- Security-sensitive code paths changed
- Multi-threading introduced where single-threaded before

### Translation Uncertainty
- Confidence score below 70%
- Ambiguous legacy patterns without clear modern equivalent
- Missing dependency resolution
- Platform-specific API usage without cross-platform alternative

### Test Failures
- Any regression test failure
- Coverage below 80%
- Performance degradation over 20%
- Memory usage increase over 50%

## Escalation Workflow
1. Agent flags issue with context
2. Risk evaluator assesses severity
3. Notification sent to reviewer queue
4. Translation paused until resolution
5. Manual override or correction applied
6. Re-validation triggered

## Review SLAs
- Critical: 2 hours
- High: 24 hours
- Medium: 3 days
- Low: 1 week