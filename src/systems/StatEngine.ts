/**
 * StatEngine - Central stat processing pipeline
 *
 * Applies in one place:
 * - Diminishing returns
 * - Trait multipliers
 * - Behavioral Momentum multipliers
 * - Dynamic stat caps
 */

import { Family, PersonalityState, StatKey, Stats } from '../types';
import {
  calculateStatGain,
  clamp,
  getStatCap,
  getTraitMultiplier,
} from '../utils/gameUtils';
import { tRuntime } from '../i18n/strings';
import { getMomentumMultiplierForStat } from './PersonalityMomentumEngine';

export interface StatChangeConfig {
  age: number;
  family: Family | null;
  traits: string[];
  personalityState?: Partial<PersonalityState>;
  burdenRisk?: number;
}

export interface StatChangeResult {
  newStats: Stats;
  appliedChanges: Partial<Stats>;
  details: StatChangeDetail[];
}

export interface StatChangeDetail {
  stat: StatKey;
  originalDelta: number;
  afterDiminishing: number;
  traitMultiplier: number;
  momentumMultiplier: number;
  burdenMultiplier: number;
  momentumTendency: string | null;
  finalDelta: number;
  oldValue: number;
  newValue: number;
  cap: number;
}

export class StatEngine {
  static applyChanges(
    currentStats: Stats,
    changes: Partial<Stats>,
    config: StatChangeConfig
  ): StatChangeResult {
    const newStats = { ...currentStats };
    const appliedChanges: Partial<Stats> = {};
    const details: StatChangeDetail[] = [];

    const statKeys = Object.keys(changes) as StatKey[];

    for (const key of statKeys) {
      const originalDelta = changes[key];
      if (originalDelta === undefined || originalDelta === 0) continue;

      const oldValue = currentStats[key];
      const cap = getStatCap(config.age, key, config.family, config.traits);

      let afterDiminishing = originalDelta;
      let traitMultiplier = 1.0;
      let momentumMultiplier = 1.0;
      let burdenMultiplier = 1.0;
      let momentumTendency: string | null = null;

      if (originalDelta > 0 && key !== 'money' && key !== 'energy') {
        afterDiminishing = calculateStatGain(oldValue, originalDelta, cap);
        traitMultiplier = getTraitMultiplier(config.traits, key);
        afterDiminishing = Math.ceil(afterDiminishing * traitMultiplier);
      }

      if (originalDelta > 0 && config.personalityState) {
        const momentumResult = getMomentumMultiplierForStat(key, config.personalityState);
        momentumMultiplier = momentumResult.multiplier;
        momentumTendency = momentumResult.tendency;

        if (momentumMultiplier > 1) {
          afterDiminishing = Math.ceil(afterDiminishing * momentumMultiplier);
        }
      }

      const burden = config.burdenRisk ?? 0;
      const isProductivityStat = key === 'intelligence' || key === 'discipline' || key === 'charisma';
      if (originalDelta > 0 && burden > 40 && isProductivityStat) {
        const severity = Math.min((burden - 40) / 60, 1); // 0→1 as burden goes 40→100
        burdenMultiplier = 1.0 - severity * 0.35;          // 1.0 → 0.65 kademeli (sadece verimlilik statları)
        afterDiminishing = Math.ceil(afterDiminishing * burdenMultiplier);
      }

      const shouldUseDiminishingForNegative =
        originalDelta < 0 &&
        key !== 'money' &&
        key !== 'energy';

      const finalDelta = originalDelta > 0
        ? afterDiminishing
        : shouldUseDiminishingForNegative
          ? -calculateStatGain(cap - oldValue, Math.abs(originalDelta), cap)
          : originalDelta;

      let newValue = oldValue + finalDelta;
      const minLimit = 0;
      const maxLimit = key === 'money' ? Infinity : cap + 10;

      newValue = clamp(newValue, minLimit, maxLimit);
      newStats[key] = newValue;

      const actualDelta = newValue - oldValue;
      if (actualDelta !== 0) {
        appliedChanges[key] = actualDelta;
      }

      details.push({
        stat: key,
        originalDelta,
        afterDiminishing,
        traitMultiplier,
        momentumMultiplier,
        burdenMultiplier,
        momentumTendency,
        finalDelta,
        oldValue,
        newValue,
        cap,
      });
    }

    // === FIRSAT MALİYETİ (Opportunity Cost) ===
    // Para kazanımı, aile ilişkisini hafifçe düşürür — "çalışan çocuk aileyle zaman geçiremiyor"
    // Sadece kazanım varsa ve aile ilişkisi zaten bu set'te değiştirilmiyorsa uygula
    const moneyGain = (changes['money'] ?? 0);
    if (moneyGain > 0 && !('familyRelation' in changes)) {
      const opportunityCost = -Math.max(1, Math.floor(moneyGain / 80));
      const currentFR = newStats['familyRelation'];
      if (currentFR > 5) {
        const newFR = Math.max(0, currentFR + opportunityCost);
        newStats['familyRelation'] = newFR;
        const actualFRDelta = newFR - (currentStats['familyRelation']);
        if (actualFRDelta !== 0) {
          appliedChanges['familyRelation'] = (appliedChanges['familyRelation'] ?? 0) + actualFRDelta;
        }
      }
    }

    return {
      newStats,
      appliedChanges,
      details,
    };
  }

  /**
   * Para miktarını yaşa göre 0-100 "servet skoru"na normalize eder.
   * Dashboard gösterimi için kullanılır; ham money değeri oyun içinde değişmez.
   */
  static normalizeMoneyToScore(money: number, age: number): number {
    const cap = age < 7 ? 500 : age < 12 ? 2_000 : 10_000;
    return Math.min(100, Math.round((money / cap) * 100));
  }

  /**
   * Stat değişim detaylarından oyuncu dostu narrative mesajlar üretir.
   * Sayısal çarpanları gizleyerek sadece "neden" bilgisi verir.
   */
  static getStatChangeNarrativeFeedback(details: StatChangeDetail[]): string[] {
    const messages: string[] = [];

    for (const detail of details) {
      if (detail.stat === 'energy' || detail.stat === 'money') continue;
      if (detail.originalDelta <= 0) continue;

      const ratio = detail.originalDelta > 0 ? detail.finalDelta / detail.originalDelta : 1;

      if (detail.burdenMultiplier < 1 && ratio < 0.75) {
        const tiredPenalty = tRuntime('feedback.statNarrative.tiredPenalty');
        if (!messages.includes(tiredPenalty)) {
          messages.push(tiredPenalty);
        }
      } else if (detail.traitMultiplier > 1.2 && detail.finalDelta > detail.originalDelta) {
        const traitBoost = tRuntime('feedback.statNarrative.traitBoost');
        if (!messages.includes(traitBoost)) {
          messages.push(traitBoost);
        }
      } else if (detail.momentumMultiplier > 1.1) {
        const momentumBoost = tRuntime('feedback.statNarrative.momentumBoost');
        if (!messages.includes(momentumBoost)) {
          messages.push(momentumBoost);
        }
      }
    }

    return messages;
  }

  static applyRaw(currentStats: Stats, changes: Partial<Stats>): Stats {
    const newStats = { ...currentStats };

    for (const key of Object.keys(changes) as StatKey[]) {
      const delta = changes[key];
      if (delta === undefined) continue;

      const minLimit = 0;
      const maxLimit = key === 'money' ? Infinity : 100;
      newStats[key] = clamp(currentStats[key] + delta, minLimit, maxLimit);
    }

    return newStats;
  }

  static getChangeReport(result: StatChangeResult): string {
    const lines: string[] = ['=== Stat Change Report ==='];

    for (const detail of result.details) {
      const {
        stat,
        originalDelta,
        finalDelta,
        traitMultiplier,
        momentumMultiplier,
        burdenMultiplier,
        momentumTendency,
        oldValue,
        newValue,
        cap,
      } = detail;
      const sign = originalDelta > 0 ? '+' : '';

      lines.push(`${stat}: ${oldValue} -> ${newValue} (${sign}${finalDelta})`);

      if (originalDelta !== finalDelta) {
        lines.push(`  Original: ${sign}${originalDelta}`);
        if (traitMultiplier !== 1.0) {
          lines.push(`  Trait multiplier: ${traitMultiplier.toFixed(2)}x`);
        }
        if (momentumMultiplier !== 1.0 && momentumTendency) {
          lines.push(`  Momentum (${momentumTendency}): ${momentumMultiplier.toFixed(2)}x`);
        }
        if (burdenMultiplier !== 1.0) {
          lines.push(`  Burden penalty: ${burdenMultiplier.toFixed(2)}x`);
        }
        lines.push(`  Cap: ${cap}`);
      }
    }

    return lines.join('\n');
  }
}

export default StatEngine;
