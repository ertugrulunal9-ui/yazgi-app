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

      if (originalDelta > 0 && (config.burdenRisk ?? 0) > 50) {
        burdenMultiplier = 0.9;
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

    return {
      newStats,
      appliedChanges,
      details,
    };
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
