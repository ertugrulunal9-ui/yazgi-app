import React from 'react';
import { Lock, TrendingUp } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress: number;
  onClick?: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isUnlocked,
  progress,
  onClick
}) => {
  const rarityColors = {
    COMMON: 'border-gray-500/30 bg-gray-800/30',
    RARE: 'border-blue-500/30 bg-blue-900/20',
    EPIC: 'border-purple-500/30 bg-purple-900/20',
    LEGENDARY: 'border-yellow-500/30 bg-yellow-900/20',
  };

  const rarityTextColors = {
    COMMON: 'text-gray-400',
    RARE: 'text-blue-400',
    EPIC: 'text-purple-400',
    LEGENDARY: 'text-yellow-400',
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${rarityColors[achievement.rarity]}
        border rounded-lg p-4 transition-all cursor-pointer
        ${isUnlocked ? 'opacity-100' : 'opacity-60'}
        hover:scale-[1.02] hover:shadow-lg
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`text-4xl ${!isUnlocked && 'grayscale opacity-50'}`}>
          {isUnlocked ? achievement.icon : '🔒'}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
              {achievement.isSecret && !isUnlocked ? '???' : achievement.name}
            </h3>
            <span className={`text-xs font-semibold ${rarityTextColors[achievement.rarity]}`}>
              {achievement.rarity}
            </span>
          </div>

          <p className={`text-sm mb-2 ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
            {achievement.isSecret && !isUnlocked ? '???' : achievement.description}
          </p>

          {/* Progress Bar */}
          {!isUnlocked && progress > 0 && progress < 100 && (
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>İlerleme</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Reward */}
          {achievement.reward && isUnlocked && (
            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
              {achievement.reward.money && (
                <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded">
                  💰 +{achievement.reward.money}₺
                </span>
              )}
              {achievement.reward.stats && (
                <span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded">
                  📈 Stat Boost
                </span>
              )}
              {achievement.reward.item && (
                <span className="bg-purple-900/30 text-purple-400 px-2 py-1 rounded">
                  🎁 Item
                </span>
              )}
            </div>
          )}

          {/* Locked State */}
          {!isUnlocked && progress === 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Lock size={12} />
              <span>Kilitli</span>
            </div>
          )}

          {/* Unlocked State */}
          {isUnlocked && (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <TrendingUp size={12} />
              <span>Açıldı</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
