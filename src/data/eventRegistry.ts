/**
 * eventRegistry.ts â€” Build-time & dev-mode event validation
 *
 * Zod schema'larÄ± event havuzunu erken yakalar:
 *   - minAge > maxAge Ã§eliÅŸkileri
 *   - GeÃ§ersiz id formatlarÄ± (snake_case zorunlu)
 *   - BoÅŸ choice listesi
 *   - Bilinmeyen rarity deÄŸerleri
 *
 * SaveValidation.ts'te zaten `zod` kullanÄ±lÄ±yor; ek baÄŸÄ±mlÄ±lÄ±k yok.
 *
 * KullanÄ±m:
 *   import { validateEventPool } from './eventRegistry';
 *   const validatedEvents = validateEventPool(rawEventPool);  // fÄ±rlatÄ±r veya dÃ¶ner
 */

import { z } from 'zod';
import type { GameEvent } from '../types/events';

// =================================================================
// CHOICE SCHEMA
// =================================================================

const ChoiceSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Choice text boÅŸ olamaz'),
  effect: z.record(z.number()),
  feedback: z.string().min(1, 'Feedback boÅŸ olamaz'),
  icon: z.string().optional(),
  grantTraits: z.array(z.string()).optional(),
  gradeUpdates: z.record(z.number()).optional(),
  skillUpdates: z.record(z.number()).optional(),
  inventoryAdd: z.array(z.string()).optional(),
  setSelectedGoal: z.string().nullable().optional(),
  reqStats: z.record(z.number()).optional(),
  reqSkills: z.record(z.number()).optional(),
  reqNPCRole: z.string().optional(),
  reqEventIds: z.array(z.string()).optional(),
  blockEventIds: z.array(z.string()).optional(),
  npcRelationChange: z.number().optional(),
  choiceType: z.enum(['PASSIVE', 'CHALLENGE', 'BREAKDOWN', 'NEUTRAL']).optional(),
  stressEffect: z.number().optional(),
  momentumTag: z.string().optional(),
  // Deep objects are loose-validated (functions not serializable via Zod)
  memory: z.object({
    emotion: z.enum(['REGRET', 'PRIDE', 'GUILT', 'SATISFACTION', 'NEUTRAL']),
    weight: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    relatedNpcId: z.string().optional(),
    customNote: z.string().optional(),
  }).optional(),
});

// =================================================================
// GAME EVENT SCHEMA
// =================================================================

const GameEventSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z][a-z0-9_]*$/, 'Event id snake_case olmalÄ± (Ã¶rn. "school_exam_day")'),
  // text: string veya function â€” Zod function'Ä± doÄŸrulayamaz, sadece string branch'i validate edilir
  text: z.union([z.string().min(1, 'Event text boÅŸ olamaz'), z.function()]),
  minAge: z.number().int().min(0).max(18),
  maxAge: z.number().int().min(0).max(18),
  condition: z.function().optional(),
  rarity: z.enum(['COMMON', 'UNCOMMON', 'RARE']).default('COMMON'),
  difficulty: z.number().min(1).max(5).optional(),
  isRepeatable: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  // choices: static Choice nesneleri veya function â€” fonksiyonlar geÃ§ilir
  choices: z.array(z.union([ChoiceSchema, z.function()])).min(1, 'En az 1 choice gerekli'),
  // KoÅŸullar loose-validate (partial stats/skills maps)
  reqStats: z.record(z.number()).optional(),
  reqSkills: z.record(z.number()).optional(),
  reqTraits: z.array(z.string()).optional(),
  reqNoItem: z.array(z.string()).optional(),
  reqNPCRole: z.string().optional(),
  relatedNpcId: z.string().optional(),
  reqEventIds: z.array(z.string()).optional(),
  blockEventIds: z.array(z.string()).optional(),
  reqMemory: z.object({
    emotion: z.enum(['REGRET', 'PRIDE', 'GUILT', 'SATISFACTION', 'NEUTRAL']),
    minWeight: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  }).optional(),
  personalityCategory: z.enum(['SOCIAL', 'RISK', 'MORAL', 'CONFLICT', 'GROWTH', 'BREAKDOWN']).optional(),
  milestoneLevel: z.enum(['MINOR', 'MAJOR']).optional(),
  isMilestoneEvent: z.boolean().optional(),
}).refine(
  (e) => e.minAge <= e.maxAge,
  (e) => ({ message: `"${e.id}": minAge (${e.minAge}) maxAge'den (${e.maxAge}) bÃ¼yÃ¼k olamaz` }),
);

// =================================================================
// PUBLIC API
// =================================================================

export type EventValidationError = {
  index: number;
  id: string | undefined;
  errors: string[];
};

/**
 * TÃ¼m event havuzunu validate eder.
 *
 * - Dev modunda veya build zamanÄ±nda Ã§aÄŸrÄ±lÄ±r.
 * - HatalÄ± event varsa console.error ile raporlar ve Error fÄ±rlatÄ±r.
 * - BaÅŸarÄ±lÄ±ysa type-safe GameEvent[] dÃ¶ner.
 *
 * @example
 * import { ALL_EVENTS } from './events';
 * import { validateEventPool } from './eventRegistry';
 * const events = validateEventPool(ALL_EVENTS);
 */
export function validateEventPool(events: unknown[]): GameEvent[] {
  const failures: EventValidationError[] = [];

  const validated = events.map((raw, index) => {
    const result = GameEventSchema.safeParse(raw);
    if (!result.success) {
      const id = (raw as Record<string, unknown>)?.id as string | undefined;
      failures.push({
        index,
        id,
        errors: result.error.errors.map((e) => `[${e.path.join('.')}] ${e.message}`),
      });
      return null;
    }
    return result.data as GameEvent;
  });

  if (failures.length > 0) {
    for (const f of failures) {
      console.error(
        `EventRegistry: Event[${f.index}] id="${f.id ?? '?'}" geÃ§ersiz:\n` +
        f.errors.map((e) => `  â€¢ ${e}`).join('\n'),
      );
    }
    throw new Error(
      `EventRegistry: ${failures.length} event doÄŸrulama hatasÄ±. Detaylar iÃ§in console.error Ã§Ä±ktÄ±sÄ±na bakÄ±n.`,
    );
  }

  return validated as GameEvent[];
}

/**
 * Tek bir event'i validate eder, geliÅŸtirme sÄ±rasÄ±nda kullanÄ±ÅŸlÄ±.
 * Hata varsa ilk hata mesajÄ±nÄ± dÃ¶ner, geÃ§erliyse null dÃ¶ner.
 */
export function validateSingleEvent(raw: unknown): string | null {
  const result = GameEventSchema.safeParse(raw);
  if (result.success) return null;
  return result.error.errors.map((e) => `[${e.path.join('.')}] ${e.message}`).join('; ');
}

/**
 * DEV-only: event havuzunu validate eder ama hata fÄ±rlatmaz.
 * UyarÄ±larÄ± dÃ¶ner, production'da no-op.
 */
export function auditEventPool(events: unknown[]): EventValidationError[] {
  if (process.env.NODE_ENV === 'production') return [];

  const failures: EventValidationError[] = [];
  for (let index = 0; index < events.length; index++) {
    const raw = events[index];
    const result = GameEventSchema.safeParse(raw);
    if (!result.success) {
      const id = (raw as Record<string, unknown>)?.id as string | undefined;
      failures.push({
        index,
        id,
        errors: result.error.errors.map((e) => `[${e.path.join('.')}] ${e.message}`),
      });
    }
  }
  return failures;
}

