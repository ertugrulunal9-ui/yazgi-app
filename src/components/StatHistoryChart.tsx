/**
 * StatHistoryChart — Yaş başına stat geçmişi (Faz 6B)
 *
 * Her yaş geçişinde kaydedilen statSnapshots'ı kullanarak
 * harici kütüphane gerektirmeden basit sparkline grafik çizer.
 */

import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { tRuntime } from '../i18n/strings';
import type { Stats } from '../types/core';

interface StatSnapshot {
  age: number;
  stats: Stats;
}

interface StatHistoryChartProps {
  snapshots: StatSnapshot[];
  currentAge: number;
  currentStats: Stats;
  theme: {
    textPrimary: string;
    textSecondary: string;
    surfaceOverlay: string;
    border: string;
    surfaceBase: string;
  };
}

const CHART_STATS: Array<{ key: keyof Stats; labelKey: string; fallback: string; color: string }> = [
  { key: 'health', labelKey: 'labels.stats.health', fallback: 'Health', color: '#ef4444' },
  { key: 'intelligence', labelKey: 'labels.stats.intelligence', fallback: 'Intelligence', color: '#3b82f6' },
  { key: 'charisma', labelKey: 'labels.stats.charisma', fallback: 'Charisma', color: '#a855f7' },
  { key: 'discipline', labelKey: 'labels.stats.discipline', fallback: 'Discipline', color: '#f59e0b' },
  { key: 'energy', labelKey: 'labels.stats.energy', fallback: 'Energy', color: '#22c55e' },
];

const BAR_HEIGHT = 32;
const BAR_MIN = 2;
const SEG_WIDTH = 16;
const SEG_GAP = 2;

export const StatHistoryChart: React.FC<StatHistoryChartProps> = ({
  snapshots,
  currentAge,
  currentStats,
  theme,
}) => {
  // Mevcut anı da ekle (son nokta)
  const allPoints = useMemo(() => {
    const pts = [...snapshots];
    // currentAge zaten bir snapshot'ta yoksa ekle
    if (!pts.find(s => s.age === currentAge)) {
      pts.push({ age: currentAge, stats: currentStats });
    }
    return pts.sort((a, b) => a.age - b.age);
  }, [snapshots, currentAge, currentStats]);

  if (allPoints.length < 2) {
    return (
      <View style={{ paddingVertical: 16, alignItems: 'center' }}>
        <Text style={{ color: theme.textSecondary, fontSize: 13, fontStyle: 'italic' }}>
          {tRuntime('character.screen.statHistoryEmpty')}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={{
        color: theme.textSecondary,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 10,
      }}>
        {tRuntime('character.screen.sections.statHistory')}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* X ekseni: yaş etiketleri */}
          <View style={{ flexDirection: 'row', marginLeft: 60, marginBottom: 4 }}>
            {allPoints.map(pt => (
              <View key={pt.age} style={{ width: SEG_WIDTH + SEG_GAP, alignItems: 'center' }}>
                <Text style={{ color: theme.textSecondary, fontSize: 9 }}>
                  {pt.age}
                </Text>
              </View>
            ))}
          </View>

          {/* Stat satırları */}
          {CHART_STATS.map(stat => {
            const values = allPoints.map(pt => Math.min(100, Math.max(0, pt.stats[stat.key] ?? 0)));
            return (
              <View
                key={stat.key}
                style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 6 }}
              >
                {/* Stat etiketi */}
                <View style={{ width: 58, justifyContent: 'center', paddingRight: 6 }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 10, fontWeight: '600' }} numberOfLines={1}>
                    {tRuntime(stat.labelKey, undefined, stat.fallback)}
                  </Text>
                </View>

                {/* Bar segmentleri */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: BAR_HEIGHT }}>
                  {values.map((val, i) => {
                    const barH = Math.max(BAR_MIN, Math.round((val / 100) * BAR_HEIGHT));
                    const isLast = i === values.length - 1;
                    const isLow = val < 30;
                    return (
                      <View
                        key={allPoints[i].age}
                        style={{
                          width: SEG_WIDTH,
                          height: barH,
                          marginRight: SEG_GAP,
                          backgroundColor: isLow ? '#ef444488' : `${stat.color}${isLast ? 'FF' : 'AA'}`,
                          borderRadius: 2,
                          borderTopLeftRadius: 3,
                          borderTopRightRadius: 3,
                        }}
                      />
                    );
                  })}
                </View>

                {/* Son değer */}
                <Text style={{
                  color: stat.color,
                  fontSize: 11,
                  fontWeight: '700',
                  marginLeft: 6,
                  alignSelf: 'flex-end',
                }}>
                  {Math.round(values[values.length - 1])}
                </Text>
              </View>
            );
          })}

          {/* Alt çizgi */}
          <View style={{
            marginLeft: 60,
            height: 1,
            backgroundColor: theme.border,
            marginTop: 2,
          }} />
        </View>
      </ScrollView>
    </View>
  );
};
