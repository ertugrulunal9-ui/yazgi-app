/**
 * "Günü Bitir" onayı: gün özeti yalnızca oyuncu hâlâ harcayabileceği enerjiyi
 * bırakarak günü bitirirken gösterilir; aksi halde tur doğrudan ilerler.
 * Kontroller HubActionCommand'daki engellerle aynı sırayı izler.
 */
import { TURN_LIMITED_ACTIONS } from '../commands/ActionCommand';
import { ActionCategory, getActionEffectiveMinAge, resolveActionEffectForFamily } from '../data/actions';
import { getEffectiveOwnedItems } from '../data/items';
import type { ActionHistoryItem, FamilyWealth, SchoolGrades, Skills } from '../types';
import { applySkillsToHubAction } from './gameUtils';

interface SpendableEnergyContext {
  categories: ActionCategory[];
  age: number;
  turn: number;
  energy: number;
  money: number;
  skills: Skills;
  actionHistory: ActionHistoryItem[];
  inventory: string[];
  familyWealth?: FamilyWealth | null;
}

/**
 * Enerji harcayan ve şu an yapılabilen en az bir eylem var mı? Satın almalar ve
 * tanımda ücretsiz olan dinlenme eylemleri (bebek yemek/uyku) sayılmaz; beceri
 * ayarı bunları da en az 1 enerjiye yuvarladığı için taban bedele bakılır.
 */
export const hasSpendableEnergy = ({
  categories,
  age,
  turn,
  energy,
  money,
  skills,
  actionHistory,
  inventory,
  familyWealth,
}: SpendableEnergyContext): boolean => {
  const ownedItems = getEffectiveOwnedItems(inventory, familyWealth);

  return categories.some(category => category.subActions.some(action => {
    if (action.purchaseItemId || action.energyCost <= 0) return false;

    const minAge = getActionEffectiveMinAge(action, ownedItems);
    if (minAge !== undefined && age < minAge) return false;
    if ((action.requiredItemIds || []).some(itemId => !ownedItems.includes(itemId))) return false;
    if (
      TURN_LIMITED_ACTIONS.has(action.id)
      && actionHistory.some(entry => entry.turn === turn && entry.actionId === action.id)
    ) {
      return false;
    }

    const adjusted = applySkillsToHubAction(
      action.id,
      resolveActionEffectForFamily(action, familyWealth),
      action.energyCost,
      action.gradeUpdates as Partial<SchoolGrades> | undefined,
      skills,
      actionHistory
    );
    const requiredMoney = adjusted.effect.money !== undefined && adjusted.effect.money < 0
      ? Math.abs(adjusted.effect.money)
      : 0;

    return adjusted.energyCost <= energy && requiredMoney <= money;
  }));
};
