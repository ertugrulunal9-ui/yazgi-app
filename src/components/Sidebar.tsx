import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Stats, StatKey, Family, GameState, Talent } from '../types';
import StatBar from './StatBar';
import { getStatCap } from '../utils/gameUtils';
import { getTrait } from '../data/traits';

interface SidebarProps {
  age: number;
  stats: Stats;
  playerName: string;
  family?: Family | null;
  gameState?: GameState;
  onAdvanceTurn: () => void;
  onOpenSettings: () => void;
  theme: any;
}

const Sidebar = React.memo<SidebarProps>(({ age, stats, playerName, family, gameState, onAdvanceTurn, onOpenSettings, theme }) => {
  const isBaby = age < 7;

  const getStatLabel = (key: StatKey): string => {
    switch (key) {
      case 'intelligence': return isBaby ? 'Motor Becerileri' : 'Zeka';
      case 'charisma': return isBaby ? 'Tatlılık' : 'Karizma';
      case 'discipline': return isBaby ? 'Uslu Durma' : 'Disiplin';
      case 'health': return 'Sağlık';
      case 'energy': return 'Günlük Enerji';
      case 'money': return 'Para';
      case 'familyRelation': return 'Aile İlişkisi';
      default: return key;
    }
  };

  const getWealthLabel = (w: string) => {
    switch(w) {
      case 'POOR': return 'Dar Gelirli';
      case 'MIDDLE': return 'Orta Halli';
      case 'RICH': return 'Varlıklı';
      default: return w;
    }
  };

  const getDynamicLabel = (d: string) => {
    switch(d) {
      case 'SUPPORTIVE': return 'Destekleyici';
      case 'STRICT': return 'Otoriter';
      case 'CHAOTIC': return 'Kaotik';
      default: return d;
    }
  };

  const getTalentLabel = (t: Talent) => {
    switch(t) {
      case 'CODING': return '💻 Teknoloji Dehası';
      case 'MUSIC': return '🎵 Müzik Kulağı';
      case 'SPORTS': return '⚡ Atletik Vücut';
      default: return null;
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 60) return '#34d399';
    return '#9ca3af';
  };

  const getTraitStyle = (type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL') => {
    switch(type) {
      case 'POSITIVE': return { backgroundColor: '#059669', color: '#ffffff', borderColor: '#10b981' };
      case 'NEGATIVE': return { backgroundColor: '#dc2626', color: '#ffffff', borderColor: '#ef4444' };
      default: return { backgroundColor: theme.surfaceBase, color: theme.textSecondary, borderColor: theme.border };
    }
  };

  const isEventActive = gameState?.phase === 'EVENT' || gameState?.phase === 'RESULT' || gameState?.phase === 'GAME_OVER';

  const styles = StyleSheet.create({
    container: {
      width: '35%',
      minWidth: 280,
      backgroundColor: theme.surfaceBase,
      borderRightWidth: 1,
      borderRightColor: theme.border,
      flex: 1,
    },
    scrollContent: {
      flex: 1,
    },
    header: {
      padding: 24,
      paddingBottom: 16,
      alignItems: 'center',
      backgroundColor: theme.surfaceOverlay,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    avatar: {
      width: 80,
      height: 80,
      backgroundColor: theme.surfaceRaised,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 40,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: '#3b82f6',
    },
    ageBadge: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      backgroundColor: '#2563eb',
      color: '#ffffff',
      fontSize: 10,
      fontWeight: 'bold',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
    },
    playerName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.textPrimary,
    },
    babyLabel: {
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 2,
      color: theme.accentEvent,
      fontWeight: '600',
      marginTop: 4,
    },
    talentBadge: {
      marginTop: 8,
      backgroundColor: '#7c3aed',
      color: '#e9d5ff',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 999,
      fontSize: 12,
      fontWeight: '600',
    },
    content: {
      padding: 24,
      paddingBottom: 24,
    },
    sectionTitle: {
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 2,
      color: theme.textSecondary,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    traitContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    traitBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      fontSize: 11,
      fontWeight: 'bold',
      borderWidth: 1,
    },
    separator: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 24,
    },
    familyCard: {
      backgroundColor: theme.surfaceRaised,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 8,
    },
    familyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    familyLabel: {
      color: theme.textSecondary,
      fontSize: 14,
    },
    familyValue: {
      fontWeight: '600',
      fontSize: 14,
    },
    schoolCard: {
      backgroundColor: theme.surfaceRaised,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 16,
    },
    skillCard: {
      backgroundColor: theme.surfaceRaised,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    skillRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    skillLabel: {
      color: theme.textSecondary,
    },
    skillValue: {
      color: theme.accentSkill,
      fontWeight: 'bold',
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      padding: 16,
      backgroundColor: theme.surfaceOverlay,
      flexDirection: 'row',
      gap: 8,
    },
    advanceButton: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    advanceButtonActive: {
      backgroundColor: theme.accentEvent,
      borderWidth: 1,
      borderColor: theme.accentEvent,
    },
    advanceButtonDisabled: {
      backgroundColor: theme.surfaceBase,
      borderWidth: 1,
      borderColor: theme.border,
      opacity: 0.5,
    },
    advanceButtonText: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    advanceButtonTextDisabled: {
      color: theme.textSecondary,
    },
    settingsButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <View style={styles.header}>
          <View style={{ position: 'relative' }}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 40 }}>
                {age < 3 ? '👶' : age < 7 ? '🧸' : age < 13 ? '🧒' : '🧑‍🎓'}
              </Text>
            </View>
            <View style={styles.ageBadge}>
              <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: 'bold' }}>{age} Yaş</Text>
            </View>
          </View>

          <Text style={styles.playerName}>{playerName}</Text>
          {isBaby && <Text style={styles.babyLabel}>Bebeklik Çağı</Text>}

          {gameState?.talent && gameState.talent !== 'NONE' && (
            <View style={styles.talentBadge}>
              <Text>{getTalentLabel(gameState.talent)}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {gameState?.traits && gameState.traits.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Karakter Özellikleri</Text>
              <View style={styles.traitContainer}>
                {gameState.traits.map(traitId => {
                  const trait = getTrait(traitId);
                  if (!trait) return null;
                  const traitStyle = getTraitStyle(trait.type);
                  return (
                    <View key={traitId} style={[styles.traitBadge, traitStyle]}>
                      <Text style={{ color: traitStyle.color }}>{trait.name}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.separator} />

          {family && (
            <View>
              <Text style={styles.sectionTitle}>Aile Durumu</Text>
              <View style={styles.familyCard}>
                <View style={styles.familyRow}>
                  <Text style={styles.familyLabel}>Ekonomik:</Text>
                  <Text style={[styles.familyValue, { color: family.wealth === 'RICH' ? '#34d399' : family.wealth === 'POOR' ? '#f87171' : '#93c5fd' }]}>
                    {getWealthLabel(family.wealth)}
                  </Text>
                </View>
                <View style={styles.familyRow}>
                  <Text style={styles.familyLabel}>Dinamik:</Text>
                  <Text style={[styles.familyValue, { color: '#fcd34d' }]}>
                    {getDynamicLabel(family.dynamic)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.separator} />

          <View style={{ gap: 12 }}>
            <StatBar label={getStatLabel('health')} value={stats.health} statKey="health" cap={getStatCap(age, 'health', family, gameState?.traits)} theme={theme} />
            <StatBar label={getStatLabel('energy')} value={stats.energy} statKey="energy" theme={theme} />
            <StatBar label={getStatLabel('familyRelation')} value={stats.familyRelation} statKey="familyRelation" theme={theme} />

            <View style={{ height: 8 }} />

            <StatBar label={getStatLabel('intelligence')} value={stats.intelligence} statKey="intelligence" cap={getStatCap(age, 'intelligence', family, gameState?.traits)} theme={theme} />
            <StatBar label={getStatLabel('charisma')} value={stats.charisma} statKey="charisma" cap={getStatCap(age, 'charisma', family, gameState?.traits)} theme={theme} />
            <StatBar label={getStatLabel('discipline')} value={stats.discipline} statKey="discipline" cap={getStatCap(age, 'discipline', family, gameState?.traits)} theme={theme} />

            {!isBaby && <StatBar label={getStatLabel('money')} value={stats.money} statKey="money" theme={theme} />}
          </View>

          {!isBaby && gameState && (
            <>
              <View style={styles.separator} />
              <View style={styles.schoolCard}>
                <Text style={styles.sectionTitle}>🏫 Okul Notları</Text>
                <View style={{ gap: 8 }}>
                  <View style={[styles.familyRow, { borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 8 }]}>
                    <Text style={styles.familyLabel}>Matematik:</Text>
                    <Text style={[styles.familyValue, { fontFamily: 'monospace', fontWeight: 'bold', color: getGradeColor(gameState.schoolGrades.math) }]}>
                      {gameState.schoolGrades.math}
                    </Text>
                  </View>
                  <View style={[styles.familyRow, { borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 8 }]}>
                    <Text style={styles.familyLabel}>Fen Bilgisi:</Text>
                    <Text style={[styles.familyValue, { fontFamily: 'monospace', fontWeight: 'bold', color: getGradeColor(gameState.schoolGrades.science) }]}>
                      {gameState.schoolGrades.science}
                    </Text>
                  </View>
                  <View style={styles.familyRow}>
                    <Text style={styles.familyLabel}>Dil:</Text>
                    <Text style={[styles.familyValue, { fontFamily: 'monospace', fontWeight: 'bold', color: getGradeColor(gameState.schoolGrades.language) }]}>
                      {gameState.schoolGrades.language}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.skillCard}>
                <Text style={styles.sectionTitle}>🎯 Beceriler</Text>
                <View style={{ gap: 8 }}>
                  <View style={styles.skillRow}>
                    <Text style={styles.skillLabel}>Yazılım:</Text>
                    <Text style={styles.skillValue}>{gameState.skills.coding}</Text>
                  </View>
                  <View style={styles.skillRow}>
                    <Text style={styles.skillLabel}>Müzik:</Text>
                    <Text style={styles.skillValue}>{gameState.skills.music}</Text>
                  </View>
                  <View style={styles.skillRow}>
                    <Text style={styles.skillLabel}>Spor:</Text>
                    <Text style={styles.skillValue}>{gameState.skills.sports}</Text>
                  </View>
                  <View style={styles.skillRow}>
                    <Text style={styles.skillLabel}>Tasarım:</Text>
                    <Text style={styles.skillValue}>{gameState.skills.design}</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={onAdvanceTurn}
          disabled={isEventActive}
          style={[
            styles.advanceButton,
            isEventActive ? styles.advanceButtonDisabled : styles.advanceButtonActive,
          ]}
        >
          <Text style={[styles.advanceButtonText, isEventActive && styles.advanceButtonTextDisabled]}>
            Sonraki Tur
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onOpenSettings}
          style={styles.settingsButton}
        >
          <Text>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default Sidebar;
