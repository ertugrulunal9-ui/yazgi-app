import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withDelay
} from 'react-native-reanimated';
import { Skills, Talent } from '../types';
import { getThemeTokens, getDensityMetrics } from '../utils/themeUtils';
import { MilestoneDetailModal } from './MilestoneDetailModal';
import { selectionHaptic, milestoneHaptic } from '../animations/HapticFeedback';
import { UI_TEXT } from '../constants/uiText';

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

interface OtherSkillConfig {
  key: keyof Skills;
  title: string;
  icon: string;
  accent: string;
  milestones: Omit<Milestone, 'unlocked'>[];
}

interface SkillColumnProps {
  title: string;
  icon: string;
  level: number;
  previousLevel?: number;
  color: 'cyan' | 'pink' | 'orange';
  hasTalent: boolean;
  milestones: Milestone[];
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
  milestones: Milestone[];
  theme: ReturnType<typeof getThemeTokens>;
  onMilestonePress: (milestone: Milestone, skillName: string) => void;
}

const OTHER_SKILL_CONFIG: OtherSkillConfig[] = [
  {
    key: 'athletics',
    title: 'Atletizm',
    icon: '🏃',
    accent: '#22c55e',
    milestones: [
      { lvl: 30, text: 'Dayanıklılık', desc: 'Spor aktivitelerinde enerji tasarrufu artar.', benefits: ['Spor enerji maliyeti azalır', 'Sağlık kazanımı artar'] },
      { lvl: 60, text: 'Formda', desc: 'Fiziksel dayanıklılığın üst seviyeye çıkar.', benefits: ['Disiplin artışında bonus', 'Fiziksel güç artışı'] },
      { lvl: 90, text: 'Elit Sporcu', desc: 'Spor kariyerlerinde zirveye yaklaşılır.', benefits: ['Takım seçmelerinde avantaj', 'Spor bursu şansı'] },
    ],
  },
  {
    key: 'logic',
    title: 'Mantık',
    icon: '🧩',
    accent: '#0ea5e9',
    milestones: [
      { lvl: 30, text: 'Hızlı Kavrama', desc: 'Ders çalışırken zeka artışı hızlanır.', benefits: ['Okul zeka artışı', 'Mat/Fen desteği'] },
      { lvl: 60, text: 'Analitik Zihin', desc: 'Zor problemleri çözmek kolaylaşır.', benefits: ['Sınavlarda avantaj', 'Not artışında bonus'] },
      { lvl: 90, text: 'Stratejist', desc: 'Akıl oyunlarında ustalaşırsın.', benefits: ['Yüksek zeka bonusu', 'Özel etkinlikler'] },
    ],
  },
  {
    key: 'reading',
    title: 'Okuma',
    icon: '📚',
    accent: '#a855f7',
    milestones: [
      { lvl: 30, text: 'Hızlı Okur', desc: 'Metinleri daha hızlı kavrarsın.', benefits: ['Dil notu artışı', 'Kitap etkinlikleri'] },
      { lvl: 60, text: 'Kültürlü', desc: 'Bilgi birikimin dikkat çeker.', benefits: ['Sosyal diyaloglarda avantaj', 'Araştırma fırsatları'] },
      { lvl: 90, text: 'Bilge', desc: 'Derin analiz yeteneği kazanırsın.', benefits: ['Dil notu zirvesi', 'Özel görevler'] },
    ],
  },
  {
    key: 'teamwork',
    title: 'Takım',
    icon: '🤝',
    accent: '#f97316',
    milestones: [
      { lvl: 30, text: 'Uyum', desc: 'Takım çalışmalarında verimin artar.', benefits: ['Sosyal enerji tasarrufu', 'İlişki artışı'] },
      { lvl: 60, text: 'Kaptan', desc: 'Grup liderliğinde öne çıkarsın.', benefits: ['Takım etkinliklerinde avantaj', 'Liderlik bonusu'] },
      { lvl: 90, text: 'Birleştirici', desc: 'Herkesi motive edersin.', benefits: ['Yüksek ilişki artışı', 'Zor etkinliklerde başarı'] },
    ],
  },
  {
    key: 'art',
    title: 'Sanat',
    icon: '🎨',
    accent: '#ec4899',
    milestones: [
      { lvl: 30, text: 'Estetik Göz', desc: 'Sanat aktivitelerinde karizma artar.', benefits: ['Karizma bonusu', 'Atölye etkinlikleri'] },
      { lvl: 60, text: 'Sahne Işığı', desc: 'Yaratıcılığın dikkat çeker.', benefits: ['Sergi fırsatı', 'Sanat etkinliklerinde bonus'] },
      { lvl: 90, text: 'Usta Sanatçı', desc: 'Sanat dünyasında ün kazanırsın.', benefits: ['Prestij artışı', 'Özel projeler'] },
    ],
  },
  {
    key: 'writing',
    title: 'Yazarlık',
    icon: '✍️',
    accent: '#ef4444',
    milestones: [
      { lvl: 30, text: 'Kısa Hikaye', desc: 'Yazma aktivitelerinde hızlanırsın.', benefits: ['Yazma zeka bonusu', 'Blog fırsatı'] },
      { lvl: 60, text: 'Yazar', desc: 'Yazıların ilgi görmeye başlar.', benefits: ['Yayın şansı', 'Yeni etkinlikler'] },
      { lvl: 90, text: 'Romancı', desc: 'Geniş kitlelere ulaşırsın.', benefits: ['Yüksek zeka bonusu', 'Kitap teklifi'] },
    ],
  },
  {
    key: 'work_ethic',
    title: 'Çalışkanlık',
    icon: '💼',
    accent: '#64748b',
    milestones: [
      { lvl: 30, text: 'Düzenli', desc: 'Çalışma temposunu oturtursun.', benefits: ['İş enerji tasarrufu', 'Gelir artışı'] },
      { lvl: 60, text: 'Güvenilir', desc: 'İş yerinde tercih edilirsin.', benefits: ['Terfi şansı', 'Kazanç bonusu'] },
      { lvl: 90, text: 'Disiplin Ustası', desc: 'Çalışma disiplini zirvede.', benefits: ['Yüksek gelir bonusu', 'Özel iş fırsatları'] },
    ],
  },
  {
    key: 'business',
    title: 'İş',
    icon: '📈',
    accent: '#14b8a6',
    milestones: [
      { lvl: 30, text: 'Pazarlıkçı', desc: 'Alışverişte fiyat düşürürsün.', benefits: ['İndirim bonusu', 'Ek tasarruf'] },
      { lvl: 60, text: 'Yatırımcı', desc: 'Para yönetiminde ilerlersin.', benefits: ['Kazanç artışı', 'Yatırım fırsatları'] },
      { lvl: 90, text: 'Girişimci', desc: 'Kendi işini kurma yolu açılır.', benefits: ['Büyük gelir fırsatları', 'Özel etkinlikler'] },
    ],
  },
  {
    key: 'design',
    title: 'Tasarım',
    icon: '🖌️',
    accent: '#fb7185',
    milestones: [
      { lvl: 30, text: 'Görsel Düşünce', desc: 'Tasarım işlerinde hızlanırsın.', benefits: ['Tasarım karizma bonusu', 'Mini projeler'] },
      { lvl: 60, text: 'Portfolyo', desc: 'Profesyonel işler gelmeye başlar.', benefits: ['Freelance işler', 'Daha iyi kazanç'] },
      { lvl: 90, text: 'Yaratıcı Yönetmen', desc: 'Büyük projelerde liderlik edersin.', benefits: ['Prestij artışı', 'Özel projeler'] },
    ],
  },
];

/**
 * SkillTree - React Native Version
 * 
 * Displays the player's skill progression in a tree format.
 * Shows three skill categories (Coding, Music, Sports) with milestones.
 * 
 * Usage:
 * ```tsx
 * <SkillTree 
 *   skills={gameState.skills} 
 *   talent={gameState.talent}
 *   onBack={() => setPhase('HUB')}
 * />
 * ```
 */
export const SkillTree = React.memo<SkillTreeProps>(({ skills, previousSkills, talent, onBack, theme: themeOverride, metrics: metricsOverride }) => {
  const theme = themeOverride || getThemeTokens('dark');
  const metrics = metricsOverride || getDensityMetrics('standard');

  const [selectedMilestone, setSelectedMilestone] = useState<{
    level: number;
    benefits: string[];
    unlocked: boolean;
    skillName: string;
  } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const otherSkills = OTHER_SKILL_CONFIG.map(skill => {
    const level = skills[skill.key] || 0;
    return {
      ...skill,
      level,
      previousLevel: previousSkills?.[skill.key],
      milestones: skill.milestones.map(milestone => ({
        ...milestone,
        unlocked: level >= milestone.lvl,
      })),
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
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backButton, {
              backgroundColor: theme.surfaceRaised,
              borderColor: theme.border,
            }]}
            accessibilityLabel="Geri dön"
            accessibilityRole="button"
          >
            <Text style={[styles.backButtonText, { color: theme.textPrimary }]}>← {UI_TEXT.buttons.back}</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <View style={[styles.titleBadge, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
              <Text style={[styles.titleText, { color: theme.textPrimary }]}>{UI_TEXT.skillTree.title}</Text>
            </View>
          </View>
        </View>

        {/* Skill Columns */}
        <View style={styles.skillsGrid}>
          <SkillColumn
            title="Yazılım"
            icon="💻"
            level={skills.coding}
            previousLevel={previousSkills?.coding}
            color="cyan"
            hasTalent={talent === 'CODING'}
            theme={theme}
            metrics={metrics}
            onMilestonePress={handleMilestonePress}
            milestones={[
              { lvl: 30, text: "Freelance İşler", desc: "Basit web siteleri yaparak para kazanabilirsin.", unlocked: skills.coding >= 30, benefits: ["+100$/proje kazanma", "Evden çalışma imkanı"] },
              { lvl: 50, text: "Hackathon", desc: "Zeka gerektiren özel etkinlikler açılır.", unlocked: skills.coding >= 50, benefits: ["Ödüllü yarışmalar", "Networking fırsatları"] },
              { lvl: 70, text: "Kıdemli Müh.", desc: "Yazılım Mühendisliği kariyeri garantilenir.", unlocked: skills.coding >= 70, benefits: ["Yüksek maaşlı iş garantisi", "Startup kurma şansı"] },
              { lvl: 100, text: "Teknoloji Devi", desc: "Kendi şirketini kurma potansiyeli.", unlocked: skills.coding >= 100, benefits: ["Milyar dolarlık şirket kurma", "Teknoloji lideri unvanı"] }
            ]}
          />

          <SkillColumn
            title="Müzik"
            icon="🎸"
            level={skills.music}
            previousLevel={previousSkills?.music}
            color="pink"
            hasTalent={talent === 'MUSIC'}
            theme={theme}
            metrics={metrics}
            onMilestonePress={handleMilestonePress}
            milestones={[
              { lvl: 30, text: "Sokak Müziği", desc: "İstiklal'de gitar çalarak harçlık çıkar.", unlocked: skills.music >= 30, benefits: ["Günlük harçlık kazanma", "Karizma artışı"] },
              { lvl: 50, text: "Bestekar", desc: "Konservatuar teklifi alma şansı.", unlocked: skills.music >= 50, benefits: ["Müzik kariyeri yolu", "Telif geliri"] },
              { lvl: 85, text: "Rockstar", desc: "Dünyaca ünlü bir müzisyen olma yolu.", unlocked: skills.music >= 85, benefits: ["Konser gelirleri", "Fan kitlesi"] },
              { lvl: 100, text: "Virtüöz", desc: "Adını müzik tarihine altın harflerle yazdır.", unlocked: skills.music >= 100, benefits: ["Efsane statüsü", "Müzik okulu açma"] }
            ]}
          />

          <SkillColumn
            title="Spor"
            icon="⚽"
            level={skills.sports}
            previousLevel={previousSkills?.sports}
            color="orange"
            hasTalent={talent === 'SPORTS'}
            theme={theme}
            metrics={metrics}
            onMilestonePress={handleMilestonePress}
            milestones={[
              { lvl: 40, text: "Okul Takımı", desc: "Okul takımına seçilme şansı.", unlocked: skills.sports >= 40, benefits: ["Popülarite artışı", "Burs imkanı"] },
              { lvl: 60, text: "Kaptan", desc: "Fiziksel olaylarda (kavga vb.) üstünlük.", unlocked: skills.sports >= 60, benefits: ["Liderlik bonusu", "Fiziksel güç"] },
              { lvl: 90, text: "Milli Sporcu", desc: "Olimpiyat seviyesinde bir kariyer.", unlocked: skills.sports >= 90, benefits: ["Milli maaş", "Ülke tanınırlığı"] },
              { lvl: 100, text: "Efsane", desc: "Heykelin dikilir.", unlocked: skills.sports >= 100, benefits: ["Ölümsüzlük (mecazi)", "Spor bakanı olma şansı"] }
            ]}
          />
        </View>

        <View style={styles.otherSkillsSection}>
          <Text style={[styles.otherSkillsTitle, { color: theme.textSecondary }]}>
            {UI_TEXT.skillTree.otherSkills}
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
                milestones={skill.milestones}
                theme={theme}
                onMilestonePress={handleMilestonePress}
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
  color,
  hasTalent,
  milestones,
  theme,
  metrics,
  onMilestonePress
}) => {
  const getPalette = (): { accentColor: string; headerBg: string } => {
    if (color === 'cyan') return { accentColor: '#0891b2', headerBg: 'rgba(8, 145, 178, 0.12)' };
    if (color === 'pink') return { accentColor: '#db2777', headerBg: 'rgba(219, 39, 119, 0.12)' };
    return { accentColor: '#ea580c', headerBg: 'rgba(234, 88, 12, 0.12)' };
  };

  const { accentColor, headerBg } = getPalette();

  // Animation for progress bar
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withDelay(300, withTiming(level, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    }));
  }, [level, progressWidth]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });

  const levelDifference = previousLevel !== undefined ? level - previousLevel : 0;

  return (
    <View style={[
      styles.skillColumn,
      {
        backgroundColor: theme.surfaceBase,
        borderColor: hasTalent ? '#fbbf24' : theme.border,
        borderWidth: hasTalent ? 2 : 1,
      }
    ]}>
      <View
        style={[
          styles.columnHeader,
          {
            backgroundColor: headerBg,
            borderBottomColor: `${accentColor}66`,
            borderBottomWidth: 1,
          },
        ]}
      >
        {hasTalent && (
          <View style={styles.talentBadge}>
            <Text style={styles.talentBadgeText}>{UI_TEXT.skillTree.talentBadge}</Text>
          </View>
        )}

        <Text style={styles.iconText}>{icon}</Text>
        <Text style={[styles.columnTitle, { color: theme.textPrimary }]}>{title}</Text>

        <View style={styles.levelContainer}>
          <Text style={[styles.levelNumber, { color: accentColor }]}>{level}</Text>
          <Text style={[styles.levelMax, { color: theme.textSecondary }]}>/100</Text>

          {/* Comparison Badge */}
          {levelDifference !== 0 && (
            <View style={[
              styles.diffBadge,
              { backgroundColor: levelDifference > 0 ? '#10b981' : '#ef4444' }
            ]}>
              <Text style={styles.diffText}>
                {levelDifference > 0 ? '+' : ''}{levelDifference}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Milestones - Compact Chips */}
      <View style={[styles.compactBody, { padding: metrics.pad }]}>
        <Text style={[styles.milestoneLabel, { color: theme.textSecondary }]}>
          {UI_TEXT.skillTree.milestones}
        </Text>
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
                }
              ]}
            >
              <Text style={[
                styles.milestoneChipText,
                { color: milestone.unlocked ? accentColor : theme.textSecondary }
              ]}>
                {milestone.lvl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Progress Bar */}
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
      { backgroundColor: theme.surfaceBase, borderColor: theme.border }
    ]}>
      <View style={styles.miniHeader}>
        <Text style={styles.miniIcon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.miniTitle, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[styles.miniLevel, { color: theme.textSecondary }]}>{level}/100</Text>
        </View>
        {levelDifference !== 0 && (
          <View style={[
            styles.miniDiffBadge,
            { backgroundColor: levelDifference > 0 ? '#10b981' : '#ef4444' }
          ]}>
            <Text style={styles.miniDiffText}>
              {levelDifference > 0 ? '+' : ''}{levelDifference}
            </Text>
          </View>
        )}
      </View>

      

      <View style={[styles.miniProgressTrack, { backgroundColor: theme.surfaceOverlay }]}>
        <View
          style={[
            styles.miniProgressFill,
            { width: `${Math.min(100, Math.max(0, level))}%`, backgroundColor: accent }
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

  // Header
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

  // Skills Grid
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

  // Skill Column
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

  // Compact Milestones
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

  // Progress Bar
  progressBarContainer: {
    height: 8,
    width: '100%',
  },
  progressBar: {
    height: '100%',
  },

  // Comparison Badge
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
  miniMilestones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  miniMilestoneChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  miniMilestoneText: {
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







