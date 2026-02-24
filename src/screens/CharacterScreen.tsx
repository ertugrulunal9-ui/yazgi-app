import React from 'react';
import { View, Text, ViewStyle, TouchableOpacity } from 'react-native';
import { FadeInUpView } from '../animations';
import { getLetterGrade, calculateGradeAverage } from '../utils/schoolLogic';
import { Family, FamilyEvolutionState, PersonalityState, Stats, Skills, SchoolGrades } from '../types';
import { ensureTextContrast } from '../utils/colorContrast';
import { getFamilyAtmosphereLabel } from '../utils/familyNarrative';
import { getTraitName } from '../data/traits';
import { ProgressBonus } from '../components/ProgressBonus';
import { tRuntime } from '../i18n/strings';

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

const STAT_CONFIG: Array<{
  key: keyof Stats;
  labelKey: string;
  fallbackLabel: string;
  emoji: string;
  color: string;
  max: number;
}> = [
  { key: 'health', labelKey: 'labels.stats.health', fallbackLabel: 'Saglik', emoji: '\u2764\uFE0F', color: '#ef4444', max: 100 },
  { key: 'energy', labelKey: 'labels.stats.energy', fallbackLabel: 'Enerji', emoji: '\u26A1', color: '#ca8a04', max: 100 },
  { key: 'intelligence', labelKey: 'labels.stats.intelligence', fallbackLabel: 'Zeka', emoji: '\u{1F9E0}', color: '#2563eb', max: 100 },
  { key: 'charisma', labelKey: 'labels.stats.charisma', fallbackLabel: 'Karizma', emoji: '\u2728', color: '#7e22ce', max: 100 },
  { key: 'discipline', labelKey: 'labels.stats.discipline', fallbackLabel: 'Disiplin', emoji: '\u{1F4DA}', color: '#0f766e', max: 100 },
  { key: 'familyRelation', labelKey: 'labels.stats.familyRelation', fallbackLabel: 'Aile Iliskisi', emoji: '\u{1F46A}', color: '#be185d', max: 100 },
];

const SUBJECT_CONFIG: Array<{
  key: keyof SchoolGrades;
  labelKey: string;
  fallbackLabel: string;
  emoji: string;
  color: string;
}> = [
  { key: 'math', labelKey: 'labels.grades.math', fallbackLabel: 'Matematik', emoji: '\u{1F522}', color: '#2563eb' },
  { key: 'turkish', labelKey: 'labels.grades.turkish', fallbackLabel: 'Turkce', emoji: '\u{1F4DD}', color: '#7e22ce' },
  { key: 'science', labelKey: 'labels.grades.science', fallbackLabel: 'Fen Bilgisi', emoji: '\u{1F52C}', color: '#047857' },
  { key: 'language', labelKey: 'labels.grades.language', fallbackLabel: 'Yabanci Dil', emoji: '\u{1F30D}', color: '#b45309' },
  { key: 'history', labelKey: 'labels.grades.history', fallbackLabel: 'Tarih', emoji: '\u{1F4DC}', color: '#be185d' },
  { key: 'geography', labelKey: 'labels.grades.geography', fallbackLabel: 'Cografya', emoji: '\u{1F5FA}\uFE0F', color: '#0e7490' },
  { key: 'art', labelKey: 'labels.grades.art', fallbackLabel: 'Gorsel Sanatlar', emoji: '\u{1F3A8}', color: '#c2410c' },
  { key: 'music', labelKey: 'labels.grades.music', fallbackLabel: 'Muzik', emoji: '\u{1F3B5}', color: '#15803d' },
];

type PassiveBonusKey =
  | 'sportsEnergy'
  | 'sportsHealth'
  | 'schoolEnergy'
  | 'schoolIntelligence'
  | 'mathScienceGrade'
  | 'languageGrade'
  | 'writingIntelligence'
  | 'artCharisma'
  | 'socialEnergy'
  | 'relationshipGain'
  | 'computerEnergy'
  | 'codingIntelligence'
  | 'designCharisma'
  | 'workEnergy'
  | 'workIncome'
  | 'shoppingDiscount';

const getPassiveBonusLabel = (key: PassiveBonusKey): string => tRuntime(
  `character.screen.passiveBonus.${key}`,
  undefined,
  key
);

const getFamilyWealthLabel = (wealth: Family['wealth']): string => {
  switch (wealth) {
    case 'POOR':
      return tRuntime('character.screen.family.wealth.POOR', undefined, 'Dar Gelirli');
    case 'RICH':
      return tRuntime('character.screen.family.wealth.RICH', undefined, 'Varlikli');
    default:
      return tRuntime('character.screen.family.wealth.MIDDLE', undefined, 'Orta Halli');
  }
};

const getFamilyDynamicLabel = (dynamic: Family['dynamic']): string => {
  switch (dynamic) {
    case 'STRICT':
      return tRuntime('character.screen.family.dynamic.STRICT', undefined, 'Otoriter');
    case 'CHAOTIC':
      return tRuntime('character.screen.family.dynamic.CHAOTIC', undefined, 'Kaotik');
    default:
      return tRuntime('character.screen.family.dynamic.SUPPORTIVE', undefined, 'Destekleyici');
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
  const statConfig = STAT_CONFIG.map(stat => ({
    ...stat,
    max: stat.key === 'energy' ? Math.max(1, maxEnergy) : stat.max,
    label: tRuntime(stat.labelKey, undefined, stat.fallbackLabel),
  }));

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

  pushBonus(getPassiveBonusLabel('sportsEnergy'), -15 * athleticsRatio);
  pushBonus(getPassiveBonusLabel('sportsHealth'), 20 * athleticsRatio);
  pushBonus(getPassiveBonusLabel('schoolEnergy'), -8 * logicRatio);
  pushBonus(getPassiveBonusLabel('schoolIntelligence'), 20 * logicRatio);
  pushBonus(getPassiveBonusLabel('mathScienceGrade'), 15 * logicRatio);
  pushBonus(getPassiveBonusLabel('languageGrade'), 15 * readingRatio);
  pushBonus(getPassiveBonusLabel('writingIntelligence'), 15 * writingRatio);
  pushBonus(getPassiveBonusLabel('artCharisma'), 15 * artRatio);
  pushBonus(getPassiveBonusLabel('socialEnergy'), -8 * teamworkRatio);
  pushBonus(getPassiveBonusLabel('relationshipGain'), 20 * teamworkRatio);
  pushBonus(getPassiveBonusLabel('computerEnergy'), -8 * codingRatio);
  pushBonus(getPassiveBonusLabel('codingIntelligence'), 12 * codingRatio);
  pushBonus(getPassiveBonusLabel('designCharisma'), 12 * designRatio);
  pushBonus(getPassiveBonusLabel('workEnergy'), -8 * workEthicRatio);
  pushBonus(getPassiveBonusLabel('workIncome'), 20 * combinedWorkRatio);
  pushBonus(getPassiveBonusLabel('shoppingDiscount'), -15 * businessRatio);

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
      <CharacterSection
        title={tRuntime('character.screen.sections.stats', undefined, 'Karakter Statlari')}
        icon={'\u{1F4CA}'}
        cardStyle={cardStyle}
        theme={theme}
      >
        {statConfig.map((stat, index) => {
          const value = stats[stat.key] || 0;
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
            <Text style={{ fontSize: 18 }}>{'\u{1F4B0}'}</Text>
            <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 14 }}>
              {tRuntime('labels.stats.money', undefined, 'Para')}
            </Text>
          </View>
          <Text style={{ color: ensureTextContrast('#15803d', theme.surfaceBase, 4.5), fontWeight: '700', fontSize: 18 }}>
            \u20BA{stats.money}
          </Text>
        </View>
      </CharacterSection>

      <CharacterSection
        title={tRuntime('character.screen.sections.momentum', undefined, 'Davranissal Ivme')}
        icon=">>"
        cardStyle={cardStyle}
        theme={theme}
      >
        <View style={{ gap: 10 }}>
          <ProgressBonus personalityState={personalityState} tendency="HELPFUL" />
          <ProgressBonus personalityState={personalityState} tendency="PRAGMATIC" />
          <ProgressBonus personalityState={personalityState} tendency="AGGRESSIVE" />
        </View>
        <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 10 }}>
          {tRuntime(
            'character.screen.momentumHint',
            undefined,
            'Tutarli secimler ivme yaratir: ozel eventler ve etiketli diyalog secenekleri acilir.'
          )}
        </Text>
      </CharacterSection>

      {family ? (
        <CharacterSection
          title={tRuntime('character.screen.sections.family', undefined, 'Aile Durumu')}
          icon={'\u{1F3E1}'}
          cardStyle={cardStyle}
          theme={theme}
        >
          <View style={{
            backgroundColor: theme.surfaceOverlay,
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: theme.border,
            gap: 10,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                {tRuntime('character.screen.family.economic', undefined, 'Ekonomik')}
              </Text>
              <Text style={{ color: familyWealthColor, fontWeight: '700', fontSize: 13 }}>
                {getFamilyWealthLabel(family.wealth)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                {tRuntime('character.screen.family.dynamicLabel', undefined, 'Dinamik')}
              </Text>
              <Text style={{ color: familyDynamicColor, fontWeight: '700', fontSize: 13 }}>
                {getFamilyDynamicLabel(family.dynamic)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                {tRuntime('character.screen.family.atmosphere', undefined, 'Atmosfer')}
              </Text>
              <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 13 }}>
                {familyAtmosphere}
              </Text>
            </View>
            <View style={{ marginTop: 2, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.border }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                {tRuntime(
                  'character.screen.family.allowanceBase',
                  { amount: family.allowance },
                  `Harclik Baz Tutari: \u20BA${family.allowance} / istek`
                )}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 4 }}>
                {tRuntime(
                  'character.screen.family.allowanceNote',
                  undefined,
                  'Not: Gercek miktar aile dinamikleri ve iliski puanina gore degisir.'
                )}
              </Text>
            </View>
          </View>
        </CharacterSection>
      ) : null}

      <CharacterSection
        title={tRuntime('character.screen.sections.traits', undefined, 'Ozellikler')}
        icon={'\u2728'}
        cardStyle={cardStyle}
        theme={theme}
      >
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
            {tRuntime('character.screen.noTraits', undefined, 'Henuz ozellik kazanmadin')}
          </Text>
        )}
      </CharacterSection>

      {achievementSummary ? (
        <CharacterSection
          title={tRuntime('character.screen.sections.achievements', undefined, 'Basarilar')}
          icon={'\u{1F3C6}'}
          cardStyle={cardStyle}
          theme={theme}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View>
              <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 16 }}>
                {tRuntime(
                  'character.screen.achievements.unlockedSummary',
                  { unlocked: achievementSummary.unlocked, total: achievementSummary.total },
                  `${achievementSummary.unlocked}/${achievementSummary.total} Acildi`
                )}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>
                {tRuntime(
                  'character.screen.achievements.completion',
                  { percentage: achievementSummary.percentage },
                  `%${achievementSummary.percentage} tamamlandi`
                )}
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
              accessibilityLabel={tRuntime('character.screen.achievements.openAria', undefined, 'Basarilari goruntule')}
              accessibilityHint={tRuntime('character.screen.achievements.openHint', undefined, 'Acilan panelde tum basarimlarini ve ilerlemeni gosterir')}
              accessibilityRole="button"
            >
              <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 13 }}>
                {tRuntime('character.screen.achievements.openButton', undefined, 'Basarilari Gor')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </CharacterSection>
      ) : null}

      <CharacterSection
        title={tRuntime('character.screen.sections.passiveBonuses', undefined, 'Pasif Bonuslar')}
        icon={'\u{1F4A0}'}
        cardStyle={cardStyle}
        theme={theme}
      >
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
            {tRuntime('character.screen.noPassiveBonuses', undefined, 'Henuz pasif bonus yok')}
          </Text>
        )}
        <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 10, fontStyle: 'italic' }}>
          {'\u{1F4A1}'} {tRuntime('character.screen.passiveBonusHint', undefined, 'Bonuslar beceri seviyelerine gore otomatik uygulanir.')}
        </Text>
      </CharacterSection>

      {age >= 7 ? (
        <CharacterSection
          title={tRuntime('character.screen.sections.schoolGrades', undefined, 'Okul Notlari')}
          icon={'\u{1F4DA}'}
          cardStyle={cardStyle}
          theme={theme}
        >
          <View style={{
            backgroundColor: theme.surfaceOverlay,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            alignItems: 'center',
          }}>
            <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4 }}>
              {tRuntime('character.screen.school.average', undefined, 'Genel Ortalama')}
            </Text>
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
            const value = schoolGrades[subject.key] || 0;
            const percentage = Math.min(100, value);
            const letterGrade = getLetterGrade(value);
            const baseGradeColor = value >= 70 ? '#15803d' : value >= 50 ? '#b45309' : '#b91c1c';
            const gradeColor = ensureTextContrast(baseGradeColor, theme.surfaceBase, 4.5);
            const readableSubjectColor = ensureTextContrast(subject.color, theme.surfaceBase, 4.5);
            const subjectLabel = tRuntime(subject.labelKey, undefined, subject.fallbackLabel);

            return (
              <FadeInUpView key={subject.key} delay={index * 40}>
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 16 }}>{subject.emoji}</Text>
                      <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 13 }}>
                        {subjectLabel}
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
              {'\u{1F4A1}'} {tRuntime(
                'character.screen.school.hint',
                undefined,
                'Notlarini yukseltmek icin Okul kategorisinden ders calis veya sinavlara gir.'
              )}
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
