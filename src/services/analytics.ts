import type {
  AgePacingBucket,
  CohortEventRarity,
  EnergyCostBucket,
  RetentionCheckpoint,
} from '../utils/progressionAnalytics';
import { devLog } from '../utils/devLogger';

const isDev = __DEV__;
const isWeb = typeof window !== 'undefined' && typeof navigator !== 'undefined';

type FirebaseAnalyticsModule = {
  logEvent: (name: string, params?: Record<string, unknown>) => Promise<void>;
  setUserId: (id: string | null) => Promise<void>;
  setUserProperty: (name: string, value: string) => Promise<void>;
  setAnalyticsCollectionEnabled: (enabled: boolean) => Promise<void>;
  resetAnalyticsData: () => Promise<void>;
};

type FirebaseAnalyticsFactory = () => FirebaseAnalyticsModule;

/**
 * Yazgi Game Analytics Service
 * Type-safe event tracking for Firebase Analytics
 */

// Event parameter types
export interface GameStartedParams {
  characterName: string;
  difficulty?: 'easy' | 'normal' | 'hard';
}

export interface CharacterCreatedParams {
  wealth: number;
  talent: number;
  traits: string[];
  familyType: string;
}

export interface EventCompletedParams {
  eventId: string;
  choiceIndex: number;
  age: number;
  eventType?: string;
}

export interface HubActionParams {
  actionType: string;
  cost: number;
  age: number;
  skillGain?: number;
}

export interface TurnAdvancedParams {
  age: number;
  health: number;
  money: number;
  energy: number;
}

export interface GameEndedParams {
  finalAge: number;
  finalStats: {
    health: number;
    intelligence: number;
    charisma: number;
    discipline: number;
    money: number;
  };
  playtimeMinutes: number;
  endingType?: string;
}

export interface PurchaseMadeParams {
  productId: string;
  price: number;
  currency?: string;
  category?: string;
}

export interface ProgressionEconomyParams {
  source: 'event_choice' | 'hub_action' | 'turn_progress' | 'session_start' | 'session_end';
  eventId?: string;
  eventRarity: CohortEventRarity;
  energyCost: number;
  energyCostBucket: EnergyCostBucket;
  age: number;
  agePacing: AgePacingBucket;
  turn: number;
  totalTurns: number;
  currentEnergy: number;
  maxEnergy: number;
  daySinceInstall: number;
  retentionCheckpoint: RetentionCheckpoint;
  cohortKey: string;
}

export interface RetentionCheckpointParams {
  checkpoint: 'D1' | 'D3';
  daySinceInstall: number;
  age: number;
  turn: number;
  totalTurns: number;
  eventChoices: number;
  cohortKey: string;
}

class AnalyticsService {
  private enabled: boolean = false;
  private firebaseAnalytics: FirebaseAnalyticsModule | null = null;
  private firebaseLoadAttempted = false;
  private firebaseUnavailableWarned = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.firebaseAnalytics = this.getFirebaseAnalytics();
    devLog.log('[ANALYTICS] Service initialized');
    this.setEnabled(false); // Explicit opt-in required.
  }

  private getFirebaseAnalytics(): FirebaseAnalyticsModule | null {
    if (isWeb) {
      return null;
    }

    if (this.firebaseAnalytics) {
      return this.firebaseAnalytics;
    }

    if (this.firebaseLoadAttempted) {
      return null;
    }

    this.firebaseLoadAttempted = true;

    try {
      const firebaseModule = require('@react-native-firebase/analytics') as {
        default?: FirebaseAnalyticsFactory;
      };
      if (!firebaseModule.default) {
        return null;
      }
      this.firebaseAnalytics = firebaseModule.default();
      return this.firebaseAnalytics;
    } catch (error) {
      if (isDev) {
        devLog.warn('[ANALYTICS] Firebase Analytics module not available', error);
      }
      return null;
    }
  }

  private warnFirebaseUnavailableOnce(): void {
    if (this.firebaseUnavailableWarned || isWeb) {
      return;
    }
    this.firebaseUnavailableWarned = true;
    devLog.warn('[ANALYTICS] Firebase Analytics not available. Check native Firebase setup.');
  }

  private async applyCollectionPreference(enabled: boolean): Promise<void> {
    const firebaseAnalytics = this.getFirebaseAnalytics();
    if (!firebaseAnalytics) {
      if (enabled && !isDev) {
        this.warnFirebaseUnavailableOnce();
      }
      return;
    }

    try {
      await firebaseAnalytics.setAnalyticsCollectionEnabled(enabled);
    } catch (error) {
      if (isDev) {
        devLog.warn('[ANALYTICS] Failed to set analytics collection state', error);
      }
    }
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    void this.applyCollectionPreference(enabled);
    devLog.log(`[ANALYTICS] ${this.enabled ? 'enabled' : 'disabled'}`);
  }

  private sanitizeParams(params?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!params) {
      return undefined;
    }
    const sanitized: Record<string, unknown> = {};
    const MAX_STRING_LENGTH = 100;

    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const value = params[key];
        if (value === undefined || value === null) {
          continue;
        }

        if (typeof value === 'boolean') {
          // GA4 boolean params should be represented as numeric values.
          sanitized[key] = value ? 1 : 0;
          continue;
        }

        if (typeof value === 'number') {
          if (Number.isFinite(value)) {
            sanitized[key] = value;
          }
          continue;
        }

        if (typeof value === 'string') {
          sanitized[key] = value.length > MAX_STRING_LENGTH
            ? `${value.substring(0, MAX_STRING_LENGTH - 3)}...`
            : value;
          continue;
        }

        if (Array.isArray(value)) {
          const serialized = value
            .map((item) => (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean' ? String(item) : ''))
            .filter(Boolean)
            .join(',');

          if (!serialized) continue;
          sanitized[key] = serialized.length > MAX_STRING_LENGTH
            ? `${serialized.substring(0, MAX_STRING_LENGTH - 3)}...`
            : serialized;
        }
      }
    }
    return sanitized;
  }

  /**
   * Log game start
   */
  async logGameStarted(params: GameStartedParams): Promise<void> {
    const event = {
      character_name_length: params.characterName.length,
      difficulty: params.difficulty || 'normal',
      platform: isWeb ? 'web' : 'mobile',
      timestamp: new Date().toISOString(),
    };

    await this.logEvent('game_started', event);
  }

  /**
   * Log character creation
   */
  async logCharacterCreated(params: CharacterCreatedParams): Promise<void> {
    const event = {
      initial_wealth: params.wealth,
      talent_score: params.talent,
      traits_count: params.traits.length,
      traits: params.traits.join(','),
      family_type: params.familyType,
    };

    await this.logEvent('character_created', event);
  }

  /**
   * Log event completion
   */
  async logEventCompleted(params: EventCompletedParams): Promise<void> {
    const event = {
      event_id: params.eventId,
      choice_index: params.choiceIndex,
      age: params.age,
      event_type: params.eventType || 'unknown',
    };

    await this.logEvent('event_completed', event);
  }

  /**
   * Log hub action
   */
  async logHubAction(params: HubActionParams): Promise<void> {
    const event = {
      action_type: params.actionType,
      energy_cost: params.cost,
      player_age: params.age,
      skill_gain: params.skillGain || 0,
    };

    await this.logEvent('hub_action', event);
  }

  /**
   * Log turn advancement
   */
  async logTurnAdvanced(params: TurnAdvancedParams): Promise<void> {
    const event = {
      age: params.age,
      health: params.health,
      money: params.money,
      energy: params.energy,
    };

    await this.logEvent('turn_advanced', event);
  }

  /**
   * Log progression economy sample for cohort analysis
   */
  async logProgressionEconomy(params: ProgressionEconomyParams): Promise<void> {
    const event = {
      source: params.source,
      event_id: params.eventId || 'none',
      event_rarity: params.eventRarity,
      energy_cost: params.energyCost,
      energy_cost_bucket: params.energyCostBucket,
      age: params.age,
      age_pacing: params.agePacing,
      turn: params.turn,
      total_turns: params.totalTurns,
      current_energy: params.currentEnergy,
      max_energy: params.maxEnergy,
      day_since_install: params.daySinceInstall,
      retention_checkpoint: params.retentionCheckpoint,
      cohort_key: params.cohortKey,
    };

    await this.logEvent('progression_economy_sample', event);
  }

  /**
   * Log D1 / D3 retention checkpoints once per user
   */
  async logRetentionCheckpoint(params: RetentionCheckpointParams): Promise<void> {
    const event = {
      checkpoint: params.checkpoint,
      day_since_install: params.daySinceInstall,
      age: params.age,
      turn: params.turn,
      total_turns: params.totalTurns,
      event_choices: params.eventChoices,
      cohort_key: params.cohortKey,
    };

    await this.logEvent('retention_checkpoint', event);
  }

  /**
   * Log game ended
   */
  async logGameEnded(params: GameEndedParams): Promise<void> {
    const event = {
      final_age: params.finalAge,
      health: params.finalStats.health,
      intelligence: params.finalStats.intelligence,
      charisma: params.finalStats.charisma,
      discipline: params.finalStats.discipline,
      money: params.finalStats.money,
      playtime_minutes: params.playtimeMinutes,
      ending_type: params.endingType || 'normal',
    };

    await this.logEvent('game_ended', event);
  }

  /**
   * Log purchase
   */
  async logPurchaseMade(params: PurchaseMadeParams): Promise<void> {
    const event = {
      product_id: params.productId,
      price: params.price,
      currency: params.currency || 'USD',
      category: params.category || 'general',
    };

    await this.logEvent('purchase_made', event);
  }

  /**
   * Custom event logger
   */
  async logCustomEvent(eventName: string, params?: Record<string, unknown>): Promise<void> {
    await this.logEvent(eventName, params);
  }

  /**
   * Core event logging logic
   */
  private async logEvent(
    eventName: string,
    params?: Record<string, unknown>
  ): Promise<void> {
    if (!this.enabled && !isDev) {
      return;
    }

    const sanitizedParams = this.sanitizeParams(params);

    if (isDev) {
      devLog.log(`[ANALYTICS] Event: ${eventName}`, sanitizedParams || {});
    }

    if (!this.enabled) {
      return;
    }

    const firebaseAnalytics = this.getFirebaseAnalytics();
    if (!firebaseAnalytics) {
      if (!isDev) {
        this.warnFirebaseUnavailableOnce();
      }
      return;
    }

    try {
      await firebaseAnalytics.logEvent(eventName, sanitizedParams);
    } catch (error) {
      if (isDev) {
        devLog.warn(`[ANALYTICS] Failed to log event: ${eventName}`, error);
      }
    }
  }

  /**
   * Set user ID for tracking
   */
  async setUserId(userId: string): Promise<void> {
    if (isDev) {
      devLog.log(`[ANALYTICS] User ID set: ${userId}`);
    }

    if (!this.enabled) {
      return;
    }

    const firebaseAnalytics = this.getFirebaseAnalytics();
    if (!firebaseAnalytics) {
      if (!isDev) {
        this.warnFirebaseUnavailableOnce();
      }
      return;
    }

    try {
      await firebaseAnalytics.setUserId(userId);
    } catch (error) {
      if (isDev) {
        devLog.warn('[ANALYTICS] Failed to set user ID', error);
      }
    }
  }

  /**
   * Set user properties
   */
  async setUserProperty(
    name: string,
    value: string | number
  ): Promise<void> {
    if (isDev) {
      devLog.log(`[ANALYTICS] User property set: ${name} = ${value}`);
    }

    if (!this.enabled) {
      return;
    }

    const firebaseAnalytics = this.getFirebaseAnalytics();
    if (!firebaseAnalytics) {
      if (!isDev) {
        this.warnFirebaseUnavailableOnce();
      }
      return;
    }

    try {
      await firebaseAnalytics.setUserProperty(name, String(value));
    } catch (error) {
      if (isDev) {
        devLog.warn(`[ANALYTICS] Failed to set user property: ${name}`, error);
      }
    }
  }

  /**
   * Reset analytics data (for testing)
   */
  async resetAnalytics(): Promise<void> {
    if (isDev) {
      devLog.log('[ANALYTICS] Data reset');
    }

    const firebaseAnalytics = this.getFirebaseAnalytics();
    if (!firebaseAnalytics) {
      return;
    }

    try {
      await firebaseAnalytics.resetAnalyticsData();
    } catch (error) {
      if (isDev) {
        devLog.warn('[ANALYTICS] Failed to reset analytics data', error);
      }
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// For debugging: enable/disable analytics
export const enableAnalyticsDebug = () => {
  analyticsService.setEnabled(true);
  devLog.log('[ANALYTICS] Debug enabled');
};

export const disableAnalyticsDebug = () => {
  analyticsService.setEnabled(false);
  devLog.log('[ANALYTICS] Debug disabled');
};
