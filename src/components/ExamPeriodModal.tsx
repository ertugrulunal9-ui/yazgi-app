import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ExamSubject, ALL_EXAM_SUBJECTS } from '../types';
import { ExamGameType } from '../data/actions';
import { tRuntime } from '../i18n/strings';

interface ExamPeriodModalProps {
  visible: boolean;
  examsTaken: ExamSubject[];
  onTakeExam: (examType: ExamGameType) => void;
  onClose: () => void;
}

const EXAM_INFO: Record<ExamSubject, {
  labelKey: string;
  fallback: string;
  emoji: string;
  color: string;
  examType: ExamGameType;
}> = {
  math: { labelKey: 'labels.grades.math', fallback: 'Matematik', emoji: '\u{1F522}', color: '#3b82f6', examType: 'MATH' },
  turkish: { labelKey: 'labels.grades.turkish', fallback: 'Turkce', emoji: '\u{1F4DD}', color: '#8b5cf6', examType: 'TURKISH' },
  science: { labelKey: 'labels.grades.science', fallback: 'Fen Bilgisi', emoji: '\u{1F52C}', color: '#10b981', examType: 'SCIENCE' },
  language: { labelKey: 'labels.grades.language', fallback: 'Yabanci Dil', emoji: '\u{1F30D}', color: '#f59e0b', examType: 'ENGLISH' },
  history: { labelKey: 'labels.grades.history', fallback: 'Tarih', emoji: '\u{1F4DC}', color: '#ec4899', examType: 'HISTORY' },
  geography: { labelKey: 'labels.grades.geography', fallback: 'Cografya', emoji: '\u{1F5FA}\uFE0F', color: '#06b6d4', examType: 'GEOGRAPHY' },
  art: { labelKey: 'labels.grades.art', fallback: 'Gorsel Sanatlar', emoji: '\u{1F3A8}', color: '#f97316', examType: 'ART' },
  music: { labelKey: 'labels.grades.music', fallback: 'Muzik', emoji: '\u{1F3B5}', color: '#22c55e', examType: 'MUSIC' },
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

  if (!visible) return null;

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;
  const title = tRuntime('app.examPeriod.title', undefined, 'Sinav Donemi');
  const subtitle = tRuntime(
    'app.examPeriod.subtitle',
    undefined,
    'Karne aciklanmadan once tum sinavlara girmelisin!'
  );
  const progressText = tRuntime(
    'app.examPeriod.progressText',
    { completed: completedCount, total: totalCount },
    `${completedCount}/${totalCount} sinav tamamlandi`
  );
  const completedStatus = tRuntime('app.examPeriod.completedStatus', undefined, 'Tamamlandi');
  const takeExamStatus = tRuntime('app.examPeriod.takeExamStatus', undefined, 'Sinava gir');
  const viewReport = tRuntime('app.examPeriod.viewReport', undefined, 'Karneye Bak');
  const completeAllWarning = tRuntime(
    'app.examPeriod.completeAllWarning',
    undefined,
    'Karne gormek icin tum sinavlari tamamla'
  );

  return (
    <View style={[styles.overlay, { paddingTop: statusBarHeight }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Text style={{ fontSize: 32 }}>{'\u{1F4DA}'}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>{progressText}</Text>
            <Text style={styles.progressPercent}>{progressPercentage}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
        </View>

        <ScrollView
          style={styles.examList}
          contentContainerStyle={styles.examListContent}
          showsVerticalScrollIndicator={false}
        >
          {ALL_EXAM_SUBJECTS.map((subject) => {
            const info = EXAM_INFO[subject];
            const isCompleted = examsTaken.includes(subject);
            const label = tRuntime(info.labelKey, undefined, info.fallback);

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
                  <View style={[styles.examEmoji, { backgroundColor: `${info.color}20` }]}>
                    <Text style={{ fontSize: 24 }}>{info.emoji}</Text>
                  </View>
                  <View style={styles.examInfo}>
                    <Text style={[
                      styles.examLabel,
                      isCompleted && styles.examLabelCompleted,
                    ]}>
                      {label}
                    </Text>
                    <Text style={styles.examStatus}>
                      {isCompleted ? `${'\u2713'} ${completedStatus}` : `${takeExamStatus} ${'\u2192'}`}
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

        <View style={styles.footer}>
          {allCompleted ? (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>
                {'\u2728'} {viewReport}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.warningBox}>
              <Feather name="alert-circle" size={18} color="#f59e0b" />
              <Text style={styles.warningText}>{completeAllWarning}</Text>
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
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  examInfo: {
    flex: 1,
  },
  examLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 2,
  },
  examLabelCompleted: {
    color: '#86efac',
  },
  examStatus: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  examBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  examBadgeCompleted: {
    backgroundColor: '#10b981',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  continueButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  warningBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningText: {
    color: '#fcd34d',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});
