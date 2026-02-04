// Achievement System Kullanım Örneği

import React, { useState } from 'react';
import { useAchievements } from './src/hooks/useAchievements';
import { AchievementToast } from './src/components/AchievementToast';
import { Stats, GameState, Skills, SchoolGrades } from './src/types';

export const GameWithAchievements: React.FC = () => {
  // Game state
  const [stats, setStats] = useState<Stats>({
    health: 50,
    intelligence: 50,
    charisma: 50,
    discipline: 50,
    money: 0,
    energy: 100,
    familyRelation: 50,
  });

  const [gameState, setGameState] = useState<GameState>({
    age: 0,
    phase: 'HUB',
    recentEvents: [],
    memories: [],
    traits: [],
    skills: { coding: 0, music: 0, sports: 0, design: 0 },
    inventory: [],
    npcs: [],
    family: {
      dynamic: 'SUPPORTIVE',
      wealthLevel: 'MIDDLE_CLASS',
      parentEducation: 'COLLEGE',
      siblings: 1,
    },
    grades: { math: 50, science: 50, language: 50 },
    actionCounts: {},
    eventChoiceHistory: [],
    totalTurns: 0,
    maxEnergy: 100,
    achievementProgress: {},
  });

  const [skills] = useState<Skills>({ coding: 0, music: 0, sports: 0, design: 0 });
  const [grades] = useState<SchoolGrades>({ math: 50, science: 50, language: 50 });

  // Achievement toast state
  const [toastIds, setToastIds] = useState<string[]>([]);

  // Achievement hook
  const { 
    unlockedAchievements, 
    stats: achievementStats, 
    checkAchievements, 
    isUnlocked,
    getProgress,
    loading 
  } = useAchievements(
    stats,
    gameState,
    skills,
    grades,
    (achievementIds, rewards) => {
      // Show toast
      setToastIds(achievementIds);

      // Apply rewards
      rewards.forEach(reward => {
        if (reward?.money) {
          setStats(prev => ({ ...prev, money: prev.money + reward.money! }));
        }
        if (reward?.stats) {
          setStats(prev => ({
            ...prev,
            ...Object.keys(reward.stats!).reduce((acc, key) => {
              const statKey = key as keyof Stats;
              const value = reward.stats![statKey] as number;
              return { ...acc, [statKey]: (prev[statKey] as number) + value };
            }, {}),
          }));
        }
      });
    }
  );

  // Simulate stat increase
  const increaseIntelligence = async () => {
    setStats(prev => ({ ...prev, intelligence: Math.min(100, prev.intelligence + 10) }));
    
    // Check achievements after stat change
    const newAchievements = await checkAchievements();
    console.log('New achievements:', newAchievements);
  };

  const earnMoney = async () => {
    setStats(prev => ({ ...prev, money: prev.money + 1000 }));
    await checkAchievements();
  };

  const ageUp = async () => {
    setGameState(prev => ({ ...prev, age: prev.age + 1 }));
    await checkAchievements();
  };

  if (loading) {
    return <div>Loading achievements...</div>;
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">🏆 Achievement System Demo</h1>

      {/* Stats Display */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>Zeka: {stats.intelligence}</div>
          <div>Sağlık: {stats.health}</div>
          <div>Karizma: {stats.charisma}</div>
          <div>Disiplin: {stats.discipline}</div>
          <div>Para: {stats.money}₺</div>
          <div>Yaş: {gameState.age}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Actions</h2>
        <div className="flex gap-4">
          <button
            onClick={increaseIntelligence}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
          >
            📚 Ders Çalış (+10 Zeka)
          </button>
          <button
            onClick={earnMoney}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
          >
            💰 Para Kazan (+1000₺)
          </button>
          <button
            onClick={ageUp}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-semibold"
          >
            🎂 Yaşlan (+1)
          </button>
        </div>
      </div>

      {/* Achievement Stats */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Achievement Progress</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold">{achievementStats.unlocked}/{achievementStats.total}</div>
            <div className="text-sm text-gray-400">Achievements Unlocked</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{achievementStats.percentage}%</div>
            <div className="text-sm text-gray-400">Completion</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-400">{achievementStats.byRarity.COMMON}</div>
            <div className="text-xs">Common</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">{achievementStats.byRarity.RARE}</div>
            <div className="text-xs">Rare</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400">{achievementStats.byRarity.EPIC}</div>
            <div className="text-xs">Epic</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">{achievementStats.byRarity.LEGENDARY}</div>
            <div className="text-xs">Legendary</div>
          </div>
        </div>
      </div>

      {/* Unlocked Achievements */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Unlocked Achievements ({unlockedAchievements.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unlockedAchievements.map(ua => {
            const achievement = require('./src/systems/achievementDefinitions').getAchievement(ua.achievementId);
            if (!achievement) return null;
            
            return (
              <div key={ua.achievementId} className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl mb-2">{achievement.icon}</div>
                <div className="font-bold">{achievement.name}</div>
                <div className="text-sm text-gray-400">{achievement.description}</div>
                <div className="text-xs text-gray-500 mt-2">
                  Unlocked at age {ua.unlockedAt}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sample Progress Checks */}
      <div className="bg-gray-800 rounded-lg p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Sample Progress</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>🧠 Dahi (Zeka 90+)</span>
            <span className={getProgress('genius') === 100 ? 'text-green-400' : ''}>
              {getProgress('genius')}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>💰 Binlik (1000₺)</span>
            <span className={getProgress('thousandaire') === 100 ? 'text-green-400' : ''}>
              {getProgress('thousandaire')}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>🎂 İlk Yıl (1 yaş)</span>
            <span className={getProgress('first_year') === 100 ? 'text-green-400' : ''}>
              {getProgress('first_year')}%
            </span>
          </div>
        </div>
      </div>

      {/* Achievement Toast */}
      {toastIds.length > 0 && (
        <AchievementToast
          achievementIds={toastIds}
          onClose={() => setToastIds([])}
          duration={5000}
        />
      )}
    </div>
  );
};
