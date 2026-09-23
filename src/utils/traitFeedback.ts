import { getTrait, getTraitName } from '../data/traits';
import { tRuntime } from '../i18n/strings';
import { TraitChangeFeedback } from '../types';

const NEGATIVE_GAIN_GUIDANCE_KEYS: Record<string, string> = {
  LAZY: 'storyText.traits.negativeGuidance.LAZY',
  PROCRASTINATOR: 'storyText.traits.negativeGuidance.PROCRASTINATOR',
  BURNOUT_PRONE: 'storyText.traits.negativeGuidance.BURNOUT_PRONE',
  LONE_WOLF: 'storyText.traits.negativeGuidance.LONE_WOLF',
  COWARD: 'storyText.traits.negativeGuidance.COWARD',
  CHEATER: 'storyText.traits.negativeGuidance.CHEATER',
  REBELLIOUS: 'storyText.traits.negativeGuidance.REBELLIOUS',
  SICKLY: 'storyText.traits.negativeGuidance.SICKLY',
  CLUMSY: 'storyText.traits.negativeGuidance.CLUMSY',
};

const stripLeadingEmoji = (name: string): string => name.replace(/^[^A-Za-z0-9]+/u, '').trim();

const getDisplayName = (traitId: string): string => stripLeadingEmoji(getTraitName(traitId));

const buildGainGuidance = (traitId: string): string | undefined => {
  const trait = getTrait(traitId);
  if (!trait) return undefined;
  if (trait.type === 'NEGATIVE') {
    const guidanceKey = NEGATIVE_GAIN_GUIDANCE_KEYS[traitId];
    return guidanceKey
      ? tRuntime(guidanceKey)
      : tRuntime('storyText.traits.negativeGuidance.default');
  }
  return undefined;
};

const buildRemovalSummary = (traitId: string, gainedTraits: string[]): string => {
  const resolverId = gainedTraits.find(gainedId => getTrait(gainedId)?.conflicts?.includes(traitId));
  const traitName = getDisplayName(traitId);
  if (!resolverId) {
    return tRuntime('storyText.traits.removalSummary', { traitName });
  }
  return tRuntime('storyText.traits.removalResolvedSummary', {
    traitName,
    resolverName: getDisplayName(resolverId),
  });
};

const dedupe = (items: string[]): string[] => Array.from(new Set(items.filter(Boolean)));

export const buildTraitChangeFeedback = (
  gainedTraits: string[] = [],
  removedTraits: string[] = []
): TraitChangeFeedback[] => {
  const uniqueGained = dedupe(gainedTraits);
  const uniqueRemoved = dedupe(removedTraits);

  const gainEntries = uniqueGained.map(traitId => ({
    traitId,
    changeType: 'GAINED' as const,
    summary: tRuntime('storyText.traits.gainSummary', { traitName: getDisplayName(traitId) }),
    guidance: buildGainGuidance(traitId),
  }));

  const removalEntries = uniqueRemoved.map(traitId => ({
    traitId,
    changeType: 'REMOVED' as const,
    summary: buildRemovalSummary(traitId, uniqueGained),
    guidance: undefined,
  }));

  return [...gainEntries, ...removalEntries];
};
