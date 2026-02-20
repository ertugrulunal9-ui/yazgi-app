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

interface OnboardingProps {
  theme: ThemeTokens;
  metrics: DensityMetrics;
  onComplete: () => void;
}

// Simple typewriter that doesn't depend on UIProvider
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

// Interactive stat bar for slide 2
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

export const Onboarding: React.FC<OnboardingProps> = ({ theme, metrics, onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Slide 2 interactive state
  const [demoChoice, setDemoChoice] = useState<'A' | 'B' | null>(null);
  const [demoStats, setDemoStats] = useState({ zeka: 20, karisma: 20 });

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
      setDemoStats({ zeka: 65, karisma: 30 });
    } else {
      setDemoStats({ zeka: 30, karisma: 65 });
    }
  };

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return (
          <View style={styles.slideContent}>
            <SimpleTypewriter
              text="Bir hayat başlayacak..."
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
              Doğumdan mezuniyete, her anı{'\n'}senin seçimlerin belirleyecek.
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
              Her seçim seni değiştirir
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
                Arkadaşın seni dışarı çağırıyor. Ne yaparsın?
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
                    📚 Ders çalışırım
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
                    🎉 Arkadaşlarla buluşurum
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {demoChoice && (
              <View style={{ width: '100%' }}>
                <DemoStatBar label="🧠 Zeka" value={demoStats.zeka} color={theme.accentSkill} theme={theme} />
                <DemoStatBar label="✨ Karisma" value={demoStats.karisma} color={theme.accentEvent} theme={theme} />
                <Text style={{
                  fontSize: 12,
                  fontFamily: theme.fontBody,
                  color: theme.accentBrand,
                  textAlign: 'center',
                  marginTop: 8,
                }}>
                  {demoChoice === 'A'
                    ? 'Zekan arttı! Ama sosyal hayatın biraz geriledi.'
                    : 'Karizma arttı! Ama derslerden geri kaldın.'}
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
              Yazgı
            </Text>
            <Text style={{
              fontSize: 18,
              fontFamily: theme.fontBody,
              color: theme.textPrimary,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              Yazgın senin elinde.
            </Text>
            <Text style={{
              fontSize: 14,
              fontFamily: theme.fontBody,
              color: theme.textSecondary,
              textAlign: 'center',
              lineHeight: 22,
            }}>
              Hayat simülasyonunda kararlar ver,{'\n'}karakterini oluştur, kaderini belirle.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.appBg }]}>
      {/* Skip button */}
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
            Atla
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, paddingHorizontal: horizontalPad }]}>
        {renderSlide()}
      </Animated.View>

      {/* Navigation */}
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
            {currentSlide === 2 ? 'Hayatına Başla' : 'Devam'}
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
