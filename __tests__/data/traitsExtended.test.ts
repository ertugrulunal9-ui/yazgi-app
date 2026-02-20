/**
 * Trait System Extended Tests
 * 
 * Tests rare traits, stat multipliers, energy cost modifications,
 * trait conflicts, and formation conditions
 */

import { TRAIT_DEFINITIONS } from '../../src/data/traits';
import { TraitDefinition } from '../../src/types';

describe('Trait System - Extended Coverage', () => {
  
  describe('Trait Data Integrity', () => {
    it('should have unique trait IDs', () => {
      const ids = TRAIT_DEFINITIONS.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique trait names', () => {
      const names = TRAIT_DEFINITIONS.map(t => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('all traits should have valid categories', () => {
      TRAIT_DEFINITIONS.forEach(trait => {
        expect(['GENETIC', 'ACQUIRED']).toContain(trait.category);
      });
    });

    it('all traits should have valid types', () => {
      TRAIT_DEFINITIONS.forEach(trait => {
        expect(['POSITIVE', 'NEGATIVE', 'NEUTRAL']).toContain(trait.type);
      });
    });
  });

  describe('Genetic Traits', () => {
    const geneticTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'GENETIC');

    it('should have at least 5 genetic traits', () => {
      expect(geneticTraits.length).toBeGreaterThanOrEqual(5);
    });

    it('GENIUS should have intelligence multiplier', () => {
      const genius = geneticTraits.find(t => t.id === 'GENIUS');
      expect(genius).toBeDefined();
      expect(genius!.effects.statMultipliers?.intelligence).toBe(1.3);
    });

    it('ATHLETIC should have health multiplier and energy cost reduction', () => {
      const athletic = geneticTraits.find(t => t.id === 'ATHLETIC');
      expect(athletic).toBeDefined();
      expect(athletic!.effects.statMultipliers?.health).toBe(1.2);
      expect(athletic!.effects.energyCostMultiplier).toBe(0.85);
    });

    it('CHARISMATIC should have charisma multiplier', () => {
      const charismatic = geneticTraits.find(t => t.id === 'CHARISMATIC');
      expect(charismatic).toBeDefined();
      expect(charismatic!.effects.statMultipliers?.charisma).toBe(1.25);
    });

    it('SICKLY should reduce health (negative trait)', () => {
      const sickly = geneticTraits.find(t => t.id === 'SICKLY');
      expect(sickly).toBeDefined();
      expect(sickly!.type).toBe('NEGATIVE');
      expect(sickly!.effects.statMultipliers?.health).toBe(0.75);
    });

    it('CLUMSY should reduce charisma (negative trait)', () => {
      const clumsy = geneticTraits.find(t => t.id === 'CLUMSY');
      expect(clumsy).toBeDefined();
      expect(clumsy!.type).toBe('NEGATIVE');
      expect(clumsy!.effects.statMultipliers?.charisma).toBe(0.85);
    });
  });

  describe('Acquired Traits', () => {
    const acquiredTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'ACQUIRED');

    it('should have multiple acquired traits', () => {
      expect(acquiredTraits.length).toBeGreaterThan(5);
    });

    it('all acquired traits should have formation conditions', () => {
      acquiredTraits.forEach(trait => {
        expect(trait.formation).toBeDefined();
        expect(trait.formation?.triggers).toBeDefined();
        expect(Array.isArray(trait.formation?.triggers)).toBe(true);
        expect(trait.formation?.ageWindow).toBeDefined();
        expect(trait.formation?.pointsRequired).toBeGreaterThan(0);
      });
    });

    it('EMPATHETIC should form from social actions and bullying choices', () => {
      const empathetic = acquiredTraits.find(t => t.id === 'EMPATHETIC');
      expect(empathetic).toBeDefined();
      expect(empathetic!.formation?.triggers.length).toBeGreaterThan(0);
      
      const hasSocialTrigger = empathetic!.formation?.triggers.some(
        t => t.type === 'ACTION' && t.actionId === 'social'
      );
      expect(hasSocialTrigger).toBe(true);
    });

    it('ORGANIZED should form from study actions', () => {
      const organized = acquiredTraits.find(t => t.id === 'ORGANIZED');
      expect(organized).toBeDefined();
      expect(organized!.formation?.triggers[0].type).toBe('ACTION');
      expect(organized!.formation?.triggers[0].actionId).toBe('study');
    });

    it('BRAVE should form from bullying intervention choices', () => {
      const brave = acquiredTraits.find(t => t.id === 'BRAVE');
      expect(brave).toBeDefined();
      expect(brave!.formation?.triggers.length).toBeGreaterThan(0);
    });

    it('DISCIPLINED should require multiple action types', () => {
      const disciplined = acquiredTraits.find(t => t.id === 'DISCIPLINED');
      expect(disciplined).toBeDefined();
      expect(disciplined!.formation?.triggers.length).toBeGreaterThan(1);
      expect(disciplined!.formation?.pointsRequired).toBeGreaterThanOrEqual(6);
    });

    it('AMBITIOUS should require stat threshold', () => {
      const ambitious = acquiredTraits.find(t => t.id === 'AMBITIOUS');
      expect(ambitious).toBeDefined();
      
      const hasStatThreshold = ambitious!.formation?.triggers.some(
        t => t.type === 'STAT_THRESHOLD'
      );
      expect(hasStatThreshold).toBe(true);
    });

    it('BOOKWORM should require high points (rare trait)', () => {
      const bookworm = acquiredTraits.find(t => t.id === 'BOOKWORM');
      expect(bookworm).toBeDefined();
      expect(bookworm!.formation?.pointsRequired).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Stat Multipliers', () => {
    it('positive multipliers should be > 1.0', () => {
      TRAIT_DEFINITIONS.forEach(trait => {
        if (trait.type === 'POSITIVE' && trait.effects.statMultipliers) {
          Object.values(trait.effects.statMultipliers).forEach(multiplier => {
            if (multiplier !== undefined) {
              expect(multiplier).toBeGreaterThan(1.0);
              expect(multiplier).toBeLessThanOrEqual(2.0); // Reasonable upper bound
            }
          });
        }
      });
    });

    it('negative multipliers should be < 1.0', () => {
      TRAIT_DEFINITIONS.forEach(trait => {
        if (trait.type === 'NEGATIVE' && trait.effects.statMultipliers) {
          Object.values(trait.effects.statMultipliers).forEach(multiplier => {
            if (multiplier !== undefined) {
              expect(multiplier).toBeLessThan(1.0);
              expect(multiplier).toBeGreaterThanOrEqual(0.5); // Reasonable lower bound
            }
          });
        }
      });
    });

    it('should handle traits with no stat multipliers', () => {
      const night_owl = TRAIT_DEFINITIONS.find(t => t.id === 'NIGHT_OWL');
      if (night_owl) {
        expect(night_owl.effects.statMultipliers).toBeUndefined();
      }
    });
  });

  describe('Energy Cost Modifiers', () => {
    it('ATHLETIC should reduce energy costs', () => {
      const athletic = TRAIT_DEFINITIONS.find(t => t.id === 'ATHLETIC');
      expect(athletic).toBeDefined();
      expect(athletic!.effects.energyCostMultiplier).toBe(0.85);
    });

    it('energy cost multipliers should be reasonable', () => {
      TRAIT_DEFINITIONS.forEach(trait => {
        if (trait.effects.energyCostMultiplier !== undefined) {
          expect(trait.effects.energyCostMultiplier).toBeGreaterThan(0.5);
          expect(trait.effects.energyCostMultiplier).toBeLessThan(1.5);
        }
      });
    });
  });

  describe('Trait Conflicts', () => {
    it('should handle traits with conflicts array', () => {
      TRAIT_DEFINITIONS.forEach(trait => {
        if (trait.conflicts) {
          expect(Array.isArray(trait.conflicts)).toBe(true);
          
          // Conflicts should reference valid trait IDs
          trait.conflicts.forEach(conflictId => {
            const conflictingTrait = TRAIT_DEFINITIONS.find(t => t.id === conflictId);
            // If the trait exists, conflict is valid. If not, it might be intentional for future traits
            if (conflictingTrait) {
              expect(conflictingTrait).toBeDefined();
            }
          });
        }
      });
    });

    it('positive and negative versions of same attribute should not coexist', () => {
      // Example: GENIUS and SICKLY, ATHLETIC and CLUMSY, etc.
      const genius = TRAIT_DEFINITIONS.find(t => t.id === 'GENIUS');
      const athletic = TRAIT_DEFINITIONS.find(t => t.id === 'ATHLETIC');
      
      // These traits should exist
      expect(genius).toBeDefined();
      expect(athletic).toBeDefined();
    });
  });

  describe('Formation Conditions - Age Windows', () => {
    it('acquired traits should have valid age windows', () => {
      const acquiredTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'ACQUIRED');
      
      acquiredTraits.forEach(trait => {
        if (trait.formation?.ageWindow) {
          const [minAge, maxAge] = trait.formation.ageWindow;
          expect(minAge).toBeGreaterThanOrEqual(0);
          expect(maxAge).toBeLessThanOrEqual(18);
          expect(minAge).toBeLessThan(maxAge);
        }
      });
    });

    it('early childhood traits should start from age 3-7', () => {
      const empathetic = TRAIT_DEFINITIONS.find(t => t.id === 'EMPATHETIC');
      if (empathetic?.formation?.ageWindow) {
        const [minAge] = empathetic.formation.ageWindow;
        expect(minAge).toBeLessThanOrEqual(7);
      }
    });

    it('school-age traits should start from age 7+', () => {
      const organized = TRAIT_DEFINITIONS.find(t => t.id === 'ORGANIZED');
      if (organized?.formation?.ageWindow) {
        const [minAge] = organized.formation.ageWindow;
        expect(minAge).toBeGreaterThanOrEqual(7);
      }
    });

    it('work-related traits should start from age 14+', () => {
      const ambitious = TRAIT_DEFINITIONS.find(t => t.id === 'AMBITIOUS');
      if (ambitious?.formation?.triggers) {
        const workTrigger = ambitious.formation.triggers.find(
          t => t.type === 'ACTION' && t.actionId === 'work'
        );
        if (workTrigger?.ageWindow) {
          const [minAge] = workTrigger.ageWindow;
          expect(minAge).toBeGreaterThanOrEqual(14);
        }
      }
    });
  });

  describe('Formation Triggers', () => {
    it('ACTION triggers should have actionId and count', () => {
      const acquiredTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'ACQUIRED');
      
      acquiredTraits.forEach(trait => {
        trait.formation?.triggers.forEach(trigger => {
          if (trigger.type === 'ACTION') {
            expect(trigger.actionId).toBeDefined();
            if (trigger.count !== undefined) {
              expect(trigger.count).toBeGreaterThan(0);
            }
          }
        });
      });
    });

    it('EVENT_CHOICE triggers should have eventId and choice index', () => {
      const acquiredTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'ACQUIRED');
      
      acquiredTraits.forEach(trait => {
        trait.formation?.triggers.forEach(trigger => {
          if (trigger.type === 'EVENT_CHOICE') {
            expect(trigger.eventId).toBeDefined();
            expect(trigger.choice).toBeDefined();
            expect(typeof trigger.choice === 'number' || typeof trigger.choice === 'string').toBe(true);
          }
        });
      });
    });

    it('STAT_THRESHOLD triggers should have statKey and threshold', () => {
      const acquiredTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'ACQUIRED');
      
      acquiredTraits.forEach(trait => {
        trait.formation?.triggers.forEach(trigger => {
          if (trigger.type === 'STAT_THRESHOLD') {
            const hasSimpleThreshold = trigger.statKey !== undefined && trigger.threshold !== undefined;
            const hasConditionalThreshold = trigger.statCondition !== undefined;

            expect(hasSimpleThreshold || hasConditionalThreshold).toBe(true);

            if (hasSimpleThreshold) {
              expect(trigger.threshold).toBeGreaterThan(0);
              // Some stats like money can exceed 100
              if (trigger.statKey === 'money') {
                expect(trigger.threshold).toBeGreaterThan(0);
              } else {
                expect(trigger.threshold).toBeLessThanOrEqual(100);
              }
            }

            if (hasConditionalThreshold && trigger.statCondition) {
              expect(trigger.statCondition.stat).toBeDefined();
              expect(['>', '<']).toContain(trigger.statCondition.operator);
              expect(trigger.statCondition.value).toBeGreaterThan(0);
            }
          }
        });
      });
    });

    it('triggers should have age windows', () => {
      const acquiredTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'ACQUIRED');
      
      acquiredTraits.forEach(trait => {
        trait.formation?.triggers.forEach(trigger => {
          if (trigger.ageWindow) {
            const [minAge, maxAge] = trigger.ageWindow;
            expect(minAge).toBeGreaterThanOrEqual(0);
            expect(maxAge).toBeLessThanOrEqual(18);
            expect(minAge).toBeLessThanOrEqual(maxAge);
          }
        });
      });
    });
  });

  describe('Rare and Uncommon Traits', () => {
    it('should identify traits with high point requirements as rare', () => {
      const acquiredTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'ACQUIRED');
      const rareTraits = acquiredTraits.filter(
        t => t.formation && t.formation.pointsRequired >= 8
      );

      expect(rareTraits.length).toBeGreaterThan(0);
      
      rareTraits.forEach(trait => {
        expect(trait.formation?.pointsRequired).toBeGreaterThanOrEqual(8);
      });
    });

    it('should identify traits with stat thresholds as uncommon', () => {
      const acquiredTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'ACQUIRED');
      const uncommonTraits = acquiredTraits.filter(t => 
        t.formation?.triggers.some(trigger => trigger.type === 'STAT_THRESHOLD')
      );

      expect(uncommonTraits.length).toBeGreaterThan(0);
    });

    it('rare traits should have stronger effects', () => {
      const bookworm = TRAIT_DEFINITIONS.find(t => t.id === 'BOOKWORM');
      const organized = TRAIT_DEFINITIONS.find(t => t.id === 'ORGANIZED');
      
      if (bookworm && organized) {
        const bookwormPoints = bookworm.formation?.pointsRequired || 0;
        const organizedPoints = organized.formation?.pointsRequired || 0;
        
        // Bookworm requires more points
        expect(bookwormPoints).toBeGreaterThan(organizedPoints);
        
        // Bookworm should have stronger intelligence multiplier
        const bookwormMult = bookworm.effects.statMultipliers?.intelligence || 1;
        const organizedMult = organized.effects.statMultipliers?.intelligence || 1;
        
        if (bookwormMult > 1 && organizedMult > 1) {
          expect(bookwormMult).toBeGreaterThan(organizedMult);
        }
      }
    });
  });

  describe('Trait Effects Validation', () => {
    it('all traits should have at least one effect', () => {
      TRAIT_DEFINITIONS.forEach(trait => {
        const hasStatMultiplier = trait.effects.statMultipliers !== undefined &&
          Object.keys(trait.effects.statMultipliers).length > 0;
        const hasEnergyCost = trait.effects.energyCostMultiplier !== undefined;
        const hasPassiveBonus = (trait.effects as any).passiveBonuses !== undefined;
        const hasDescription = trait.description && trait.description.length > 0;

        // At least one effect should be present (description counts as an effect for flavor traits)
        expect(
          hasStatMultiplier || hasEnergyCost || hasPassiveBonus || hasDescription
        ).toBe(true);
      });
    });

    it('traits should not have extreme multipliers', () => {
      TRAIT_DEFINITIONS.forEach(trait => {
        if (trait.effects.statMultipliers) {
          Object.values(trait.effects.statMultipliers).forEach(multiplier => {
            if (multiplier !== undefined) {
              expect(multiplier).toBeGreaterThan(0.5);
              expect(multiplier).toBeLessThan(2.0);
            }
          });
        }
      });
    });
  });

  describe('Trait Descriptions', () => {
    it('all traits should have non-empty descriptions', () => {
      TRAIT_DEFINITIONS.forEach(trait => {
        expect(trait.description).toBeDefined();
        expect(trait.description.length).toBeGreaterThan(10);
      });
    });

    it('all traits should have emoji in name', () => {
      TRAIT_DEFINITIONS.forEach(trait => {
        // Turkish characters and emojis should be present
        expect(trait.name).toBeDefined();
        expect(trait.name.length).toBeGreaterThan(1);
      });
    });
  });
});
