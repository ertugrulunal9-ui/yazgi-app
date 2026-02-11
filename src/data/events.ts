import { GameEvent } from '../types';
import { TURKISH_EVENTS } from './turkishEvents';
import { MORAL_DILEMMA_EVENTS } from './moralDilemmaEvents';
import { PERSONALITY_EVENTS } from './personalityEvents';
import { NPC_EVENTS } from './npcEvents';
import { MILESTONE_EVENTS } from './relationshipMilestoneEvents';
import { LATE_TEEN_EVENTS } from './lateTeenEvents';
import { FAMILY_ARC_EVENTS } from './familyArcEvents';
import { MEMORY_GATED_EVENTS } from './memoryGatedEvents';
import { AGE_SPECIFIC_EVENTS } from './ageSpecificEvents';
import { EventBuilder } from '../builders/EventBuilder';
import { validateEventGraph } from '../utils/eventValidation';

// =================================================================
// YAZGI - TÜM EVENTLER
// Kişilik sistemiyle entegre, dinamik event havuzu
// =================================================================

export const EVENTS: GameEvent[] = [
  // Türkiye'ye özgü eventler (kişilik entegreli)
  ...TURKISH_EVENTS,
  // Ahlaki ikilem eventleri (kişilik entegreli)
  ...MORAL_DILEMMA_EVENTS,
  // Kişilik odaklı eventler
  ...PERSONALITY_EVENTS,
  // NPC sosyal sistem eventleri
  ...NPC_EVENTS,
  // İlişki milestone eventleri
  ...MILESTONE_EVENTS,
  ...LATE_TEEN_EVENTS,
  ...FAMILY_ARC_EVENTS,
  ...MEMORY_GATED_EVENTS,
  ...AGE_SPECIFIC_EVENTS,
];

if (__DEV__) {
  const eventValidationErrors = validateEventGraph(EVENTS);
  if (eventValidationErrors.length > 0) {
    console.error('[EventValidation] Event graph validation failed:');
    eventValidationErrors.forEach(error => console.error(`[EventValidation] ${error}`));
  }
}

// Hiçbir event tetiklenmezse kullanılacak fallback
export const FALLBACK_EVENT: GameEvent = new EventBuilder('fallback_generic')
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
    .text('Günü bitir')
    .effect({ energy: 5 })
    .feedback('Bazen olaysız günler en iyisidir.')
    .choiceType('NEUTRAL')
  )
  .build();

// Hastane eventi - sağlık çok düşükse tetiklenir
export const HOSPITAL_EVENT: GameEvent = new EventBuilder('evt_hastane')
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
    .text('Dinlen ve iyileş')
    .effect({ health: 30, money: -100, energy: 50 })
    .stressEffect(-40)
    .feedback('Birkaç gün hastanede kaldın. Yavaş yavaş toparlanıyorsun. Belki de daha dikkatli olmalısın.')
    .choiceType('PASSIVE')
  )
  .build();
