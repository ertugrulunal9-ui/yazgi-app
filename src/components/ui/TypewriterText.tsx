import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
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
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 30,
  onComplete,
  style,
  accessibilityLabel,
}) => {
  const { uiPrefs, t } = useUI();
  const [visibleCount, setVisibleCount] = useState(uiPrefs.reduceMotion ? text.length : 0);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    setVisibleCount(uiPrefs.reduceMotion ? text.length : 0);
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
      setVisibleCount(prev => Math.min(prev + 1, text.length));
    }, speed);

    return () => {
      clearTimeout(timer);
    };
  }, [visibleCount, text.length, speed, onComplete, uiPrefs.reduceMotion]);

  const isComplete = uiPrefs.reduceMotion || visibleCount >= text.length;
  const displayedText = uiPrefs.reduceMotion ? text : text.slice(0, visibleCount);

  const handleSkip = useCallback(() => {
    if (isComplete) return;
    setVisibleCount(text.length);
  }, [isComplete, text.length]);

  return (
    <Pressable
      onPress={handleSkip}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || t('event.defaultFeedback', undefined, 'Event text')}
      accessibilityHint={isComplete ? undefined : t('common.continue', undefined, 'Tap to complete text')}
    >
      <Text allowFontScaling style={style}>
        {displayedText}
      </Text>
    </Pressable>
  );
};
