import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Stats, GameState } from '../types';

interface DashboardProps {
  stats: Stats;
  gameState: GameState;
  playerName: string;
  theme: any;
}

export const Dashboard = React.memo<DashboardProps>(({ stats, gameState, playerName, theme }) => {
  const { age, schoolGrades, innerThought } = gameState;
  const isBaby = age < 7;

  const getMoodIcon = () => {
    if (stats.health < 40) return { icon: '🤒', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.2)' };
    if (stats.energy < 20) return { icon: '😫', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.2)' };
    if (stats.health > 80 && stats.energy > 50) return { icon: '🤩', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.2)' };
    if (stats.health > 60) return { icon: '🙂', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.2)' };
    return { icon: '😐', color: '#9ca3af', bgColor: 'rgba(156, 163, 175, 0.2)' };
  };

  const mood = getMoodIcon();

  const getInnerVoice = () => {
    if (stats.energy < 10) return "Gözlerim kapanıyor... Ayakta duracak halim yok.";
    if (stats.health < 20) return "Kendimi berbat hissediyorum, doktora mı gitsek?";
    
    if (innerThought) return innerThought;

    if (isBaby) {
        if (stats.familyRelation < 50) return "İlgi istiyorum...";
        return "Agu bugu...";
    }

    if (stats.money < 50 && age >= 10) return "Cebimde metelik kalmadı, bir şeyler yapmalıyım.";
    if (stats.intelligence > 80 && stats.energy > 50) return "Zihnim çok açık, bugün dünyayı fethedebilirim!";
    
    const defaults = [
        "Acaba bugün ne yapsak?",
        "Geleceğimi düşünüyorum...",
        "Hava ne kadar da güzel.",
        "Biraz değişiklik iyi gelebilir."
    ];
    return defaults[gameState.turn % defaults.length];
  };

  const getAdvice = () => {
      if (stats.energy < 20) {
          return { text: "Enerjin tükendi! Günü bitirip dinlenmelisin.", type: 'critical' };
      }
      
      if (!isBaby) {
          const avgGrade = (schoolGrades.math + schoolGrades.science + schoolGrades.language) / 3;
          if (avgGrade < 45) {
              return { text: "Okul notların tehlikeli seviyede! Ders çalışsan iyi olur.", type: 'warning' };
          }
          if (schoolGrades.math < 40) {
              return { text: "Matematik notun çok düşük. Sayısal çalışmalısın.", type: 'warning' };
          }
          if (gameState.skills.coding > 20 && gameState.skills.coding < 40) {
              return { text: "Yazılımda ilerliyorsun. Biraz daha pratikle freelance işler alabilirsin.", type: 'info' };
          }
          if (gameState.skills.music > 20 && gameState.skills.music < 40) {
              return { text: "Müzik kulağın gelişiyor. Enstrümanına odaklan.", type: 'info' };
          }
      }

      if (stats.familyRelation < 30) {
          return { text: "Ailenle aran açıldı. Onlarla vakit geçirip gönüllerini al.", type: 'warning' };
      }
      
      if (stats.energy > 80) {
          return { text: "Enerjin yerinde! Zorlu bir aktiviteye (Spor/Ders) girişebilirsin.", type: 'success' };
      }

      return null;
  };

  const advice = getAdvice();

  const getAdviceStyle = (type: string) => {
    switch(type) {
      case 'critical': return { backgroundColor: 'rgba(127, 29, 29, 0.4)', borderColor: 'rgba(239, 68, 68, 0.5)', textColor: '#fecaca' };
      case 'warning': return { backgroundColor: 'rgba(120, 53, 15, 0.4)', borderColor: 'rgba(245, 158, 11, 0.5)', textColor: '#fde68a' };
      case 'success': return { backgroundColor: 'rgba(6, 78, 59, 0.4)', borderColor: 'rgba(16, 185, 129, 0.5)', textColor: '#a7f3d0' };
      default: return { backgroundColor: 'rgba(30, 58, 138, 0.4)', borderColor: 'rgba(59, 130, 246, 0.5)', textColor: '#bfdbfe' };
    }
  };

  const adviceStyle = advice ? getAdviceStyle(advice.type) : null;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 32,
    },
    avatarGlow: {
      position: 'absolute',
      top: -10,
      left: -10,
      right: -10,
      bottom: -10,
      borderRadius: 100,
      opacity: 0.2,
    },
    avatar: {
      width: 128,
      height: 128,
      borderRadius: 64,
      backgroundColor: theme.surfaceRaised,
      borderWidth: 4,
      borderColor: mood.color,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        web: {
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        },
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
      zIndex: 10,
    },
    avatarText: {
      fontSize: 48,
    },
    moodBadge: {
      position: 'absolute',
      bottom: -8,
      right: -8,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.surfaceBase,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        web: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        },
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    moodIcon: {
      fontSize: 24,
    },
    speechBubbleContainer: {
      position: 'relative',
      width: '100%',
      maxWidth: 400,
    },
    speechBubbleArrow: {
      position: 'absolute',
      top: -12,
      left: '50%',
      marginLeft: -12,
      width: 24,
      height: 24,
      backgroundColor: theme.surfaceRaised,
      transform: [{ rotate: '45deg' }],
      borderLeftWidth: 1,
      borderColor: theme.border,
      zIndex: 0,
    },
    speechBubble: {
      backgroundColor: theme.surfaceRaised,
      borderRadius: 16,
      padding: 24,
      borderTopWidth: 4,
      borderTopColor: theme.accentEvent,
      zIndex: 10,
      alignItems: 'center',
      ...Platform.select({
        web: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    speechBubbleTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 2,
      marginBottom: 8,
    },
    speechBubbleText: {
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 28,
      fontStyle: 'italic',
      textAlign: 'center',
      color: theme.textPrimary,
    },
    adviceContainer: {
      marginTop: 24,
      maxWidth: 350,
      width: '100%',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      ...Platform.select({
        web: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        },
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    adviceIcon: {
      fontSize: 24,
      marginTop: 2,
    },
    adviceTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      opacity: 0.7,
      marginBottom: 4,
    },
    adviceText: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatarGlow, { backgroundColor: mood.color }]} />
        
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {isBaby ? '👶' : age < 13 ? '🧒' : '🧑‍🎓'}
          </Text>
          
          <View style={styles.moodBadge}>
            <Text style={styles.moodIcon}>{mood.icon}</Text>
          </View>
        </View>
      </View>

      <View style={styles.speechBubbleContainer}>
        <View style={styles.speechBubbleArrow} />
        <View style={styles.speechBubble}>
          <Text style={styles.speechBubbleTitle}>{playerName}'in İç Sesi</Text>
          <Text style={styles.speechBubbleText}>
            "{getInnerVoice()}"
          </Text>
        </View>
      </View>

      {advice && adviceStyle && (
        <View style={[styles.adviceContainer, { backgroundColor: adviceStyle.backgroundColor, borderColor: adviceStyle.borderColor }]}>
          <Text style={styles.adviceIcon}>
            {advice.type === 'critical' || advice.type === 'warning' ? '⚠️' : '💡'}
          </Text>
          <View>
            <Text style={[styles.adviceTitle, { color: adviceStyle.textColor }]}>
              {advice.type === 'critical' ? 'Kritik Uyarı' : 'Tavsiye'}
            </Text>
            <Text style={[styles.adviceText, { color: adviceStyle.textColor }]}>
              {advice.text}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
});

export default Dashboard;