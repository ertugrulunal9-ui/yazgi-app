import { getTrait, getTraitName } from '../data/traits';
import { TraitChangeFeedback } from '../types';

const NEGATIVE_GAIN_GUIDANCE: Record<string, string> = {
  LAZY: 'Disiplini yuksek tut ve ders/spor rutinini bozma.',
  PROCRASTINATOR: 'Kisa hedefler belirleyip ertelenen gorevleri hemen tamamla.',
  BURNOUT_PRONE: 'Dusuk enerjiyle yogun aksiyon yapma, once dinlen.',
  LONE_WOLF: 'Sosyal aksiyonlari artirip iletisim statini toparla.',
  COWARD: 'Zor anlarda pasif kalmak yerine kontrollu risk al.',
  CHEATER: 'Kisa yol yerine uzun vadeli guvenilir secimler yap.',
  REBELLIOUS: 'Aile ile catisma anlarinda uzlasmaci secenekleri dene.',
  SICKLY: 'Saglik odakli rutin kurup enerji dususlerini erken toparla.',
  CLUMSY: 'Fiziksel aktiviteleri kademeli artirip tekrar et.',
};

const stripLeadingEmoji = (name: string): string => name.replace(/^[^A-Za-z0-9]+/u, '').trim();

const getDisplayName = (traitId: string): string => stripLeadingEmoji(getTraitName(traitId));

const buildGainGuidance = (traitId: string): string | undefined => {
  const trait = getTrait(traitId);
  if (!trait) return undefined;
  if (trait.type === 'NEGATIVE') {
    return NEGATIVE_GAIN_GUIDANCE[traitId] || 'Bu ozelligi azaltmak icin ters davranis kalibini surdur.';
  }
  return undefined;
};

const buildRemovalSummary = (traitId: string, gainedTraits: string[]): string => {
  const resolverId = gainedTraits.find(gainedId => getTrait(gainedId)?.conflicts?.includes(traitId));
  const traitName = getDisplayName(traitId);
  if (!resolverId) {
    return `- ${traitName} kaldirildi.`;
  }
  return `- ${traitName} kaldirildi (cakisma: ${getDisplayName(resolverId)}).`;
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
    summary: `+ ${getDisplayName(traitId)} kazanildi.`,
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

