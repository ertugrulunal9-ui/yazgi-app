import {
  EventMemory,
  FateOutcome,
  GameState,
  InnerThoughtType,
  LifeGoal,
  NPC,
  Personality,
  PersonalityState,
  PersonalityTendency,
} from '../types';
import { normalizePersonalityState } from '../systems/PersonalityMomentumEngine';
import { GoalMismatchAnalysis } from './endingResolver';
import { getTraitName } from '../data/traits';
import { getMomentumVisibilityFromPersonalityState } from './momentumVisibility';
import { getPersonalityLevelDescription } from './personalitySystem';
import { buildNPCPersonalityReaction } from './npcPersonalityReaction';
import { getRuntimeStringArray, tRuntime } from '../i18n/strings';

const TENDENCIES: PersonalityTendency[] = ['HELPFUL', 'PRAGMATIC', 'AGGRESSIVE'];
const PERSONALITY_AXES: (keyof Personality)[] = ['openness', 'courage', 'empathy', 'patience', 'conformity'];

export interface StrategicMonologueInput {
  burdenRisk: number;
  age: number;
  turnsUntilNextAge?: number;
  selectedGoal: LifeGoal | null;
  goalMismatch: GoalMismatchAnalysis;
  traitProgress: GameState['traitProgress'];
  personalityState: Partial<PersonalityState> | undefined;
  turn: number;
  pendingCliffhanger?: { type: string; title: string; description: string };
  lastFateOutcome?: FateOutcome;
  recentHighWeightMemory?: EventMemory;
  turnsSinceMemory?: number;
  personality?: Personality;
  memories?: EventMemory[];
  lastEventNpcId?: string;
  npcs?: NPC[];
}

export interface StrategicMonologueResult {
  text: string;
  type: InnerThoughtType;
}

const pickByTurn = (messages: string[], turn: number, salt: number = 0): string => {
  const index = Math.abs(turn + salt) % messages.length;
  return messages[index];
};

const stripEmoji = (text: string): string =>
  text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();

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

const getNarrativeBank = (path: string): string[] => {
  return getRuntimeStringArray(path).map(line => line.trim()).filter(Boolean);
};

const localizeNarrativeLine = (
  key: string,
  params?: Record<string, string | number | boolean>
): string => tRuntime(key, params);

const buildCharacterIdentityThought = (
  nextAge: number,
  personality: Personality,
  dominantTendency: PersonalityTendency | null,
  turn: number,
): string | null => {
  const templates = getNarrativeBank(`narrative.monologue.banks.identity.age${nextAge}`);
  if (templates.length === 0) return null;

  let highAxis: keyof Personality = 'openness';
  let lowAxis: keyof Personality = 'openness';
  let highVal = -1;
  let lowVal = 101;

  for (const axis of PERSONALITY_AXES) {
    const val = personality[axis];
    if (val > highVal) { highVal = val; highAxis = axis; }
    if (val < lowVal) { lowVal = val; lowAxis = axis; }
  }

  if (highAxis === lowAxis) {
    let secondLowVal = 101;
    let secondLowAxis: keyof Personality = 'openness';
    for (const axis of PERSONALITY_AXES) {
      if (axis === highAxis) continue;
      const val = personality[axis];
      if (val < secondLowVal) { secondLowVal = val; secondLowAxis = axis; }
    }
    lowAxis = secondLowAxis;
  }

  const highLabel = getPersonalityLevelDescription(highAxis, highVal);
  const lowLabel = getPersonalityLevelDescription(lowAxis, lowVal).toLowerCase();

  const chosen = pickByTurn(templates, turn);
  let text = applyTemplate(chosen, { age: nextAge, highLabel, lowLabel });

  if (dominantTendency && nextAge >= 13) {
    const suffix = localizeNarrativeLine(`narrative.monologue.identity.tendency.${dominantTendency}`);
    if (suffix && suffix !== `narrative.monologue.identity.tendency.${dominantTendency}`) {
      text += ` ${suffix}`;
    }
  }

  return text;
};

export const getTurnsUntilNextAge = (currentAge: number, currentTurn: number): number | undefined => {
  if (currentAge >= 18) return undefined;
  const turnsPerAge = currentAge < 7 ? 2 : 5;
  const turnsIntoCurrentAge = currentTurn % turnsPerAge;
  return turnsPerAge - turnsIntoCurrentAge;
};

export const getStrategicMonologue = (input: StrategicMonologueInput): StrategicMonologueResult | null => {
  const {
    burdenRisk,
    age,
    turnsUntilNextAge,
    selectedGoal,
    goalMismatch,
    traitProgress,
    personalityState,
    turn,
    pendingCliffhanger,
    lastFateOutcome,
    recentHighWeightMemory,
    turnsSinceMemory,
  } = input;

  if (pendingCliffhanger && turn % 3 === 0) {
    const hints = getNarrativeBank('narrative.monologue.banks.cliffhanger')
      .map(line => applyTemplate(line, { title: pendingCliffhanger.title }));
    if (hints.length > 0) {
      return {
        text: pickByTurn(hints, turn),
        type: 'CLIFFHANGER',
      };
    }
  }

  if (burdenRisk > 80) {
    const lines = getNarrativeBank('narrative.monologue.banks.crisis.critical');
    if (lines.length > 0) {
      return { text: pickByTurn(lines, turn), type: 'CRISIS' };
    }
  }
  if (burdenRisk > 70) {
    const lines = getNarrativeBank('narrative.monologue.banks.crisis.severe');
    if (lines.length > 0) {
      return { text: pickByTurn(lines, turn), type: 'CRISIS' };
    }
  }
  if (burdenRisk > 60) {
    const lines = getNarrativeBank('narrative.monologue.banks.crisis.warning');
    if (lines.length > 0) {
      return { text: pickByTurn(lines, turn), type: 'CRISIS' };
    }
  }

  if (
    selectedGoal &&
    age >= 13 &&
    age <= 15 &&
    goalMismatch.selectedGoal &&
    goalMismatch.dominantGoal !== goalMismatch.selectedGoal &&
    (goalMismatch.selectedScore <= 45 || goalMismatch.gap >= 12)
  ) {
    const lines = getNarrativeBank(`narrative.monologue.banks.mismatch.${selectedGoal}`);
    if (lines.length > 0) {
      return {
        text: pickByTurn(lines, turn),
        type: 'MISMATCH',
      };
    }
  }

  const computedTurnsUntilNextAge = turnsUntilNextAge ?? getTurnsUntilNextAge(age, turn);
  if (computedTurnsUntilNextAge !== undefined && computedTurnsUntilNextAge <= 3) {
    const nextAge = age + 1;

    if (input.personality && [7, 10, 13, 15, 17, 18].includes(nextAge) && turn % 2 === 0) {
      const normalizedState = normalizePersonalityState(personalityState);
      const dominantTendency = TENDENCIES
        .slice()
        .sort((a, b) => normalizedState[b].streak - normalizedState[a].streak)[0] ?? null;
      const identityLine = buildCharacterIdentityThought(nextAge, input.personality, dominantTendency, turn);
      if (identityLine) {
        return { text: identityLine, type: 'IDLE' };
      }
    }

    const lines = getNarrativeBank(`narrative.monologue.banks.milestone.age${nextAge}`);
    if (lines.length > 0 && turn % 2 === 0) {
      return {
        text: applyTemplate(pickByTurn(lines, turn), { age: nextAge }),
        type: 'IDLE',
      };
    }
  }

  if (lastFateOutcome && (lastFateOutcome === 'CURSED' || lastFateOutcome === 'BLESSED')) {
    const fateLines = getNarrativeBank(`narrative.monologue.banks.fate.${lastFateOutcome}`);
    if (fateLines.length > 0 && turn % 4 === 0) {
      return {
        text: pickByTurn(fateLines, turn),
        type: 'MOMENTUM',
      };
    }
  }

  if (
    recentHighWeightMemory &&
    turnsSinceMemory !== undefined &&
    turnsSinceMemory >= 5 &&
    turnsSinceMemory <= 10 &&
    turn % 5 === 0
  ) {
    const lines = getNarrativeBank(`narrative.monologue.banks.memoryRecall.${recentHighWeightMemory.emotion}`);
    if (lines.length > 0) {
      return {
        text: pickByTurn(lines, turn),
        type: 'IDLE',
      };
    }
  }

  if (traitProgress) {
    const progressTemplates = getNarrativeBank('narrative.monologue.banks.trait.progress');
    const strongTemplates = getNarrativeBank('narrative.monologue.banks.trait.strong');

    const progressEntries = Object.entries(traitProgress);
    for (const [traitId, progress] of progressEntries) {
      if (
        progress &&
        !progress.isLocked &&
        progress.required > 0 &&
        progress.points / progress.required >= 0.5
      ) {
        const rawName = getTraitName(traitId);
        const traitName = stripEmoji(rawName);
        const ratio = progress.points / progress.required;
        const templates = ratio >= 0.7 ? strongTemplates : progressTemplates;
        if (templates.length === 0) continue;

        const template = pickByTurn(templates, turn, traitId.length);
        return {
          text: applyTemplate(template, { traitName }),
          type: 'TRAIT',
        };
      }
    }
  }

  const visibility = getMomentumVisibilityFromPersonalityState(personalityState);
  if (visibility.streakLevel === 'ACTIVE') {
    return { text: visibility.hint, type: 'MOMENTUM' };
  }
  if (visibility.streakLevel === 'BUILDING' && turn % 3 === 0 && visibility.hint) {
    return { text: visibility.hint, type: 'MOMENTUM' };
  }

  const normalized = normalizePersonalityState(personalityState);
  const dominant = TENDENCIES
    .slice()
    .sort((a, b) => {
      if (normalized[b].streak !== normalized[a].streak) {
        return normalized[b].streak - normalized[a].streak;
      }
      return normalized[b].multiplier - normalized[a].multiplier;
    })[0];

  if (dominant && visibility.streakLevel === 'POWERFUL' && normalized[dominant].streak >= 5) {
    const entry = normalized[dominant];
    const lines = getNarrativeBank(`narrative.monologue.banks.momentum.${dominant}`);
    if (lines.length > 0) {
      const index = Math.abs(turn + entry.streak + entry.count) % lines.length;
      return {
        text: lines[index],
        type: 'MOMENTUM',
      };
    }
  }

  if (input.personality && input.lastEventNpcId && input.npcs && input.npcs.length > 0) {
    const npc = input.npcs.find(n => n.id === input.lastEventNpcId);
    if (npc) {
      const normalizedForNPC = normalizePersonalityState(personalityState);
      const dominantTendencyForNPC = TENDENCIES
        .slice()
        .sort((a, b) => normalizedForNPC[b].streak - normalizedForNPC[a].streak)[0] ?? null;
      const reaction = buildNPCPersonalityReaction(npc, input.personality, dominantTendencyForNPC, age, turn);
      if (reaction) {
        return {
          text: localizeNarrativeLine('narrative.monologue.npcQuote', {
            npcName: reaction.npcName,
            line: reaction.line,
          }),
          type: 'MOMENTUM',
        };
      }
    }
  }

  return null;
};

export const getMomentumInternalMonologue = (
  personalityState: Partial<PersonalityState> | undefined,
  turn: number,
  threshold: number = 1.25
): string | null => {
  const normalized = normalizePersonalityState(personalityState);
  const dominant = TENDENCIES
    .slice()
    .sort((a, b) => {
      if (normalized[b].multiplier !== normalized[a].multiplier) {
        return normalized[b].multiplier - normalized[a].multiplier;
      }
      if (normalized[b].streak !== normalized[a].streak) {
        return normalized[b].streak - normalized[a].streak;
      }
      return normalized[b].count - normalized[a].count;
    })[0];

  if (!dominant) return null;
  const entry = normalized[dominant];
  if (entry.multiplier < threshold) return null;

  const lines = getNarrativeBank(`narrative.monologue.banks.momentum.${dominant}`);
  if (lines.length === 0) return null;
  const index = Math.abs(turn + entry.streak + entry.count) % lines.length;
  return lines[index];
};

export const composeInnerThought = (
  familyThought: string | null | undefined,
  strategicResult: StrategicMonologueResult | null,
  fallbackThought: string
): { text: string; type: InnerThoughtType } => {
  if (strategicResult) {
    return { text: strategicResult.text, type: strategicResult.type };
  }

  const familyText = familyThought?.trim();
  if (familyText) {
    return { text: familyText, type: 'IDLE' };
  }

  return { text: fallbackThought, type: 'IDLE' };
};
