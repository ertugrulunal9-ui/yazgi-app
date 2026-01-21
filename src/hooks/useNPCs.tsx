import { useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { NPC, NPCRole } from '../types';
import { generateNPCs } from '../utils/gameUtils';

export const useNPCs = () => {
  const { gameState, updateGameState } = useGame();

  const updateNPCRelationship = useCallback((npcId: string, delta: number) => {
    const updated = gameState.npcs.map(npc =>
      npc.id === npcId
        ? { ...npc, relationship: Math.max(0, Math.min(100, npc.relationship + delta)) }
        : npc
    );
    updateGameState({ npcs: updated });
  }, [gameState.npcs, updateGameState]);

  const createRandomNPC = useCallback((age: number): NPC => {
    const genders = ['MALE', 'FEMALE'] as const;
    const roles: NPCRole[] = ['ACQUAINTANCE', 'FRIEND', 'CRUSH', 'RIVAL'];
    return {
      id: `npc_${Date.now()}_${Math.random()}`,
      name: `NPC_${Math.random().toString(36).slice(2, 9)}`,
      gender: genders[Math.floor(Math.random() * genders.length)],
      role: roles[Math.floor(Math.random() * roles.length)],
      relationship: 30 + Math.floor(Math.random() * 40),
      romance: 0,
    };
  }, []);

  const initializeNPCs = useCallback(() => {
    if (gameState.npcs.length === 0) {
      const newNPCs = generateNPCs();
      updateGameState({ npcs: newNPCs });
    }
  }, [gameState.npcs, updateGameState]);

  const selectNPC = useCallback((npcId: string | null) => {
    updateGameState({ selectedNpcId: npcId });
  }, [updateGameState]);

  return {
    npcs: gameState.npcs,
    selectedNpcId: gameState.selectedNpcId,
    updateNPCRelationship,
    createRandomNPC,
    initializeNPCs,
    selectNPC,
  };
};
