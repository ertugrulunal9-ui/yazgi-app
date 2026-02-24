import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { Skills, Talent } from '../types';
import { getThemeTokens, getDensityMetrics } from '../utils/themeUtils';
import { MilestoneDetailModal } from './MilestoneDetailModal';
import { selectionHaptic, milestoneHaptic } from '../animations/HapticFeedback';
import { tRuntime } from '../i18n/strings';

interface SkillTreeProps {
  skills: Skills;
  previousSkills?: Skills;
  talent: Talent;
  onBack: () => void;
  theme?: ReturnType<typeof getThemeTokens>;
  metrics?: ReturnType<typeof getDensityMetrics>;
}

interface Milestone {
  lvl: number;
  text: string;
  desc: string;
  unlocked: boolean;
  benefits?: string[];
}

interface MilestoneTemplate {
  lvl: number;
  text: string;
  desc: string;
  benefits?: string[];
}

interface SkillConfig {
  key: keyof Skills;
  title: string;
  icon: string;
  accent: string;
  talent?: Talent;
  milestones: MilestoneTemplate[];
}

interface SkillColumnProps {
  title: string;
  icon: string;
  level: number;
  previousLevel?: number;
  accentColor: string;
  hasTalent: boolean;
  milestones: Milestone[];
  talentBadgeLabel: string;
  milestonesLabel: string;
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
  onMilestonePress: (milestone: Milestone, skillName: string) => void;
}

interface MiniSkillCardProps {
  title: string;
  icon: string;
  level: number;
  previousLevel?: number;
  accent: string;
  theme: ReturnType<typeof getThemeTokens>;
}

const MAIN_SKILLS: SkillConfig[] = [
  {
    key: 'coding',
    title: 'Yazilim',
    icon: '\u{1F4BB}',
    accent: '#0891b2',
    talent: 'CODING',
    milestones: [
      { lvl: 30, text: 'Freelance Isler', desc: 'Basit web siteleri yaparak para kazanabilirsin.', benefits: ['+100$/proje kazanma', 'Evden calisma imkani'] },
      { lvl: 50, text: 'Hackathon', desc: 'Zeka gerektiren ozel etkinlikler acilir.', benefits: ['Odullu yarismalar', 'Networking firsatlari'] },
      { lvl: 70, text: 'Kidemli Muhendis', desc: 'Yazilim muhendisligi kariyeri garantilenir.', benefits: ['Yuksek maasli is firsatlari', 'Startup kurma sansi'] },
      { lvl: 100, text: 'Teknoloji Devi', desc: 'Kendi sirketini kurma potansiyeli acilir.', benefits: ['Milyar dolarlik sirket kurma', 'Teknoloji lideri unvani'] },
    ],
  },
  {
    key: 'music',
    title: 'Muzik',
    icon: '\u{1F3B8}',
    accent: '#db2777',
    talent: 'MUSIC',
    milestones: [
      { lvl: 30, text: 'Sokak Muzigi', desc: 'Sokakta gitar calarak harclik cikarirsin.', benefits: ['Gunluk harclik kazanma', 'Karizma artisi'] },
      { lvl: 50, text: 'Bestekar', desc: 'Konservatuvar teklifi alma sansi dogar.', benefits: ['Muzik kariyeri yolu', 'Telif geliri'] },
      { lvl: 85, text: 'Rockstar', desc: 'Dunyaca unlu bir muzisyen olma yolu acilir.', benefits: ['Konser gelirleri', 'Fan kitlesi'] },
      { lvl: 100, text: 'Virtuoz', desc: 'Adini muzik tarihine yazdirirsin.', benefits: ['Efsane statusu', 'Muzik okulu acma'] },
    ],
  },
  {
    key: 'sports',
    title: 'Spor',
    icon: '\u26BD',
    accent: '#ea580c',
    talent: 'SPORTS',
    milestones: [
      { lvl: 40, text: 'Okul Takimi', desc: 'Okul takimina secilme sansi dogar.', benefits: ['Popularite artisi', 'Burs imkani'] },
      { lvl: 60, text: 'Kaptan', desc: 'Fiziksel olaylarda ustunluk saglarsin.', benefits: ['Liderlik bonusu', 'Fiziksel guc'] },
      { lvl: 90, text: 'Milli Sporcu', desc: 'Olimpiyat seviyesinde kariyer yolu acilir.', benefits: ['Milli gelir', 'Ulke taninirligi'] },
      { lvl: 100, text: 'Efsane', desc: 'Spor tarihinde iz birakirsin.', benefits: ['Efsane statu', 'Spor liderligi sansi'] },
    ],
  },
];

const OTHER_SKILLS: SkillConfig[] = [
  {
    key: 'athletics',
    title: 'Atletizm',
    icon: '\u{1F3C3}',
    accent: '#22c55e',
    milestones: [
      { lvl: 30, text: 'Dayaniklilik', desc: 'Spor aktivitelerinde enerji tasarrufu artar.', benefits: ['Spor enerji maliyeti azalir', 'Saglik kazanimi artar'] },
      { lvl: 60, text: 'Formda', desc: 'Fiziksel dayanikliligin ust seviyeye cikar.', benefits: ['Disiplin artisinda bonus', 'Fiziksel guc artisi'] },
      { lvl: 90, text: 'Elit Sporcu', desc: 'Spor kariyerlerinde zirveye yaklasilir.', benefits: ['Takim secmelerinde avantaj', 'Spor bursu sansi'] },
    ],
  },
  {
    key: 'logic',
    title: 'Mantik',
    icon: '\u{1F9E9}',
    accent: '#0ea5e9',
    milestones: [
      { lvl: 30, text: 'Hizli Kavrama', desc: 'Ders calisirken zeka artisi hizlanir.', benefits: ['Okul zeka artisi', 'Mat/Fen destegi'] },
      { lvl: 60, text: 'Analitik Zihin', desc: 'Zor problemleri cozmek kolaylasir.', benefits: ['Sinavlarda avantaj', 'Not artisinda bonus'] },
      { lvl: 90, text: 'Stratejist', desc: 'Akil oyunlarinda ustalasirsin.', benefits: ['Yuksek zeka bonusu', 'Ozel etkinlikler'] },
    ],
  },
  {
    key: 'reading',
    title: 'Okuma',
    icon: '\u{1F4DA}',
    accent: '#a855f7',
    milestones: [
      { lvl: 30, text: 'Hizli Okur', desc: 'Metinleri daha hizli kavrarsin.', benefits: ['Dil notu artisi', 'Kitap etkinlikleri'] },
      { lvl: 60, text: 'Kulturlu', desc: 'Bilgi birikimin dikkat ceker.', benefits: ['Sosyal diyaloglarda avantaj', 'Arastirma firsatlari'] },
      { lvl: 90, text: 'Bilge', desc: 'Derin analiz yetenegi kazanirsin.', benefits: ['Dil notu zirvesi', 'Ozel gorevler'] },
    ],
  },
  {
    key: 'teamwork',
    title: 'Takim',
    icon: '\u{1F91D}',
    accent: '#f97316',
    milestones: [
      { lvl: 30, text: 'Uyum', desc: 'Takim calismalarinda verimin artar.', benefits: ['Sosyal enerji tasarrufu', 'Iliski artisi'] },
      { lvl: 60, text: 'Kaptanlik', desc: 'Grup liderliginde one cikarsin.', benefits: ['Takim etkinliklerinde avantaj', 'Liderlik bonusu'] },
      { lvl: 90, text: 'Birleþtirici', desc: 'Herkesi motive eden bir rol kazanirsin.', benefits: ['Yuksek iliski artisi', 'Zor etkinliklerde basari'] },
    ],
  },
  {
    key: 'art',
    title: 'Sanat',
    icon: '\u{1F3A8}',
    accent: '#ec4899',
    milestones: [
      { lvl: 30, text: 'Estetik Goz', desc: 'Sanat aktivitelerinde karizma artar.', benefits: ['Karizma bonusu', 'Atolye etkinlikleri'] },
      { lvl: 60, text: 'Sahne Isigi', desc: 'Yaraticiligin dikkat ceker.', benefits: ['Sergi firsati', 'Sanat etkinliklerinde bonus'] },
      { lvl: 90, text: 'Usta Sanatci', desc: 'Sanat dunyasinda un kazanirsin.', benefits: ['Prestij artisi', 'Ozel projeler'] },
    ],
  },
  {
    key: 'writing',
    title: 'Yazarlik',
    icon: '\u270D\uFE0F',
    accent: '#ef4444',
    milestones: [
      { lvl: 30, text: 'Kisa Hikaye', desc: 'Yazma aktivitelerinde hizlanirsin.', benefits: ['Yazma zeka bonusu', 'Blog firsati'] },
      { lvl: 60, text: 'Yazar', desc: 'Yazilarin ilgi gormeye baslar.', benefits: ['Yayin sansi', 'Yeni etkinlikler'] },
      { lvl: 90, text: 'Romanci', desc: 'Genis kitlelere ulasirsin.', benefits: ['Yuksek zeka bonusu', 'Kitap teklifi'] },
    ],
  },
  {
    key: 'work_ethic',
    title: 'Caliskanlik',
    icon: '\u{1F4BC}',
    accent: '#64748b',
    milestones: [
      { lvl: 30, text: 'Duzenli', desc: 'Calisma temposunu oturtursun.', benefits: ['Is enerji tasarrufu', 'Gelir artisi'] },
      { lvl: 60, text: 'Guvenilir', desc: 'Is yerinde tercih edilirsin.', benefits: ['Terfi sansi', 'Kazanc bonusu'] },
      { lvl: 90, text: 'Disiplin Ustasi', desc: 'Calisma disiplini zirveye cikar.', benefits: ['Yuksek gelir bonusu', 'Ozel is firsatlari'] },
    ],
  },
  {
    key: 'business',
    title: 'Is',
    icon: '\u{1F4C8}',
    accent: '#14b8a6',
    milestones: [
      { lvl: 30, text: 'Pazarlikci', desc: 'Alisveriste fiyat dusurursun.', benefits: ['Indirim bonusu', 'Ek tasarruf'] },
      { lvl: 60, text: 'Yatirimci', desc: 'Para yonetiminde ilerlersin.', benefits: ['Kazanc artisi', 'Yatirim firsatlari'] },
      { lvl: 90, text: 'Girisimci', desc: 'Kendi isini kurma yolu acilir.', benefits: ['Buyuk gelir firsatlari', 'Ozel etkinlikler'] },
    ],
  },
  {
    key: 'design',
    title: 'Tasarim',
    icon: '\u{1F58C}\uFE0F',
    accent: '#fb7185',
    milestones: [
      { lvl: 30, text: 'Gorsel Dusunce', desc: 'Tasarim islerinde hizlanirsin.', benefits: ['Tasarim karizma bonusu', 'Mini projeler'] },
      { lvl: 60, text: 'Portfolyo', desc: 'Profesyonel isler gelmeye baslar.', benefits: ['Freelance isler', 'Daha iyi kazanc'] },
      { lvl: 90, text: 'Yaratici Yonetmen', desc: 'Buyuk projelerde liderlik edersin.', benefits: ['Prestij artisi', 'Ozel projeler'] },
    ],
  },
];

const localizeMilestones = (
  keyPrefix: string,
  milestones: MilestoneTemplate[],
  level: number
): Milestone[] => (
  milestones.map((milestone, index) => ({
    lvl: milestone.lvl,
    text: tRuntime(`skillTree.${keyPrefix}.milestones.${index}.text`, undefined, milestone.text),
    desc: tRuntime(`skillTree.${keyPrefix}.milestones.${index}.desc`, undefined, milestone.desc),
    benefits: milestone.benefits?.map((benefit, benefitIndex) => (
      tRuntime(`skillTree.${keyPrefix}.milestones.${index}.benefits.${benefitIndex}`, undefined, benefit)
    )),
    unlocked: level >= milestone.lvl,
  }))
);

/**
 * SkillTree - React Native Version
 */
export const SkillTree = React.memo<SkillTreeProps>(({
  skills,
  previousSkills,
  talent,
  onBack,
  theme: themeOverride,
  metrics: metricsOverride,
}) => {
  const theme = themeOverride || getThemeTokens('dark');
  const metrics = metricsOverride || getDensityMetrics('standard');

  const [selectedMilestone, setSelectedMilestone] = useState<{
    level: number;
    benefits: string[];
    unlocked: boolean;
    skillName: string;
  } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const tSkill = useCallback(
    (key: string, fallback: string, params?: Record<string, string | number | boolean>) =>
      tRuntime(`skillTree.${key}`, params, fallback),
    []
  );

  const handleMilestonePress = useCallback((milestone: Milestone, skillName: string) => {
    if (milestone.unlocked) {
      milestoneHaptic();
    } else {
      selectionHaptic();
    }

    setSelectedMilestone({
      level: milestone.lvl,
      benefits: milestone.benefits || [milestone.desc],
      unlocked: milestone.unlocked,
      skillName,
    });
    setModalVisible(true);
  }, []);

  const talentBadgeLabel = tSkill('talentBadge', 'YETENEK');
  const milestonesLabel = tSkill('milestones', 'Taslar');

  const mainSkills = MAIN_SKILLS.map(skill => {
    const level = skills[skill.key] || 0;
    return {
      ...skill,
      title: tSkill(`skills.${skill.key}.title`, skill.title),
      level,
      previousLevel: previousSkills?.[skill.key],
      milestones: localizeMilestones(`skills.${skill.key}`, skill.milestones, level),
    };
  });

  const otherSkills = OTHER_SKILLS.map(skill => {
    const level = skills[skill.key] || 0;
    return {
      ...skill,
      title: tSkill(`skills.${skill.key}.title`, skill.title),
      level,
      previousLevel: previousSkills?.[skill.key],
      milestones: localizeMilestones(`skills.${skill.key}`, skill.milestones, level),
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.appBg }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { padding: metrics.pad }]}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        overScrollMode="never"
        bounces={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backButton, {
              backgroundColor: theme.surfaceRaised,
              borderColor: theme.border,
            }]}
            accessibilityLabel={tSkill('backAria', 'Geri don')}
            accessibilityRole="button"
          >
            <Text style={[styles.backButtonText, { color: theme.textPrimary }]}>
              {'\u2190'} {tSkill('buttons.back', 'Geri')}
            </Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <View style={[styles.titleBadge, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
              <Text style={[styles.titleText, { color: theme.textPrimary }]}>{tSkill('title', 'Yetenek')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.skillsGrid}>
          {mainSkills.map(skill => (
            <SkillColumn
              key={skill.key}
              title={skill.title}
              icon={skill.icon}
              level={skill.level}
              previousLevel={skill.previousLevel}
              accentColor={skill.accent}
              hasTalent={skill.talent === talent}
              milestones={skill.milestones}
              talentBadgeLabel={talentBadgeLabel}
              milestonesLabel={milestonesLabel}
              theme={theme}
              metrics={metrics}
              onMilestonePress={handleMilestonePress}
            />
          ))}
        </View>

        <View style={styles.otherSkillsSection}>
          <Text style={[styles.otherSkillsTitle, { color: theme.textSecondary }]}>
            {tSkill('otherSkills', 'Diger')}
          </Text>
          <View style={styles.otherSkillsGrid}>
            {otherSkills.map(skill => (
              <MiniSkillCard
                key={skill.key}
                title={skill.title}
                icon={skill.icon}
                level={skill.level}
                previousLevel={skill.previousLevel}
                accent={skill.accent}
                theme={theme}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <MilestoneDetailModal
        visible={modalVisible}
        milestone={selectedMilestone}
        onClose={() => setModalVisible(false)}
        theme={theme}
      />
    </View>
  );
});

SkillTree.displayName = 'SkillTree';

const SkillColumn: React.FC<SkillColumnProps> = ({
  title,
  icon,
  level,
  previousLevel,
  accentColor,
  hasTalent,
  milestones,
  talentBadgeLabel,
  milestonesLabel,
  theme,
  metrics,
  onMilestonePress,
}) => {
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withDelay(300, withTiming(level, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    }));
  }, [level, progressWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const levelDifference = previousLevel !== undefined ? level - previousLevel : 0;

  return (
    <View style={[
      styles.skillColumn,
      {
        backgroundColor: theme.surfaceBase,
        borderColor: hasTalent ? '#fbbf24' : theme.border,
        borderWidth: hasTalent ? 2 : 1,
      },
    ]}>
      <View
        style={[
          styles.columnHeader,
          {
            backgroundColor: `${accentColor}20`,
            borderBottomColor: `${accentColor}66`,
            borderBottomWidth: 1,
          },
        ]}
      >
        {hasTalent ? (
          <View style={styles.talentBadge}>
            <Text style={styles.talentBadgeText}>{talentBadgeLabel}</Text>
          </View>
        ) : null}

        <Text style={styles.iconText}>{icon}</Text>
        <Text style={[styles.columnTitle, { color: theme.textPrimary }]}>{title}</Text>

        <View style={styles.levelContainer}>
          <Text style={[styles.levelNumber, { color: accentColor }]}>{level}</Text>
          <Text style={[styles.levelMax, { color: theme.textSecondary }]}>/100</Text>

          {levelDifference !== 0 ? (
            <View style={[
              styles.diffBadge,
              { backgroundColor: levelDifference > 0 ? '#10b981' : '#ef4444' },
            ]}>
              <Text style={styles.diffText}>
                {levelDifference > 0 ? '+' : ''}{levelDifference}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={[styles.compactBody, { padding: metrics.pad }]}>
        <Text style={[styles.milestoneLabel, { color: theme.textSecondary }]}>{milestonesLabel}</Text>
        <View style={styles.milestoneChips}>
          {milestones.map((milestone, idx) => (
            <TouchableOpacity
              key={`${title}-${milestone.lvl}-${idx}`}
              activeOpacity={0.7}
              onPress={() => onMilestonePress(milestone, title)}
              style={[
                styles.milestoneChip,
                {
                  borderColor: milestone.unlocked ? accentColor : theme.border,
                  backgroundColor: milestone.unlocked ? `${accentColor}20` : theme.surfaceOverlay,
                },
              ]}
            >
              <Text style={[
                styles.milestoneChipText,
                { color: milestone.unlocked ? accentColor : theme.textSecondary },
              ]}>
                {milestone.lvl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.progressBarContainer, { backgroundColor: theme.surfaceOverlay }]}>
        <Animated.View style={[styles.progressBar, animatedStyle]}>
          <View style={{ flex: 1, backgroundColor: accentColor }} />
        </Animated.View>
      </View>
    </View>
  );
};

const MiniSkillCard: React.FC<MiniSkillCardProps> = ({
  title,
  icon,
  level,
  previousLevel,
  accent,
  theme,
}) => {
  const levelDifference = previousLevel !== undefined ? level - previousLevel : 0;

  return (
    <View style={[
      styles.miniSkillCard,
      { backgroundColor: theme.surfaceBase, borderColor: theme.border },
    ]}>
      <View style={styles.miniHeader}>
        <Text style={styles.miniIcon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.miniTitle, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[styles.miniLevel, { color: theme.textSecondary }]}>{level}/100</Text>
        </View>
        {levelDifference !== 0 ? (
          <View style={[
            styles.miniDiffBadge,
            { backgroundColor: levelDifference > 0 ? '#10b981' : '#ef4444' },
          ]}>
            <Text style={styles.miniDiffText}>
              {levelDifference > 0 ? '+' : ''}{levelDifference}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.miniProgressTrack, { backgroundColor: theme.surfaceOverlay }]}>
        <View
          style={[
            styles.miniProgressFill,
            { width: `${Math.min(100, Math.max(0, level))}%`, backgroundColor: accent },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    marginBottom: 24,
    position: 'relative',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  titleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  otherSkillsSection: {
    marginTop: 12,
  },
  otherSkillsTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  otherSkillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skillColumn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 160,
  },
  columnHeader: {
    padding: 14,
    position: 'relative',
  },
  talentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  talentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  iconText: {
    fontSize: 28,
    marginBottom: 4,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginTop: 4,
  },
  levelNumber: {
    fontSize: 28,
    fontWeight: '900',
  },
  levelMax: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
    marginBottom: 2,
  },
  compactBody: {
    paddingTop: 8,
  },
  milestoneLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  milestoneChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  milestoneChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 36,
    alignItems: 'center',
  },
  milestoneChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    width: '100%',
  },
  progressBar: {
    height: '100%',
  },
  diffBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  diffText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  miniSkillCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    flexBasis: '48%',
    flexGrow: 1,
  },
  miniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  miniIcon: {
    fontSize: 20,
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  miniLevel: {
    fontSize: 11,
    fontWeight: '600',
  },
  miniDiffBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  miniDiffText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  miniProgressTrack: {
    height: 6,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 10,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 6,
  },
});

export default SkillTree;
