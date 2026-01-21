import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { getAchievement } from '../systems/achievementDefinitions';

interface AchievementToastProps {
  achievementIds: string[];
  onClose: () => void;
  duration?: number;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ 
  achievementIds, 
  onClose,
  duration = 5000 
}) => {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const achievement = getAchievement(achievementIds[currentIndex]);

  useEffect(() => {
    // Fade in
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        if (currentIndex < achievementIds.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          onClose();
        }
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, achievementIds.length, duration, onClose]);

  if (!achievement) return null;

  const rarityColors = {
    COMMON: 'bg-gray-700 border-gray-500',
    RARE: 'bg-blue-700 border-blue-500',
    EPIC: 'bg-purple-700 border-purple-500',
    LEGENDARY: 'bg-yellow-600 border-yellow-400',
  };

  const rarityGlow = {
    COMMON: 'shadow-gray-500/50',
    RARE: 'shadow-blue-500/50',
    EPIC: 'shadow-purple-500/50',
    LEGENDARY: 'shadow-yellow-500/50',
  };

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
      }`}
    >
      <div
        className={`
          ${rarityColors[achievement.rarity]} 
          ${rarityGlow[achievement.rarity]}
          border-2 rounded-lg shadow-2xl p-4 min-w-[320px] max-w-[400px]
          backdrop-blur-sm
        `}
      >
        <div className="flex items-center gap-3">
          {/* Trophy Animation */}
          <div className="animate-bounce">
            <Trophy className="text-white" size={32} />
          </div>

          <div className="flex-1">
            <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">
              Başarı Açıldı!
            </div>
            <div className="text-white font-bold text-lg flex items-center gap-2">
              <span>{achievement.icon}</span>
              <span>{achievement.name}</span>
            </div>
            <div className="text-white/90 text-sm">
              {achievement.description}
            </div>
            {achievement.reward && (
              <div className="text-xs text-white/70 mt-1">
                {achievement.reward.money && `💰 +${achievement.reward.money}₺`}
                {achievement.reward.stats && ` 📈 Stat Boost`}
              </div>
            )}
          </div>

          {/* Rarity Badge */}
          <div className="text-xs font-bold text-white/80 bg-black/30 px-2 py-1 rounded">
            {achievement.rarity}
          </div>
        </div>

        {/* Progress indicator if multiple */}
        {achievementIds.length > 1 && (
          <div className="mt-2 flex gap-1">
            {achievementIds.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded ${
                  index === currentIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
