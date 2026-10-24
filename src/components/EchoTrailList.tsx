/**
 * Yazgı İzi listesi: gerçekleşen yankılar (hangi yaşta ne seçtin → hangi yaşta ne oldu)
 * ve henüz geri dönmemiş seçimlerin sayısı.
 */

import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from './ui/LocaleText';
import { tRuntime } from '../i18n/strings';
import { ensureTextContrast } from '../utils/colorContrast';
import { buildEchoTrailItems } from '../utils/echoTrailView';
import type { EchoTrailEntry } from '../types';

// Olay ekranındaki yankı kartıyla aynı renk
const ECHO_COLOR = '#a78bfa';

interface EchoTrailListProps {
  echoLog?: EchoTrailEntry[];
  pendingCount: number;
  theme: {
    textPrimary: string;
    textSecondary: string;
    surfaceBase: string;
    border: string;
  };
}

export const EchoTrailList: React.FC<EchoTrailListProps> = ({ echoLog, pendingCount, theme }) => {
  const items = useMemo(() => buildEchoTrailItems(echoLog), [echoLog]);
  const accent = ensureTextContrast(ECHO_COLOR, theme.surfaceBase, 4.5);

  return (
    <View>
      {items.length === 0 ? (
        <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 19 }}>
          {tRuntime('character.screen.echoTrail.empty')}
        </Text>
      ) : (
        items.map((item, index) => (
          <View
            key={item.key}
            style={{ flexDirection: 'row', gap: 12 }}
            accessible
            accessibilityLabel={`${tRuntime('character.screen.echoTrail.ages', { from: item.sourceAge, to: item.age })}. ${item.choiceText}. ${item.summary}`}
          >
            {/* Zaman çizgisi: nokta ve sonraki kayda uzanan çizgi */}
            <View style={{ alignItems: 'center', width: 12 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: accent, marginTop: 4 }} />
              {index < items.length - 1 ? (
                <View style={{ flex: 1, width: 2, backgroundColor: `${ECHO_COLOR}55`, marginTop: 2 }} />
              ) : null}
            </View>
            <View style={{ flex: 1, paddingBottom: index < items.length - 1 ? 16 : 0 }}>
              <Text style={{ color: accent, fontSize: 12, fontWeight: '700' }}>
                {tRuntime('character.screen.echoTrail.ages', { from: item.sourceAge, to: item.age })}
              </Text>
              <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: '600', marginTop: 3 }}>
                {tRuntime('character.screen.echoTrail.choice', { choice: item.choiceText })}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 2 }}>
                {item.summary}
              </Text>
            </View>
          </View>
        ))
      )}
      {pendingCount > 0 ? (
        <View style={{
          marginTop: 14,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
          <Text style={{ fontSize: 14 }}>{'⏳'}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13, flex: 1 }}>
            {tRuntime('character.screen.echoTrail.pending', { count: pendingCount })}
          </Text>
        </View>
      ) : null}
    </View>
  );
};
