import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { CareerResult, ZodiacSign } from '../types';
import { getTraitName } from '../data/traits';
import { getThemeTokens } from '../utils/themeUtils';

interface ShareCardProps {
  theme: ReturnType<typeof getThemeTokens>;
  playerName: string;
  age: number;
  zodiacSign?: ZodiacSign | null;
  tier: CareerResult['type'];
  endingTitle: string;
  traitIds: string[];
  legacyLevel: number;
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
  theme,
  playerName,
  age,
  zodiacSign,
  tier,
  endingTitle,
  traitIds,
  legacyLevel,
}) => {
  const zodiacLabel = zodiacSign ? ZODIAC_LABELS[zodiacSign] : 'Bilinmiyor';
  const zodiacColor = zodiacSign ? ZODIAC_COLORS[zodiacSign] : theme.accentStat;
  const tierColor = TIER_COLORS[tier];
  const tierLabel = TIER_LABELS[tier];

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
        backgroundColor: '#091122',
        borderWidth: 1,
        borderColor: '#22324d',
        overflow: 'hidden',
      }}
    >
      <View style={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 14 }}>
        <Text style={{ color: '#f8fafc', fontWeight: '900', fontSize: 22, textAlign: 'center', letterSpacing: 0.8 }}>
          YAZGI
        </Text>
        <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 2, fontSize: 12 }}>
          Kaderini sen yaz.
        </Text>
      </View>

      <View style={{ height: 1, backgroundColor: '#1e2f4b' }} />

      <View style={{ paddingHorizontal: 18, paddingVertical: 16 }}>
        <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: '800' }}>
          {playerName}
        </Text>
        <Text style={{ color: zodiacColor, marginTop: 2, fontWeight: '700' }}>
          {zodiacLabel}
        </Text>
        <Text style={{ color: '#cbd5e1', marginTop: 6 }}>
          {age} yasinda son buldu
        </Text>

        <View
          style={{
            marginTop: 14,
            borderWidth: 1,
            borderColor: `${tierColor}99`,
            backgroundColor: `${tierColor}22`,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: tierColor, fontWeight: '900' }}>
            {'\u{1F3C6}'} {tierLabel}
          </Text>
          <Text style={{ color: '#f8fafc', marginTop: 2 }} numberOfLines={1}>
            {endingTitle}
          </Text>
        </View>

        {topTraits.length > 0 ? (
          <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap' }}>
            {topTraits.map((trait, index) => (
              <View
                key={`${trait.id}_${index}`}
                style={{
                  borderRadius: 999,
                  backgroundColor: '#101d33',
                  borderWidth: 1,
                  borderColor: '#243758',
                  paddingHorizontal: 9,
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

        <Text style={{ color: '#93c5fd', marginTop: 10, fontWeight: '700' }}>
          {'\u{1F3DB}\uFE0F'} Miras Seviyesi: {legacyLevel}
        </Text>
      </View>

      <View style={{ height: 1, backgroundColor: '#1e2f4b' }} />
      <View style={{ paddingHorizontal: 18, paddingVertical: 12 }}>
        <Text style={{ color: '#94a3b8', textAlign: 'center', fontSize: 12 }}>
          {'Sen de dene -> yazgi.app'}
        </Text>
      </View>
    </View>
  );
};
