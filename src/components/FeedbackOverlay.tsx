import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { FadeInUpView } from '../animations';
import { AnimatedButton } from '../animations/ButtonAnimations';
import { Choice, FateState, GameEvent, Personality, ResultData, Skills, Stats } from '../types';
import { Card, StatChange, TypewriterText } from './ui';
import { FateTokenDisplay, hasNegativeOutcome } from './FateTokenDisplay';
import { TraitProgressChip } from './TraitProgressChip';
import { buildPrimaryFeedbackMessage, EventOutcomeSummary } from '../utils/feedbackPrioritizer';

const STAT_LABELS: Record<string, string> = {
  health: 'Saglik',
  energy: 'Enerji',
  intelligence: 'Zeka',
  charisma: 'Karizma',
  discipline: 'Disiplin',
  money: 'Para',
  familyRelation: 'Aile',
};

const SKILL_LABELS: Record<string, string> = {
  coding: 'Yazilim',
  music: 'Muzik',
  sports: 'Spor',
  design: 'Tasarim',
  athletics: 'Atletizm',
  logic: 'Mantik',
  reading: 'Okuma',
  teamwork: 'Takim',
  art: 'Sanat',
  writing: 'Yazarlik',
  work_ethic: 'Caliskanlik',
  business: 'Is',
};

const GRADE_LABELS: Record<string, string> = {
  math: 'Matematik',
  science: 'Fen Bilgisi',
  language: 'Dil',
  turkish: 'Turkce',
  history: 'Tarih',
  geography: 'Cografya',
  art: 'Sanat',
  music: 'Muzik',
};

const PERSONALITY_AXIS_LABELS: Record<keyof Personality, string> = {
  openness: 'Aciklik',
  courage: 'Cesaret',
  empathy: 'Empati',
  patience: 'Sabir',
  conformity: 'Uyum',
};

const CHOICE_TYPE_LABELS: Record<NonNullable<Choice['choiceType']>, string> = {
  PASSIVE: 'Guvenli tercih',
  CHALLENGE: 'Zorlayici tercih',
  BREAKDOWN: 'Stres patlamasi',
  NEUTRAL: 'Notr tercih',
};

const FATE_OUTCOME_LABELS: Record<string, string> = {
  BLESSED: 'Mukemmel sans',
  FORTUNATE: 'Iyi sans',
  NEUTRAL: 'Notr sans',
  UNLUCKY: 'Sanssiz',
  CURSED: 'Kotu sans',
};

interface FeedbackOverlayProps {
  theme: any;
  metrics: any;
  insets: { top: number; bottom: number };
  t: (key: string, params?: unknown, fallback?: string) => string;
  lastResult: ResultData | null;
  currentEvent: GameEvent | null;
  selectedChoice: Choice | null;
  stats: Stats;
  personality: Personality;
  skills: Skills;
  fate: FateState | undefined;
  canReroll: boolean;
  buttonEnabled: boolean;
  onContinue: () => void;
  onReroll: () => void;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = React.memo(({
  theme,
  metrics,
  insets,
  t,
  lastResult,
  currentEvent,
  selectedChoice,
  stats,
  personality,
  skills,
  fate,
  canReroll,
  buttonEnabled,
  onContinue,
  onReroll,
}) => {
  const overlayStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.appBg,
  }), [theme.appBg]);

  const scrollContentStyle = useMemo(() => ({
    paddingTop: Math.max(insets.top + 20, 60),
    paddingBottom: Math.max(insets.bottom + 20, 40),
  }), [insets.bottom, insets.top]);

  const scrollViewStyle = useMemo(() => ({
    flex: 1 as const,
    padding: metrics.pad,
  }), [metrics.pad]);

  const buttonStyle = useMemo(() => ({
    backgroundColor: theme.surfaceBase,
    padding: metrics.pad,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
  }), [metrics.pad, theme.border, theme.surfaceBase]);

  const buttonTextStyle = useMemo(() => ({
    color: theme.textPrimary,
    fontSize: metrics.font,
    fontWeight: '600' as const,
    lineHeight: Math.round(metrics.font * 1.4),
  }), [metrics.font, theme.textPrimary]);

  const priorityFeedback = useMemo(() => {
    if (!lastResult) return null;
    const changes = lastResult.changes ?? {};
    const gainedTrait = lastResult.traitChanges?.find(c => c.changeType === 'GAINED');

    let primaryStatLabel: string | undefined;
    let primaryStatDelta: number | undefined;
    const changedStats = Object.entries(changes).filter(
      (entry): entry is [string, number] => typeof entry[1] === 'number' && entry[1] !== 0
    );
    if (changedStats.length > 0) {
      const [topKey, topVal] = changedStats.reduce((a, b) =>
        Math.abs(a[1]) >= Math.abs(b[1]) ? a : b
      );
      primaryStatLabel = STAT_LABELS[topKey] ?? topKey;
      primaryStatDelta = topVal;
    }

    const summary: EventOutcomeSummary = {
      statChanges: changes,
      newStats: stats,
      newTraitId: gainedTrait?.traitId,
      newTraitName: gainedTrait?.traitId,
      fateOutcome: lastResult.fateRoll?.outcome,
      npcRelationChange: selectedChoice?.npcRelationChange,
      primaryStatLabel,
      primaryStatDelta,
    };
    return buildPrimaryFeedbackMessage(summary, lastResult.feedback ?? '');
  }, [lastResult, selectedChoice?.npcRelationChange, stats]);

  const outcomeDrivers = useMemo(() => {
    if (!lastResult) return [];

    const drivers: string[] = [];

    if (currentEvent?.personalityCategory) {
      drivers.push(`Event tipi: ${currentEvent.personalityCategory.toLowerCase()}`);
    }

    if (currentEvent?.challengesAxis) {
      const axis = currentEvent.challengesAxis;
      const axisValue = personality[axis];
      drivers.push(`${PERSONALITY_AXIS_LABELS[axis]} ekseni (${Math.round(axisValue)}) sonucu etkiledi`);
    }

    if (selectedChoice?.choiceType && selectedChoice.choiceType !== 'NEUTRAL') {
      drivers.push(`Secim tipi: ${CHOICE_TYPE_LABELS[selectedChoice.choiceType]}`);
    }

    if (selectedChoice?.reqStats) {
      const matchedStatReqs = Object.entries(selectedChoice.reqStats)
        .filter(([, value]) => typeof value === 'number')
        .map(([key, value]) => `${STAT_LABELS[key] ?? key} ${(stats[key as keyof Stats] ?? 0)}/${value}`);

      if (matchedStatReqs.length > 0) {
        drivers.push(`Stat kosulu: ${matchedStatReqs.slice(0, 2).join(', ')}`);
      }
    }

    if (selectedChoice?.reqSkills) {
      const matchedSkillReqs = Object.entries(selectedChoice.reqSkills)
        .filter(([, value]) => typeof value === 'number')
        .map(([key, value]) => `${SKILL_LABELS[key] ?? key} ${(skills[key as keyof Skills] ?? 0)}/${value}`);

      if (matchedSkillReqs.length > 0) {
        drivers.push(`Beceri kosulu: ${matchedSkillReqs.slice(0, 2).join(', ')}`);
      }
    }

    if (selectedChoice?.reqPersonality?.length) {
      const reqPreview = selectedChoice.reqPersonality
        .slice(0, 2)
        .map((req) => {
          const axisLabel = PERSONALITY_AXIS_LABELS[req.axis];
          const current = personality[req.axis];
          if (req.min !== undefined) return `${axisLabel} ${Math.round(current)}/${req.min}+`;
          if (req.max !== undefined) return `${axisLabel} ${Math.round(current)}/${req.max}-`;
          return axisLabel;
        })
        .join(', ');

      if (reqPreview) {
        drivers.push(`Kisilik kosulu: ${reqPreview}`);
      }
    }

    const fateRoll = lastResult.fateRoll;
    if (fateRoll) {
      const outcomeLabel = FATE_OUTCOME_LABELS[fateRoll.outcome] ?? fateRoll.outcome;
      drivers.push(`Kader etkisi: ${outcomeLabel} (rulo ${fateRoll.modifiedRoll})`);
    }

    return drivers.slice(0, 4);
  }, [currentEvent?.challengesAxis, currentEvent?.personalityCategory, lastResult, personality, selectedChoice, skills, stats]);

  const rawFeedback = lastResult?.feedback || t('event.defaultFeedback', undefined, 'Devam ediyorsun...');
  const wasDramatic = (currentEvent?.difficulty ?? 0) >= 4;
  const feedbackText = wasDramatic ? `Bu karar\u0131n hayat\u0131n\u0131 de\u011Fi\u015Ftirdi. ${rawFeedback}` : rawFeedback;

  return (
    <View style={overlayStyle}>
      <ScrollView
        style={scrollViewStyle}
        contentContainerStyle={scrollContentStyle}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        overScrollMode="never"
        bounces={false}
      >
        <Card style={{ marginBottom: 20, borderRadius: 16 }} padded>
          <TypewriterText
            text={feedbackText}
            speed={26}
            accessibilityLabel="Event sonucu"
            style={{
              color: theme.textPrimary,
              fontSize: 17,
              fontWeight: '500',
              lineHeight: 26,
            }}
          />
        </Card>

        {priorityFeedback?.secondary && (
          <View style={{
            marginBottom: 12,
            paddingVertical: 10,
            paddingHorizontal: 14,
            backgroundColor: stats.health < 15 || stats.energy < 10
              ? 'rgba(239, 68, 68, 0.12)'
              : theme.surfaceRaised,
            borderRadius: 10,
            borderLeftWidth: 3,
            borderLeftColor: stats.health < 15 || stats.energy < 10
              ? '#ef4444'
              : theme.accentBrand,
          }}>
            <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: '600' }}>
              {priorityFeedback.secondary}
            </Text>
          </View>
        )}

        {outcomeDrivers.length > 0 && (
          <Card style={{ marginBottom: 16, borderRadius: 14 }} padded>
            <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 8 }}>
              Neden bu sonuc?
            </Text>
            {outcomeDrivers.map((line, index) => (
              <Text
                key={`${line}_${index}`}
                style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: index === outcomeDrivers.length - 1 ? 0 : 4 }}
              >
                - {line}
              </Text>
            ))}
          </Card>
        )}

        {lastResult?.traitProgressUpdates && lastResult.traitProgressUpdates.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <TraitProgressChip
              traits={lastResult.traitProgressUpdates}
              theme={theme}
            />
          </View>
        )}

        {lastResult?.traitChanges && lastResult.traitChanges.length > 0 && (
          <Card style={{ marginBottom: 16, borderRadius: 14 }} padded>
            <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 8 }}>
              Ozellik degisimi
            </Text>
            {lastResult.traitChanges.map((change, index, arr) => (
              <View key={`${change.changeType}_${change.traitId}_${index}`} style={{ marginBottom: index === arr.length - 1 ? 0 : 10 }}>
                <Text
                  style={{
                    color: change.changeType === 'GAINED' ? theme.accentSkill : theme.accentStat,
                    fontSize: 13,
                    fontWeight: '600',
                  }}
                >
                  {change.summary}
                </Text>
                {change.guidance && (
                  <Text style={{ color: theme.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 3 }}>
                    Ipuclari: {change.guidance}
                  </Text>
                )}
              </View>
            ))}
          </Card>
        )}

        <AnimatedButton
          onPress={onContinue}
          disabled={!buttonEnabled}
          animationType="pressScale"
          style={{ ...buttonStyle, opacity: buttonEnabled ? 1 : 0.7 }}
          accessibilityRole="button"
          accessibilityLabel={t('common.continue', undefined, 'Devam Et')}
          accessibilityHint="Sonraki tura gecer"
        >
          <Text style={buttonTextStyle}>
            {buttonEnabled
              ? t('common.continue', undefined, 'Devam Et')
              : t('common.reading', undefined, 'Okunuyor...')}
          </Text>
        </AnimatedButton>

        {fate && fate.tokens > 0 && hasNegativeOutcome(lastResult?.changes) && (
          <FateTokenDisplay
            tokens={fate.tokens}
            fateState={fate}
            fateRoll={lastResult?.fateRoll}
            onReroll={onReroll}
            canReroll={canReroll}
            theme={theme}
            metrics={metrics}
          />
        )}

        <FadeInUpView delay={100}>
          {lastResult?.statNarrativeFeedback && lastResult.statNarrativeFeedback.length > 0 && (
            <View style={{ marginTop: 12, marginBottom: 4, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: theme.surfaceRaised, borderRadius: 10 }}>
              {lastResult.statNarrativeFeedback.map((msg, i) => (
                <Text key={i} style={{ color: theme.textSecondary, fontSize: 12, fontStyle: 'italic' }}>
                  {msg}
                </Text>
              ))}
            </View>
          )}

          {lastResult?.changes && Object.keys(lastResult.changes).length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ color: theme.accentStat, fontSize: 13, marginBottom: 8, fontWeight: '700' }}>
                [Stat] {t('event.statChanges', undefined, 'Istatistikler')}
              </Text>
              <StatChange icon="S" changes={lastResult.changes} labels={STAT_LABELS} />
            </View>
          )}

          {lastResult?.skillChanges && Object.keys(lastResult.skillChanges).length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: theme.accentSkill, fontSize: 13, marginBottom: 8, fontWeight: '700' }}>
                [Skill] {t('event.skillChanges', undefined, 'Beceriler')}
              </Text>
              <StatChange
                icon="K"
                changes={lastResult.skillChanges as Record<string, number>}
                labels={SKILL_LABELS}
              />
            </View>
          )}

          {lastResult?.gradeChanges && Object.keys(lastResult.gradeChanges).length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: theme.accentSkill, fontSize: 13, marginBottom: 8, fontWeight: '700' }}>
                [Grade] {t('event.gradeChanges', undefined, 'Okul Notlari')}
              </Text>
              <StatChange
                icon="N"
                changes={lastResult.gradeChanges as Record<string, number>}
                labels={GRADE_LABELS}
              />
            </View>
          )}
        </FadeInUpView>
      </ScrollView>
    </View>
  );
});

FeedbackOverlay.displayName = 'FeedbackOverlay';

