import { crashReportingService } from '../services/crashReporting';

export const setupGlobalErrorHandlers = () => {
  const originalErrorHandler = console.error;

  console.error = (...args: any[]) => {
    originalErrorHandler(...args);

    if (args[0] instanceof Error) {
      crashReportingService.logNonFatal(args[0], 'Uncaught console.error');
    }
  };

  // process.on sadece Node.js'de çalışır, web için window.addEventListener kullan
  if (typeof process !== 'undefined' && process.on) {
    process.on('unhandledRejection', (reason: any) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      crashReportingService.logNonFatal(error, 'Unhandled Promise Rejection');
    });
  } else if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      crashReportingService.logNonFatal(error, 'Unhandled Promise Rejection');
    });
  }

  const globalObj = global as any;
  if (globalObj.ErrorUtils) {
    const originalHandler = globalObj.ErrorUtils.setGlobalHandler;

    globalObj.ErrorUtils.setGlobalHandler((error: Error) => {
      crashReportingService.logError(error, {
        action: 'Global error handler',
      });

      if (originalHandler) {
        originalHandler(error);
      }
    });
  }
};

export const setupGameCrashTracking = () => {
  const originalSetTimeout = global.setTimeout;

  global.setTimeout = ((callback: any, ms?: number) => {
    return originalSetTimeout(() => {
      try {
        callback();
      } catch (error) {
        crashReportingService.logError(
          error instanceof Error ? error : new Error(String(error)),
          { action: 'Timeout callback error' }
        );
        throw error;
      }
    }, ms);
  }) as any;
};
