import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { CareerResult, ZodiacSign } from '../types';
import { getTraitName } from '../data/traits';
import type { getThemeTokens } from '../utils/themeUtils';

interface ShareCardProps {
  theme: ReturnType<typeof getThemeTokens>;
  playerName: string;
  age: number;
  zodiacSign?: ZodiacSign | null;
  tier: CareerResult['type'];
  endingTitle: string;
  traitIds: string[];
  legacyLevel: number;
  topMemories?: string[];
  closestNpcName?: string;
}

const TIER_LABELS: Record<CareerResult['type'], string> = {
  FAILURE: 'ZOR',
  NORMAL: 'ORTA',
  SUCCESS: 'BASARI',
  LEGENDARY: 'EFSANE',
};

const TIER_COLORS: Record<CareerResult['type'], string> = {
  FAILURE: '#ef4444',
  NORMAL: '#3b82f6',
  SUCCESS: '#22c55e',
  LEGENDARY: '#f59e0b',
};

const TIER_GRADIENTS: Record<CareerResult['type'], [string, string, string]> = {
  FAILURE: ['#1a0505', '#2d0a0a', '#0f0808'],
  NORMAL: ['#050e1a', '#0a1a2d', '#08101f'],
  SUCCESS: ['#051a0a', '#0a2d14', '#081f0f'],
  LEGENDARY: ['#1a150a', '#2d2010', '#1f1808'],
};

const TIER_SHARE_TEXTS: Record<CareerResult['type'], string> = {
  LEGENDARY: '18 yilda efsane oldum. Sen de dene!',
  SUCCESS: 'Hayatim guzel gitti. Seninki nasil olur?',
  NORMAL: 'Fena degildi. Ama bir dahaki sefere...',
  FAILURE: 'Bu hayat beni yendi. Tekrar deniyorum!',
};

const ZODIAC_LABELS: Record<ZodiacSign, string> = {
  KOC: 'Koc',
  BOGA: 'Boga',
  IKIZLER: 'Ikizler',
  YENGEC: 'Yengec',
  ASLAN: 'Aslan',
  BASAK: 'Basak',
  TERAZI: 'Terazi',
  AKREP: 'Akrep',
  YAY: 'Yay',
  OGLAK: 'Oglak',
  KOVA: 'Kova',
  BALIK: 'Balik',
};

const ZODIAC_COLORS: Record<ZodiacSign, string> = {
  KOC: '#ef4444',
  BOGA: '#16a34a',
  IKIZLER: '#f97316',
  YENGEC: '#22c55e',
  ASLAN: '#f59e0b',
  BASAK: '#84cc16',
  TERAZI: '#ec4899',
  AKREP: '#a855f7',
  YAY: '#fb7185',
  OGLAK: '#6366f1',
  KOVA: '#0ea5e9',
  BALIK: '#14b8a6',
};

const TRAIT_EMOJIS = ['\u26A1', '\u{1F3A8}', '\u{1F4DA}'];

export const ShareCard: React.FC<ShareCardProps> = ({
  playerName,
  age,
  zodiacSign,
  tier,
  endingTitle,
  traitIds,
  legacyLevel,
  topMemories,
  closestNpcName,
}) => {
  const zodiacLabel = zodiacSign ? ZODIAC_LABELS[zodiacSign] : 'Bilinmiyor';
  const zodiacColor = zodiacSign ? ZODIAC_COLORS[zodiacSign] : '#94a3b8';
  const tierColor = TIER_COLORS[tier];
  const tierLabel = TIER_LABELS[tier];
  const shareText = TIER_SHARE_TEXTS[tier];
  const gradientColors = TIER_GRADIENTS[tier];

  const topTraits = useMemo(() => (
    traitIds.slice(0, 3).map((traitId, index) => ({
      id: traitId,
      label: getTraitName(traitId),
      icon: TRAIT_EMOJIS[index] || '\u2728',
    }))
  ), [traitIds]);

  return (
    <View
      style={{
        width: 340,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: `${tierColor}44`,
      }}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        {/* Header — Branding */}
        <View style={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 14 }}>
          <Text style={{ color: tierColor, fontWeight: '900', fontSize: 24, textAlign: 'center', letterSpacing: 1.2 }}>
            YAZGI
          </Text>
          <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 2, fontSize: 12 }}>
            Kaderini sen yaz.
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: `${tierColor}33` }} />

        {/* Player Info */}
        <View style={{ paddingHorizontal: 18, paddingVertical: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: '#f8fafc', fontSize: 20, fontWeight: '800' }}>
                {playerName}
              </Text>
              <Text style={{ color: zodiacColor, marginTop: 2, fontWeight: '700', fontSize: 13 }}>
                {zodiacLabel}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#cbd5e1', fontSize: 13 }}>
                {age} yasinda
              </Text>
              <Text style={{ color: '#93c5fd', fontWeight: '700', fontSize: 12, marginTop: 2 }}>
                {'\u{1F3DB}\uFE0F'} Miras Lv.{legacyLevel}
              </Text>
            </View>
          </View>

          {/* Tier Badge */}
          <View
            style={{
              marginTop: 14,
              borderWidth: 1.5,
              borderColor: `${tierColor}66`,
              backgroundColor: `${tierColor}18`,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <Text style={{ color: tierColor, fontWeight: '900', fontSize: 16 }}>
              {'\u{1F3C6}'} {tierLabel}
            </Text>
            <Text style={{ color: '#f8fafc', marginTop: 3, fontSize: 14 }} numberOfLines={1}>
              {endingTitle}
            </Text>
          </View>

          {/* Traits */}
          {topTraits.length > 0 ? (
            <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap' }}>
              {topTraits.map((trait, index) => (
                <View
                  key={`${trait.id}_${index}`}
                  style={{
                    borderRadius: 999,
                    backgroundColor: `${tierColor}12`,
                    borderWidth: 1,
                    borderColor: `${tierColor}33`,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    marginRight: 6,
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ color: '#dbeafe', fontSize: 12, fontWeight: '700' }}>
                    {trait.icon} {trait.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Closest NPC */}
          {closestNpcName ? (
            <Text style={{ color: '#a5b4fc', marginTop: 8, fontSize: 12, fontWeight: '600' }}>
              {'\u2764\uFE0F'} En yakin: {closestNpcName}
            </Text>
          ) : null}

          {/* Top Memories */}
          {topMemories && topMemories.length > 0 ? (
            <View style={{ marginTop: 10 }}>
              {topMemories.slice(0, 2).map((memory, idx) => (
                <Text
                  key={`mem_${idx}`}
                  style={{ color: '#94a3b8', fontSize: 11, fontStyle: 'italic', marginTop: 2 }}
                  numberOfLines={1}
                >
                  {'\u{1F4AD}'} {memory}
                </Text>
              ))}
            </View>
          ) : null}
        </View>

        <View style={{ height: 1, backgroundColor: `${tierColor}33` }} />

        {/* Footer — Share text + CTA */}
        <View style={{ paddingHorizontal: 18, paddingVertical: 12 }}>
          <Text style={{ color: '#e2e8f0', textAlign: 'center', fontSize: 13, fontWeight: '600' }}>
            {shareText}
          </Text>
          <Text style={{ color: '#64748b', textAlign: 'center', fontSize: 11, marginTop: 4 }}>
            {'yazgi.app'}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};
