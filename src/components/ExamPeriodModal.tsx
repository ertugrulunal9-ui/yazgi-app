import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ExamSubject, ALL_EXAM_SUBJECTS } from '../types';
import { ExamGameType } from '../data/actions';

interface ExamPeriodModalProps {
  visible: boolean;
  examsTaken: ExamSubject[];
  onTakeExam: (examType: ExamGameType) => void;
  onClose: () => void;
}

// Map from ExamSubject to display info
const EXAM_INFO: Record<ExamSubject, { label: string; emoji: string; color: string; examType: ExamGameType }> = {
  math: { label: 'Matematik', emoji: '🔢', color: '#3b82f6', examType: 'MATH' },
  turkish: { label: 'Türkçe', emoji: '📝', color: '#8b5cf6', examType: 'TURKISH' },
  science: { label: 'Fen Bilgisi', emoji: '🔬', color: '#10b981', examType: 'SCIENCE' },
  language: { label: 'Yabancı Dil', emoji: '🌍', color: '#f59e0b', examType: 'ENGLISH' },
  history: { label: 'Tarih', emoji: '📜', color: '#ec4899', examType: 'HISTORY' },
  geography: { label: 'Coğrafya', emoji: '🗺️', color: '#06b6d4', examType: 'GEOGRAPHY' },
  art: { label: 'Görsel Sanatlar', emoji: '🎨', color: '#f97316', examType: 'ART' },
  music: { label: 'Müzik', emoji: '🎵', color: '#22c55e', examType: 'MUSIC' },
};

export const ExamPeriodModal: React.FC<ExamPeriodModalProps> = ({
  visible,
  examsTaken,
  onTakeExam,
  onClose,
}) => {
  const completedCount = examsTaken.length;
  const totalCount = ALL_EXAM_SUBJECTS.length;
  const allCompleted = completedCount >= totalCount;

  const handleExamPress = useCallback((subject: ExamSubject) => {
    const info = EXAM_INFO[subject];
    onTakeExam(info.examType);
  }, [onTakeExam]);

  const progressPercentage = useMemo(() =>
    Math.round((completedCount / totalCount) * 100),
  [completedCount, totalCount]);

  // Modal yerine absolute positioning kullan (Android uyumluluğu için)
  if (!visible) return null;

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

  return (
    <View style={[styles.overlay, { paddingTop: statusBarHeight }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Text style={{ fontSize: 32 }}>📚</Text>
          </View>
          <Text style={styles.title}>Sınav Dönemi</Text>
          <Text style={styles.subtitle}>
            Karne açıklanmadan önce tüm sınavlara girmelisin!
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {completedCount}/{totalCount} sınav tamamlandı
            </Text>
            <Text style={styles.progressPercent}>{progressPercentage}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` }
              ]}
            />
          </View>
        </View>

        {/* Exam List */}
        <ScrollView
          style={styles.examList}
          contentContainerStyle={styles.examListContent}
          showsVerticalScrollIndicator={false}
        >
          {ALL_EXAM_SUBJECTS.map((subject) => {
            const info = EXAM_INFO[subject];
            const isCompleted = examsTaken.includes(subject);

            return (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.examItem,
                  isCompleted && styles.examItemCompleted,
                ]}
                onPress={() => !isCompleted && handleExamPress(subject)}
                disabled={isCompleted}
                activeOpacity={0.7}
              >
                <View style={styles.examItemLeft}>
                  <View style={[styles.examEmoji, { backgroundColor: info.color + '20' }]}>
                    <Text style={{ fontSize: 24 }}>{info.emoji}</Text>
                  </View>
                  <View style={styles.examInfo}>
                    <Text style={[
                      styles.examLabel,
                      isCompleted && styles.examLabelCompleted,
                    ]}>
                      {info.label}
                    </Text>
                    <Text style={styles.examStatus}>
                      {isCompleted ? '✓ Tamamlandı' : 'Sınava gir →'}
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.examBadge,
                  isCompleted ? styles.examBadgeCompleted : { backgroundColor: info.color },
                ]}>
                  {isCompleted ? (
                    <Feather name="check" size={16} color="#fff" />
                  ) : (
                    <Feather name="edit-2" size={14} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {allCompleted ? (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>
                ✨ Karneye Bak
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.warningBox}>
              <Feather name="alert-circle" size={18} color="#f59e0b" />
              <Text style={styles.warningText}>
                Karne görmek için tüm sınavları tamamla
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 10000,
    elevation: 10000,
  },
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    minHeight: 520,
    maxHeight: '90%',
    flexDirection: 'column',
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#e2e8f0',
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  examList: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 200,
  },
  examListContent: {
    padding: 12,
    paddingBottom: 8,
  },
  examItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  examItemCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  examItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  examEmoji: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  examInfo: {
    flex: 1,
  },
  examLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  examLabelCompleted: {
    color: '#10b981',
  },
  examStatus: {
    fontSize: 12,
    color: '#64748b',
  },
  examBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examBadgeCompleted: {
    backgroundColor: '#10b981',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  continueButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  warningText: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default ExamPeriodModal;
