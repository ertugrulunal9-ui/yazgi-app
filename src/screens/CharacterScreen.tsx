import React from 'react';
import { View, Text, ViewStyle, TouchableOpacity } from 'react-native';
import { FadeInUpView } from '../animations';
import { getLetterGrade, calculateGradeAverage } from '../utils/schoolLogic';
import { Family, FamilyEvolutionState, PersonalityState, Stats, Skills, SchoolGrades } from '../types';
import { ensureTextContrast } from '../utils/colorContrast';
import { getFamilyAtmosphereLabel } from '../utils/familyNarrative';
import { getTraitName } from '../data/traits';
import { ProgressBonus } from '../components/ProgressBonus';

interface ThemeTokens {
  textPrimary: string;
  textSecondary: string;
  surfaceOverlay: string;
  border: string;
  accentEvent: string;
  surfaceBase: string;
}

interface CharacterScreenProps {
  stats: Stats;
  traits: string[];
  skills: Skills;
  schoolGrades: SchoolGrades;
  personalityState: Partial<PersonalityState> | undefined;
  age: number;
  maxEnergy: number;
  family?: Family | null;
  familyEvolution?: FamilyEvolutionState;
  theme: ThemeTokens;
  cardStyle: ViewStyle;
  onOpenAchievements?: () => void;
  achievementSummary?: {
    unlocked: number;
    total: number;
    percentage: number;
  };
}

interface CharacterSectionProps {
  title: string;
  icon?: string;
  cardStyle: ViewStyle;
  theme: ThemeTokens;
  children: React.ReactNode;
}

interface CharacterSectionTitleProps {
  title: string;
  icon?: string;
  theme: ThemeTokens;
}

const STAT_CONFIG = [
  { key: 'health', label: 'Saglik', emoji: '❤️', color: '#ef4444', max: 100 },
  { key: 'energy', label: 'Enerji', emoji: '⚡', color: '#ca8a04', max: 100 },
  { key: 'intelligence', label: 'Zeka', emoji: '🧠', color: '#2563eb', max: 100 },
  { key: 'charisma', label: 'Karizma', emoji: '✨', color: '#7e22ce', max: 100 },
  { key: 'discipline', label: 'Disiplin', emoji: '📚', color: '#0f766e', max: 100 },
  { key: 'familyRelation', label: 'Aile Iliskisi', emoji: '👨‍👩‍👧', color: '#be185d', max: 100 },
] as const;

const SUBJECT_CONFIG = [
  { key: 'math', label: 'Matematik', emoji: '🔢', color: '#2563eb' },
  { key: 'turkish', label: 'Turkce', emoji: '📝', color: '#7e22ce' },
  { key: 'science', label: 'Fen Bilgisi', emoji: '🔬', color: '#047857' },
  { key: 'language', label: 'Yabanci Dil', emoji: '🌍', color: '#b45309' },
  { key: 'history', label: 'Tarih', emoji: '📜', color: '#be185d' },
  { key: 'geography', label: 'Cografya', emoji: '🗺️', color: '#0e7490' },
  { key: 'art', label: 'Gorsel Sanatlar', emoji: '🎨', color: '#c2410c' },
  { key: 'music', label: 'Muzik', emoji: '🎵', color: '#15803d' },
] as const;

const getFamilyWealthLabel = (wealth: Family['wealth']): string => {
  switch (wealth) {
    case 'POOR':
      return 'Dar Gelirli';
    case 'RICH':
      return 'Varlikli';
    default:
      return 'Orta Halli';
  }
};

const getFamilyDynamicLabel = (dynamic: Family['dynamic']): string => {
  switch (dynamic) {
    case 'STRICT':
      return 'Otoriter';
    case 'CHAOTIC':
      return 'Kaotik';
    default:
      return 'Destekleyici';
  }
};

const CharacterSectionTitle: React.FC<CharacterSectionTitleProps> = ({ title, icon, theme }) => (
  <Text
    style={{
      color: theme.textPrimary,
      fontWeight: '700',
      marginBottom: 16,
      fontSize: 14,
      textTransform: 'uppercase',
      letterSpacing: 1,
    }}
  >
    {icon ? `${icon} ${title}` : title}
  </Text>
);

const CharacterSection: React.FC<CharacterSectionProps> = ({
  title,
  icon,
  cardStyle,
  theme,
  children,
}) => (
  <View style={cardStyle}>
    <CharacterSectionTitle title={title} icon={icon} theme={theme} />
    {children}
  </View>
);

const getReadableStatColor = (color: string, theme: ThemeTokens): string =>
  ensureTextContrast(color, theme.surfaceBase, 4.5);

const CharacterScreenRoot: React.FC<CharacterScreenProps> = ({
  stats,
  traits,
  skills,
  schoolGrades,
  personalityState,
  age,
  maxEnergy,
  family,
  familyEvolution,
  theme,
  cardStyle,
  onOpenAchievements,
  achievementSummary,
}) => {
  const statConfig = STAT_CONFIG.map(stat =>
    stat.key === 'energy' ? { ...stat, max: Math.max(1, maxEnergy) } : stat
  );

  const getSkillRatio = (value: number) => Math.max(0, Math.min(1, value / 100));
  const athleticsRatio = getSkillRatio(skills.athletics);
  const logicRatio = getSkillRatio(skills.logic);
  const readingRatio = getSkillRatio(skills.reading);
  const teamworkRatio = getSkillRatio(skills.teamwork);
  const artRatio = getSkillRatio(skills.art);
  const writingRatio = getSkillRatio(skills.writing);
  const workEthicRatio = getSkillRatio(skills.work_ethic);
  const businessRatio = getSkillRatio(skills.business);
  const codingRatio = getSkillRatio(skills.coding);
  const designRatio = getSkillRatio(skills.design);
  const combinedWorkRatio = Math.max(workEthicRatio, businessRatio);

  const passiveBonuses: { label: string; percent: number }[] = [];
  const pushBonus = (label: string, percent: number) => {
    const rounded = Math.round(percent);
    if (rounded !== 0) {
      passiveBonuses.push({ label, percent: rounded });
    }
  };

  pushBonus('Spor Enerji', -15 * athleticsRatio);
  pushBonus('Spor Saglik', 20 * athleticsRatio);
  pushBonus('Okul Enerji', -8 * logicRatio);
  pushBonus('Okul Zeka', 20 * logicRatio);
  pushBonus('Mat/Fen Notu', 15 * logicRatio);
  pushBonus('Dil Notu', 15 * readingRatio);
  pushBonus('Yazma Zeka', 15 * writingRatio);
  pushBonus('Sanat Karizma', 15 * artRatio);
  pushBonus('Sosyal Enerji', -8 * teamworkRatio);
  pushBonus('Iliski Kazanimi', 20 * teamworkRatio);
  pushBonus('Bilgisayar Enerji', -8 * codingRatio);
  pushBonus('Kodlama Zeka', 12 * codingRatio);
  pushBonus('Tasarim Karizma', 12 * designRatio);
  pushBonus('Is Enerji', -8 * workEthicRatio);
  pushBonus('Is Geliri', 20 * combinedWorkRatio);
  pushBonus('Alisveris Indirim', -15 * businessRatio);

  const averageGrade = calculateGradeAverage(schoolGrades);
  const readableAccentEvent = ensureTextContrast(theme.accentEvent, theme.surfaceBase, 4.5);
  const familyAtmosphere = getFamilyAtmosphereLabel(family || null, stats.familyRelation, familyEvolution);
  const familyWealthColor = family?.wealth === 'RICH'
    ? ensureTextContrast('#15803d', theme.surfaceOverlay, 4.5)
    : family?.wealth === 'POOR'
      ? ensureTextContrast('#b91c1c', theme.surfaceOverlay, 4.5)
      : ensureTextContrast('#1d4ed8', theme.surfaceOverlay, 4.5);
  const familyDynamicColor = family?.dynamic === 'STRICT'
    ? ensureTextContrast('#ca8a04', theme.surfaceOverlay, 4.5)
    : family?.dynamic === 'CHAOTIC'
      ? ensureTextContrast('#b45309', theme.surfaceOverlay, 4.5)
      : ensureTextContrast('#0f766e', theme.surfaceOverlay, 4.5);

  return (
    <FadeInUpView delay={100}>
      <CharacterSection title="Karakter Statlari" icon="📊" cardStyle={cardStyle} theme={theme}>
        {statConfig.map((stat, index) => {
          const value = stats[stat.key as keyof Stats] || 0;
          const percentage = Math.min(100, (Number(value) / Math.max(1, stat.max)) * 100);
          const readableColor = getReadableStatColor(stat.color, theme);

          return (
            <FadeInUpView key={stat.key} delay={index * 40}>
              <View style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 16 }}>{stat.emoji}</Text>
                    <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 13 }}>
                      {stat.label}
                    </Text>
                  </View>
                  <Text style={{ color: readableColor, fontWeight: '700', fontSize: 13 }}>
                    {Math.round(Number(value))}/{stat.max}
                  </Text>
                </View>
                <View style={{
                  height: 8,
                  backgroundColor: theme.surfaceOverlay,
                  borderRadius: 4,
                  overflow: 'hidden',
                }}>
                  <View style={{
                    height: '100%',
                    width: `${percentage}%`,
                    backgroundColor: readableColor,
                    borderRadius: 4,
                  }} />
                </View>
              </View>
            </FadeInUpView>
          );
        })}

        <View style={{
          marginTop: 8,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 18 }}>💰</Text>
            <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 14 }}>Para</Text>
          </View>
          <Text style={{ color: ensureTextContrast('#15803d', theme.surfaceBase, 4.5), fontWeight: '700', fontSize: 18 }}>
            ₺{stats.money}
          </Text>
        </View>
      </CharacterSection>

      <CharacterSection title="Davranissal Ivme" icon=">>" cardStyle={cardStyle} theme={theme}>
        <View style={{ gap: 10 }}>
          <ProgressBonus personalityState={personalityState} tendency="HELPFUL" />
          <ProgressBonus personalityState={personalityState} tendency="PRAGMATIC" />
          <ProgressBonus personalityState={personalityState} tendency="AGGRESSIVE" />
        </View>
        <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 10 }}>
          Tutarli secimler ivme yaratir: ozel eventler ve etiketli diyalog secenekleri acilir.
        </Text>
      </CharacterSection>

      {family ? (
        <CharacterSection title="Aile Durumu" icon="🏡" cardStyle={cardStyle} theme={theme}>
          <View style={{
            backgroundColor: theme.surfaceOverlay,
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 10,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Ekonomik</Text>
              <Text style={{ color: familyWealthColor, fontWeight: '700', fontSize: 13 }}>
                {getFamilyWealthLabel(family.wealth)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Dinamik</Text>
              <Text style={{ color: familyDynamicColor, fontWeight: '700', fontSize: 13 }}>
                {getFamilyDynamicLabel(family.dynamic)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Atmosfer</Text>
              <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 13 }}>
                {familyAtmosphere}
              </Text>
            </View>
            <View style={{ marginTop: 2, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.border }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                Harclik Baz Tutari: ₺{family.allowance} / istek
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 4 }}>
                Not: Gercek miktar aile dinamikleri ve iliski puanina gore degisir.
              </Text>
            </View>
          </View>
        </CharacterSection>
      ) : null}

      <CharacterSection title="Ozellikler" icon="✨" cardStyle={cardStyle} theme={theme}>
        {traits.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {traits.map((traitId, index) => (
              <FadeInUpView key={traitId} delay={index * 50}>
                <View style={{
                  backgroundColor: `${readableAccentEvent}20`,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: `${readableAccentEvent}45`,
                }}>
                  <Text style={{ color: readableAccentEvent, fontWeight: '600', fontSize: 12 }}>
                    {getTraitName(traitId)}
                  </Text>
                </View>
              </FadeInUpView>
            ))}
          </View>
        ) : (
          <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>
            Henuz ozellik kazanmadin
          </Text>
        )}
      </CharacterSection>
      {achievementSummary ? (
        <CharacterSection title="Basarilar" icon="🏆" cardStyle={cardStyle} theme={theme}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View>
              <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 16 }}>
                {achievementSummary.unlocked}/{achievementSummary.total} Acildi
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>
                %{achievementSummary.percentage} tamamlandi
              </Text>
            </View>
            <View style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              borderWidth: 4,
              borderColor: readableAccentEvent,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${readableAccentEvent}10`,
            }}>
              <Text style={{ color: readableAccentEvent, fontWeight: '800', fontSize: 16 }}>
                %{achievementSummary.percentage}
              </Text>
            </View>
          </View>
          {onOpenAchievements ? (
            <TouchableOpacity
              onPress={onOpenAchievements}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.surfaceOverlay,
                alignItems: 'center',
              }}
              accessibilityLabel="Basarilari goruntule"
              accessibilityHint="Acilan panelde tum basarimlarini ve ilerlemeni gosterir"
              accessibilityRole="button"
            >
              <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 13 }}>
                Basarilari Gor
              </Text>
            </TouchableOpacity>
          ) : null}
        </CharacterSection>
      ) : null}

      <CharacterSection title="Pasif Bonuslar" icon="💠" cardStyle={cardStyle} theme={theme}>
        {passiveBonuses.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {passiveBonuses.map((bonus, index) => {
              const bonusColor = bonus.percent < 0 ? '#0f766e' : '#166534';
              const readableBonusColor = ensureTextContrast(bonusColor, theme.surfaceOverlay, 4.5);

              return (
                <FadeInUpView key={`${bonus.label}-${index}`} delay={index * 20}>
                  <View style={{
                    backgroundColor: theme.surfaceOverlay,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: theme.border,
                    minWidth: 120,
                  }}>
                    <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 12 }}>
                      {bonus.label}
                    </Text>
                    <Text style={{
                      color: readableBonusColor,
                      fontWeight: '700',
                      fontSize: 12,
                      marginTop: 2,
                    }}>
                      {bonus.percent > 0 ? `+${bonus.percent}%` : `${bonus.percent}%`}
                    </Text>
                  </View>
                </FadeInUpView>
              );
            })}
          </View>
        ) : (
          <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>
            Henuz pasif bonus yok
          </Text>
        )}
        <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 10, fontStyle: 'italic' }}>
          💡 Bonuslar beceri seviyelerine gore otomatik uygulanir.
        </Text>
      </CharacterSection>

      {age >= 7 ? (
        <CharacterSection title="Okul Notlari" icon="📚" cardStyle={cardStyle} theme={theme}>
          <View style={{
            backgroundColor: theme.surfaceOverlay,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            alignItems: 'center',
          }}>
            <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4 }}>Genel Ortalama</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Text style={{
                fontSize: 36,
                fontWeight: '800',
                color: ensureTextContrast(
                  averageGrade >= 70 ? '#15803d' : averageGrade >= 50 ? '#b45309' : '#b91c1c',
                  theme.surfaceOverlay,
                  4.5
                ),
              }}>
                {Math.round(averageGrade)}
              </Text>
              <Text style={{
                fontSize: 24,
                fontWeight: '700',
                color: ensureTextContrast(
                  averageGrade >= 70 ? '#15803d' : averageGrade >= 50 ? '#b45309' : '#b91c1c',
                  theme.surfaceOverlay,
                  4.5
                ),
              }}>
                ({getLetterGrade(averageGrade)})
              </Text>
            </View>
          </View>

          {SUBJECT_CONFIG.map((subject, index) => {
            const value = schoolGrades[subject.key as keyof SchoolGrades] || 0;
            const percentage = Math.min(100, value);
            const letterGrade = getLetterGrade(value);
            const baseGradeColor = value >= 70 ? '#15803d' : value >= 50 ? '#b45309' : '#b91c1c';
            const gradeColor = ensureTextContrast(baseGradeColor, theme.surfaceBase, 4.5);
            const readableSubjectColor = ensureTextContrast(subject.color, theme.surfaceBase, 4.5);

            return (
              <FadeInUpView key={subject.key} delay={index * 40}>
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 16 }}>{subject.emoji}</Text>
                      <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 13 }}>
                        {subject.label}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                        {Math.round(value)}
                      </Text>
                      <View style={{
                        backgroundColor: `${gradeColor}20`,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: `${gradeColor}50`,
                      }}>
                        <Text style={{ color: gradeColor, fontWeight: '700', fontSize: 12 }}>
                          {letterGrade}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{
                    height: 6,
                    backgroundColor: theme.surfaceOverlay,
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                    <View style={{
                      height: '100%',
                      width: `${percentage}%`,
                      backgroundColor: readableSubjectColor,
                      borderRadius: 3,
                    }} />
                  </View>
                </View>
              </FadeInUpView>
            );
          })}

          <View style={{
            marginTop: 8,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}>
            <Text style={{ color: theme.textSecondary, fontSize: 11, fontStyle: 'italic', textAlign: 'center' }}>
              💡 Notlarini yukseltmek icin Okul kategorisinden ders calis veya sinavlara gir.
            </Text>
          </View>
        </CharacterSection>
      ) : null}
    </FadeInUpView>
  );
};

type CharacterScreenCompound = React.FC<CharacterScreenProps> & {
  Section: React.FC<CharacterSectionProps>;
  SectionTitle: React.FC<CharacterSectionTitleProps>;
};

export const CharacterScreen = Object.assign(CharacterScreenRoot, {
  Section: CharacterSection,
  SectionTitle: CharacterSectionTitle,
}) as CharacterScreenCompound;
