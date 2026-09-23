import { TraitDefinition } from '../types';
import { tRuntime } from '../i18n/strings';

export const TRAIT_DEFINITIONS: TraitDefinition[] = [
  // ===== GENETIC TRAITS =====
  {
    id: 'GENIUS',
    name: '',
    description: '',
    type: 'POSITIVE',
    category: 'GENETIC',
    effects: {
      statMultipliers: { intelligence: 1.3 }
    }
  },
  {
    id: 'ATHLETIC',
    name: '',
    description: '',
    type: 'POSITIVE',
    category: 'GENETIC',
    effects: {
      statMultipliers: { health: 1.2 },
      energyCostMultiplier: 0.85
    }
  },
  {
    id: 'CHARISMATIC',
    name: '',
    description: '',
    type: 'POSITIVE',
    category: 'GENETIC',
    effects: {
      statMultipliers: { charisma: 1.25 }
    }
  },
  {
    id: 'SICKLY',
    name: '',
    description: '',
    type: 'NEGATIVE',
    category: 'GENETIC',
    effects: {
      statMultipliers: { health: 0.75 }
    }
  },
  {
    id: 'CLUMSY',
    name: '',
    description: '',
    type: 'NEGATIVE',
    category: 'GENETIC',
    effects: {
      statMultipliers: { charisma: 0.85 }
    }
  },

  // ===== ACQUIRED POSITIVE TRAITS =====
  {
    id: 'EMPATHETIC',
    name: '',
    description: '',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'social', count: 4, ageWindow: [3, 14] },
        { type: 'EVENT_CHOICE', eventId: 'pers_grup_zorbaligi', choice: 'zorbalik_mudahale', ageWindow: [6, 14] }
      ],
      ageWindow: [3, 18],
      pointsRequired: 4
    },
    effects: {
      statMultipliers: { charisma: 1.1 }
    }
  },
  {
    id: 'ORGANIZED',
    name: '',
    description: '',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'study', count: 5, ageWindow: [7, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 5
    },
    effects: {
      statMultipliers: { discipline: 1.2 }
    }
  },
  {
    id: 'BRAVE',
    name: '',
    description: '',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'EVENT_CHOICE', eventId: 'pers_grup_zorbaligi', choice: 'zorbalik_mudahale', ageWindow: [6, 18] }
      ],
      ageWindow: [6, 18],
      pointsRequired: 2
    },
    effects: {
      statMultipliers: { discipline: 1.15 }
    }
  },
  {
    id: 'DISCIPLINED',
    name: '',
    description: '',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'study', count: 6, ageWindow: [7, 18] },
        { type: 'ACTION', actionId: 'sports', count: 5, ageWindow: [0, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 6
    },
    effects: {
      statMultipliers: { discipline: 1.3 }
    },
    conflicts: ['LAZY', 'PROCRASTINATOR']
  },
  {
    id: 'AMBITIOUS',
    name: '',
    description: '',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'STAT_THRESHOLD', statKey: 'intelligence', threshold: 60, ageWindow: [10, 18] },
        { type: 'ACTION', actionId: 'work', count: 4, ageWindow: [14, 18] }
      ],
      ageWindow: [10, 18],
      pointsRequired: 5
    },
    effects: {
      statMultipliers: { intelligence: 1.1 }
    }
  },
  {
    id: 'CREATIVE',
    name: '',
    description: '',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'art', count: 5, ageWindow: [7, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 5
    },
    effects: {
      statMultipliers: { intelligence: 1.15 }
    }
  },
  {
    id: 'BOOKWORM',
    name: '',
    description: '',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'study', count: 8, ageWindow: [7, 18] },
        { type: 'STAT_THRESHOLD', statKey: 'intelligence', threshold: 70, ageWindow: [10, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 8
    },
    effects: {
      statMultipliers: { intelligence: 1.2 }
    }
  },
  {
    id: 'NIGHT_OWL',
    name: '',
    description: '',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'coding', count: 4, ageWindow: [10, 18] }
      ],
      ageWindow: [10, 18],
      pointsRequired: 4
    },
    effects: {}
  },
  {
    id: 'SOCIAL_BUTTERFLY',
    name: '',
    description: '',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'social', count: 6, ageWindow: [7, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 6
    },
    effects: {
      statMultipliers: { charisma: 1.25 }
    }
  },
  {
    id: 'ENTREPRENEUR',
    name: '',
    description: '',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'work', count: 6, ageWindow: [14, 18] },
        { type: 'STAT_THRESHOLD', statKey: 'money', threshold: 500, ageWindow: [14, 18] }
      ],
      ageWindow: [14, 18],
      pointsRequired: 6
    },
    effects: {
      statMultipliers: { intelligence: 1.1 }
    }
  },
  {
    id: 'HONEST',
    name: '',
    description: '',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'EVENT_CHOICE', eventId: 'dilemma_kopya_satin_alma', choice: 'kopya_alma', ageWindow: [14, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 1
    },
    effects: {
      statMultipliers: { familyRelation: 1.1 }
    }
  },

  // ===== ACQUIRED NEGATIVE TRAITS =====
  {
    id: 'LAZY',
    name: '',
    description: '',
    type: 'NEGATIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'STAT_THRESHOLD', statCondition: { stat: 'discipline', operator: '<', value: 15 }, ageWindow: [7, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 2,
      progressCooldownTurns: 2
    },
    effects: {
      energyCostMultiplier: 1.2
    },
    conflicts: ['DISCIPLINED', 'ORGANIZED']
  },
  {
    id: 'PROCRASTINATOR',
    name: '',
    description: '',
    type: 'NEGATIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'STAT_THRESHOLD', statCondition: { stat: 'discipline', operator: '<', value: 25 }, ageWindow: [7, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 3,
      progressCooldownTurns: 2
    },
    effects: {}
  },
  {
    id: 'COWARD',
    name: '',
    description: '',
    type: 'NEGATIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'EVENT_CHOICE', eventId: 'pers_grup_zorbaligi', choice: 'zorbalik_izle', ageWindow: [6, 18] }
      ],
      ageWindow: [6, 18],
      pointsRequired: 2
    },
    effects: {
      statMultipliers: { charisma: 0.9 }
    }
  },
  {
    id: 'CHEATER',
    name: '',
    description: '',
    type: 'NEGATIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'EVENT_CHOICE', eventId: 'dilemma_kopya_satin_alma', choice: 'kopya_al', ageWindow: [14, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 2
    },
    effects: {}
  },
  {
    id: 'BURNOUT_PRONE',
    name: '',
    description: '',
    type: 'NEGATIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'STAT_THRESHOLD', statCondition: { stat: 'energy', operator: '<', value: 25 }, ageWindow: [11, 18] },
        { type: 'ACTION', actionId: 'study', ageWindow: [11, 18] },
        { type: 'ACTION', actionId: 'work', ageWindow: [14, 18] },
        { type: 'ACTION', actionId: 'coding', ageWindow: [11, 18] }
      ],
      ageWindow: [11, 18],
      pointsRequired: 4,
      progressCooldownTurns: 2
    },
    effects: {
      energyCostMultiplier: 1.15
    }
  },
  {
    id: 'REBELLIOUS',
    name: '',
    description: '',
    type: 'NEGATIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'EVENT_CHOICE', eventId: 'dilemma_aile_beklentisi', choice: 'follow_dreams', ageWindow: [14, 18] }
      ],
      ageWindow: [10, 18],
      pointsRequired: 2
    },
    effects: {
      statMultipliers: { familyRelation: 0.85 }
    }
  },

  // ===== NEUTRAL/SPECIAL TRAITS =====
  {
    id: 'GAMER',
    name: '',
    description: '',
    type: 'NEUTRAL',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'coding', count: 3, ageWindow: [10, 18] }
      ],
      ageWindow: [10, 18],
      pointsRequired: 3
    },
    effects: {}
  },
  {
    id: 'LONE_WOLF',
    name: '',
    description: '',
    type: 'NEUTRAL',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'EVENT_CHOICE', eventId: 'pers_bir_gun_yalniz', choice: 'yalniz_rahat', ageWindow: [11, 18] },
        { type: 'STAT_THRESHOLD', statCondition: { stat: 'charisma', operator: '<', value: 35 }, ageWindow: [11, 18] }
      ],
      ageWindow: [11, 18],
      pointsRequired: 3,
      progressCooldownTurns: 3
    },
    effects: {}
  },
  {
    id: 'PRAGMATIC',
    name: '',
    description: '',
    type: 'NEUTRAL',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'STAT_THRESHOLD', statKey: 'intelligence', threshold: 75, ageWindow: [12, 18] }
      ],
      ageWindow: [12, 18],
      pointsRequired: 1
    },
    effects: {}
  }
];

export const getTrait = (traitId: string): TraitDefinition | undefined => {
  return TRAIT_DEFINITIONS.find(t => t.id === traitId);
};

export const getTraitName = (traitId: string): string => {
  return tRuntime(`traits.${traitId}.name`, undefined, getTrait(traitId)?.name || traitId);
};

export const getTraitDescription = (traitId: string): string => {
  return tRuntime(`traits.${traitId}.description`, undefined, getTrait(traitId)?.description || '');
};

export const getRandomGeneticTraits = (count: number = 1): string[] => {
  const geneticTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'GENETIC');
  const result: string[] = [];
  const shuffled = [...geneticTraits].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < count && i < shuffled.length; i++) {
    result.push(shuffled[i].id);
  }
  
  return result;
};
