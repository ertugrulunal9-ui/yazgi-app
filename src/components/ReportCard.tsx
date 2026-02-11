import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, ScrollView } from 'react-native';
import { SchoolGrades, Family } from '../types';
import { getLetterGrade, calculateGradeAverage } from '../utils/schoolLogic';

interface ReportCardProps {
  grades: SchoolGrades;
  family: Family;
  onClose: () => void;
  age: number;
  visible: boolean;
}

const ReportCard = React.memo<ReportCardProps>(({ grades, family, onClose, age, visible }) => {
  // Modal yerine absolute positioning kullan (Android uyumluluğu için)
  if (!visible) return null;

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;
  const average = useMemo(() =>
    Math.round(calculateGradeAverage(grades)),
    [grades]
  );

  const getGradeColor = (score: number) => {
    if (score >= 85) return '#10b981'; // Yeşil - Mükemmel
    if (score >= 70) return '#3b82f6'; // Mavi - İyi
    if (score >= 50) return '#f59e0b'; // Turuncu - Orta
    return '#ef4444'; // Kırmızı - Kötü
  };

  const getStatusMessage = (avg: number) => {
    if (avg >= 85) return { text: "ONUR BELGESİ", emoji: "🏆" };
    if (avg >= 70) return { text: "TEŞEKKÜR", emoji: "🎉" };
    if (avg >= 50) return { text: "SINIFI GEÇTİ", emoji: "✅" };
    return { text: "SINIF TEKRARI", emoji: "😰" };
  };

  // Aile dinamiğine göre veli tepkisi
  const getParentReaction = () => {
    if (average >= 85) {
      return family.dynamic === 'SUPPORTIVE' ? '🎉 "Seninle gurur duyuyoruz!"' :
             family.dynamic === 'STRICT' ? '📚 "İyi ama daha da iyisini bekleriz."' :
             '🎊 "Harika! Gel sarılalım!"';
    }
    if (average >= 50) {
      return family.dynamic === 'SUPPORTIVE' ? '👍 "Fena değil, devam et."' :
             family.dynamic === 'STRICT' ? '😤 "Bu notlar kabul edilemez!"' :
             '🤷 "Ehh, olsun..."';
    }
    return family.dynamic === 'SUPPORTIVE' ? '😟 "Seneye telafi ederiz."' :
           family.dynamic === 'STRICT' ? '😡 "Cep telefonu yasak!"' :
           '🙄 "Bize mi çektin acaba..."';
  };

  const status = getStatusMessage(average);
  const averageColor = getGradeColor(average);

  const subjects = [
    { key: 'math', label: 'Matematik', emoji: '🔢' },
    { key: 'turkish', label: 'Türkçe', emoji: '📝' },
    { key: 'science', label: 'Fen Bilgisi', emoji: '🔬' },
    { key: 'language', label: 'Yabancı Dil', emoji: '🌍' },
    { key: 'history', label: 'Tarih', emoji: '📜' },
    { key: 'geography', label: 'Coğrafya', emoji: '🗺️' },
    { key: 'art', label: 'Görsel Sanatlar', emoji: '🎨' },
    { key: 'music', label: 'Müzik', emoji: '🎵' },
  ];

  return (
    <View style={[styles.overlay, { paddingTop: statusBarHeight }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>📋 Yıl Sonu Karnesi</Text>
            <Text style={styles.headerSubtitle}>Öğrenci Yaşı: {age}</Text>

            {/* Ortalama Badge */}
            <View style={[styles.averageBadge, { borderColor: averageColor }]}>
              <Text style={[styles.averageText, { color: averageColor }]}>{average}</Text>
              <Text style={[styles.averageGrade, { color: averageColor }]}>
                {getLetterGrade(average)}
              </Text>
            </View>
          </View>

          {/* Ders Notları */}
          <View style={styles.gradesContainer}>
            {subjects.map((subject) => {
              const score = grades[subject.key as keyof SchoolGrades] || 0;
              const color = getGradeColor(score);
              const letter = getLetterGrade(score);

              return (
                <View key={subject.key} style={styles.gradeItem}>
                  <View style={styles.gradeLeft}>
                    <Text style={styles.gradeEmoji}>{subject.emoji}</Text>
                    <Text style={styles.gradeLabel}>{subject.label}</Text>
                  </View>
                  <View style={styles.gradeRight}>
                    <Text style={styles.gradeScore}>{Math.round(score)}/100</Text>
                    <View style={[styles.gradeBadge, { backgroundColor: color + '20', borderColor: color }]}>
                      <Text style={[styles.gradeLetter, { color }]}>{letter}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Durum Damgası */}
          <View style={[
            styles.statusStamp,
            { borderColor: average >= 50 ? '#10b981' : '#ef4444' }
          ]}>
            <Text style={styles.statusEmoji}>{status.emoji}</Text>
            <Text style={[
              styles.statusText,
              { color: average >= 50 ? '#10b981' : '#ef4444' }
            ]}>
              {status.text}
            </Text>
          </View>

          {/* Veli Tepkisi */}
          <View style={styles.reactionContainer}>
            <Text style={styles.reactionText}>{getParentReaction()}</Text>
          </View>

          {/* Alt Bilgi */}
          <Text style={styles.footerNote}>
            *Notlar zeka, stres seviyesi ve şans faktörüne göre hesaplanmıştır.
          </Text>

          {/* Tamam Butonu */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Tamam</Text>
            <Text style={styles.closeButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 9500,
    elevation: 9500,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  header: {
    backgroundColor: '#16213e',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  averageBadge: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  averageText: {
    fontSize: 20,
    fontWeight: '800',
  },
  averageGrade: {
    fontSize: 12,
    fontWeight: '700',
  },
  gradesContainer: {
    padding: 16,
  },
  gradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gradeEmoji: {
    fontSize: 18,
  },
  gradeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  gradeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gradeScore: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 32,
    alignItems: 'center',
  },
  gradeLetter: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 3,
    borderRadius: 12,
    transform: [{ rotate: '-2deg' }],
  },
  statusEmoji: {
    fontSize: 24,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  reactionContainer: {
    backgroundColor: '#0f172a',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  reactionText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerNote: {
    color: '#64748b',
    fontSize: 10,
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeButtonArrow: {
    color: '#fff',
    fontSize: 20,
  },
});

export default ReportCard;
