# Communication Principles

## Progress Reporting
- Update frequency: every 100 files or 5 minutes
- Metrics included: files processed, tests generated, risks identified
- Format: structured JSON for programmatic consumption, formatted text for humans

## Error Communication
- Severity classification: critical, error, warning, info
- Required context: file, line number, legacy pattern, attempted translation
- Suggested actions: manual review, configuration change, skip and continue

## Inter-Agent Messages
- Protocol: JSON-RPC over message queue
- Message types: request, response, notification, error
- Timeout handling: 30 seconds with retry logic
- Dead letter queue for failed messages

## User Notifications
- Channel selection based on severity and user preference
- Batch low-priority notifications to avoid alert fatigue
- Rich context links to detailed views
- Clear action buttons for common responses