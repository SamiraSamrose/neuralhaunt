enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private logs: Array<{ level: string; message: string; timestamp: Date; metadata?: any }> = [];

  setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    const levels = { debug: LogLevel.DEBUG, info: LogLevel.INFO, warn: LogLevel.WARN, error: LogLevel.ERROR };
    this.level = levels[level];
  }

  debug(message: string, metadata?: any): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: any): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: any): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, metadata?: any): void {
    this.log(LogLevel.ERROR, message, metadata);
  }

  private log(level: LogLevel, message: string, metadata?: any): void {
    if (level < this.level) return;

    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const levelName = levelNames[level];
    const timestamp = new Date();

    const logEntry = {
      level: levelName,
      message,
      timestamp,
      metadata
    };

    this.logs.push(logEntry);

    const formattedMessage = `[${timestamp.toISOString()}] [${levelName}] ${message}`;
    
    if (metadata) {
      console.log(formattedMessage, metadata);
    } else {
      console.log(formattedMessage);
    }
  }

  getLogs(level?: string): any[] {
    if (!level) return this.logs;
    return this.logs.filter(log => log.level === level.toUpperCase());
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger();