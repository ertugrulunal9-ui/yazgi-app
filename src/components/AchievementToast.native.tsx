import React from 'react';

interface AchievementToastProps {
  achievementIds: string[];
  onClose: () => void;
  duration?: number;
}

export const AchievementToast: React.FC<AchievementToastProps> = () => null;

export default AchievementToast;
