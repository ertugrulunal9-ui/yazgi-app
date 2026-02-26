import { GameEvent } from '../types';
import { TURKISH_EVENTS } from './turkishEvents';
import { MORAL_DILEMMA_EVENTS } from './moralDilemmaEvents';
import { PERSONALITY_EVENTS } from './personalityEvents';
import { NPC_EVENTS } from './npcEvents';
import { MILESTONE_EVENTS } from './relationshipMilestoneEvents';
import { LATE_TEEN_EVENTS } from './lateTeenEvents';
import { FAMILY_ARC_EVENTS } from './familyArcEvents';
import { ECONOMIC_RECOVERY_EVENTS } from './economicRecoveryEvents';
import { MEMORY_GATED_EVENTS } from './memoryGatedEvents';
import { AGE_SPECIFIC_EVENTS } from './ageSpecificEvents';
import { GOAL_CHAIN_EVENTS } from './goalChainEvents';
import { NPC_QUESTLINE_EVENTS } from './npcQuestlineEvents';
import { NPC_CHECKIN_EVENTS } from './npcCheckInEvents';
import { CLIFFHANGER_EVENTS } from './cliffhangerEvents';
import { applyProceduralEventBranching } from './eventBranchingEnhancer';
import { EventBuilder } from '../builders/EventBuilder';
import { validateEventGraph, validateEventTagStandard } from '../utils/eventValidation';
import { withEventLocalizationKeys, withEventLocalizationKeysForAll } from '../i18n/events/keyMapper';

// =================================================================
// YAZGI - TÜM EVENTLER
// Kişilik sistemiyle entegre, dinamik event havuzu
// =================================================================

const BASE_EVENTS: GameEvent[] = [
  // Türkiye'ye özgü eventler (kişilik entegreli)
  ...TURKISH_EVENTS,
  // Ahlaki ikilem eventleri (kişilik entegreli)
  ...MORAL_DILEMMA_EVENTS,
  // Kişilik odaklı eventler
  ...PERSONALITY_EVENTS,
  // NPC sosyal sistem eventleri
  ...NPC_EVENTS,
  // NPC check-in micro eventleri
  ...NPC_CHECKIN_EVENTS,
  // İlişki milestone eventleri
  ...MILESTONE_EVENTS,
  ...LATE_TEEN_EVENTS,
  ...FAMILY_ARC_EVENTS,
  ...ECONOMIC_RECOVERY_EVENTS,
  ...MEMORY_GATED_EVENTS,
  ...AGE_SPECIFIC_EVENTS,
  ...GOAL_CHAIN_EVENTS,
  // NPC questline arc eventleri
  ...NPC_QUESTLINE_EVENTS,
  // Cliffhanger / oturum kancasi eventleri
  ...CLIFFHANGER_EVENTS,
];

const BRANCHED_EVENT_RESULT = applyProceduralEventBranching(BASE_EVENTS);
export const EVENTS: GameEvent[] = withEventLocalizationKeysForAll(BRANCHED_EVENT_RESULT.events);

if (__DEV__) {
  console.info(
    `[EventBranching] gated=${BRANCHED_EVENT_RESULT.stats.gatedEvents}/${BRANCHED_EVENT_RESULT.stats.totalEvents}`
      + ` blocked=${BRANCHED_EVENT_RESULT.stats.blockedEvents}`
  );
  const eventValidationErrors = validateEventGraph(EVENTS);
  if (eventValidationErrors.length > 0) {
    console.error('[EventValidation] Event graph validation failed:');
    eventValidationErrors.forEach(error => console.error(`[EventValidation] ${error}`));
  }

  const tagValidationWarnings = validateEventTagStandard(EVENTS);
  if (tagValidationWarnings.length > 0) {
    const previewLimit = 25;
    console.warn(`[EventValidation] Tag standard warnings: ${tagValidationWarnings.length}`);
    tagValidationWarnings
      .slice(0, previewLimit)
      .forEach(warning => console.warn(`[EventValidation] ${warning}`));

    if (tagValidationWarnings.length > previewLimit) {
      console.warn(`[EventValidation] ...and ${tagValidationWarnings.length - previewLimit} more tag warnings`);
    }
  }
}

// Hiçbir event tetiklenmezse kullanılacak fallback
export const FALLBACK_EVENT: GameEvent = withEventLocalizationKeys(new EventBuilder('fallback_generic')
  .text((ctx) => {
    const p = ctx.personality;
    if (p.openness < 30) {
      return 'Bugün evde kaldın. Sessiz, sakin bir gün. Bazen en iyi günler böyle olur.';
    }
    if (p.openness > 70) {
      return 'Bugün pek bir şey olmadı. Sıkıldın biraz ama yarın yeni bir gün.';
    }
    return 'Sıradan bir gün geçti. Hayat akıp gidiyor.';
  })
  .ageRange(0, 100)
  .difficulty(1)
  .rarity('COMMON')
  .addChoice(choice => choice
    .id('fallback_continue')
    .text('Günü bitir')
    .effect({ energy: 5 })
    .feedback('Bazen olaysız günler en iyisidir.')
    .choiceType('NEUTRAL')
  )
  .build());

// Hastane eventi - sağlık çok düşükse tetiklenir
export const HOSPITAL_EVENT: GameEvent = withEventLocalizationKeys(new EventBuilder('evt_hastane')
  .text((ctx) => {
    if (ctx.stress.current > 70) {
      return "Gözlerini beyaz ışıklar altında açtın. Doktorlar 'tükenmişlik sendromu' diyor. Vücudun artık taşıyamadı.";
    }
    return 'Gözlerini hastane odasında açtın. Doktorlar aşırı yorgunluk ve sağlık sorunları nedeniyle çöktüğünü söylüyor.';
  })
  .ageRange(0, 100)
  .difficulty(1)
  .rarity('RARE')
  .personalityCategory('BREAKDOWN')
  .addChoice(choice => choice
    .id('hospital_rest')
    .text('Dinlen ve iyileş')
    .effect({ health: 30, money: -100, energy: 50 })
    .stressEffect(-40)
    .feedback('Birkaç gün hastanede kaldın. Yavaş yavaş toparlanıyorsun. Belki de daha dikkatli olmalısın.')
    .choiceType('PASSIVE')
  )
  .build());
