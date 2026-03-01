/**
 * src/types/index.ts — Backward-compatible re-export barrel
 *
 * Tüm mevcut `import { X } from '../types'` importları kırılmadan çalışır.
 * Her domain kendi dosyasında yaşar; bu dosya sadece hepsini bir araya getirir.
 */

export * from './core';
export * from './personality';
export * from './npc';
export * from './fate';
export * from './events';
export * from './game';
export * from './scars';
