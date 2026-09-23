import { AGE_SPECIFIC_EVENTS } from '../../src/data/ageSpecificEvents';
import { EARLY_CONSEQUENCE_EVENTS } from '../../src/data/earlyConsequenceEvents';
import { TURKISH_EVENTS } from '../../src/data/turkishEvents';
import type { GameEvent } from '../../src/types';

const sourceEvents = [...TURKISH_EVENTS, ...AGE_SPECIFIC_EVENTS];
const sourceById = new Map(sourceEvents.map(event => [event.id, event]));
const targetById = new Map(EARLY_CONSEQUENCE_EVENTS.map(event => [event.id, event]));

const CHAIN_SOURCE_IDS = [
  'tr_oyuncak_paylasim',
  'tr_gece_korkusu',
  'tr_top_cama_vurma',
  'tr_resim_yarisma',
  'tr_yeni_arkadas',
  'tr_sinav_sonucu',
  'tr_sosyal_medya_ilk',
  'tr_grup_projesi',
  'tr_grup_dislanma',
  'tr_ortaokul_gecis',
  'tr_hobi_secimi',
  'tr_arkadas_kus',
  'tr_zorbalik_tanik',
  'tr_telefon_isteme',
  'tr_ders_baskisi',
  'tr_ogretmen_adaletsiz',
  'tr_beden_degisim',
  'tr_bilim_fuari',
] as const;

const staticChoices = (event: GameEvent) => event.choices.flatMap(choice => (
  typeof choice === 'function' ? [] : [choice]
));

describe('early childhood delayed consequence chains', () => {
  it.each(CHAIN_SOURCE_IDS)('%s schedules one distinct age-based target per branch', sourceId => {
    const source = sourceById.get(sourceId);

    expect(source).toBeDefined();
    expect(source?.isRepeatable).toBe(false);

    const choices = source ? staticChoices(source) : [];
    const targets = choices.map(choice => {
      expect(choice.futureEvents).toHaveLength(1);
      const schedule = choice.futureEvents?.[0];
      expect(schedule).toMatchObject({ trigger: 'AGE', priority: 'HIGH' });
      expect(schedule?.age).toBeGreaterThan(source?.maxAge ?? 18);
      return schedule?.eventId ?? '';
    });

    expect(new Set(targets).size).toBe(choices.length);
    targets.forEach(targetId => {
      const target = targetById.get(targetId);
      expect(target).toBeDefined();
      expect(target?.reqEventIds).toContain(sourceId);
      expect(target?.tags).toEqual(expect.arrayContaining(['followup', 'scheduled_only']));
      expect(target?.minAge).toBe(target?.maxAge);
      expect(target && staticChoices(target).length).toBeGreaterThanOrEqual(2);
    });
  });

  it('keeps recovery choices available for avoidance and conformity branches', () => {
    const recoveryTargets = [
      targetById.get('early_toy_keep_boundaries_echo'),
      targetById.get('early_window_hide_accountability_echo'),
      targetById.get('early_art_safe_pattern_echo'),
      targetById.get('school_exam_hidden_echo'),
      targetById.get('social_media_secret_echo'),
      targetById.get('school_project_overwork_echo'),
      targetById.get('exclusion_belong_echo'),
      targetById.get('middle_school_fear_echo'),
      targetById.get('hobby_music_echo'),
      targetById.get('friend_conflict_distance_echo'),
      targetById.get('bullying_witness_ignore_echo'),
      targetById.get('phone_conflict_echo'),
      targetById.get('study_pressure_cram_echo'),
      targetById.get('teacher_unfair_support_echo'),
      targetById.get('body_change_questions_echo'),
      targetById.get('science_fair_last_minute_echo'),
    ].filter((event): event is GameEvent => Boolean(event));

    recoveryTargets.forEach(event => {
      expect(staticChoices(event).some(choice => (
        (choice.stressEffect ?? 0) < 0 || Object.values(choice.setPermanentFlags ?? {}).includes(true)
      ))).toBe(true);
    });
  });
});
