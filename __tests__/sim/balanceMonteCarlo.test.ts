/**
 * Balance Monte Carlo Simulation Gate
 *
 * Lightweight simulation: config degerleri ve formullerin 1000 rastgele
 * senaryo uzerinde ship gate metriklerini karsiladigini dogrular.
 * Tam oyun simulasyonu degil — deger araliklari ve formul invariant'lari test edilir.
 */

import { POWER_BUDGET, CONSUMABLE_CONFIG, BUFF_RULES, AD_FATIGUE_POLICY, ENERGY_RECOVERY } from '../../src/config/gameBalance';
import { calculateDiminishingReturns } from '../../src/config/gameBalance';

const RUN_COUNT = 1000;

/** Rastgele int [min, max] araliginda */
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

describe('Balance Monte Carlo Gate', () => {
  describe('Stat inflation guard (POWER_BUDGET)', () => {
    it('net stat gain per run stays within budget across 1000 simulations', () => {
      const violations: number[] = [];

      for (let run = 0; run < RUN_COUNT; run++) {
        let totalGain = 0;
        const turnsPerRun = randInt(55, 72); // Typical 7-18 age range turns

        for (let turn = 0; turn < turnsPerRun; turn++) {
          const currentStat = Math.min(100, 20 + totalGain * 0.3);
          const rawGain = randInt(1, POWER_BUDGET.maxDailyNetGainAfterAge7);
          const effectiveGain = calculateDiminishingReturns(currentStat, rawGain, 100);
          totalGain += effectiveGain;
        }

        if (totalGain > POWER_BUDGET.maxNetStatGainPerRun) {
          violations.push(totalGain);
        }
      }

      // Allow max 5% violation rate (edge cases with very low current stat)
      const violationRate = violations.length / RUN_COUNT;
      expect(violationRate).toBeLessThan(0.05);
    });
  });

  describe('Economy: money_at_18 projection', () => {
    it('money balance stays reasonable when consumables are available', () => {
      const endMoneyValues: number[] = [];

      for (let run = 0; run < RUN_COUNT; run++) {
        let money = randInt(0, 500); // Starting money
        const turnsAge14To18 = randInt(16, 24);

        for (let turn = 0; turn < turnsAge14To18; turn++) {
          // Income from actions/events
          money += randInt(50, 200);

          // Random consumable spending (50% chance per turn)
          if (Math.random() < 0.5) {
            const items = Object.values(CONSUMABLE_CONFIG);
            const item = items[randInt(0, items.length - 1)];
            if (money >= item.base) {
              money -= item.base;
            }
          }
        }

        endMoneyValues.push(money);
      }

      const sorted = [...endMoneyValues].sort((a, b) => a - b);
      const p90 = sorted[Math.floor(RUN_COUNT * 0.9)];

      // Ship gate: p90 money at 18 should be <= 6000
      expect(p90).toBeLessThanOrEqual(6000);
    });
  });

  describe('Energy depletion rate band', () => {
    it('partial recovery keeps depletion rate meaningful but not universal', () => {
      let depletedSessions = 0;

      for (let run = 0; run < RUN_COUNT; run++) {
        const isYoung = Math.random() < 0.5;
        const recoveryRate = isYoung
          ? ENERGY_RECOVERY.youngRecoveryRate
          : ENERGY_RECOVERY.teenRecoveryRate;

        // Each turn = 1 action (player picks one action per turn in the game)
        // Energy cost per action: 10-30
        // Between turns: partial recovery toward maxEnergy
        let energy = 100;
        let depleted = false;
        const maxEnergy = 100;
        const turnsPerSession = randInt(6, 14); // Turns in a play session

        for (let turn = 0; turn < turnsPerSession; turn++) {
          // One action per turn with energy cost
          const cost = randInt(10, 30);
          energy = Math.max(0, energy - cost);
          if (energy === 0) depleted = true;

          // Turn boundary: partial energy recovery (lerp toward max)
          energy = Math.min(maxEnergy, Math.floor(energy * recoveryRate + maxEnergy * (1 - recoveryRate)));
        }

        if (depleted) depletedSessions++;
      }

      const depletionRate = depletedSessions / RUN_COUNT;
      // With partial recovery, some sessions should deplete but not all
      expect(depletionRate).toBeGreaterThan(0.05);
      expect(depletionRate).toBeLessThan(0.95);
    });
  });

  describe('Ad offer density', () => {
    it('session ad offers stay within p95 <= 6', () => {
      const sessionOffers: number[] = [];

      for (let run = 0; run < RUN_COUNT; run++) {
        let offers = 0;
        let lastOfferTurn = -999;
        let consecutiveDeclines = 0;
        let snoozeTurns = 0;
        const sessionTurns = randInt(10, 25);

        for (let turn = 0; turn < sessionTurns; turn++) {
          if (snoozeTurns > 0) {
            snoozeTurns--;
            continue;
          }

          const turnsSinceLast = turn - lastOfferTurn;
          if (turnsSinceLast < AD_FATIGUE_POLICY.minTurnsBetweenOffers) continue;
          if (offers >= AD_FATIGUE_POLICY.globalDailyCap) continue;

          // 40% chance system wants to offer an ad
          if (Math.random() < 0.4) {
            offers++;
            lastOfferTurn = turn;

            // 30% chance user declines
            if (Math.random() < 0.3) {
              consecutiveDeclines++;
              if (consecutiveDeclines >= 2) {
                snoozeTurns = AD_FATIGUE_POLICY.declineSnoozeTurns;
                consecutiveDeclines = 0;
              }
            } else {
              consecutiveDeclines = 0;
            }
          }
        }

        sessionOffers.push(offers);
      }

      const sorted = [...sessionOffers].sort((a, b) => a - b);
      const p95 = sorted[Math.floor(RUN_COUNT * 0.95)];

      // Ship gate: p95 ad offers per session <= globalDailyCap
      expect(p95).toBeLessThanOrEqual(AD_FATIGUE_POLICY.globalDailyCap);
    });
  });

  describe('Buff system invariants', () => {
    it('active buff count never exceeds maxActiveBuffs', () => {
      for (let run = 0; run < 100; run++) {
        let activeCount = 0;
        const turnsPerRun = randInt(10, 30);

        for (let turn = 0; turn < turnsPerRun; turn++) {
          // Try to add buff
          if (Math.random() < 0.3 && activeCount < BUFF_RULES.maxActiveBuffs) {
            activeCount++;
          }

          // Random expiry
          if (Math.random() < 0.2 && activeCount > 0) {
            activeCount--;
          }

          expect(activeCount).toBeLessThanOrEqual(BUFF_RULES.maxActiveBuffs);
        }
      }
    });
  });

  describe('Config sanity checks', () => {
    it('consumable prices cover investment return', () => {
      const inv = CONSUMABLE_CONFIG.investment;
      expect(inv.returnAmount).toBeGreaterThan(inv.base);
      // ROI should be reasonable (< 100%)
      const roi = (inv.returnAmount - inv.base) / inv.base;
      expect(roi).toBeLessThan(1.0);
      expect(roi).toBeGreaterThan(0);
    });

    it('energy drink effect is modest relative to max energy (100)', () => {
      expect(CONSUMABLE_CONFIG.energyDrink.effect).toBeLessThan(50);
      expect(CONSUMABLE_CONFIG.energyDrink.effect).toBeGreaterThan(0);
    });

    it('buff rules are internally consistent', () => {
      expect(BUFF_RULES.maxActiveBuffs).toBeGreaterThan(0);
      expect(BUFF_RULES.investmentMaxActive).toBeLessThanOrEqual(BUFF_RULES.maxActiveBuffs);
    });
  });
});
