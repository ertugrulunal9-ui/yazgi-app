import {
  Choice,
  ChoiceType,
  ConditionalOutcome,
  EventContext,
  EventRarity,
  Family,
  FutureEventConfig,
  GameEvent,
  MemoryEmotion,
  MemoryWeight,
  NPCRole,
  Personality,
  PersonalityEffect,
  PersonalityRequirement,
  SchoolGrades,
  Skills,
  Stats,
} from '../types';

type EventText = string | ((ctx: EventContext) => string);
type ChoiceBuilderFactory = (builder: ChoiceBuilder) => ChoiceBuilder;

export class ChoiceBuilder {
  private value: Partial<Choice> = {};

  id(id: string): ChoiceBuilder {
    this.value.id = id;
    return this;
  }

  text(text: string): ChoiceBuilder {
    this.value.text = text;
    return this;
  }

  textKey(textKey: string): ChoiceBuilder {
    this.value.textKey = textKey;
    return this;
  }

  effect(effect: Partial<Stats>): ChoiceBuilder {
    this.value.effect = effect;
    return this;
  }

  feedback(feedback: string): ChoiceBuilder {
    this.value.feedback = feedback;
    return this;
  }

  feedbackKey(feedbackKey: string): ChoiceBuilder {
    this.value.feedbackKey = feedbackKey;
    return this;
  }

  icon(icon: string): ChoiceBuilder {
    this.value.icon = icon;
    return this;
  }

  choiceType(type: ChoiceType): ChoiceBuilder {
    this.value.choiceType = type;
    return this;
  }

  stressEffect(stressEffect: number): ChoiceBuilder {
    this.value.stressEffect = stressEffect;
    return this;
  }

  personalityEffect(axis: keyof Personality, change: number): ChoiceBuilder {
    const effects = this.value.personalityEffects || [];
    this.value.personalityEffects = [...effects, { axis, change }];
    return this;
  }

  personalityEffects(effects: PersonalityEffect[]): ChoiceBuilder {
    this.value.personalityEffects = effects;
    return this;
  }

  memory(
    emotion: MemoryEmotion,
    weight: MemoryWeight,
    extra: Partial<Choice['memory']> = {}
  ): ChoiceBuilder {
    this.value.memory = {
      emotion,
      weight,
      relatedNpcId: extra.relatedNpcId,
      customNote: extra.customNote,
    };
    return this;
  }

  gradeUpdates(gradeUpdates: Partial<SchoolGrades>): ChoiceBuilder {
    this.value.gradeUpdates = gradeUpdates;
    return this;
  }

  skillUpdates(skillUpdates: Partial<Skills>): ChoiceBuilder {
    this.value.skillUpdates = skillUpdates;
    return this;
  }

  reqPersonality(requirements: PersonalityRequirement[]): ChoiceBuilder {
    this.value.reqPersonality = requirements;
    return this;
  }

  reqStats(stats: Partial<Stats>): ChoiceBuilder {
    this.value.reqStats = stats;
    return this;
  }

  reqFamily(family: { wealth?: Family['wealth'][]; dynamic?: Family['dynamic'][] }): ChoiceBuilder {
    this.value.reqFamily = family;
    return this;
  }

  reqSkills(skills: Partial<Skills>): ChoiceBuilder {
    this.value.reqSkills = skills;
    return this;
  }

  reqNPCRole(role: NPCRole): ChoiceBuilder {
    this.value.reqNPCRole = role;
    return this;
  }

  reqEventIds(ids: string[]): ChoiceBuilder {
    this.value.reqEventIds = ids;
    return this;
  }

  blockEventIds(ids: string[]): ChoiceBuilder {
    this.value.blockEventIds = ids;
    return this;
  }

  npcRelationChange(delta: number): ChoiceBuilder {
    this.value.npcRelationChange = delta;
    return this;
  }

  inventoryAdd(items: string[]): ChoiceBuilder {
    this.value.inventoryAdd = items;
    return this;
  }

  futureEvents(futureEvents: FutureEventConfig[]): ChoiceBuilder {
    this.value.futureEvents = futureEvents;
    return this;
  }

  grantTraits(traits: string[]): ChoiceBuilder {
    this.value.grantTraits = traits;
    return this;
  }

  dynamicFeedback(dynamicFeedback: Choice['dynamicFeedback']): ChoiceBuilder {
    this.value.dynamicFeedback = dynamicFeedback;
    return this;
  }

  addConditionalOutcome(outcome: ConditionalOutcome): ChoiceBuilder {
    if (!this.value.conditionalOutcomes) {
      this.value.conditionalOutcomes = [];
    }
    this.value.conditionalOutcomes.push(outcome);
    return this;
  }

  build(): Choice {
    if (!this.value.text) {
      throw new Error('ChoiceBuilder: text is required');
    }
    if (!this.value.effect) {
      throw new Error('ChoiceBuilder: effect is required');
    }
    if (!this.value.feedback) {
      throw new Error('ChoiceBuilder: feedback is required');
    }
    return this.value as Choice;
  }
}

export class EventBuilder {
  private idValue: string;
  private textValue: EventText | null = null;
  private textKeyValue: string | undefined;
  private minAgeValue = 0;
  private maxAgeValue = 100;
  private choicesValue: (Choice | ((ctx: EventContext) => Choice))[] = [];
  private rarityValue: EventRarity | undefined;
  private difficultyValue: number | undefined;
  private isRepeatableValue: boolean | undefined;
  private personalityCategoryValue: GameEvent['personalityCategory'] | undefined;
  private challengesAxisValue: GameEvent['challengesAxis'] | undefined;
  private reqMemoryValue: GameEvent['reqMemory'] | undefined;
  private reqEventIdsValue: string[] | undefined;
  private blockEventIdsValue: string[] | undefined;
  private reqStatsValue: Partial<Stats> | undefined;
  private reqTraitsValue: string[] | undefined;
  private reqFamilyValue: GameEvent['reqFamily'] | undefined;
  private reqSkillsValue: Partial<Skills> | undefined;
  private reqNPCRoleValue: NPCRole | undefined;
  private reqPersonalityValue: PersonalityRequirement[] | undefined;
  private reqStressValue: GameEvent['reqStress'] | undefined;
  private reqNoItemValue: string[] | undefined;
  private tagsValue: string[] | undefined;

  constructor(id: string) {
    this.idValue = id;
  }

  text(text: EventText): EventBuilder {
    this.textValue = text;
    return this;
  }

  textKey(textKey: string): EventBuilder {
    this.textKeyValue = textKey;
    return this;
  }

  ageRange(minAge: number, maxAge: number): EventBuilder {
    this.minAgeValue = minAge;
    this.maxAgeValue = maxAge;
    return this;
  }

  rarity(rarity: EventRarity): EventBuilder {
    this.rarityValue = rarity;
    return this;
  }

  difficulty(difficulty: number): EventBuilder {
    this.difficultyValue = difficulty;
    return this;
  }

  isRepeatable(isRepeatable: boolean): EventBuilder {
    this.isRepeatableValue = isRepeatable;
    return this;
  }

  personalityCategory(category: GameEvent['personalityCategory']): EventBuilder {
    this.personalityCategoryValue = category;
    return this;
  }

  challengesAxis(axis: keyof Personality): EventBuilder {
    this.challengesAxisValue = axis;
    return this;
  }

  reqMemory(emotion: MemoryEmotion, minWeight: MemoryWeight): EventBuilder {
    this.reqMemoryValue = { emotion, minWeight };
    return this;
  }

  reqEventIds(ids: string[]): EventBuilder {
    this.reqEventIdsValue = ids;
    return this;
  }

  blockEventIds(ids: string[]): EventBuilder {
    this.blockEventIdsValue = ids;
    return this;
  }

  reqStats(stats: Partial<Stats>): EventBuilder {
    this.reqStatsValue = stats;
    return this;
  }

  reqTraits(traits: string[]): EventBuilder {
    this.reqTraitsValue = traits;
    return this;
  }

  reqFamily(family: { wealth?: Family['wealth'][]; dynamic?: Family['dynamic'][] }): EventBuilder {
    this.reqFamilyValue = family;
    return this;
  }

  reqSkills(skills: Partial<Skills>): EventBuilder {
    this.reqSkillsValue = skills;
    return this;
  }

  reqNPCRole(role: NPCRole): EventBuilder {
    this.reqNPCRoleValue = role;
    return this;
  }

  reqPersonality(requirements: PersonalityRequirement[]): EventBuilder {
    this.reqPersonalityValue = requirements;
    return this;
  }

  reqStress(stress: { min?: number; max?: number }): EventBuilder {
    this.reqStressValue = stress;
    return this;
  }

  reqNoItem(items: string[]): EventBuilder {
    this.reqNoItemValue = items;
    return this;
  }

  tags(tags: string[]): EventBuilder {
    this.tagsValue = tags;
    return this;
  }

  addChoice(choice: Choice | ChoiceBuilderFactory): EventBuilder {
    if (typeof choice === 'function') {
      const builder = new ChoiceBuilder();
      const result = (choice as ChoiceBuilderFactory)(builder).build();
      this.choicesValue.push(result);
      return this;
    }
    this.choicesValue.push(choice);
    return this;
  }

  addDynamicChoice(choice: (ctx: EventContext) => Choice): EventBuilder {
    this.choicesValue.push(choice);
    return this;
  }

  build(): GameEvent {
    if (!this.idValue) {
      throw new Error('EventBuilder: id is required');
    }
    if (!this.textValue) {
      throw new Error(`EventBuilder(${this.idValue}): text is required`);
    }
    if (this.choicesValue.length === 0) {
      throw new Error(`EventBuilder(${this.idValue}): at least one choice is required`);
    }
    if (this.minAgeValue > this.maxAgeValue) {
      throw new Error(`EventBuilder(${this.idValue}): minAge cannot be greater than maxAge`);
    }

    return {
      id: this.idValue,
      text: this.textValue,
      textKey: this.textKeyValue,
      minAge: this.minAgeValue,
      maxAge: this.maxAgeValue,
      choices: this.choicesValue,
      rarity: this.rarityValue,
      difficulty: this.difficultyValue,
      isRepeatable: this.isRepeatableValue,
      personalityCategory: this.personalityCategoryValue,
      challengesAxis: this.challengesAxisValue,
      reqMemory: this.reqMemoryValue,
      reqEventIds: this.reqEventIdsValue,
      blockEventIds: this.blockEventIdsValue,
      reqStats: this.reqStatsValue,
      reqTraits: this.reqTraitsValue,
      reqFamily: this.reqFamilyValue,
      reqSkills: this.reqSkillsValue,
      reqNPCRole: this.reqNPCRoleValue,
      reqPersonality: this.reqPersonalityValue,
      reqStress: this.reqStressValue,
      reqNoItem: this.reqNoItemValue,
      tags: this.tagsValue,
    };
  }
}

export default EventBuilder;
