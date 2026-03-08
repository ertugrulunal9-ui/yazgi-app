/**
 * Avatar — Minimalist karakter görseli (Faz 6A)
 *
 * react-native-svg kullanmadan saf View/Text ile çizilir.
 * Yaş parametresine göre boyut/oran değişir.
 */

import React from 'react';
import { Text, View } from 'react-native';
import type { AvatarConfig } from '../types/core';

// Ten tonu renkleri
const SKIN_COLORS = ['#FDDBB4', '#F0C27F', '#C68642', '#8D5524'] as const;

// Saç renkleri
const HAIR_COLORS = ['#1a1a1a', '#6B3A2A', '#C8A951', '#A0522D'] as const;

// Aksesuar sembolleri
const ACCESSORY_CHARS = ['', '◉', '▲'] as const;

export interface AvatarProps {
  config: AvatarConfig;
  /** Yaş: 0-18. Küçükse daha yuvarlak/büyük kafa oranı */
  age?: number;
  /** Pixel boyutu (kare) */
  size?: number;
}

const DEFAULT_CONFIG: AvatarConfig = { hairStyle: 0, skinTone: 0, accessory: 0 };

export const Avatar: React.FC<AvatarProps> = ({
  config = DEFAULT_CONFIG,
  age = 10,
  size = 40,
}) => {
  const skinColor = SKIN_COLORS[config.skinTone];
  const hairColor = HAIR_COLORS[config.hairStyle];
  const accessoryChar = ACCESSORY_CHARS[config.accessory];

  // Yaşa göre kafa oranı: bebek büyük kafa, teen daha küçük
  const headRatio = age < 4 ? 0.70 : age < 10 ? 0.62 : 0.55;
  const headSize = Math.round(size * headRatio);
  const hairHeight = Math.round(headSize * 0.28);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      {/* Gövde */}
      <View style={{
        width: Math.round(size * 0.45),
        height: Math.round(size * 0.35),
        backgroundColor: skinColor,
        borderRadius: 4,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      }} />

      {/* Kafa */}
      <View style={{
        position: 'absolute',
        top: Math.round(size * 0.05),
        width: headSize,
        height: headSize,
        borderRadius: headSize / 2,
        backgroundColor: skinColor,
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        {/* Saç şeridi (üst kısım) */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: hairHeight,
          backgroundColor: hairColor,
          borderTopLeftRadius: headSize / 2,
          borderTopRightRadius: headSize / 2,
        }} />

        {/* Yüz sembolleri */}
        <Text style={{
          position: 'absolute',
          bottom: Math.round(headSize * 0.12),
          fontSize: Math.round(headSize * 0.30),
          lineHeight: Math.round(headSize * 0.35),
        }}>
          {'·͜·'}
        </Text>
      </View>

      {/* Aksesuar */}
      {accessoryChar ? (
        <Text style={{
          position: 'absolute',
          top: config.accessory === 2
            ? Math.round(size * 0.04)
            : Math.round(size * 0.28),
          fontSize: Math.round(headSize * 0.28),
          color: config.accessory === 1 ? '#374151' : '#92400e',
        }}>
          {accessoryChar}
        </Text>
      ) : null}
    </View>
  );
};

/** Küçük inline avatar chip — StatusHeader gibi dar alanlarda */
export const AvatarChip: React.FC<AvatarProps> = (props) => (
  <Avatar {...props} size={props.size ?? 32} />
);
