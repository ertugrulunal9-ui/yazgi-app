import React, { useState } from 'react';
import { Zap, Brain, DollarSign, Video } from 'lucide-react';
import { showRewardedAd, getRemainingRewardedAds } from '../services/monetization';
import { Stats } from '../types';

interface RewardedAdButtonProps {
  onRewardClaimed: (reward: { type: 'energy' | 'intelligence' | 'money'; amount: number }) => void;
  currentEnergy: number;
  disabled?: boolean;
}

export const RewardedAdButton: React.FC<RewardedAdButtonProps> = ({ 
  onRewardClaimed, 
  currentEnergy,
  disabled 
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remainingAds = getRemainingRewardedAds();

  const handleWatchAd = async (rewardType: 'energy' | 'intelligence' | 'money') => {
    try {
      setLoading(true);
      setError(null);
      setShowOptions(false);

      const result = await showRewardedAd(rewardType);

      if (result.success && result.reward) {
        onRewardClaimed(result.reward);
      } else {
        setError(result.error || 'Reklam gösterilemedi');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const isEnergyLow = currentEnergy < 30;

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={disabled || loading || remainingAds === 0}
        className="pressable bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative"
      >
        <Video className="w-5 h-5" />
        <span className="text-sm">Reklam İzle</span>
        {remainingAds > 0 && (
          <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {remainingAds}
          </span>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-red-500/20 border border-red-500/50 text-red-200 text-xs px-3 py-2 rounded-lg z-50">
          {error}
        </div>
      )}

      {/* Options Dropdown */}
      {showOptions && remainingAds > 0 && (
        <div className="absolute top-full left-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 min-w-[280px] overflow-hidden animate-scale-in">
          <div className="p-3 bg-gradient-to-r from-purple-900 to-pink-900 border-b border-gray-700">
            <p className="text-xs text-white font-semibold">Reklam izleyerek ödül kazan!</p>
            <p className="text-xs text-purple-200 mt-1">Kalan: {remainingAds}/5</p>
          </div>

          <div className="p-2 space-y-1">
            {/* Energy Reward */}
            <button
              onClick={() => handleWatchAd('energy')}
              disabled={loading}
              className={`pressable w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                isEnergyLow 
                  ? 'bg-green-600/30 hover:bg-green-600/40 border border-green-500/50' 
                  : 'hover:bg-gray-800'
              }`}
            >
              <div className="p-2 bg-green-500 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-sm text-white">+20 Enerji</div>
                <div className="text-xs text-gray-400">Enerjini doldur</div>
              </div>
              {isEnergyLow && (
                <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                  Önerilen
                </span>
              )}
            </button>

            {/* Intelligence Reward */}
            <button
              onClick={() => handleWatchAd('intelligence')}
              disabled={loading}
              className="pressable w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-all"
            >
              <div className="p-2 bg-blue-500 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-sm text-white">+10 Zeka</div>
                <div className="text-xs text-gray-400">Zekanı artır</div>
              </div>
            </button>

            {/* Money Reward */}
            <button
              onClick={() => handleWatchAd('money')}
              disabled={loading}
              className="pressable w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-all"
            >
              <div className="p-2 bg-yellow-500 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-sm text-white">+100 TL</div>
                <div className="text-xs text-gray-400">Para kazan</div>
              </div>
            </button>
          </div>

          <div className="p-2 border-t border-gray-700">
            <button
              onClick={() => setShowOptions(false)}
              className="pressable w-full py-2 text-xs text-gray-400 hover:text-white"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* No Ads Remaining */}
      {showOptions && remainingAds === 0 && (
        <div className="absolute top-full left-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl p-4 z-50 min-w-[280px] animate-scale-in">
          <div className="text-center">
            <div className="text-4xl mb-2">🎬</div>
            <p className="text-sm font-bold text-white mb-1">Günlük limit doldu</p>
            <p className="text-xs text-gray-400">Yarın tekrar reklam izleyebilirsin!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardedAdButton;
