import { Choice, EventContext, Family, GameEvent, NPCRole, Personality, PersonalityRequirement, Skills, Stats } from '../types';

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

  return filtered.length > 0 ? filtered : currentEvent.choices;
};
