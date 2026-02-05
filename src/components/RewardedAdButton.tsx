import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { showRewardedAd, getRemainingRewardedAds } from '../services/monetization';

interface RewardedAdButtonProps {
  onRewardClaimed: (reward: { type: 'energy' | 'intelligence' | 'money'; amount: number }) => void;
  currentEnergy: number;
  disabled?: boolean;
  theme: {
    surfaceBase: string;
    surfaceRaised: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
  };
}

const REWARD_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  energy: 'zap',
  intelligence: 'cpu',
  money: 'dollar-sign',
};

const REWARD_COLORS: Record<string, string> = {
  energy: '#22c55e',
  intelligence: '#3b82f6',
  money: '#eab308',
};

export const RewardedAdButton: React.FC<RewardedAdButtonProps> = ({
  onRewardClaimed,
  currentEnergy,
  disabled,
  theme,
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
    <View style={styles.container}>
      {/* Main Button */}
      <TouchableOpacity
        onPress={() => setShowOptions(!showOptions)}
        disabled={disabled || loading || remainingAds === 0}
        style={[
          styles.mainButton,
          (disabled || loading || remainingAds === 0) && styles.mainButtonDisabled,
        ]}
        accessibilityLabel="Reklam izle"
        accessibilityRole="button"
        accessibilityHint="Ödül seçeneklerini görmek için dokun"
      >
        <Feather name="video" size={20} color="#fff" />
        <Text style={styles.mainButtonText}>Reklam İzle</Text>
        {remainingAds > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{remainingAds}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Options Dropdown */}
      {showOptions && remainingAds > 0 && (
        <View style={[styles.dropdown, { backgroundColor: theme.surfaceBase, borderColor: theme.border }]}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>Reklam izleyerek ödül kazan!</Text>
            <Text style={styles.dropdownSubtitle}>Kalan: {remainingAds}/5</Text>
          </View>

          <View style={styles.optionsList}>
            {/* Energy Reward */}
            <TouchableOpacity
              onPress={() => handleWatchAd('energy')}
              disabled={loading}
              style={[
                styles.optionButton,
                { backgroundColor: theme.surfaceRaised },
                isEnergyLow && styles.optionButtonHighlighted,
              ]}
              accessibilityLabel="+20 Enerji ödülü al"
              accessibilityRole="button"
            >
              <View style={[styles.optionIcon, { backgroundColor: REWARD_COLORS.energy }]}>
                <Feather name={REWARD_ICONS.energy} size={20} color="#fff" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>+20 Enerji</Text>
                <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>Enerjini doldur</Text>
              </View>
              {isEnergyLow && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Önerilen</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Intelligence Reward */}
            <TouchableOpacity
              onPress={() => handleWatchAd('intelligence')}
              disabled={loading}
              style={[styles.optionButton, { backgroundColor: theme.surfaceRaised }]}
              accessibilityLabel="+10 Zeka ödülü al"
              accessibilityRole="button"
            >
              <View style={[styles.optionIcon, { backgroundColor: REWARD_COLORS.intelligence }]}>
                <Feather name={REWARD_ICONS.intelligence} size={20} color="#fff" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>+10 Zeka</Text>
                <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>Zekanı artır</Text>
              </View>
            </TouchableOpacity>

            {/* Money Reward */}
            <TouchableOpacity
              onPress={() => handleWatchAd('money')}
              disabled={loading}
              style={[styles.optionButton, { backgroundColor: theme.surfaceRaised }]}
              accessibilityLabel="+100 TL ödülü al"
              accessibilityRole="button"
            >
              <View style={[styles.optionIcon, { backgroundColor: REWARD_COLORS.money }]}>
                <Feather name={REWARD_ICONS.money} size={20} color="#fff" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>+100 TL</Text>
                <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>Para kazan</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.dropdownFooter, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              onPress={() => setShowOptions(false)}
              style={styles.cancelButton}
              accessibilityLabel="İptal"
              accessibilityRole="button"
            >
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* No Ads Remaining */}
      {showOptions && remainingAds === 0 && (
        <View style={[styles.dropdown, styles.noAdsDropdown, { backgroundColor: theme.surfaceBase, borderColor: theme.border }]}>
          <Text style={styles.noAdsEmoji}>🎬</Text>
          <Text style={[styles.noAdsTitle, { color: theme.textPrimary }]}>Günlük limit doldu</Text>
          <Text style={[styles.noAdsSubtitle, { color: theme.textSecondary }]}>Yarın tekrar reklam izleyebilirsin!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#9333ea',
  },
  mainButtonDisabled: {
    opacity: 0.5,
  },
  mainButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#eab308',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  errorContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    padding: 8,
    borderRadius: 8,
    zIndex: 50,
  },
  errorText: {
    color: '#fecaca',
    fontSize: 12,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 8,
    minWidth: 280,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 50,
  },
  dropdownHeader: {
    padding: 12,
    backgroundColor: 'rgba(88, 28, 135, 0.8)',
  },
  dropdownTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownSubtitle: {
    color: '#d8b4fe',
    fontSize: 12,
    marginTop: 4,
  },
  optionsList: {
    padding: 8,
    gap: 4,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    minHeight: 48,
  },
  optionButtonHighlighted: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  optionDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  recommendedBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#fde047',
    fontSize: 11,
    fontWeight: '600',
  },
  dropdownFooter: {
    padding: 8,
    borderTopWidth: 1,
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 13,
  },
  noAdsDropdown: {
    padding: 16,
    alignItems: 'center',
  },
  noAdsEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  noAdsTitle: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  noAdsSubtitle: {
    fontSize: 12,
  },
});

export default RewardedAdButton;
