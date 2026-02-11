/**
 * TriggerManager - Event Effect Processing System
 *
 * Choice'ların yan etkilerini işler:
 * - Stress güncellemeleri
 * - Personality değişiklikleri
 * - Memory oluşturma
 * - Breakdown event tetikleme
 */

import {
  GameState,
  Stats,
  Choice,
  StressState,
  Personality,
  PersonalityShift,
  EventMemory,
  MemoryEmotion,
  MemoryWeight,
} from '../types';
import {
  updateStress,
  applyPersonalityEffects,
  calculateBreakdownRisk,
} from '../utils/personalitySystem';

export interface TriggerContext {
  gameState: GameState;
  stats: Stats;
  choice: Choice;
  eventId: string;
}

export interface TriggerResults {
  // Stress changes
  stressUpdate: StressState;
  stressDelta: number;

  // Personality changes
  personalityUpdate: Personality;
  personalityShifts: PersonalityShift[];

  // Memory to store
  memoryToStore: EventMemory | null;

  // Breakdown event suggestion (if stress threshold exceeded)
  shouldTriggerBreakdown: boolean;
  breakdownRisk: number;
}

/**
 * TriggerManager - Tüm choice side effect'lerini işler
 */
export class TriggerManager {
  /**
   * Choice'ın tüm yan etkilerini işle
   */
  static processChoice(ctx: TriggerContext): TriggerResults {
    const { gameState, choice, eventId } = ctx;
    const { stress, personality, turn, age } = gameState;

    // 1. Stress güncellemesi
    const stressDelta = choice.stressEffect || 0;
    const stressUpdate = stressDelta !== 0
      ? updateStress(stress, stressDelta, `Event: ${eventId}`, turn)
      : stress;

    // 2. Personality güncellemesi
    let personalityUpdate = personality;
    let personalityShifts: PersonalityShift[] = [];

    if (choice.personalityEffects && choice.personalityEffects.length > 0) {
      const result = applyPersonalityEffects(
        personality,
        choice.personalityEffects,
        age,
        turn,
        `Event: ${eventId}`
      );
      personalityUpdate = result.newPersonality;
      personalityShifts = result.shifts;
    }

    // 3. Memory oluşturma
    const memoryToStore = this.createMemory(ctx);

    // 4. Breakdown risk kontrolü
    const breakdownRisk = calculateBreakdownRisk(stressUpdate, personalityUpdate);
    const shouldTriggerBreakdown = breakdownRisk > 0 && Math.random() * 100 < breakdownRisk;

    return {
      stressUpdate,
      stressDelta,
      personalityUpdate,
      personalityShifts,
      memoryToStore,
      shouldTriggerBreakdown,
      breakdownRisk,
    };
  }

  /**
   * Choice'tan EventMemory oluştur
   */
  private static createMemory(ctx: TriggerContext): EventMemory | null {
    const { choice, eventId, gameState } = ctx;

    if (!choice.memory) return null;

    const memory: EventMemory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      eventId,
      choiceId: choice.id || 'unknown',
      age: gameState.age,
      emotion: choice.memory.emotion as MemoryEmotion,
      weight: choice.memory.weight as MemoryWeight,
      relatedNpcId: choice.memory.relatedNpcId,
      turnTimestamp: gameState.turn,
    };

    return memory;
  }

  /**
   * Stress ve personality değişikliklerinin özet mesajını oluştur
   */
  static getSummaryMessage(results: TriggerResults): string | null {
    const parts: string[] = [];

    // Stress değişimi
    if (results.stressDelta !== 0) {
      const sign = results.stressDelta > 0 ? '+' : '';
      parts.push(`Stres: ${sign}${results.stressDelta}`);
    }

    // Personality değişimleri
    for (const shift of results.personalityShifts) {
      const axisNames: Record<string, string> = {
        openness: 'Açıklık',
        courage: 'Cesaret',
        empathy: 'Empati',
        patience: 'Sabır',
        conformity: 'Uyum',
      };
      const change = shift.newValue - shift.oldValue;
      const sign = change > 0 ? '+' : '';
      parts.push(`${axisNames[shift.axis]}: ${sign}${change}`);
    }

    // Memory oluşturuldu
    if (results.memoryToStore) {
      const emotionNames: Record<MemoryEmotion, string> = {
        REGRET: 'Pişmanlık',
        PRIDE: 'Gurur',
        GUILT: 'Suçluluk',
        SATISFACTION: 'Memnuniyet',
        NEUTRAL: 'Nötr',
      };
      parts.push(`Hafıza: ${emotionNames[results.memoryToStore.emotion]}`);
    }

    return parts.length > 0 ? parts.join(' | ') : null;
  }

  /**
   * Debug: Trigger sonuçlarının detaylı raporunu döndürür
   */
  static getDetailedReport(results: TriggerResults): string {
    const lines: string[] = ['=== Trigger Results ==='];

    lines.push(`\nStress:`);
    lines.push(`  Current: ${results.stressUpdate.current}`);
    lines.push(`  Delta: ${results.stressDelta}`);
    lines.push(`  Breakdown Risk: ${results.breakdownRisk}%`);
    if (results.shouldTriggerBreakdown) {
      lines.push(`  ⚠️ BREAKDOWN TRIGGERED!`);
    }

    if (results.personalityShifts.length > 0) {
      lines.push(`\nPersonality Shifts:`);
      for (const shift of results.personalityShifts) {
        lines.push(`  ${shift.axis}: ${shift.oldValue} → ${shift.newValue}`);
      }
    }

    if (results.memoryToStore) {
      lines.push(`\nMemory Created:`);
      lines.push(`  Event: ${results.memoryToStore.eventId}`);
      lines.push(`  Emotion: ${results.memoryToStore.emotion}`);
      lines.push(`  Weight: ${results.memoryToStore.weight}`);
    }

    return lines.join('\n');
  }
}

export default TriggerManager;
