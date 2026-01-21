import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    id: 'welcome',
    title: '🎮 Yazgı\'ya Hoş Geldin',
    subtitle: 'Hayatını Şekillendiren Seçimler Yap',
    description: 'Yazgı\'da yaşamsal kararlarla karakterinizi geliştirin. Doğuştan 18 yaşına kadar eğitim, spor, çalışma ve sosyal aktiviteler yapın.',
  },
  {
    id: 'stats',
    title: '📊 Temel İstatistikler',
    subtitle: 'Her Aktivite Seni Değiştirir',
    description: 'Sağlık, Zeka, Karisma, Disiplin, Para, Enerji ve Aile İlişkileriniz vardır. Her seçim bu değerleri etkiler.',
  },
  {
    id: 'choices',
    title: '🎯 Seçimler Önemlidir',
    subtitle: 'Karakterini Oluştur',
    description: 'Rastgele olaylar meydana gelir. Nasıl tepki verdiğiniz, karakterinizi ve sonunuzu belirler.',
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerText: {
    fontSize: 12,
    color: '#666',
  },
  closeButton: {
    padding: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ff88',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#00ff88',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 22,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  navButton: {
    padding: 8,
  },
  nextButton: {
    backgroundColor: '#00ff88',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  nextButtonText: {
    color: '#1a1a2e',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        const { dx } = gestureState;
        if (dx < -50 && currentSlide < SLIDES.length - 1) {
          nextSlide();
        } else if (dx > 50 && currentSlide > 0) {
          prevSlide();
        }
      },
    })
  ).current;

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('@yazgi/onboarding_completed', 'true');
      onComplete();
    } catch (error) {
      console.error('Failed to save onboarding completion:', error);
      onComplete();
    }
  };

  const slide = SLIDES[currentSlide];
  const progress = (currentSlide + 1) / SLIDES.length;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {currentSlide + 1} / {SLIDES.length}
        </Text>
        <TouchableOpacity onPress={handleComplete} style={styles.closeButton}>
          <Feather name="x" size={24} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%` },
          ]}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.icon}>{slide.title.split(' ')[0]}</Text>
        <Text style={styles.title}>
          {slide.title}
        </Text>
        <Text style={styles.subtitle}>
          {slide.subtitle}
        </Text>
        <Text style={styles.description}>
          {slide.description}
        </Text>
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          onPress={prevSlide}
          disabled={currentSlide === 0}
          style={[styles.navButton, { opacity: currentSlide === 0 ? 0.3 : 1 }]}
        >
          <Feather name="chevron-left" size={28} color="#00ff88" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={nextSlide}
          style={styles.nextButton}
        >
          <Text style={styles.nextButtonText}>
            {currentSlide === SLIDES.length - 1 ? 'Başla' : 'Devam'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={nextSlide}
          disabled={currentSlide === SLIDES.length - 1}
          style={[styles.navButton, { opacity: currentSlide === SLIDES.length - 1 ? 0.3 : 1 }]}
        >
          <Feather name="chevron-right" size={28} color="#00ff88" />
        </TouchableOpacity>
      </View>
    </View>
  );
};