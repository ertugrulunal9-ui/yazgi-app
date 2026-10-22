import { Choice, EventContext, Family, GameEvent, NPCRole, Personality, PersonalityRequirement, Skills, Stats } from '../types';
import { tRuntime } from '../i18n/strings';

const meetsPersonality = (
  requirements: PersonalityRequirement[] | undefined,
  personality: Personality
): boolean => {
  if (!requirements || requirements.length === 0) return true;
  return requirements.every(req => {
    const value = personality[req.axis];
    if (req.min !== undefined && value < req.min) return false;
    if (req.max !== undefined && value > req.max) return false;
    return true;
  });
};

const meetsStats = (reqStats: Partial<Stats> | undefined, currentStats: Stats): boolean => {
  if (!reqStats) return true;
  return Object.entries(reqStats).every(([key, value]) => {
    if (typeof value !== 'number') return true;
    const statValue = currentStats[key as keyof Stats] ?? 0;
    return statValue >= value;
  });
};

const meetsFamily = (
  reqFamily: { wealth?: Family['wealth'][]; dynamic?: Family['dynamic'][] } | undefined,
  family: Family | null
): boolean => {
  if (!reqFamily) return true;
  if (!family) return false;
  if (reqFamily.wealth && !reqFamily.wealth.includes(family.wealth)) return false;
  if (reqFamily.dynamic && !reqFamily.dynamic.includes(family.dynamic)) return false;
  return true;
};

const meetsSkills = (reqSkills: Partial<Skills> | undefined, skills: Skills): boolean => {
  if (!reqSkills) return true;
  return Object.entries(reqSkills).every(([key, value]) => {
    if (typeof value !== 'number') return true;
    return (skills[key as keyof Skills] ?? 0) >= value;
  });
};

const meetsNpcRole = (reqNPCRole: NPCRole | undefined, npcRoles: NPCRole[]): boolean => {
  if (!reqNPCRole) return true;
  return npcRoles.includes(reqNPCRole);
};

const meetsEventHistory = (
  reqEventIds: string[] | undefined,
  blockEventIds: string[] | undefined,
  eventChoiceSet: Set<string>
): boolean => {
  if (reqEventIds && !reqEventIds.every(id => eventChoiceSet.has(id))) return false;
  if (blockEventIds && blockEventIds.some(id => eventChoiceSet.has(id))) return false;
  return true;
};

interface GetChoicesToRenderArgs {
  currentEvent: GameEvent | null;
  resolveChoice: (choice: Choice | ((ctx: EventContext) => Choice)) => Choice;
  personality: Personality;
  stats: Stats;
  family: Family | null;
  skills: Skills;
  npcRoles: NPCRole[];
  eventChoiceSet: Set<string>;
}

export const getChoicesToRender = ({
  currentEvent,
  resolveChoice,
  personality,
  stats,
  family,
  skills,
  npcRoles,
  eventChoiceSet,
}: GetChoicesToRenderArgs): (Choice | ((ctx: EventContext) => Choice))[] | null => {
  if (!currentEvent) return null;

  const filtered = currentEvent.choices.filter(choice => {
    const resolved = resolveChoice(choice);
    if (resolved.reqPersonality && !meetsPersonality(resolved.reqPersonality, personality)) return false;
    if (resolved.reqStats && !meetsStats(resolved.reqStats, stats)) return false;
    if (resolved.reqFamily && !meetsFamily(resolved.reqFamily, family)) return false;
    if (resolved.reqSkills && !meetsSkills(resolved.reqSkills, skills)) return false;
    if (resolved.reqNPCRole && !meetsNpcRole(resolved.reqNPCRole, npcRoles)) return false;
    if (!meetsEventHistory(resolved.reqEventIds, resolved.blockEventIds, eventChoiceSet)) return false;
    return true;
  });

  if (filtered.length > 0) return filtered;
  return currentEvent.choices;
};

export type ChoiceLockReason =
  | { kind: 'personality'; axis: keyof Personality; bound: 'min' | 'max' }
  | { kind: 'stats'; stat: keyof Stats; min: number }
  | { kind: 'skills'; skill: keyof Skills; min: number }
  | { kind: 'family' };

export interface LockedChoice {
  choice: Choice;
  reason: ChoiceLockReason;
}

/**
 * Kişilik/stat/beceri/aile şartı yüzünden gizlenen seçenekleri nedeniyle döner;
 * oyuncuya gri ve kilitli gösterilir. Olay geçmişi ve NPC şartları hikâyeyi
 * önceden açık etmemek için listelenmez.
 */
export const getLockedChoices = ({
  currentEvent,
  resolveChoice,
  personality,
  stats,
  family,
  skills,
  npcRoles,
  eventChoiceSet,
}: GetChoicesToRenderArgs): LockedChoice[] => {
  if (!currentEvent) return [];
  const rendered = getChoicesToRender({
    currentEvent, resolveChoice, personality, stats, family, skills, npcRoles, eventChoiceSet,
  });
  // Hepsi kilitliyse getChoicesToRender zaten tümünü gösterir
  if (!rendered || rendered.length === currentEvent.choices.length) return [];

  const locked: LockedChoice[] = [];
  for (const choice of currentEvent.choices) {
    if (rendered.includes(choice)) continue;
    const resolved = resolveChoice(choice);
    // Gizli tutulan şartlar: geçmiş olaylar ve NPC rolleri
    if (resolved.reqNPCRole && !meetsNpcRole(resolved.reqNPCRole, npcRoles)) continue;
    if (!meetsEventHistory(resolved.reqEventIds, resolved.blockEventIds, eventChoiceSet)) continue;

    const failedPersonality = resolved.reqPersonality?.find(req => !meetsPersonality([req], personality));
    if (failedPersonality) {
      const value = personality[failedPersonality.axis];
      const bound = failedPersonality.min !== undefined && value < failedPersonality.min ? 'min' : 'max';
      // "max" şartları düşük eksenli karakterlere ayrılmış gelişim seçenekleridir; kilitli
      // gösterildiklerinde "Bunu yapamayacak kadar fedakârsın" gibi anlamsız okunuyorlar.
      // Bu yüzden yalnızca doğal okunan "min" kilitleri ("yeterince cesur değilsin") gösterilir.
      if (bound === 'max') continue;
      locked.push({ choice: resolved, reason: { kind: 'personality', axis: failedPersonality.axis, bound } });
      continue;
    }
    const failedStat = Object.entries(resolved.reqStats ?? {}).find(
      ([key, value]) => typeof value === 'number' && (stats[key as keyof Stats] ?? 0) < value,
    );
    if (failedStat) {
      locked.push({ choice: resolved, reason: { kind: 'stats', stat: failedStat[0] as keyof Stats, min: failedStat[1] as number } });
      continue;
    }
    const failedSkill = Object.entries(resolved.reqSkills ?? {}).find(
      ([key, value]) => typeof value === 'number' && (skills[key as keyof Skills] ?? 0) < value,
    );
    if (failedSkill) {
      locked.push({ choice: resolved, reason: { kind: 'skills', skill: failedSkill[0] as keyof Skills, min: failedSkill[1] as number } });
      continue;
    }
    if (resolved.reqFamily && !meetsFamily(resolved.reqFamily, family)) {
      locked.push({ choice: resolved, reason: { kind: 'family' } });
    }
  }
  return locked;
};

/** Kilit nedenini oyuncuya gösterilecek kısa cümleye çevirir. */
export const describeLockReason = (reason: ChoiceLockReason): string => {
  switch (reason.kind) {
    case 'personality':
      return tRuntime(`ui.event.locked.personality.${reason.axis}.${reason.bound}`);
    case 'stats':
      return tRuntime('ui.event.locked.stat', {
        stat: tRuntime(`labels.stats.${reason.stat}`, undefined, reason.stat),
        value: reason.min,
      });
    case 'skills':
      return tRuntime('ui.event.locked.skill', {
        skill: tRuntime(`labels.skills.${reason.skill}`, undefined, reason.skill),
      });
    case 'family':
      return tRuntime('ui.event.locked.family');
    default:
      return '';
  }
};
