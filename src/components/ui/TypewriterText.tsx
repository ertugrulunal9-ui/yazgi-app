import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  View,
  StyleProp,
  Text,
  TextStyle,
} from 'react-native';
import { useUI } from '../../context/UIContext';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  /**
   * true: tam metin görünmez olarak yerleşimde yer tutar, yazılan kısım üstüne bindirilir;
   * içerik yazılırken aşağı kaymaz (altındaki düğmeler yer değiştirmez).
   */
  reserveSpace?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 30,
  onComplete,
  style,
  accessibilityLabel,
  reserveSpace = false,
}) => {
  const { uiPrefs, t } = useUI();
  // Sayaç ait olduğu metinle birlikte tutulur: metin değiştiği render'da eski metnin sayısı yeni metni
  // "bitmiş" gösterip onComplete'i erken çağırmasın (ör. Kaderi Yeniden Çevir sonrası kısa metin).
  const [progress, setProgress] = useState(() => ({ text, count: uiPrefs.reduceMotion ? text.length : 0 }));
  const visibleCount = progress.text === text ? progress.count : (uiPrefs.reduceMotion ? text.length : 0);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    setProgress({ text, count: uiPrefs.reduceMotion ? text.length : 0 });
  }, [text, uiPrefs.reduceMotion]);

  useEffect(() => {
    if (uiPrefs.reduceMotion) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return undefined;
    }

    if (visibleCount >= text.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return undefined;
    }

    const timer = setTimeout(() => {
      setProgress(prev => ({
        text,
        count: Math.min((prev.text === text ? prev.count : 0) + 1, text.length),
      }));
    }, speed);

    return () => {
      clearTimeout(timer);
    };
  }, [visibleCount, text, speed, onComplete, uiPrefs.reduceMotion]);

  const isComplete = uiPrefs.reduceMotion || visibleCount >= text.length;
  const displayedText = uiPrefs.reduceMotion ? text : text.slice(0, visibleCount);

  const handleSkip = useCallback(() => {
    if (isComplete) return;
    setProgress({ text, count: text.length });
  }, [isComplete, text]);

  return (
    <Pressable
      onPress={handleSkip}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || t('event.defaultFeedback', undefined, 'Event text')}
      accessibilityHint={isComplete ? undefined : t('common.continue', undefined, 'Tap to complete text')}
    >
      {reserveSpace ? (
        <View>
          <Text allowFontScaling style={[style, { opacity: 0 }]} accessible={false} importantForAccessibility="no-hide-descendants">
            {text}
          </Text>
          <Text allowFontScaling style={[style, { position: 'absolute', top: 0, left: 0, right: 0 }]}>
            {displayedText}
          </Text>
        </View>
      ) : (
        <Text allowFontScaling style={style}>
          {displayedText}
        </Text>
      )}
    </Pressable>
  );
};
