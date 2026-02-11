/**
 * StatEngine - Merkezi Stat İşleme Sistemi
 *
 * Tüm stat değişikliklerini tek noktadan geçirir:
 * - Diminishing returns (azalan getiri)
 * - Trait multipliers
 * - Dynamic age-based caps
 * - Family bonuses/penalties
 */

import { Stats, StatKey, Family } from '../types';
import {
  calculateStatGain,
  getStatCap,
  getTraitMultiplier,
  clamp,
} from '../utils/gameUtils';

export interface StatChangeConfig {
  age: number;
  family: Family | null;
  traits: string[];
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
  finalDelta: number;
  oldValue: number;
  newValue: number;
  cap: number;
}

/**
 * StatEngine - Oyun dengesi için kritik
 *
 * Kullanım:
 * const result = StatEngine.applyChanges(currentStats, { intelligence: 5 }, config);
 * setStats(result.newStats);
 */
export class StatEngine {
  /**
   * Stat değişikliklerini uygular
   * - Diminishing returns: Cap'e yaklaştıkça kazanım azalır
   * - Trait multipliers: GENIUS +30% intelligence, ATHLETIC +30% sports vb.
   * - Dynamic caps: Yaşa göre soft cap (age 5 = max 30, age 18 = max 100)
   */
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

      // Pozitif değişiklikler için formül uygula (money ve energy hariç)
      if (originalDelta > 0 && key !== 'money' && key !== 'energy') {
        // 1. Diminishing returns
        afterDiminishing = calculateStatGain(oldValue, originalDelta, cap);

        // 2. Trait multipliers
        traitMultiplier = getTraitMultiplier(config.traits, key);
        afterDiminishing = Math.ceil(afterDiminishing * traitMultiplier);
      }

      // Negatif değişiklikler için sadece trait multiplier (opsiyonel)
      // Şimdilik negatif değişiklikleri olduğu gibi uyguluyoruz
      const shouldUseDiminishingForNegative =
        originalDelta < 0 &&
        key !== 'money' &&
        key !== 'energy';

      const finalDelta = originalDelta > 0
        ? afterDiminishing
        : shouldUseDiminishingForNegative
          ? -calculateStatGain(cap - oldValue, Math.abs(originalDelta), cap)
          : originalDelta;

      // Değeri uygula ve clamp et
      let newValue = oldValue + finalDelta;
      const minLimit = key === 'money' ? 0 : 0;
      const maxLimit = key === 'money' ? Infinity : cap + 10; // Soft cap'i biraz aşabilir

      newValue = clamp(newValue, minLimit, maxLimit);
      newStats[key] = newValue;

      // Gerçek değişimi hesapla (clamp sonrası)
      const actualDelta = newValue - oldValue;
      if (actualDelta !== 0) {
        appliedChanges[key] = actualDelta;
      }

      details.push({
        stat: key,
        originalDelta,
        afterDiminishing,
        traitMultiplier,
        finalDelta,
        oldValue,
        newValue,
        cap,
      });
    }

    return {
      newStats,
      appliedChanges,
      details,
    };
  }

  /**
   * Basit stat değişikliği (formül olmadan)
   * Sadece sistem gereksinimleri için kullanılmalı (energy restore vb.)
   */
  static applyRaw(currentStats: Stats, changes: Partial<Stats>): Stats {
    const newStats = { ...currentStats };

    for (const key of Object.keys(changes) as StatKey[]) {
      const delta = changes[key];
      if (delta === undefined) continue;

      let newValue = currentStats[key] + delta;
      const minLimit = key === 'money' ? 0 : 0;
      const maxLimit = key === 'money' ? Infinity : 100;

      newStats[key] = clamp(newValue, minLimit, maxLimit);
    }

    return newStats;
  }

  /**
   * Debug: Stat değişikliğinin detaylı raporunu döndürür
   */
  static getChangeReport(result: StatChangeResult): string {
    const lines: string[] = ['=== Stat Change Report ==='];

    for (const detail of result.details) {
      const { stat, originalDelta, finalDelta, traitMultiplier, oldValue, newValue, cap } = detail;
      const sign = originalDelta > 0 ? '+' : '';

      lines.push(`${stat}: ${oldValue} → ${newValue} (${sign}${finalDelta})`);

      if (originalDelta !== finalDelta) {
        lines.push(`  Original: ${sign}${originalDelta}`);
        if (traitMultiplier !== 1.0) {
          lines.push(`  Trait multiplier: ${traitMultiplier.toFixed(2)}x`);
        }
        lines.push(`  Cap: ${cap}`);
      }
    }

    return lines.join('\n');
  }
}

export default StatEngine;
