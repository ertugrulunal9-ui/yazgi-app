// Simple console-based error logger for production
// Errors are saved to localStorage and can be viewed in dev tools

interface ErrorLog {
  message: string;
  stack?: string;
  context?: string;
  timestamp: string;
  userId?: string;
}

const ERROR_LOGS_KEY = '@yazgi/error_logs';
const MAX_LOGS = 50;

class ErrorLogger {
  private userId: string = '';

  setUserId(userId: string): void {
    this.userId = userId;
    console.log(`👤 User ID set: ${userId}`);
  }

  logError(error: Error, context?: any): void {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      context: typeof context === 'string' ? context : JSON.stringify(context),
      timestamp: new Date().toISOString(),
      userId: this.userId
    };

    console.error('🔴 ERROR:', errorLog);
    this.saveToStorage(errorLog);
  }

  logNonFatal(error: Error, context?: string): void {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userId: this.userId
    };

    console.warn('⚠️ NON-FATAL:', errorLog);
    this.saveToStorage(errorLog);
  }

  logMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    const icon = level === 'error' ? '🔴' : level === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${icon} ${message}`);
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
      console.log('✅ Error logs cleared');
    } catch (e) {
      console.error('Failed to clear logs:', e);
    }
  }

  // View logs in console
  viewLogs(): void {
    const logs = this.getLogs();
    console.group('📋 Error Logs');
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

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).errorLogger = errorLogger;
}
