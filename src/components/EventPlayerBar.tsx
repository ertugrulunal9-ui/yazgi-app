/**
 * EventPlayerBar — olay ekranının üstündeki karakter şeridi:
 * karakterin o anki yüzü, adı, yaşı/dönemi ve ruh hâli.
 */

import React from 'react';
import { Text, View } from 'react-native';
import { Avatar } from './Avatar';
import type { AvatarConfig, PlayerGender } from '../types/core';
import type { AvatarMood } from '../utils/avatarMood';
import { getCurrentChapter, getLocalizedChapterName } from '../utils/gameUtils';
import { ensureTextContrast } from '../utils/colorContrast';
import { tRuntime } from '../i18n/strings';

const MOOD_COLORS: Partial<Record<AvatarMood, string>> = {
  HAPPY: '#facc15',
  SAD: '#60a5fa',
  STRESSED: '#f87171',
};

interface EventPlayerBarProps {
  avatar?: AvatarConfig;
  gender?: PlayerGender;
  mood: AvatarMood;
  age: number;
  name?: string;
  theme: {
    appBg: string;
    surfaceBase: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
  };
}

export const EventPlayerBar: React.FC<EventPlayerBarProps> = React.memo(({
  avatar,
  gender,
  mood,
  age,
  name,
  theme,
}) => {
  const chapter = getCurrentChapter(age);
  const ageLine = `${age} ${tRuntime('character.ageUnit')} · ${chapter.emoji} ${getLocalizedChapterName(chapter.id)}`;
  const moodLabel = tRuntime(`character.screen.portrait.moods.${mood}`);
  const moodColor = ensureTextContrast(MOOD_COLORS[mood] ?? theme.textSecondary, theme.appBg, 4.5);

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14, marginRight: 60 }}
      accessible
      accessibilityLabel={[name, ageLine, moodLabel].filter(Boolean).join(', ')}
    >
      {avatar ? (
        <View style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.surfaceBase,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Avatar config={avatar} age={age} gender={gender} mood={mood} size={54} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        {name ? (
          <Text numberOfLines={1} style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '700' }}>
            {name}
          </Text>
        ) : null}
        <Text numberOfLines={1} style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>
          {ageLine}
        </Text>
        <Text numberOfLines={1} style={{ color: moodColor, fontSize: 12, fontWeight: '600', marginTop: 2 }}>
          {moodLabel}
        </Text>
      </View>
    </View>
  );
});

EventPlayerBar.displayName = 'EventPlayerBar';
