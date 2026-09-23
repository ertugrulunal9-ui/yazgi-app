/**
 * src/types.ts — Backward-compatibility shim
 *
 * Bu dosya artık sadece src/types/ dizinindeki domain dosyalarını
 * yeniden export eder. Mevcut tüm importlar değişmeden çalışır:
 *
 *   import { GameState, GameEvent } from '../types'  ✓ çalışır
 *
 * Yeni kod doğrudan domain dosyasını import edebilir:
 *
 *   import type { GameEvent } from '../types/events'
 *   import type { Personality } from '../types/personality'
 */

export * from './types/core';
export * from './types/personality';
export * from './types/npc';
export * from './types/fate';
export * from './types/events';
export * from './types/game';
