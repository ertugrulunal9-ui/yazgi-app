/**
 * GoalTracker — Hub'da kompakt hedef widget'i (Paket 5)
 *
 * Micro-goal: progress bar + kalan turn sayisi
 * Season-goal: yillik hedef karti
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MicroGoal, SeasonGoal } from '../types/game';
import { tRuntime } from '../i18n/strings';
import type { ThemeTokens } from '../utils/themeUtils';

interface GoalTrackerProps {
  microGoals: MicroGoal[];
  seasonGoal: SeasonGoal | null;
  theme: ThemeTokens;
}

const formatGoalIdFallback = (goalId: string): string => {
  const baseId = goalId
    .replace(/_(\d+)$/, '')
    .replace(/^mg_/, '')
    .replace(/^sg_/, '');

  const words = baseId.split('_').filter(Boolean);
  if (words.length === 0) return goalId;

  return words
    .map((word, index) => {
      if (index > 0) return word;
      return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
    })
    .join(' ');
};

export const GoalTracker: React.FC<GoalTrackerProps> = React.memo(({
  microGoals,
  seasonGoal,
  theme,
}) => {
  const activeGoals = microGoals.filter(g => !g.completed && g.turnsRemaining > 0);
  const hasContent = activeGoals.length > 0 || (seasonGoal && !seasonGoal.completed);

  if (!hasContent) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
      <Text style={[styles.header, { color: theme.textSecondary }]}>
        {tRuntime('goals.tracker.title', undefined, 'Hedefler')}
      </Text>

      {/* Season Goal */}
      {seasonGoal && !seasonGoal.completed && (
        <View style={[styles.seasonCard, { borderColor: theme.accentBrand }]}>
          <Text style={[styles.seasonLabel, { color: theme.accentBrand }]}>
            {tRuntime('goals.tracker.seasonGoal', undefined, 'Yillik Hedef')}
          </Text>
          <Text style={[styles.goalDesc, { color: theme.textPrimary }]} numberOfLines={1}>
            {tRuntime(seasonGoal.descriptionKey, undefined, formatGoalIdFallback(seasonGoal.id))}
          </Text>
        </View>
      )}

      {/* Micro Goals */}
      {activeGoals.slice(0, 2).map(goal => {
        const pct = goal.target > 0 ? (goal.progress / goal.target) * 100 : 0;
        return (
          <View key={goal.id} style={styles.microRow}>
            <View style={styles.microInfo}>
              <Text style={[styles.goalDesc, { color: theme.textPrimary }]} numberOfLines={1}>
                {tRuntime(goal.descriptionKey, undefined, formatGoalIdFallback(goal.id))}
              </Text>
              <Text style={[styles.turnsLeft, { color: theme.textSecondary }]}>
                {goal.turnsRemaining} {tRuntime('goals.tracker.turnsLeft', undefined, 'tur')}
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <View style={[styles.progressFill, { width: `${Math.min(100, pct)}%`, backgroundColor: theme.accentBrand }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
});

GoalTracker.displayName = 'GoalTracker';

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  header: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  seasonCard: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 8,
  },
  seasonLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  goalDesc: {
    fontSize: 13,
    fontWeight: '500',
  },
  microRow: {
    marginBottom: 6,
  },
  microInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  turnsLeft: {
    fontSize: 11,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
