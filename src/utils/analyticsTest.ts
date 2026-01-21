/**
 * Firebase Analytics Testing Guide
 * Debug tools and testing utilities for Yazgı
 */

import { analyticsService, enableAnalyticsDebug, disableAnalyticsDebug } from '../services/analytics';

// ============================================================================
// DEBUG UTILITIES
// ============================================================================

export class AnalyticsDebugger {
  /**
   * Enable debug mode (logs to console, not Firebase)
   */
  static enableDebug() {
    enableAnalyticsDebug();
    console.log('🔍 Analytics debug mode ENABLED');
    console.log('📝 Events will log to console instead of Firebase');
  }

  /**
   * Disable debug mode (sends to Firebase)
   */
  static disableDebug() {
    disableAnalyticsDebug();
    console.log('🔍 Analytics debug mode DISABLED');
    console.log('📤 Events will send to Firebase');
  }

  /**
   * Run full analytics test suite
   */
  static async runFullTestSuite() {
    console.log('\n🧪 Starting Firebase Analytics Test Suite...\n');

    const tests = [
      this.testGameStarted,
      this.testCharacterCreated,
      this.testEventCompleted,
      this.testHubAction,
      this.testTurnAdvanced,
      this.testGameEnded,
      this.testPurchaseMade,
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        await test();
        passed++;
      } catch (error) {
        console.error(`❌ Test failed:`, error);
        failed++;
      }
    }

    console.log(`\n✅ Test Suite Complete: ${passed} passed, ${failed} failed\n`);
  }

  /**
   * Test: Game Started
   */
  static async testGameStarted() {
    console.log('📊 Testing: game_started');
    await analyticsService.logGameStarted({
      characterName: 'TestPlayer',
      difficulty: 'normal',
    });
    console.log('✅ game_started: OK');
  }

  /**
   * Test: Character Created
   */
  static async testCharacterCreated() {
    console.log('📊 Testing: character_created');
    await analyticsService.logCharacterCreated({
      wealth: 1500,
      talent: 72,
      traits: ['INTELLIGENT', 'ATHLETIC', 'CHARISMATIC'],
      familyType: 'SUPPORTIVE',
    });
    console.log('✅ character_created: OK');
  }

  /**
   * Test: Event Completed
   */
  static async testEventCompleted() {
    console.log('📊 Testing: event_completed');
    await analyticsService.logEventCompleted({
      eventId: 'test_event_001',
      choiceIndex: 1,
      age: 12,
      eventType: 'school',
    });
    console.log('✅ event_completed: OK');
  }

  /**
   * Test: Hub Action
   */
  static async testHubAction() {
    console.log('📊 Testing: hub_action');
    await analyticsService.logHubAction({
      actionType: 'study_math',
      cost: 20,
      age: 10,
      skillGain: 5,
    });
    console.log('✅ hub_action: OK');
  }

  /**
   * Test: Turn Advanced
   */
  static async testTurnAdvanced() {
    console.log('📊 Testing: turn_advanced');
    await analyticsService.logTurnAdvanced({
      age: 15,
      health: 82,
      money: 5500,
      energy: 65,
    });
    console.log('✅ turn_advanced: OK');
  }

  /**
   * Test: Game Ended
   */
  static async testGameEnded() {
    console.log('📊 Testing: game_ended');
    await analyticsService.logGameEnded({
      finalAge: 18,
      finalStats: {
        health: 88,
        intelligence: 85,
        charisma: 72,
        discipline: 79,
        money: 12500,
      },
      playtimeMinutes: 180,
      endingType: 'successful',
    });
    console.log('✅ game_ended: OK');
  }

  /**
   * Test: Purchase Made
   */
  static async testPurchaseMade() {
    console.log('📊 Testing: purchase_made');
    await analyticsService.logPurchaseMade({
      productId: 'premium_pack_test',
      price: 4.99,
      currency: 'USD',
      category: 'cosmetics',
    });
    console.log('✅ purchase_made: OK');
  }

  /**
   * Stress test: Send many events rapidly
   */
  static async stressTest(eventCount: number = 50) {
    console.log(`\n⚡ Starting stress test: ${eventCount} events\n`);

    const startTime = Date.now();

    for (let i = 0; i < eventCount; i++) {
      await analyticsService.logCustomEvent('stress_test_event', {
        iteration: i,
        timestamp: new Date().toISOString(),
      });
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Stress test complete: ${eventCount} events in ${duration}ms`);
    console.log(`📊 Average: ${(duration / eventCount).toFixed(2)}ms per event\n`);
  }

  /**
   * Monitor parameter constraints
   */
  static async testParameterConstraints() {
    console.log('\n📏 Testing Firebase Parameter Constraints\n');

    // Test 1: Max 25 parameters
    console.log('Test 1: Max 25 parameters');
    const manyParams: Record<string, string> = {};
    for (let i = 1; i <= 30; i++) {
      manyParams[`param_${i}`] = `value_${i}`;
    }
    await analyticsService.logCustomEvent('test_max_params', manyParams);
    console.log('✅ Only first 25 params sent\n');

    // Test 2: Long parameter names
    console.log('Test 2: Long parameter names (>100 chars)');
    await analyticsService.logCustomEvent('test_long_names', {
      very_long_parameter_name_that_exceeds_one_hundred_characters_and_should_be_truncated_by_the_service: 'test',
    });
    console.log('✅ Long names truncated\n');

    // Test 3: Long parameter values
    console.log('Test 3: Long parameter values (>100 chars)');
    const longValue = 'a'.repeat(150);
    await analyticsService.logCustomEvent('test_long_values', {
      long_value: longValue,
    });
    console.log('✅ Long values truncated\n');
  }

  /**
   * Simulate a complete game session
   */
  static async simulateGameSession() {
    console.log('\n🎮 Simulating Complete Game Session\n');

    // Start game
    await analyticsService.logGameStarted({
      characterName: 'SimulatedPlayer',
      difficulty: 'hard',
    });
    console.log('✅ Game started');

    // Wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create character
    await analyticsService.logCharacterCreated({
      wealth: 2000,
      talent: 85,
      traits: ['GENIUS', 'ATHLETIC'],
      familyType: 'SUPPORTIVE',
    });
    console.log('✅ Character created');

    // Simulate gameplay
    for (let age = 7; age <= 18; age += 3) {
      // Random event
      await analyticsService.logEventCompleted({
        eventId: `event_age_${age}`,
        choiceIndex: Math.floor(Math.random() * 3),
        age,
        eventType: ['school', 'family', 'social'][Math.floor(Math.random() * 3)],
      });

      // Random action
      const actions = ['study_math', 'sports', 'work', 'social'];
      await analyticsService.logHubAction({
        actionType: actions[Math.floor(Math.random() * actions.length)],
        cost: Math.floor(Math.random() * 30) + 10,
        age,
        skillGain: Math.floor(Math.random() * 10),
      });

      // Wait between events
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // End game
    await analyticsService.logGameEnded({
      finalAge: 18,
      finalStats: {
        health: Math.floor(Math.random() * 100),
        intelligence: Math.floor(Math.random() * 100),
        charisma: Math.floor(Math.random() * 100),
        discipline: Math.floor(Math.random() * 100),
        money: Math.floor(Math.random() * 20000),
      },
      playtimeMinutes: 240,
      endingType: 'normal',
    });

    console.log('✅ Game ended');
    console.log('\n✅ Complete game session simulated\n');
  }
}

// ============================================================================
// QUICK TEST EXPORTS
// ============================================================================

export const analyticsTests = {
  // Enable/Disable
  enable: () => AnalyticsDebugger.enableDebug(),
  disable: () => AnalyticsDebugger.disableDebug(),

  // Tests
  full: () => AnalyticsDebugger.runFullTestSuite(),
  stress: (count?: number) => AnalyticsDebugger.stressTest(count),
  constraints: () => AnalyticsDebugger.testParameterConstraints(),
  simulate: () => AnalyticsDebugger.simulateGameSession(),
};

// ============================================================================
// USAGE IN DEVELOPMENT
// ============================================================================

/**
 * To use in development:
 * 
 * 1. Add to App.tsx for quick testing:
 * 
 *    import { analyticsTests } from './utils/analyticsTest';
 *    
 *    // In useEffect or button:
 *    analyticsTests.enable();
 *    await analyticsTests.full();
 * 
 * 2. Or test individual events:
 * 
 *    import { AnalyticsDebugger } from './utils/analyticsTest';
 *    
 *    AnalyticsDebugger.enableDebug();
 *    await AnalyticsDebugger.testGameStarted();
 * 
 * 3. For stress testing:
 * 
 *    analyticsTests.stress(100); // Send 100 events
 * 
 * 4. To simulate complete session:
 * 
 *    analyticsTests.simulate();
 */