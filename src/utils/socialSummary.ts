import type { NPC, NPCRole } from '../types';
import { tRuntime } from '../i18n/strings';

const ROLE_EMOJI: Record<NPCRole, string> = {
  PARTNER: '\u2764\uFE0F',
  BEST_FRIEND: '\u{1F91D}',
  FRIEND: '\u{1F465}',
  CRUSH: '\u{1F495}',
  RIVAL: '\u2694\uFE0F',
  ENEMY: '\u{1F4A5}',
  ACQUAINTANCE: '\u{1F44B}',
};

const ROLE_ORDER: NPCRole[] = ['PARTNER', 'BEST_FRIEND', 'CRUSH', 'FRIEND', 'RIVAL', 'ENEMY'];

export interface NPCSummary {
  name: string;
  role: NPCRole;
  relationship: number;
  metAge: number;
  sharedMemoryCount: number;
  emoji: string;
  narrativeLine: string;
}

const buildNPCNarrative = (npc: NPC): string => {
  const yearsKnown = Math.max(0, 18 - npc.metAge);
  const memCount = npc.sharedMemories.length;

  switch (npc.role) {
    case 'PARTNER':
      return tRuntime(
        'social.epilogue.templates.PARTNER',
        { name: npc.name, metAge: npc.metAge, yearsKnown },
        `${npc.name} ile ${npc.metAge} yasinda tanistin. ${yearsKnown} yil boyunca birlikte buyudunuz ve mezuniyette el ele tutuyordunuz.`
      );
    case 'BEST_FRIEND':
      return memCount > 2
        ? tRuntime(
          'social.epilogue.templates.BEST_FRIEND_MEMORIES',
          { name: npc.name, metAge: npc.metAge, memCount },
          `${npc.name}, ${npc.metAge} yasindan beri yaninda. ${memCount} ortak aniniz var, o senin kardesin.`
        )
        : tRuntime(
          'social.epilogue.templates.BEST_FRIEND',
          { name: npc.name, metAge: npc.metAge },
          `${npc.name} ile ${npc.metAge} yasindan beri birbirinize bagli kaldiniz.`
        );
    case 'CRUSH':
      return tRuntime(
        'social.epilogue.templates.CRUSH',
        { name: npc.name },
        `${npc.name} ile aranizda bir seyler var ama henuz netlesmediniz.`
      );
    case 'FRIEND':
      return yearsKnown >= 5
        ? tRuntime(
          'social.epilogue.templates.FRIEND_LONG',
          { name: npc.name, yearsKnown },
          `${npc.name} ile ${yearsKnown} yildir arkadassiniz. Iyi gunleri paylastiniz.`
        )
        : tRuntime(
          'social.epilogue.templates.FRIEND_SHORT',
          { name: npc.name },
          `${npc.name} ile ara sira takiliyorsun. Iyi bir arkadas ama derin bir bag kuramadin.`
        );
    case 'RIVAL':
      return tRuntime(
        'social.epilogue.templates.RIVAL',
        { name: npc.name, metAge: npc.metAge },
        `${npc.name} ile ${npc.metAge} yasinda yollariniz ayrildi. Hala birbirinize soguk bakiyorsunuz.`
      );
    case 'ENEMY':
      return tRuntime(
        'social.epilogue.templates.ENEMY',
        { name: npc.name, hateScore: Math.abs(npc.relationship) },
        `${npc.name} ile aran hic duzelmedi. ${Math.abs(npc.relationship)} puan nefret biriktirdiniz.`
      );
    default:
      return tRuntime(
        'social.epilogue.templates.DEFAULT',
        { name: npc.name },
        `${npc.name} ile yollariniz kesisti ama derin bir bag kuramadin.`
      );
  }
};

export const buildSocialSummary = (npcs: NPC[]): NPCSummary[] => {
  const significant = npcs.filter(n => ROLE_ORDER.includes(n.role));
  const sorted = significant.sort((a, b) => {
    const aOrder = ROLE_ORDER.indexOf(a.role);
    const bOrder = ROLE_ORDER.indexOf(b.role);
    return aOrder - bOrder;
  });

  return sorted.slice(0, 5).map(npc => ({
    name: npc.name,
    role: npc.role,
    relationship: npc.relationship,
    metAge: npc.metAge,
    sharedMemoryCount: npc.sharedMemories.length,
    emoji: ROLE_EMOJI[npc.role] ?? '\u{1F44B}',
    narrativeLine: buildNPCNarrative(npc),
  }));
};
