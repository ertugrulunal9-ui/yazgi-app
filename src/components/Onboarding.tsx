import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeTokens } from '../utils/themeUtils';
import { DensityMetrics } from '../utils/themeUtils';
import { LifeGoal } from '../types';
import { getLifeGoalMeta } from '../utils/lifeGoalSystem';
import { AppLocale, t as translateStatic } from '../i18n/strings';

interface OnboardingProps {
  theme: ThemeTokens;
  metrics: DensityMetrics;
  locale?: AppLocale;
  onComplete: () => void;
}

// Simple typewriter that does not depend on UIProvider.
const SimpleTypewriter: React.FC<{
  text: string;
  style: object;
  speed?: number;
  onComplete?: () => void;
}> = ({ text, style, speed = 35, onComplete }) => {
  const [count, setCount] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    setCount(0);
  }, [text]);

  useEffect(() => {
    if (count >= text.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }
    const timer = setTimeout(() => setCount(prev => prev + 1), speed);
    return () => clearTimeout(timer);
  }, [count, text.length, speed, onComplete]);

  return <Text style={style}>{text.slice(0, count)}</Text>;
};

// Interactive stat bar for slide 2.
const DemoStatBar: React.FC<{
  label: string;
  value: number;
  color: string;
  theme: ThemeTokens;
}> = ({ label, value, color, theme }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: value,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [value, widthAnim]);

  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ color: theme.textSecondary, fontSize: 12, fontFamily: theme.fontBody, marginBottom: 4 }}>
        {label}
      </Text>
      <View style={{ height: 8, backgroundColor: theme.surfaceOverlay, borderRadius: 999, overflow: 'hidden' }}>
        <Animated.View style={{
          height: '100%',
          borderRadius: 999,
          backgroundColor: color,
          width: widthAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
        }} />
      </View>
    </View>
  );
};

const GOAL_ICONS: Record<LifeGoal, string> = {
  ACADEMIC: '\u{1F9E0}',
  ATHLETIC: '\u{1F3C3}',
  CREATIVE: '\u{1F3A8}',
  WEALTH: '\u{1F4BC}',
  SOCIAL: '\u{1F91D}',
};

interface GoalVisionOnboardingProps {
  theme: ThemeTokens;
  metrics: DensityMetrics;
  locale?: AppLocale;
  selectedGoal: LifeGoal;
  onContinue: () => void;
  onBack?: () => void;
}

export const GoalVisionOnboarding: React.FC<GoalVisionOnboardingProps> = ({
  theme,
  metrics,
  locale = 'tr',
  selectedGoal,
  onContinue,
  onBack,
}) => {
  const tStatic = useCallback(
    (key: string, params?: Record<string, string | number | boolean>, fallback?: string) =>
      translateStatic(locale, key, params, fallback),
    [locale]
  );

  const goalMeta = getLifeGoalMeta(selectedGoal);
  const goalLabel = goalMeta?.label ?? tStatic('goals.unknown', undefined, 'Hedef');
  const accentColor = goalMeta?.accentColor ?? theme.accentBrand;
  const icon = GOAL_ICONS[selectedGoal];
  const rawHint = goalMeta?.statHint ?? tStatic(
    'onboardingFlow.slides.requirementFallback',
    undefined,
    'Temel statlarini gelistir'
  );
  const statHints = rawHint
    .split('+')
    .map(part => part.trim())
    .filter(Boolean);

  return (
    <View style={{ flex: 1, backgroundColor: theme.appBg, paddingHorizontal: metrics.pad * 1.6, justifyContent: 'center' }}>
      <Text style={{ color: theme.textSecondary, textAlign: 'center', marginBottom: 8, fontSize: 12 }}>
        {tStatic('onboardingFlow.slides.dreamTitle', undefined, 'Bu Hayatta Hayalin')}
      </Text>

      <View style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.surfaceBase,
        padding: metrics.pad * 1.4,
      }}>
        <Text style={{ textAlign: 'center', fontSize: 64, marginBottom: 8 }}>{icon}</Text>
        <Text style={{ color: accentColor, textAlign: 'center', fontWeight: '800', fontSize: 24, marginBottom: 10 }}>
          {goalLabel}
        </Text>
        <Text style={{ color: theme.textSecondary, textAlign: 'center', marginBottom: 12 }}>
          {tStatic('onboardingFlow.slides.requirementTitle', undefined, 'Bunun icin gereken:')}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {statHints.map((hint) => (
            <View
              key={hint}
              style={{
                borderRadius: 999,
                borderWidth: 1,
                borderColor: `${accentColor}66`,
                backgroundColor: `${accentColor}18`,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 12 }}>
                {hint}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={onContinue}
        style={{
          marginTop: 14,
          minHeight: 50,
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: accentColor,
        }}
        activeOpacity={0.85}
      >
        <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 15 }}>
          {tStatic('onboardingFlow.slides.continue', undefined, 'Devam Et')}
        </Text>
      </TouchableOpacity>

      {onBack ? (
        <TouchableOpacity onPress={onBack} style={{ marginTop: 10, alignItems: 'center' }} activeOpacity={0.85}>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
            {tStatic('onboardingFlow.slides.back', undefined, 'Geri Don')}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export const Onboarding: React.FC<OnboardingProps> = ({ theme, metrics, locale = 'tr', onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Slide 2 interactive state.
  const [demoChoice, setDemoChoice] = useState<'A' | 'B' | null>(null);
  const [demoStats, setDemoStats] = useState({ intelligence: 20, charisma: 20 });

  const tStatic = useCallback(
    (key: string, params?: Record<string, string | number | boolean>, fallback?: string) =>
      translateStatic(locale, key, params, fallback),
    [locale]
  );

  const horizontalPad = useMemo(() => Math.max(20, metrics.pad * 1.6), [metrics.pad]);
  const footerPad = useMemo(() => Math.max(28, metrics.pad * 2), [metrics.pad]);
  const headerTop = useMemo(() => Math.max(40, metrics.pad * 3.5), [metrics.pad]);

  const animateTransition = useCallback((nextSlide: number) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentSlide(nextSlide);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim]);

  const handleComplete = useCallback(async () => {
    try {
      await AsyncStorage.setItem('@yazgi/onboarding_completed', 'true');
      onComplete();
    } catch {
      onComplete();
    }
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (currentSlide >= 2) {
      handleComplete();
      return;
    }
    animateTransition(currentSlide + 1);
  }, [currentSlide, animateTransition, handleComplete]);

  const handleDemoChoice = (choice: 'A' | 'B') => {
    setDemoChoice(choice);
    if (choice === 'A') {
      setDemoStats({ intelligence: 65, charisma: 30 });
    } else {
      setDemoStats({ intelligence: 30, charisma: 65 });
    }
  };

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return (
          <View style={styles.slideContent}>
            <SimpleTypewriter
              text={tStatic('onboardingFlow.slides.introLine', undefined, 'Bir hayat baslayacak...')}
              style={{
                fontSize: 30,
                fontWeight: '800',
                fontFamily: theme.fontHeading,
                color: theme.textPrimary,
                textAlign: 'center',
                marginBottom: 16,
              }}
            />
            <Text style={{
              fontSize: 16,
              fontFamily: theme.fontBody,
              color: theme.textSecondary,
              textAlign: 'center',
              lineHeight: 24,
            }}>
              {tStatic(
                'onboardingFlow.slides.introBody',
                undefined,
                'Dogumdan mezuniyete, her ani senin secimlerin belirleyecek.'
              )}
            </Text>
          </View>
        );

      case 1:
        return (
          <View style={styles.slideContent}>
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              fontFamily: theme.fontHeading,
              color: theme.textPrimary,
              textAlign: 'center',
              marginBottom: 24,
            }}>
              {tStatic('onboardingFlow.slides.choiceHeader', undefined, 'Her secim seni degistirir')}
            </Text>

            <View style={{
              backgroundColor: theme.surfaceRaised,
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: theme.border,
              marginBottom: 20,
              width: '100%',
            }}>
              <Text style={{
                fontSize: 14,
                fontFamily: theme.fontBody,
                color: theme.textSecondary,
                textAlign: 'center',
                marginBottom: 16,
              }}>
                {tStatic(
                  'onboardingFlow.slides.choicePrompt',
                  undefined,
                  'Arkadasin seni disari cagiriyor. Ne yaparsin?'
                )}
              </Text>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={[
                    styles.demoButton,
                    {
                      borderColor: demoChoice === 'A' ? theme.accentSkill : theme.border,
                      backgroundColor: demoChoice === 'A' ? theme.accentBrandMuted : theme.surfaceOverlay,
                      flex: 1,
                    },
                  ]}
                  onPress={() => handleDemoChoice('A')}
                >
                  <Text style={{ fontSize: 13, fontFamily: theme.fontBody, color: theme.textPrimary, textAlign: 'center' }}>
                    {'\u{1F4DA}'} {tStatic('onboardingFlow.slides.choiceStudy', undefined, 'Ders calisirim')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.demoButton,
                    {
                      borderColor: demoChoice === 'B' ? theme.accentEvent : theme.border,
                      backgroundColor: demoChoice === 'B' ? theme.accentBrandMuted : theme.surfaceOverlay,
                      flex: 1,
                    },
                  ]}
                  onPress={() => handleDemoChoice('B')}
                >
                  <Text style={{ fontSize: 13, fontFamily: theme.fontBody, color: theme.textPrimary, textAlign: 'center' }}>
                    {'\u{1F389}'} {tStatic('onboardingFlow.slides.choiceSocial', undefined, 'Arkadaslarla bulusurum')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {demoChoice && (
              <View style={{ width: '100%' }}>
                <DemoStatBar
                  label={`${'\u{1F9E0}'} ${tStatic('labels.stats.intelligence', undefined, 'Zeka')}`}
                  value={demoStats.intelligence}
                  color={theme.accentSkill}
                  theme={theme}
                />
                <DemoStatBar
                  label={`${'\u2728'} ${tStatic('labels.stats.charisma', undefined, 'Karizma')}`}
                  value={demoStats.charisma}
                  color={theme.accentEvent}
                  theme={theme}
                />
                <Text style={{
                  fontSize: 12,
                  fontFamily: theme.fontBody,
                  color: theme.accentBrand,
                  textAlign: 'center',
                  marginTop: 8,
                }}>
                  {demoChoice === 'A'
                    ? tStatic(
                      'onboardingFlow.slides.choiceStudyResult',
                      undefined,
                      'Zekan artti! Ama sosyal hayatin biraz geriledi.'
                    )
                    : tStatic(
                      'onboardingFlow.slides.choiceSocialResult',
                      undefined,
                      'Karizma artti! Ama derslerden geri kaldin.'
                    )}
                </Text>
              </View>
            )}
          </View>
        );

      case 2:
        return (
          <View style={styles.slideContent}>
            <Text style={{
              fontSize: 42,
              fontWeight: '800',
              fontFamily: theme.fontHeading,
              color: theme.accentBrand,
              textAlign: 'center',
              letterSpacing: 3,
              marginBottom: 12,
            }}>
              {tStatic('app.title', undefined, 'Yazgi')}
            </Text>
            <Text style={{
              fontSize: 18,
              fontFamily: theme.fontBody,
              color: theme.textPrimary,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              {tStatic('app.tagline', undefined, 'Kaderini sen yaz.')}
            </Text>
            <Text style={{
              fontSize: 14,
              fontFamily: theme.fontBody,
              color: theme.textSecondary,
              textAlign: 'center',
              lineHeight: 22,
            }}>
              {tStatic(
                'onboardingFlow.slides.outroBody',
                undefined,
                'Hayat simulasyonunda kararlar ver, karakterini olustur, kaderini belirle.'
              )}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.appBg }]}>
      <View style={[styles.header, { paddingHorizontal: horizontalPad, paddingTop: headerTop }]}>
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentSlide ? theme.accentBrand : theme.surfaceOverlay,
                  width: i === currentSlide ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
        <TouchableOpacity onPress={handleComplete} style={styles.skipButton}>
          <Text style={{ fontSize: 13, fontFamily: theme.fontBody, color: theme.textSecondary }}>
            {tStatic('onboardingFlow.slides.skip', undefined, 'Atla')}
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, paddingHorizontal: horizontalPad }]}>
        {renderSlide()}
      </Animated.View>

      <View style={[styles.footer, { paddingHorizontal: horizontalPad, paddingBottom: footerPad }]}>
        <TouchableOpacity
          onPress={handleNext}
          style={[styles.nextButton, { backgroundColor: theme.accentBrand }]}
        >
          <Text style={{
            color: '#0b1220',
            fontWeight: '700',
            fontFamily: theme.fontHeading,
            fontSize: 16,
          }}>
            {currentSlide === 2
              ? tStatic('onboardingFlow.slides.startLife', undefined, 'Hayatina Basla')
              : tStatic('onboardingFlow.slides.next', undefined, 'Devam')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  skipButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  slideContent: {
    width: '100%',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  demoButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
});
