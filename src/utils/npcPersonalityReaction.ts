import { NPC, NPCRole } from '../types/npc';
import { Personality, PersonalityTendency } from '../types';
import { getPersonalityLevelDescription } from './personalitySystem';
import { getRuntimeStringArray, tRuntime } from '../i18n/strings';

type PersonalityAxis = keyof Personality;

const hashSeed = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const findDominantAxis = (personality: Personality): PersonalityAxis => {
  const axes: PersonalityAxis[] = ['openness', 'courage', 'empathy', 'patience', 'conformity'];
  let dominant: PersonalityAxis = 'openness';
  let maxDist = 0;
  for (const axis of axes) {
    const dist = Math.abs(personality[axis] - 50);
    if (dist > maxDist) {
      maxDist = dist;
      dominant = axis;
    }
  }
  return dominant;
};

const roleKeyByRole: Record<NPCRole, string> = {
  ACQUAINTANCE: 'acquaintance',
  FRIEND: 'friend',
  BEST_FRIEND: 'best_friend',
  CRUSH: 'crush',
  PARTNER: 'partner',
  RIVAL: 'rival',
  ENEMY: 'enemy',
};

const applyTemplate = (
  text: string,
  params?: Record<string, string | number | boolean>
): string => {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, token: string) => {
    const raw = params[token];
    return raw === undefined ? `{${token}}` : String(raw);
  });
};

export interface NPCPersonalityReactionResult {
  line: string;
  npcName: string;
}

export const buildNPCPersonalityReaction = (
  npc: NPC,
  personality: Personality,
  _dominantTendency: PersonalityTendency | null,
  age: number,
  turn: number,
): NPCPersonalityReactionResult | null => {
  if (npc.role === 'ACQUAINTANCE' || age < 8) return null;

  const trigger = hashSeed(`npc_react:${npc.id}:${turn}`) % 10;
  if (trigger >= 6) return null;

  const dominantAxis = findDominantAxis(personality);
  const roleKey = roleKeyByRole[npc.role];
  const lines = getRuntimeStringArray(`narrative.npcReaction.${roleKey}.${dominantAxis}`);
  if (lines.length === 0) return null;

  const index = hashSeed(`${npc.id}:${dominantAxis}:${turn}`) % lines.length;
  const axisLabel = getPersonalityLevelDescription(dominantAxis, personality[dominantAxis]);
  const line = applyTemplate(lines[index], { axisLabel });

  return {
    line: tRuntime('narrative.npcReaction.formatted', { line, axisLabel }),
    npcName: npc.name,
  };
};
