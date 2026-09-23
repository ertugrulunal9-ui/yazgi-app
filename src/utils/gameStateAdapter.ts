import {
  AcademicState,
  CharacterState,
  EventState,
  GameState,
  GameStateUpdate,
  ProgressState,
  SocialState,
  Stats,
} from '../types';
import { createInitialPersonalityState } from '../systems/PersonalityMomentumEngine';

const areStatsEqual = (a: Stats | undefined, b: Stats | undefined): boolean => {
  if (!a || !b) return a === b;
  return (
    a.health === b.health &&
    a.intelligence === b.intelligence &&
    a.charisma === b.charisma &&
    a.discipline === b.discipline &&
    a.money === b.money &&
    a.energy === b.energy &&
    a.familyRelation === b.familyRelation
  );
};

export const buildProgressState = (gameState: GameState): ProgressState => ({
  age: gameState.age,
  turn: gameState.turn,
  totalTurns: gameState.totalTurns,
  phase: gameState.phase,
  sessionCount: gameState.sessionCount,
  adaptivePacingStreak: gameState.adaptivePacingStreak,
});

export const buildCharacterState = (gameState: GameState): CharacterState => ({
  characterInfo: gameState.characterInfo,
  personality: gameState.personality,
  stress: gameState.stress,
  personalityHistory: gameState.personalityHistory,
  personalityState: gameState.personalityState ?? createInitialPersonalityState(),
  traits: gameState.traits,
  traitProgress: gameState.traitProgress,
});

export const buildSocialState = (gameState: GameState): SocialState => ({
  npcs: gameState.npcs,
  selectedNpcId: gameState.selectedNpcId,
  socialGroups: gameState.socialGroups,
  socialReputation: gameState.socialReputation,
});

export const buildAcademicState = (gameState: GameState): AcademicState => ({
  schoolGrades: gameState.schoolGrades,
  skills: gameState.skills,
  talent: gameState.talent,
  examsTakenThisYear: gameState.examsTakenThisYear,
  isExamPeriod: gameState.isExamPeriod,
});

export const buildEventChoiceSet = (eventChoiceHistory: string[]): Set<string> => new Set(eventChoiceHistory);

export const buildEventState = (
  gameState: GameState,
  previousEventState?: EventState
): EventState => {
  const shouldReuseChoiceSet =
    previousEventState?.eventChoiceHistory === gameState.eventChoiceHistory &&
    previousEventState._eventChoiceSet !== undefined;

  return {
    currentEvent: gameState.currentEvent,
    lastResult: gameState.lastResult,
    recentEvents: gameState.recentEvents,
    scheduledEvents: gameState.scheduledEvents,
    memories: gameState.memories,
    eventChoiceHistory: gameState.eventChoiceHistory,
    activeArcs: gameState.activeArcs || [],
    _eventChoiceSet: shouldReuseChoiceSet
      ? previousEventState?._eventChoiceSet
      : buildEventChoiceSet(gameState.eventChoiceHistory),
  };
};

const areProgressStatesEqual = (a: ProgressState | undefined, b: ProgressState): boolean =>
  Boolean(
    a &&
      a.age === b.age &&
      a.turn === b.turn &&
      a.totalTurns === b.totalTurns &&
      a.phase === b.phase &&
      a.sessionCount === b.sessionCount &&
      a.adaptivePacingStreak === b.adaptivePacingStreak
  );

const areCharacterStatesEqual = (a: CharacterState | undefined, b: CharacterState): boolean =>
  Boolean(
    a &&
      a.characterInfo === b.characterInfo &&
      a.personality === b.personality &&
      a.stress === b.stress &&
      a.personalityHistory === b.personalityHistory &&
      a.personalityState === b.personalityState &&
      a.traits === b.traits &&
      a.traitProgress === b.traitProgress
  );

const areSocialStatesEqual = (a: SocialState | undefined, b: SocialState): boolean =>
  Boolean(
    a &&
      a.npcs === b.npcs &&
      a.selectedNpcId === b.selectedNpcId &&
      a.socialGroups === b.socialGroups &&
      a.socialReputation === b.socialReputation
  );

const areAcademicStatesEqual = (a: AcademicState | undefined, b: AcademicState): boolean =>
  Boolean(
    a &&
      a.schoolGrades === b.schoolGrades &&
      a.skills === b.skills &&
      a.talent === b.talent &&
      a.examsTakenThisYear === b.examsTakenThisYear &&
      a.isExamPeriod === b.isExamPeriod
  );

const areEventStatesEqual = (a: EventState | undefined, b: EventState): boolean =>
  Boolean(
    a &&
      a.currentEvent === b.currentEvent &&
      a.lastResult === b.lastResult &&
      a.recentEvents === b.recentEvents &&
      a.scheduledEvents === b.scheduledEvents &&
      a.memories === b.memories &&
      a.eventChoiceHistory === b.eventChoiceHistory &&
      a.activeArcs === b.activeArcs &&
      a._eventChoiceSet === b._eventChoiceSet
  );

const mergeStats = (
  previousStats: Stats | undefined,
  incomingStats: Stats | Partial<Stats> | undefined
): Stats | undefined => {
  if (!incomingStats) return previousStats;
  if (!previousStats) return incomingStats as Stats;
  return {
    ...previousStats,
    ...incomingStats,
  };
};

const applyProgressUpdate = (nextGameState: GameState, progress?: Partial<ProgressState>): void => {
  if (!progress) return;
  if (progress.age !== undefined) nextGameState.age = progress.age;
  if (progress.turn !== undefined) nextGameState.turn = progress.turn;
  if (progress.totalTurns !== undefined) nextGameState.totalTurns = progress.totalTurns;
  if (progress.phase !== undefined) nextGameState.phase = progress.phase;
  if (progress.sessionCount !== undefined) nextGameState.sessionCount = progress.sessionCount;
  if (progress.adaptivePacingStreak !== undefined) nextGameState.adaptivePacingStreak = progress.adaptivePacingStreak;
};

const applyCharacterUpdate = (nextGameState: GameState, character?: Partial<CharacterState>): void => {
  if (!character) return;
  if (character.characterInfo !== undefined) nextGameState.characterInfo = character.characterInfo;
  if (character.personality !== undefined) nextGameState.personality = character.personality;
  if (character.stress !== undefined) nextGameState.stress = character.stress;
  if (character.personalityHistory !== undefined) nextGameState.personalityHistory = character.personalityHistory;
  if (character.personalityState !== undefined) nextGameState.personalityState = character.personalityState;
  if (character.traits !== undefined) nextGameState.traits = character.traits;
  if (character.traitProgress !== undefined) nextGameState.traitProgress = character.traitProgress;
};

const applySocialUpdate = (nextGameState: GameState, social?: Partial<SocialState>): void => {
  if (!social) return;
  if (social.npcs !== undefined) nextGameState.npcs = social.npcs;
  if (social.selectedNpcId !== undefined) nextGameState.selectedNpcId = social.selectedNpcId;
  if (social.socialGroups !== undefined) nextGameState.socialGroups = social.socialGroups;
  if (social.socialReputation !== undefined) nextGameState.socialReputation = social.socialReputation;
};

const applyAcademicUpdate = (nextGameState: GameState, academic?: Partial<AcademicState>): void => {
  if (!academic) return;
  if (academic.schoolGrades !== undefined) nextGameState.schoolGrades = academic.schoolGrades;
  if (academic.skills !== undefined) nextGameState.skills = academic.skills;
  if (academic.talent !== undefined) nextGameState.talent = academic.talent;
  if (academic.examsTakenThisYear !== undefined) nextGameState.examsTakenThisYear = academic.examsTakenThisYear;
  if (academic.isExamPeriod !== undefined) nextGameState.isExamPeriod = academic.isExamPeriod;
};

const applyEventUpdate = (nextGameState: GameState, events?: Partial<EventState>): void => {
  if (!events) return;
  if (events.currentEvent !== undefined) nextGameState.currentEvent = events.currentEvent;
  if (events.lastResult !== undefined) nextGameState.lastResult = events.lastResult;
  if (events.recentEvents !== undefined) nextGameState.recentEvents = events.recentEvents;
  if (events.scheduledEvents !== undefined) nextGameState.scheduledEvents = events.scheduledEvents;
  if (events.memories !== undefined) nextGameState.memories = events.memories;
  if (events.eventChoiceHistory !== undefined) nextGameState.eventChoiceHistory = events.eventChoiceHistory;
  if (events.activeArcs !== undefined) nextGameState.activeArcs = events.activeArcs;
};

export const ensureStructuredGameState = (
  nextGameState: GameState,
  previousGameState?: GameState,
  fallbackStats?: Stats
): GameState => {
  const resolvedStats = nextGameState.stats ?? previousGameState?.stats ?? fallbackStats;
  const progress = buildProgressState(nextGameState);
  const character = buildCharacterState(nextGameState);
  const social = buildSocialState(nextGameState);
  const academic = buildAcademicState(nextGameState);
  const events = buildEventState(nextGameState, previousGameState?.events);

  const structured: GameState = {
    ...nextGameState,
    progress: areProgressStatesEqual(previousGameState?.progress, progress)
      ? previousGameState?.progress
      : progress,
    character: areCharacterStatesEqual(previousGameState?.character, character)
      ? previousGameState?.character
      : character,
    social: areSocialStatesEqual(previousGameState?.social, social)
      ? previousGameState?.social
      : social,
    academic: areAcademicStatesEqual(previousGameState?.academic, academic)
      ? previousGameState?.academic
      : academic,
    events: areEventStatesEqual(previousGameState?.events, events)
      ? previousGameState?.events
      : events,
    stats: areStatsEqual(previousGameState?.stats, resolvedStats)
      ? previousGameState?.stats
      : resolvedStats,
  };

  return structured;
};

export const mergeGameStateUpdate = (
  previousGameState: GameState,
  updates: GameStateUpdate,
  fallbackStats?: Stats
): GameState => {
  const { progress, character, social, academic, events, stats, ...flatUpdates } = updates;

  const nextGameState: GameState = {
    ...previousGameState,
    ...flatUpdates,
  };

  applyProgressUpdate(nextGameState, progress);
  applyCharacterUpdate(nextGameState, character);
  applySocialUpdate(nextGameState, social);
  applyAcademicUpdate(nextGameState, academic);
  applyEventUpdate(nextGameState, events);
  nextGameState.stats = mergeStats(previousGameState.stats ?? fallbackStats, stats);

  return ensureStructuredGameState(nextGameState, previousGameState, fallbackStats);
};

export const getProgressState = (gameState: GameState): ProgressState =>
  gameState.progress ?? buildProgressState(gameState);

export const getCharacterState = (gameState: GameState): CharacterState =>
  gameState.character ?? buildCharacterState(gameState);

export const getSocialState = (gameState: GameState): SocialState =>
  gameState.social ?? buildSocialState(gameState);

export const getAcademicState = (gameState: GameState): AcademicState =>
  gameState.academic ?? buildAcademicState(gameState);

export const getEventState = (gameState: GameState): EventState =>
  gameState.events ?? buildEventState(gameState);

export const getEventChoiceSet = (gameState: GameState): Set<string> => {
  const events = getEventState(gameState);
  return events._eventChoiceSet ?? buildEventChoiceSet(events.eventChoiceHistory);
};

export const stripRuntimeGameStateCaches = (gameState: GameState): GameState => {
  if (!gameState.events?._eventChoiceSet) {
    return gameState;
  }

  const { _eventChoiceSet, ...persistableEvents } = gameState.events;
  void _eventChoiceSet;
  return {
    ...gameState,
    events: persistableEvents,
  };
};
