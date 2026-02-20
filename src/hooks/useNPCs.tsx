import { useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { NPC, NPCRole, SocialGroup, RelationshipMilestone, ScheduledEvent, Skills } from '../types';
import { applySkillsToSocialCost, getTeamworkRelationMultiplier } from '../utils/gameUtils';
import {
  createRandomNPC as createRandomNPCUtil,
  generateNPCs,
  calculatePersonalityCompatibility,
} from '../utils/gameUtils';
import {
  isInteractionAvailable,
  getLockedMessage,
  InteractionType,
} from '../constants/interactionRestrictions';
import { MILESTONE_EVENT_MAP } from '../data/relationshipMilestoneEvents';
import { NPC_QUESTLINE_ARCS } from '../data/npcQuestlineArcs';
import { ActiveStoryArc } from '../types';

// =================================================================
// NPC SOSYAL SİSTEM HOOK'U
// Arkadaşlık, düşmanlık, romantik ilişkiler ve grup dinamikleri
// =================================================================

// İlişki threshold'ları
const RELATIONSHIP_THRESHOLDS = {
  ENEMY: -50,
  RIVAL: -20,
  ACQUAINTANCE: 0,
  FRIEND: 40,
  BEST_FRIEND: 75,
};

const ROMANCE_THRESHOLDS = {
  CRUSH: 30,
  PARTNER: 70,
};

// Rol değişiminden milestone tespit et
const detectMilestone = (oldRole: NPCRole, newRole: NPCRole): RelationshipMilestone | null => {
  // Olumlu geçişler
  if (newRole === 'FRIEND' && oldRole === 'ACQUAINTANCE') return 'BECAME_FRIEND';
  if (newRole === 'BEST_FRIEND' && oldRole !== 'BEST_FRIEND') return 'BECAME_BEST_FRIEND';
  if (newRole === 'CRUSH' && oldRole !== 'CRUSH' && oldRole !== 'PARTNER') return 'BECAME_CRUSH';
  if (newRole === 'PARTNER' && oldRole !== 'PARTNER') return 'BECAME_PARTNER';

  // Olumsuz geçişler
  if (newRole === 'RIVAL' && oldRole !== 'RIVAL' && oldRole !== 'ENEMY') return 'BECAME_RIVAL';
  if (newRole === 'ENEMY' && oldRole !== 'ENEMY') return 'BECAME_ENEMY';

  // Kayıplar
  if (oldRole === 'FRIEND' && (newRole === 'ACQUAINTANCE' || newRole === 'RIVAL' || newRole === 'ENEMY')) return 'LOST_FRIEND';
  if (oldRole === 'BEST_FRIEND' && newRole !== 'BEST_FRIEND' && newRole !== 'PARTNER' && newRole !== 'CRUSH') return 'LOST_FRIEND';
  if (oldRole === 'PARTNER' && newRole !== 'PARTNER') return 'BREAKUP';

  return null;
};

// Milestone için event zamanla
const createMilestoneScheduledEvent = (milestone: RelationshipMilestone, npcId: string): ScheduledEvent | null => {
  const eventIds = MILESTONE_EVENT_MAP[milestone];
  if (!eventIds || eventIds.length === 0) return null;

  // Rastgele bir event seç
  const eventId = eventIds[Math.floor(Math.random() * eventIds.length)];

  return {
    id: `scheduled_milestone_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    eventId,
    remainingTurns: 1, // Sonraki turda tetikle
    priority: 'HIGH',
    sourceEventId: `milestone_${milestone}_${npcId}`,
  };
};

export const useNPCs = () => {
  const { gameState, updateGameState, setGameState } = useGame();

  // =================================================================
  // İLİŞKİ YÖNETİMİ
  // =================================================================

  /**
   * İlişki puanını güncelle ve role'ü otomatik ayarla
   * @param npcId - NPC ID
   * @param delta - İlişki değişim miktarı
   * @warning NPC bulunamazsa sessizce başarısız olur (log kaydeder)
   */
  const updateRelationship = useCallback((npcId: string, delta: number) => {
    setGameState(prevState => {
      const milestoneEvents: ScheduledEvent[] = [];
      const npcExists = prevState.npcs.some(n => n.id === npcId);
      if (!npcExists) {
        console.warn(`[useNPCs] updateRelationship: NPC with id "${npcId}" not found`);
        return prevState;
      }

      const updated = prevState.npcs.map(npc => {
        if (npc.id !== npcId) return npc;

        const oldRole = npc.role;
        const newRelationship = Math.max(-100, Math.min(100, npc.relationship + delta));

        let newRole: NPCRole = npc.role;
        if (npc.romance >= ROMANCE_THRESHOLDS.PARTNER && newRelationship > 0) {
          newRole = 'PARTNER';
        } else if (npc.romance >= ROMANCE_THRESHOLDS.CRUSH && newRelationship > 0) {
          newRole = 'CRUSH';
        } else if (newRelationship <= RELATIONSHIP_THRESHOLDS.ENEMY) {
          newRole = 'ENEMY';
        } else if (newRelationship <= RELATIONSHIP_THRESHOLDS.RIVAL) {
          newRole = 'RIVAL';
        } else if (newRelationship >= RELATIONSHIP_THRESHOLDS.BEST_FRIEND) {
          newRole = 'BEST_FRIEND';
        } else if (newRelationship >= RELATIONSHIP_THRESHOLDS.FRIEND) {
          newRole = 'FRIEND';
        } else {
          newRole = 'ACQUAINTANCE';
        }

        if (oldRole !== newRole) {
          const milestone = detectMilestone(oldRole, newRole);
          if (milestone) {
            const event = createMilestoneScheduledEvent(milestone, npc.id);
            if (event) {
              milestoneEvents.push(event);
            }
          }
        }

        return {
          ...npc,
          relationship: newRelationship,
          role: newRole,
          lastInteraction: prevState.turn,
        };
      });

      // Check if role change should start an NPC questline arc
      const newArcs: ActiveStoryArc[] = [];
      for (const npc of updated) {
        const oldNpc = prevState.npcs.find(o => o.id === npc.id);
        if (!oldNpc || oldNpc.role === npc.role) continue;

        for (const arc of NPC_QUESTLINE_ARCS) {
          if (!arc.requiresNPC || !arc.npcRoleRequirement) continue;
          if (!arc.npcRoleRequirement.includes(npc.role)) continue;
          if (prevState.age < arc.ageRange[0] || prevState.age > arc.ageRange[1]) continue;
          const alreadyActive = (prevState.activeArcs || []).some(a => a.arcId === arc.id);
          const alreadyNew = newArcs.some(a => a.arcId === arc.id);
          if (alreadyActive || alreadyNew) continue;
          newArcs.push({ arcId: arc.id, stage: 0, npcId: npc.id });
        }
      }

      return {
        ...prevState,
        npcs: updated,
        ...(milestoneEvents.length > 0
          ? { scheduledEvents: [...(prevState.scheduledEvents || []), ...milestoneEvents] }
          : {}),
        ...(newArcs.length > 0
          ? { activeArcs: [...(prevState.activeArcs || []), ...newArcs] }
          : {}),
      };
    });
  }, [setGameState]);

  /**
   * Romantik ilgi puanını güncelle (cinsiyet kontrolü ile)
   * @param npcId - NPC ID
   * @param delta - Romantik ilgi değişim miktarı
   * @warning NPC bulunamazsa veya aynı cinsiyetteyse sessizce başarısız olur
   */
  const updateRomance = useCallback((npcId: string, delta: number) => {
    setGameState(prevState => {
      const milestoneEvents: ScheduledEvent[] = [];
      const npcExists = prevState.npcs.some(n => n.id === npcId);
      if (!npcExists) {
        console.warn(`[useNPCs] updateRomance: NPC with id "${npcId}" not found`);
        return prevState;
      }

      const updated = prevState.npcs.map(npc => {
        if (npc.id !== npcId) return npc;

        const playerGender = prevState.characterInfo?.gender
          ?? prevState.character?.characterInfo?.gender;
        if (delta > 0) {
          if (!playerGender) {
            console.warn('[useNPCs] updateRomance: player gender missing, blocking romance increase');
            return npc;
          }

          if (playerGender === npc.gender) {
            return npc;
          }
        }

        const oldRole = npc.role;
        const newRomance = Math.max(0, Math.min(100, npc.romance + delta));

        let newRole: NPCRole = npc.role;
        if (newRomance >= ROMANCE_THRESHOLDS.PARTNER && npc.relationship > 0) {
          newRole = 'PARTNER';
        } else if (newRomance >= ROMANCE_THRESHOLDS.CRUSH && npc.relationship > 0) {
          newRole = 'CRUSH';
        } else if (npc.role === 'PARTNER' || npc.role === 'CRUSH') {
          newRole = npc.relationship >= RELATIONSHIP_THRESHOLDS.FRIEND ? 'FRIEND' : 'ACQUAINTANCE';
        }

        if (oldRole !== newRole) {
          const milestone = detectMilestone(oldRole, newRole);
          if (milestone) {
            const event = createMilestoneScheduledEvent(milestone, npc.id);
            if (event) {
              milestoneEvents.push(event);
            }
          }
        }

        return {
          ...npc,
          romance: newRomance,
          role: newRole,
          lastInteraction: prevState.turn,
        };
      });

      return {
        ...prevState,
        npcs: updated,
        ...(milestoneEvents.length > 0
          ? { scheduledEvents: [...(prevState.scheduledEvents || []), ...milestoneEvents] }
          : {}),
      };
    });
  }, [setGameState]);

  // =================================================================
  // NPC YÖNETİMİ
  // =================================================================

  /** Yeni NPC ekle */
  const addNPC = useCallback((playerAge?: number, playerTurn?: number): NPC => {
    const age = playerAge ?? gameState.age;
    const turn = playerTurn ?? gameState.turn;
    const newNPC = createRandomNPCUtil(age, turn);
    updateGameState({ npcs: [...gameState.npcs, newNPC] });
    return newNPC;
  }, [gameState.age, gameState.turn, gameState.npcs, updateGameState]);

  /** NPC'yi kaldır (ilişki bitişi) */
  const removeNPC = useCallback((npcId: string) => {
    const updated = gameState.npcs.filter(npc => npc.id !== npcId);
    updateGameState({ npcs: updated });
  }, [gameState.npcs, updateGameState]);

  /** Role'e göre NPC'leri getir */
  const getNPCsByRole = useCallback((role: NPCRole): NPC[] => {
    return gameState.npcs.filter(npc => npc.role === role);
  }, [gameState.npcs]);

  /** En yakın NPC'leri getir (relationship sırasına göre) */
  const getClosestNPCs = useCallback((count: number): NPC[] => {
    return [...gameState.npcs]
      .sort((a, b) => b.relationship - a.relationship)
      .slice(0, count);
  }, [gameState.npcs]);

  /**
   * ID ile NPC getir
   * @param npcId - NPC ID
   * @returns NPC objesi veya undefined
   * @important Çağıran taraf undefined kontrolü yapmalıdır
   */
  const getNPCById = useCallback((npcId: string): NPC | undefined => {
    return gameState.npcs.find(npc => npc.id === npcId);
  }, [gameState.npcs]);

  /** Arkadaş sayısını getir */
  const getFriendCount = useCallback((): number => {
    return gameState.npcs.filter(npc =>
      npc.role === 'FRIEND' || npc.role === 'BEST_FRIEND'
    ).length;
  }, [gameState.npcs]);

  /** Düşman sayısını getir */
  const getEnemyCount = useCallback((): number => {
    return gameState.npcs.filter(npc =>
      npc.role === 'RIVAL' || npc.role === 'ENEMY'
    ).length;
  }, [gameState.npcs]);

  // =================================================================
  // ORTAK ANILAR
  // =================================================================

  /**
   * NPC ile ortak anı ekle
   * @param npcId - NPC ID
   * @param eventId - Event ID
   * @warning NPC bulunamazsa sessizce başarısız olur
   */
  const addSharedMemory = useCallback((npcId: string, eventId: string) => {
    const updated = gameState.npcs.map(npc => {
      if (npc.id !== npcId) return npc;

      // Aynı anı tekrar ekleme
      if (npc.sharedMemories.includes(eventId)) return npc;

      return {
        ...npc,
        sharedMemories: [...npc.sharedMemories, eventId],
        lastInteraction: gameState.turn
      };
    });

    updateGameState({ npcs: updated });
  }, [gameState.npcs, gameState.turn, updateGameState]);

  // =================================================================
  // GRUP DİNAMİKLERİ
  // =================================================================

  /** Yeni grup oluştur */
  const createGroup = useCallback((name: string, memberIds: string[], type: SocialGroup['type'] = 'FRIEND_GROUP'): SocialGroup => {
    const newGroup: SocialGroup = {
      id: `group_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      members: memberIds,
      leaderId: memberIds[0] || null,
      type,
      reputation: 50,
      isPlayerMember: true,
      formedAtAge: gameState.age,
      formedAtTurn: gameState.turn
    };

    // NPC'lerin grup bilgisini güncelle
    const updatedNpcs = gameState.npcs.map(npc => {
      if (memberIds.includes(npc.id)) {
        return { ...npc, isInPlayerGroup: true, groupId: newGroup.id };
      }
      return npc;
    });

    updateGameState({
      socialGroups: [...gameState.socialGroups, newGroup],
      npcs: updatedNpcs
    });

    return newGroup;
  }, [gameState.age, gameState.turn, gameState.socialGroups, gameState.npcs, updateGameState]);

  /** Gruba katıl */
  const joinGroup = useCallback((groupId: string) => {
    const updatedGroups = gameState.socialGroups.map(group => {
      if (group.id !== groupId) return group;
      return { ...group, isPlayerMember: true };
    });

    updateGameState({ socialGroups: updatedGroups });
  }, [gameState.socialGroups, updateGameState]);

  /** Gruptan ayrıl */
  const leaveGroup = useCallback((groupId: string) => {
    const updatedGroups = gameState.socialGroups.map(group => {
      if (group.id !== groupId) return group;
      return { ...group, isPlayerMember: false };
    });

    // NPC'lerin grup bilgisini güncelle
    const updatedNpcs = gameState.npcs.map(npc => {
      if (npc.groupId === groupId) {
        return { ...npc, isInPlayerGroup: false };
      }
      return npc;
    });

    updateGameState({
      socialGroups: updatedGroups,
      npcs: updatedNpcs
    });
  }, [gameState.socialGroups, gameState.npcs, updateGameState]);

  /** Oyuncunun gruplarını getir */
  const getPlayerGroups = useCallback((): SocialGroup[] => {
    return gameState.socialGroups.filter(group => group.isPlayerMember);
  }, [gameState.socialGroups]);

  /** NPC'yi gruba ekle */
  const addNPCToGroup = useCallback((npcId: string, groupId: string) => {
    // Grubu güncelle
    const updatedGroups = gameState.socialGroups.map(group => {
      if (group.id !== groupId) return group;
      if (group.members.includes(npcId)) return group;
      return { ...group, members: [...group.members, npcId] };
    });

    // NPC'yi güncelle
    const updatedNpcs = gameState.npcs.map(npc => {
      if (npc.id !== npcId) return npc;
      return { ...npc, isInPlayerGroup: true, groupId };
    });

    updateGameState({
      socialGroups: updatedGroups,
      npcs: updatedNpcs
    });
  }, [gameState.socialGroups, gameState.npcs, updateGameState]);

  /** NPC'yi gruptan çıkar */
  const removeNPCFromGroup = useCallback((npcId: string, groupId: string) => {
    // Grubu güncelle
    const updatedGroups = gameState.socialGroups.map(group => {
      if (group.id !== groupId) return group;
      return { ...group, members: group.members.filter(id => id !== npcId) };
    });

    // NPC'yi güncelle
    const updatedNpcs = gameState.npcs.map(npc => {
      if (npc.id !== npcId) return npc;
      return { ...npc, isInPlayerGroup: false, groupId: undefined };
    });

    updateGameState({
      socialGroups: updatedGroups,
      npcs: updatedNpcs
    });
  }, [gameState.socialGroups, gameState.npcs, updateGameState]);

  // =================================================================
  // BAŞLATMA VE SEÇİM
  // =================================================================

  /** NPC'leri başlat */
  const initializeNPCs = useCallback(() => {
    if (gameState.npcs.length === 0) {
      const newNPCs = generateNPCs(gameState.age, gameState.turn);
      updateGameState({ npcs: newNPCs });
    }
  }, [gameState.npcs.length, gameState.age, gameState.turn, updateGameState]);

  /** NPC seç */
  const selectNPC = useCallback((npcId: string | null) => {
    updateGameState({ selectedNpcId: npcId });
  }, [updateGameState]);

  // =================================================================
  // SOSYAL İTİBAR
  // =================================================================

  /** Sosyal itibarı güncelle */
  const updateSocialReputation = useCallback((delta: number) => {
    const newReputation = Math.max(0, Math.min(100, gameState.socialReputation + delta));
    updateGameState({ socialReputation: newReputation });
  }, [gameState.socialReputation, updateGameState]);

  return {
    // State
    npcs: gameState.npcs,
    selectedNpcId: gameState.selectedNpcId,
    socialGroups: gameState.socialGroups,
    socialReputation: gameState.socialReputation,

    // İlişki yönetimi
    updateRelationship,
    updateRomance,

    // NPC yönetimi
    addNPC,
    removeNPC,
    getNPCsByRole,
    getClosestNPCs,
    getNPCById,
    getFriendCount,
    getEnemyCount,

    // Ortak anılar
    addSharedMemory,

    // Grup dinamikleri
    createGroup,
    joinGroup,
    leaveGroup,
    getPlayerGroups,
    addNPCToGroup,
    removeNPCFromGroup,

    // Başlatma ve seçim
    initializeNPCs,
    selectNPC,

    // Sosyal itibar
    updateSocialReputation,

    // =================================================================
    // MANUEL ETKİLEŞİM
    // =================================================================

    /** NPC ile manuel etkileşim (kişilik uyumluluğu ile) */
    interactWithNPC: useCallback((
      npcId: string,
      actionType: 'CHAT' | 'HANGOUT' | 'GIFT' | 'STUDY' | 'FLIRT' | 'HELP' | 'COMPETE' | 'GOSSIP',
      playerPersonality: { openness: number; empathy: number; courage: number; conformity: number },
      currentEnergy?: number,
      currentMoney?: number,
      skills?: Skills
    ) => {
      const npc = gameState.npcs.find(n => n.id === npcId);
      if (!npc) return { success: false, message: 'NPC bulunamadı', cost: { energy: 0, money: 0 } };

      // Yaş kontrolü - etkileşim yaşa uygun mu?
      if (!isInteractionAvailable(actionType as InteractionType, gameState.age)) {
        return {
          success: false,
          message: getLockedMessage(actionType as InteractionType),
          cost: { energy: 0, money: 0 }
        };
      }

      // Flört için cinsiyet kontrolü - aynı cinsiyette flört engellenir
      if (actionType === 'FLIRT') {
        const playerGender = gameState.characterInfo?.gender
          ?? gameState.character?.characterInfo?.gender;
        if (!playerGender) {
          return {
            success: false,
            message: 'Karakter cinsiyet bilgisi eksik. Flört aksiyonu kullanılamaz.',
            cost: { energy: 0, money: 0 }
          };
        }

        if (playerGender === npc.gender) {
          return {
            success: false,
            message: `${npc.name} ile bu şekilde ilişki kuramazsın.`,
            cost: { energy: 0, money: 0 }
          };
        }
      }

      // Enerji ve para maliyetleri
      const costs: Record<typeof actionType, { energy: number; money: number }> = {
        CHAT: { energy: 10, money: 0 },
        HANGOUT: { energy: 15, money: 0 },
        GIFT: { energy: 5, money: 50 },
        STUDY: { energy: 20, money: 0 },
        FLIRT: { energy: 12, money: 0 },
        HELP: { energy: 18, money: 0 },
        COMPETE: { energy: 15, money: 0 },
        GOSSIP: { energy: 8, money: 0 },
      };

      const cost = costs[actionType];
      const adjustedCost = applySkillsToSocialCost(cost, skills);

      // Yeterli kaynak kontrolü (eğer değerler verilmişse)
      if (currentEnergy !== undefined && currentEnergy < adjustedCost.energy) {
        return { success: false, message: 'Yeterli enerjin yok!', cost: adjustedCost };
      }
      if (currentMoney !== undefined && currentMoney < adjustedCost.money) {
        return { success: false, message: 'Yeterli paran yok!', cost: adjustedCost };
      }

      // Kişilik uyumluluğunu hesapla (top-level import kullanılıyor)
      const compatibility = calculatePersonalityCompatibility(playerPersonality, npc.personality);

      // Temel ilişki artışları
      const baseIncrease: Record<typeof actionType, number> = {
        CHAT: 5,
        HANGOUT: 8,
        GIFT: 12,
        STUDY: 6,
        FLIRT: 7,
        HELP: 10,
        COMPETE: -3, // Rekabet ilişkiyi azaltabilir
        GOSSIP: 4,
      };

      // Uyumluluk ile çarp (uyumsuz: -50%, uyumlu: +100%)
      const teamworkBoost = getTeamworkRelationMultiplier(skills);
      const actualIncrease = Math.round(baseIncrease[actionType] * (1 + compatibility) * teamworkBoost);

      // İlişkiyi güncelle
      updateRelationship(npcId, actualIncrease);

      // Özel aksiyon etkileri
      if (actionType === 'FLIRT' && actualIncrease > 0) {
        updateRomance(npcId, Math.round(actualIncrease * 0.5));
      }

      // Geri bildirim mesajı
      const actionNames: Record<typeof actionType, string> = {
        CHAT: 'sohbet ettin',
        HANGOUT: 'takıldın',
        GIFT: 'hediye verdin',
        STUDY: 'ders çalıştın',
        FLIRT: 'flört ettin',
        HELP: 'yardım ettin',
        COMPETE: 'yarıştın',
        GOSSIP: 'dedikodu yaptın',
      };

      let message = '';
      if (compatibility > 0.5) {
        message = `${npc.name} ile ${actionNames[actionType]}! Harika vakit! (İlişki +${actualIncrease})`;
      } else if (compatibility > 0) {
        message = `${npc.name} ile ${actionNames[actionType]}. Güzeldi! (İlişki +${actualIncrease})`;
      } else if (compatibility > -0.5) {
        message = `${npc.name} ile ${actionNames[actionType]}. (İlişki +${actualIncrease})`;
      } else {
        message = `${npc.name} ile ${actionNames[actionType]}... Pek iyi gitmedi. (İlişki +${actualIncrease})`;
      }

      return { success: true, message, relationChange: actualIncrease, cost: adjustedCost };
    }, [
      gameState.npcs,
      gameState.age,
      gameState.characterInfo,
      gameState.character,
      updateRelationship,
      updateRomance,
    ]),

    /** Yeni NPC ile tanış */
    meetNewNPC: useCallback(() => {
      const newNPC = createRandomNPCUtil(gameState.age, gameState.turn);
      updateGameState({ npcs: [...gameState.npcs, newNPC] });
      return { success: true, npc: newNPC };
    }, [gameState.age, gameState.turn, gameState.npcs, updateGameState]),
  };
};

