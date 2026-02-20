/**
 * Dev-only logger utility.
 * console.log/warn/debug çağrıları prod'da JS thread'i meşgul eder.
 * Bu modül __DEV__ guard'ı ile sadece development'ta log üretir.
 *
 * Kullanım:
 *   import { devLog } from '../utils/devLogger';
 *   devLog.log('[SaveManager]', 'slot saved');
 *   devLog.warn('[Analytics]', 'missing param');
 *   devLog.error('[Critical]', error);  // error her zaman loglanır
 */

const noop = (..._args: unknown[]): void => {};

export const devLog = {
  log: __DEV__ ? console.log.bind(console) : noop,
  warn: __DEV__ ? console.warn.bind(console) : noop,
  debug: __DEV__ ? (console.debug ?? console.log).bind(console) : noop,
  error: console.error.bind(console),
};
