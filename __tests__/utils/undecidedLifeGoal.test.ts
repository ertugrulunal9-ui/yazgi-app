import { setRuntimeLocale } from '../../src/i18n/strings';
import type { Choice, GameState, Stats } from '../../src/types';
import { resolveEnding } from '../../src/utils/endingResolver';
import { getInitialGameState } from '../../src/utils/gameUtils';
import {
  buildInitialLifeGoalEvent,
  LIFE_GOAL_SELECTION_EVENT_ID,
  shouldTriggerInitialLifeGoalEvent,
  UNDECIDED_GOAL_CHOICE_ID,
} from '../../src/utils/lifeGoalSystem';

// Her seçenek bir hedef atadığı için 4 "balanced_*" son ulaşılamıyordu
describe('undecided life goal', () => {
  beforeEach(() => setRuntimeLocale('tr'));

  it('offers "not yet" next to the five goals, and it leaves the goal empty', () => {
    const event = buildInitialLifeGoalEvent();
    // Hedef olayının seçenekleri sabit nesne (bağlama göre değişen seçenek yok)
    const choices = event.choices.filter((choice): choice is Choice => typeof choice !== 'function');
    const undecided = choices.find(choice => choice.id === UNDECIDED_GOAL_CHOICE_ID);

    expect(choices).toHaveLength(6);
    expect(undecided).toBeDefined();
    expect(undecided?.setSelectedGoal).toBeNull();
    expect(undecided?.text).toBe('Henüz bilmiyorum, her şeyi denemek istiyorum');
  });

  it('does not ask again once the player chose not to pick a goal', () => {
    const answered = {
      ...getInitialGameState(),
      age: 11,
      selectedGoal: null,
      eventChoiceHistory: [LIFE_GOAL_SELECTION_EVENT_ID],
    } as GameState;

    expect(shouldTriggerInitialLifeGoalEvent(answered, 11)).toBe(false);
  });

  it('lets an even, goal-free life reach a balanced ending', () => {
    const evenStats: Stats = {
      health: 75, intelligence: 75, charisma: 75, discipline: 75,
      familyRelation: 75, money: 300, energy: 70,
    };
    const evenSkill = 70;
    // Ders, spor, sanat ve iş arasında eşit dağılmış bir hayat (Dengeli profilin eylem önekleri)
    const spreadActions = ['study_math', 'sports_run', 'arts_draw', 'work_dog_walking']
      .flatMap((actionId, index) => Array.from({ length: 6 }, (_, n) => ({ actionId, age: 10 + n, turn: index * 6 + n })));
    const state = {
      ...getInitialGameState(),
      age: 18,
      selectedGoal: null,
      eventChoiceHistory: [LIFE_GOAL_SELECTION_EVENT_ID],
      actionHistory: spreadActions,
      skills: {
        coding: evenSkill, music: evenSkill, sports: evenSkill, design: evenSkill, athletics: evenSkill,
        logic: evenSkill, reading: evenSkill, teamwork: evenSkill, art: evenSkill, writing: evenSkill,
        work_ethic: evenSkill, business: evenSkill,
      },
    } as GameState;

    const resolution = resolveEnding({ gameState: state, stats: evenStats, achievements: [] });

    expect(resolution.selectedGoal).toBeNull();
    expect(resolution.mismatchFailure).toBe(false);
    expect(resolution.id.startsWith('balanced_')).toBe(true);
  });
});
