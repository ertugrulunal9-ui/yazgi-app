const isDev = __DEV__;
const isWeb = typeof window !== 'undefined' && typeof navigator !== 'undefined';

/**
 * Yazgı Game Analytics Service
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

// Analytics configuration

class AnalyticsService {
  private enabled: boolean = !isDev;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // In a real scenario, this would initialize Firebase, etc.
    console.log('📊 Analytics Service Initialized');
    this.setEnabled(!isDev); // Enabled by default in prod, disabled in dev
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`📊 Analytics ${this.enabled ? 'enabled' : 'disabled'}`);
  }

  private sanitizeParams(params?: Record<string, any>): Record<string, any> | undefined {
    if (!params) {
      return undefined;
    }
    const sanitized: Record<string, any> = {};
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const value = params[key];
        // Truncate long strings to avoid oversized payloads
        if (typeof value === 'string' && value.length > 100) {
          sanitized[key] = `${value.substring(0, 97)}...`;
        } else if (value !== undefined && value !== null) {
          sanitized[key] = value;
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
      character_name: params.characterName,
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
  async logCustomEvent(eventName: string, params?: Record<string, any>): Promise<void> {
    await this.logEvent(eventName, params);
  }

  /**
   * Core event logging logic - now console-only
   */
  private async logEvent(
    eventName: string,
    params?: Record<string, any>
  ): Promise<void> {
    if (!this.enabled && !isDev) {
      return;
    }

    const sanitizedParams = this.sanitizeParams(params);

    if (isDev) {
      console.log(`[ANALYTICS] Event: ${eventName}`, sanitizedParams || {});
    }
    // Production logging would go here (e.g., to Firebase)
  }

  /**
   * Set user ID for tracking
   */
  async setUserId(userId: string): Promise<void> {
    if (isDev) {
      console.log(`[ANALYTICS] User ID set: ${userId}`);
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
      console.log(`[ANALYTICS] User property set: ${name} = ${value}`);
    }
  }

  /**
   * Reset analytics data (for testing)
   */
  async resetAnalytics(): Promise<void> {
    if (isDev) {
      console.log('[ANALYTICS] Data reset');
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// For debugging: enable/disable analytics
export const enableAnalyticsDebug = () => {
  analyticsService.setEnabled(true);
  console.log('🔍 Analytics debug enabled');
};

export const disableAnalyticsDebug = () => {
  analyticsService.setEnabled(false);
  console.log('🔍 Analytics debug disabled');
};