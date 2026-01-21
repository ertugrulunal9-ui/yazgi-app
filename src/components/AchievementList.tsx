import React, { useState, useMemo } from 'react';
import { Trophy, Filter, X, TrendingUp, Lock } from 'lucide-react';
import { ACHIEVEMENTS } from '../systems/achievementDefinitions';
import { AchievementCard } from './AchievementCard';
import { AchievementRarity, AchievementCategory } from '../types';

interface AchievementListProps {
  unlockedAchievementIds: string[];
  getProgress: (achievementId: string) => number;
  onClose: () => void;
}

type FilterType = 'ALL' | 'UNLOCKED' | 'LOCKED' | AchievementRarity | AchievementCategory;

export const AchievementList: React.FC<AchievementListProps> = ({
  unlockedAchievementIds,
  getProgress,
  onClose
}) => {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate stats
  const stats = useMemo(() => {
    const total = ACHIEVEMENTS.length;
    const unlocked = unlockedAchievementIds.length;
    const percentage = Math.round((unlocked / total) * 100);

    return { total, unlocked, percentage };
  }, [unlockedAchievementIds]);

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter(achievement => {
      const isUnlocked = unlockedAchievementIds.includes(achievement.id);

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = achievement.name.toLowerCase().includes(query);
        const matchDesc = achievement.description.toLowerCase().includes(query);
        if (!matchName && !matchDesc) return false;
      }

      // Filter
      if (filter === 'ALL') return true;
      if (filter === 'UNLOCKED') return isUnlocked;
      if (filter === 'LOCKED') return !isUnlocked;
      if (['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].includes(filter)) {
        return achievement.rarity === filter;
      }
      if (['STATS', 'MONEY', 'EVENTS', 'SKILLS', 'SCHOOL', 'SECRET', 'SOCIAL', 'SURVIVAL'].includes(filter)) {
        return achievement.category === filter;
      }

      return true;
    });
  }, [filter, searchQuery, unlockedAchievementIds]);

  const filterButtons: { label: string; value: FilterType }[] = [
    { label: 'Hepsi', value: 'ALL' },
    { label: 'Açıldı', value: 'UNLOCKED' },
    { label: 'Kilitli', value: 'LOCKED' },
    { label: 'Yaygın', value: 'COMMON' },
    { label: 'Nadir', value: 'RARE' },
    { label: 'Epik', value: 'EPIC' },
    { label: 'Efsane', value: 'LEGENDARY' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 z-[9998] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-400" size={32} />
              <div>
                <h2 className="text-2xl font-bold text-white">Başarılar</h2>
                <p className="text-gray-400 text-sm">
                  {stats.unlocked} / {stats.total} Açıldı ({stats.percentage}%)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-700 space-y-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Başarı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
          />

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filterButtons.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium transition-all
                  ${filter === value 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Lock size={48} className="mx-auto mb-4 opacity-50" />
              <p>Başarı bulunamadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAchievements.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={unlockedAchievementIds.includes(achievement.id)}
                  progress={getProgress(achievement.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="bg-gray-800/50 p-4 border-t border-gray-700">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-400">
                {ACHIEVEMENTS.filter(a => a.rarity === 'COMMON').length}
              </div>
              <div className="text-xs text-gray-500">Yaygın</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {ACHIEVEMENTS.filter(a => a.rarity === 'RARE').length}
              </div>
              <div className="text-xs text-gray-500">Nadir</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {ACHIEVEMENTS.filter(a => a.rarity === 'EPIC').length}
              </div>
              <div className="text-xs text-gray-500">Epik</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {ACHIEVEMENTS.filter(a => a.rarity === 'LEGENDARY').length}
              </div>
              <div className="text-xs text-gray-500">Efsane</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
