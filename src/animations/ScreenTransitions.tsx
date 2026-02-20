/**
 * Ekran Geçiş Animasyonları
 * React Native Reanimated ile native ekran geçişleri
 * Performans için optimize edilmiş
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

export type TransitionType = 
  | 'fade'
  | 'fadeInDown'
  | 'fadeInUp'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'fadeOutDown'
  | 'fadeOutUp'
  | 'fadeOutLeft'
  | 'fadeOutRight';

interface ScreenTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  duration?: number;
  visible?: boolean;
}

/**
 * Ekran geçiş bileşeni
 */
export const ScreenTransition: React.FC<ScreenTransitionProps> = React.memo(({
  children,
  type = 'fade',
  duration = 300,
  visible = true,
}) => {
  const [opacity, setOpacity] = React.useState(0);
  const [translateY, setTranslateY] = React.useState(0);
  const [translateX, setTranslateX] = React.useState(0);

  React.useEffect(() => {
    if (visible) {
      // Fade in
      setOpacity(1);
      
      switch (type) {
        case 'fadeInDown':
          setTranslateY(0);
          break;
        case 'fadeInUp':
          setTranslateY(0);
          break;
        case 'fadeInLeft':
          setTranslateX(0);
          break;
        case 'fadeInRight':
          setTranslateX(0);
          break;
      }
    } else {
      // Fade out
      setOpacity(0);
      
      switch (type) {
        case 'fadeOutDown':
          setTranslateY(20);
          break;
        case 'fadeOutUp':
          setTranslateY(-20);
          break;
        case 'fadeOutLeft':
          setTranslateX(-20);
          break;
        case 'fadeOutRight':
          setTranslateX(20);
          break;
      }
    }
  }, [visible, type, duration]);

  const transformArray: any[] = [];
  if (translateY !== 0) {
    transformArray.push({ translateY });
  }
  if (translateX !== 0) {
    transformArray.push({ translateX });
  }

  return (
    <View style={[styles.container, { opacity, transform: transformArray }]}>
      {children}
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.visible === nextProps.visible &&
         prevProps.type === nextProps.type;
});

/**
 * Fade In Down animasyonu
 * NOT: children her zaman yeniden render edilmeli, memo kaldırıldı
 */
export const FadeInDownView: React.FC<{ children: ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const [opacity, setOpacity] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(1);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <View style={{ opacity }}>
      {children}
    </View>
  );
};

/**
 * Fade In Up animasyonu
 * NOT: children her zaman yeniden render edilmeli, memo kaldırıldı
 */
export const FadeInUpView: React.FC<{ children: ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const [opacity, setOpacity] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(1);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <View style={{ opacity }}>
      {children}
    </View>
  );
};

/**
 * Fade In Left animasyonu
 */
export const FadeInLeftView: React.FC<{ children: ReactNode; delay?: number }> = React.memo(({
  children,
  delay = 0,
}) => {
  const [opacity, setOpacity] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(1);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <View style={{ opacity }}>
      {children}
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.delay === nextProps.delay;
});

/**
 * Fade In Right animasyonu
 */
export const FadeInRightView: React.FC<{ children: ReactNode; delay?: number }> = React.memo(({
  children,
  delay = 0,
}) => {
  const [opacity, setOpacity] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(1);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <View style={{ opacity }}>
      {children}
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.delay === nextProps.delay;
});

/**
 * Basit Fade animasyonu
 */
export const FadeView: React.FC<{ children: ReactNode; visible?: boolean }> = React.memo(({
  children,
  visible = true,
}) => {
  return (
    <View style={{ display: visible ? 'flex' : 'none' }}>
      {children}
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.visible === nextProps.visible;
});

ScreenTransition.displayName = 'ScreenTransition';
FadeInLeftView.displayName = 'FadeInLeftView';
FadeInRightView.displayName = 'FadeInRightView';
FadeView.displayName = 'FadeView';

/**
 * Staggered (kademeli) fade in animasyonu
 * Çocukları sırayla animasyonla gösterir
 */
export const StaggeredFadeIn: React.FC<{
  children: ReactNode[];
}> = ({
  children,
}) => {
  return (
    <View style={styles.container}>
      {children.map((child, index) => (
        <View key={index}>
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenTransition;
