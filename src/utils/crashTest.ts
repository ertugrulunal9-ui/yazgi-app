import { crashReportingService } from '../services/crashReporting';

export class CrashTestingUtils {
  static async testUncaughtError() {
    console.log('🧪 Testing: Uncaught Error');
    await crashReportingService.logError(
      new Error('Test uncaught error'),
      { action: 'test_uncaught_error' }
    );
  }

  static async testNonFatalError() {
    console.log('🧪 Testing: Non-fatal Error');
    await crashReportingService.logNonFatal(
      new Error('Test non-fatal error'),
      'Testing non-fatal reporting'
    );
  }

  static async testWithGameContext() {
    console.log('🧪 Testing: Error with game context');
    await crashReportingService.logError(new Error('Game context error'), {
      userId: 'test-user-123',
      gameAge: 15,
      wealth: 5000,
      stats: {
        health: 85,
        intelligence: 90,
        charisma: 70,
      },
      action: 'study_math',
      eventId: 'test_event_001',
      phase: 'HUB',
    });
  }

  static async testCustomAttributes() {
    console.log('🧪 Testing: Custom attributes');
    await crashReportingService.setUserId('test-player-123');
    await crashReportingService.setAttribute('app_version', '1.0.0');
    await crashReportingService.setAttribute('platform', 'android');
    await crashReportingService.setAttribute('device_memory_mb', 2048);
  }

  static async testLogMessages() {
    console.log('🧪 Testing: Log messages');
    await crashReportingService.logMessage('Game started', 'info');
    await crashReportingService.logMessage('Low memory warning', 'warning');
    await crashReportingService.logMessage('Failed to save game', 'error');
  }

  static throwTestError() {
    console.log('🧪 Throwing test error (will trigger ErrorBoundary)');
    throw new Error('Test error for ErrorBoundary');
  }

  static throwTestAsyncError() {
    console.log('🧪 Throwing async test error');
    Promise.reject(new Error('Test async error'));
  }

  static async runAllTests() {
    console.log('\n🧪 Running Crashlytics Test Suite\n');

    try {
      await this.testUncaughtError();
      await new Promise(r => setTimeout(r, 500));

      await this.testNonFatalError();
      await new Promise(r => setTimeout(r, 500));

      await this.testWithGameContext();
      await new Promise(r => setTimeout(r, 500));

      await this.testCustomAttributes();
      await new Promise(r => setTimeout(r, 500));

      await this.testLogMessages();

      console.log('\n✅ All tests completed\n');
    } catch (error) {
      console.error('Test suite error:', error);
    }
  }
}

export const enableCrashlyticsTesting = () => {
  crashReportingService.setEnabled(true);
  console.log('🚨 Crashlytics testing enabled');
};

export const disableCrashlyticsTesting = () => {
  crashReportingService.setEnabled(false);
  console.log('🚨 Crashlytics testing disabled');
};
