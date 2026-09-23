/**
 * Performance Monitoring Utilities
 *
 * Development modunda performans sorunlarını tespit etmek için kullanılır.
 * Production'da otomatik olarak devre dışı kalır.
 *
 * Kullanım:
 * const endMeasure = measureRenderTime('MyComponent');
 * // ... render logic
 * useEffect(() => { endMeasure(); });
 */

// Performance threshold'ları (ms)
const THRESHOLDS = {
  FAST: 8,      // 120fps
  NORMAL: 16,   // 60fps
  SLOW: 33,     // 30fps
  VERY_SLOW: 50,
};

// Renk kodları (console için)
const COLORS = {
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  RED: '\x1b[31m',
  RESET: '\x1b[0m',
};

/**
 * Component render süresini ölçer
 * @param componentName - Ölçülecek component adı
 * @returns Ölçümü sonlandıran fonksiyon
 */
export const measureRenderTime = (componentName: string): (() => void) => {
  if (!__DEV__) {
    return () => {}; // Production'da no-op
  }

  const start = performance.now();

  return () => {
    const duration = performance.now() - start;

    if (duration > THRESHOLDS.VERY_SLOW) {
      console.warn(
        `${COLORS.RED}🐢 VERY SLOW RENDER: ${componentName} - ${duration.toFixed(2)}ms${COLORS.RESET}`
      );
    } else if (duration > THRESHOLDS.SLOW) {
      console.warn(
        `${COLORS.YELLOW}⚠️ Slow render: ${componentName} - ${duration.toFixed(2)}ms${COLORS.RESET}`
      );
    } else if (duration > THRESHOLDS.NORMAL) {
      console.log(
        `${COLORS.YELLOW}📊 ${componentName}: ${duration.toFixed(2)}ms${COLORS.RESET}`
      );
    }
    // FAST render'lar loglanmaz
  };
};

/**
 * Re-render sayısını izler
 * Hook olarak kullanılır
 */
export const useRenderCount = (componentName: string): void => {
  if (!__DEV__) return;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { useRef, useEffect } = require('react') as typeof import('react');
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    if (renderCount.current > 10) {
      console.warn(
        `${COLORS.YELLOW}⚠️ ${componentName} rendered ${renderCount.current} times${COLORS.RESET}`
      );
    }
  });
};

/**
 * Props değişikliklerini izler
 * Hangi prop'un re-render'a neden olduğunu tespit eder
 */
export const useWhyDidYouRender = <T extends Record<string, unknown>>(
  componentName: string,
  props: T
): void => {
  if (!__DEV__) return;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { useRef, useEffect } = require('react') as typeof import('react');
  const previousProps = useRef<T | null>(null);

  useEffect(() => {
    if (previousProps.current) {
      const changedProps: string[] = [];

      Object.keys(props).forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changedProps.push(key);
        }
      });

      if (changedProps.length > 0) {
        console.log(
          `${COLORS.GREEN}🔄 ${componentName} re-rendered due to:${COLORS.RESET}`,
          changedProps.join(', ')
        );
      }
    }

    previousProps.current = { ...props };
  });
};

/**
 * Async işlem süresini ölçer
 * @param operationName - İşlem adı
 * @param operation - Ölçülecek async fonksiyon
 */
export const measureAsyncOperation = async <T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> => {
  if (!__DEV__) {
    return operation();
  }

  const start = performance.now();
  try {
    const result = await operation();
    const duration = performance.now() - start;

    if (duration > 1000) {
      console.warn(
        `${COLORS.RED}🐢 SLOW ASYNC: ${operationName} - ${duration.toFixed(0)}ms${COLORS.RESET}`
      );
    } else if (duration > 500) {
      console.log(
        `${COLORS.YELLOW}⏱️ ${operationName}: ${duration.toFixed(0)}ms${COLORS.RESET}`
      );
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(
      `${COLORS.RED}❌ ${operationName} failed after ${duration.toFixed(0)}ms${COLORS.RESET}`
    );
    throw error;
  }
};

/**
 * Memory kullanımını loglar (varsa)
 */
export const logMemoryUsage = (label: string): void => {
  if (!__DEV__) return;

  // React Native'de performance.memory yok, bu yüzden sadece bir marker bırakıyoruz
  console.log(`📊 Memory checkpoint: ${label}`);
};

/**
 * FPS monitor - InteractionManager ile frame drop tespiti
 */
export const startFPSMonitor = (): (() => void) => {
  if (!__DEV__) return () => {};

  const { InteractionManager } = require('react-native');
  let frameCount = 0;
  let lastTime = performance.now();
  let running = true;

  const measureFrame = () => {
    if (!running) return;

    frameCount++;
    const now = performance.now();
    const elapsed = now - lastTime;

    if (elapsed >= 1000) {
      const fps = Math.round((frameCount * 1000) / elapsed);

      if (fps < 30) {
        console.warn(`${COLORS.RED}🐢 Low FPS: ${fps}${COLORS.RESET}`);
      } else if (fps < 50) {
        console.log(`${COLORS.YELLOW}📊 FPS: ${fps}${COLORS.RESET}`);
      }

      frameCount = 0;
      lastTime = now;
    }

    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(measureFrame);
    });
  };

  requestAnimationFrame(measureFrame);

  return () => {
    running = false;
  };
};

/**
 * Bundle boyut uyarısı (component bazlı)
 * Çok fazla import yapan dosyalar için uyarı
 */
export const warnLargeComponent = (componentName: string, estimatedSize: number): void => {
  if (!__DEV__) return;

  if (estimatedSize > 50) {
    console.warn(
      `${COLORS.YELLOW}📦 ${componentName} has ~${estimatedSize} imports. Consider code splitting.${COLORS.RESET}`
    );
  }
};
