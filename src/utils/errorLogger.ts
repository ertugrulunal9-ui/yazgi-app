// Simple console-based error logger for production.
// Errors are kept in localStorage for capped, local-only diagnostics.

import { calculateChecksum } from './checksum';

interface ErrorLog {
  message: string;
  stack?: string;
  context?: string;
  timestamp: string;
  userId?: string;
}

const ERROR_LOGS_KEY = '@yazgi/error_logs';
const MAX_LOGS = 50;
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
const SENSITIVE_CONTEXT_KEY_PATTERN =
  /(password|passcode|secret|token|authorization|cookie|session|api[_-]?key|private[_-]?key|email|phone|userid|user_id|playername|charactername)/i;
const JWT_LIKE_PATTERN = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

class ErrorLogger {
  private userId: string = '';

  private anonymizeUserId(userId: string): string {
    const normalized = userId.trim();
    if (!normalized) return '';
    return `u_${calculateChecksum(normalized).slice(0, 10)}`;
  }

  private serializeContext(context?: unknown): string | undefined {
    if (typeof context === 'string') return context.slice(0, 1024);
    if (context === undefined) return undefined;
    try {
      const redacted = JSON.stringify(
        context,
        (key, value) => {
          if (SENSITIVE_CONTEXT_KEY_PATTERN.test(key)) {
            return '[redacted]';
          }
          if (typeof value === 'string') {
            if (JWT_LIKE_PATTERN.test(value)) {
              return '[redacted_token]';
            }
            if (value.length > 2048) {
              return `${value.slice(0, 256)}...[truncated]`;
            }
          }
          return value;
        }
      );
      return redacted.slice(0, 1024);
    } catch {
      return '[unserializable_context]';
    }
  }

  private sanitizeStack(stack?: string): string | undefined {
    if (typeof stack !== 'string' || stack.trim().length === 0) return undefined;
    const topFrames = stack.split('\n').slice(0, 8).join('\n');
    return topFrames.slice(0, 2048);
  }

  setUserId(userId: string): void {
    this.userId = this.anonymizeUserId(userId);
    if (isDev) {
      console.log(`User ID set: ${this.userId}`);
    }
  }

  logError(error: Error, context?: unknown): void {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: this.sanitizeStack(error.stack),
      context: this.serializeContext(context),
      timestamp: new Date().toISOString(),
      userId: this.userId,
    };

    console.error('ERROR:', errorLog);
    this.saveToStorage(errorLog);
  }

  logNonFatal(error: Error, context?: string): void {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: this.sanitizeStack(error.stack),
      context: context?.slice(0, 1024),
      timestamp: new Date().toISOString(),
      userId: this.userId,
    };

    console.warn('NON-FATAL:', errorLog);
    this.saveToStorage(errorLog);
  }

  logMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    console.log(`${level.toUpperCase()}: ${message}`);
  }

  private saveToStorage(errorLog: ErrorLog): void {
    try {
      if (typeof localStorage === 'undefined') return;

      const logs = this.getLogs();
      logs.push(errorLog);

      // Keep only last MAX_LOGS
      const trimmedLogs = logs.slice(-MAX_LOGS);
      localStorage.setItem(ERROR_LOGS_KEY, JSON.stringify(trimmedLogs));
    } catch (e) {
      console.error('Failed to save error log:', e);
    }
  }

  getLogs(): ErrorLog[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const logs = localStorage.getItem(ERROR_LOGS_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (e) {
      console.error('Failed to retrieve error logs:', e);
      return [];
    }
  }

  clearLogs(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem(ERROR_LOGS_KEY);
      console.log('Error logs cleared');
    } catch (e) {
      console.error('Failed to clear logs:', e);
    }
  }

  // View logs in console
  viewLogs(): void {
    const logs = this.getLogs();
    console.group('Error Logs');
    logs.forEach((log, index) => {
      console.log(`\n--- Log ${index + 1} ---`);
      console.log('Time:', log.timestamp);
      console.log('User:', log.userId || 'Unknown');
      console.log('Message:', log.message);
      console.log('Context:', log.context);
      if (log.stack) console.log('Stack:', log.stack);
    });
    console.groupEnd();
  }
}

export const errorLogger = new ErrorLogger();

// Expose to window for debugging only.
if (typeof window !== 'undefined' && isDev) {
  (window as any).errorLogger = errorLogger;
}
