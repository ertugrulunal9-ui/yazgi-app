import { Family, FamilyEvolutionState, ScheduledEvent } from '../types';

interface FamilyEvolutionParams {
  previousState?: FamilyEvolutionState;
  family: Family | null;
  familyRelation: number;
  age: number;
  now?: () => number;
  randomFn?: () => number;
}

interface FamilyThoughtParams {
  family: Family | null;
  familyRelation: number;
  age: number;
  turn: number;
  evolution?: FamilyEvolutionState;
}

export const DEFAULT_FAMILY_EVOLUTION_STATE: FamilyEvolutionState = {
  yearsAtHighRelation: 0,
  yearsAtLowRelation: 0,
  strictWarmthTriggered: false,
  familyCrisisTriggered: false,
};

export const normalizeFamilyEvolutionState = (
  state?: FamilyEvolutionState
): FamilyEvolutionState => ({
  ...DEFAULT_FAMILY_EVOLUTION_STATE,
  ...(state || {}),
});

const buildScheduledEvolutionEvent = (
  eventId: string,
  age: number,
  now: () => number,
  randomFn: () => number
): ScheduledEvent => ({
  id: `scheduled_${eventId}_${now()}_${randomFn().toString(36).slice(2, 7)}`,
  eventId,
  triggerAge: age,
  priority: 'HIGH',
  sourceEventId: 'family_evolution',
});

export const updateFamilyEvolutionOnAgeUp = ({
  previousState,
  family,
  familyRelation,
  age,
  now = Date.now,
  randomFn = Math.random,
}: FamilyEvolutionParams): { nextState: FamilyEvolutionState; scheduledEvents: ScheduledEvent[] } => {
  const current = normalizeFamilyEvolutionState(previousState);
  const nextState: FamilyEvolutionState = {
    ...current,
    yearsAtHighRelation: familyRelation >= 80 ? current.yearsAtHighRelation + 1 : 0,
    yearsAtLowRelation: familyRelation <= 20 ? current.yearsAtLowRelation + 1 : 0,
  };
  const scheduledEvents: ScheduledEvent[] = [];

  if (
    family?.dynamic === 'STRICT' &&
    !current.strictWarmthTriggered &&
    nextState.yearsAtHighRelation >= 5
  ) {
    nextState.strictWarmthTriggered = true;
    scheduledEvents.push(buildScheduledEvolutionEvent('fam_evo_strict_softening', age, now, randomFn));
  }

  if (!current.familyCrisisTriggered && nextState.yearsAtLowRelation >= 3) {
    nextState.familyCrisisTriggered = true;
    scheduledEvents.push(buildScheduledEvolutionEvent('fam_evo_family_silence', age, now, randomFn));
  }

  return { nextState, scheduledEvents };
};

export const isFamilyThoughtTurn = (turn: number): boolean => {
  const cycle = turn % 7;
  return cycle === 3 || cycle === 0;
};

export const getFamilyThought = ({
  family,
  familyRelation,
  age,
  turn,
  evolution,
}: FamilyThoughtParams): string | null => {
  if (!family || age < 7 || !isFamilyThoughtTurn(turn)) return null;

  const state = normalizeFamilyEvolutionState(evolution);
  const thoughts: string[] = [];

  if (family.dynamic === 'STRICT' && familyRelation < 40) {
    thoughts.push('Babam yine kizacak. Her seyi dogru yapmam lazim.');
  }

  if (family.dynamic === 'CHAOTIC' && age >= 12) {
    thoughts.push('Keske evde biraz daha duzen olsa.');
  }

  if (family.dynamic === 'SUPPORTIVE' && age >= 10 && familyRelation >= 65) {
    thoughts.push('Evde hata yapsam bile beni dinleyen biri var.');
  }

  if (family.wealth === 'POOR' && age >= 8) {
    thoughts.push('Arkadaslarimin yeni telefonu var... Bizim neden yok?');
  }

  if (family.wealth === 'RICH' && age >= 10) {
    thoughts.push('Herkes benden bir sey bekliyor gibi.');
  }

  if (state.strictWarmthTriggered && family.dynamic === 'STRICT' && familyRelation >= 60) {
    thoughts.push('Evdeki ton degisti. Artik sadece emir degil, sohbet de var.');
  }

  if (state.familyCrisisTriggered && familyRelation < 35) {
    thoughts.push('Evdeki sessizlik bazen bagirmaktan daha agir.');
  }

  if (thoughts.length === 0) {
    if (family.dynamic === 'STRICT') {
      thoughts.push('Evde kurallar net. Hata yaparsam hemen fark edilir.');
    } else if (family.dynamic === 'CHAOTIC') {
      thoughts.push('Evde herkes kendi ritminde. Plan yapmak zor.');
    } else {
      thoughts.push('Ailem yanimda oldugunu hissettiriyor.');
    }
  }

  const index = Math.floor(turn / 3) % thoughts.length;
  return thoughts[index];
};

export const getFamilyAtmosphereLabel = (
  family: Family | null,
  familyRelation: number,
  evolution?: FamilyEvolutionState
): string => {
  if (!family) return 'Belirsiz';

  const state = normalizeFamilyEvolutionState(evolution);
  if (state.familyCrisisTriggered && familyRelation <= 35) return 'Gerilimli Sessizlik';
  if (family.dynamic === 'STRICT' && state.strictWarmthTriggered) return 'Yumusayan Otorite';
  if (familyRelation >= 80) return 'Guvenli';
  if (familyRelation <= 25) return 'Kirilgan';

  if (family.dynamic === 'STRICT') return 'Disiplinli';
  if (family.dynamic === 'CHAOTIC') return 'Daginik';
  return 'Destekleyici';
};
