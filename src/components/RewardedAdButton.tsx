import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getRemainingRewardedAds, showRewardedAd } from '../services/monetization';
import { logRewardedAdRequested, logRewardedAdResult } from '../utils/analyticsEvents';
import type { MonetizationPlacement } from '../utils/analyticsEvents';
import { tRuntime } from '../i18n/strings';

interface RewardedAdButtonProps {
  onRewardClaimed: (reward: { type: 'energy' | 'intelligence' | 'money'; amount: number }) => void;
  currentEnergy: number;
  disabled?: boolean;
  placement?: MonetizationPlacement;
  theme: {
    surfaceBase: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
  };
}

type RewardPlan = {
  rewardType: 'energy' | 'intelligence' | 'money';
  icon: keyof typeof Feather.glyphMap;
  accent: string;
  label: string;
};

const resolveRewardPlan = (placement: MonetizationPlacement, currentEnergy: number): RewardPlan => {
  if (placement === 'exam_prep') {
    return {
      rewardType: 'intelligence',
      icon: 'cpu',
      accent: '#3b82f6',
      label: tRuntime('ads.intelligenceTitle', undefined, 'Odak Bonusu'),
    };
  }

  if (placement === 'energy_depleted') {
    return {
      rewardType: 'energy',
      icon: 'zap',
      accent: '#16a34a',
      label: tRuntime('ads.energyTitle', undefined, 'Enerji Kazan'),
    };
  }

  if (placement === 'crisis_recovery' || placement === 'ending_alternative' || placement === 'undo_choice') {
    return {
      rewardType: 'money',
      icon: 'shield',
      accent: '#f59e0b',
      label: tRuntime('ads.utilityReward', undefined, 'Avantaj Kazan'),
    };
  }

  return currentEnergy < 30
    ? {
      rewardType: 'energy',
      icon: 'zap',
      accent: '#16a34a',
      label: tRuntime('ads.energyTitle', undefined, 'Enerji Kazan'),
    }
    : {
      rewardType: 'intelligence',
      icon: 'cpu',
      accent: '#3b82f6',
      label: tRuntime('ads.intelligenceTitle', undefined, 'Odak Bonusu'),
    };
};

export const RewardedAdButton: React.FC<RewardedAdButtonProps> = ({
  onRewardClaimed,
  currentEnergy,
  disabled,
  placement = 'unknown',
  theme,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remainingAds = getRemainingRewardedAds();

  const plan = useMemo(
    () => resolveRewardPlan(placement, currentEnergy),
    [placement, currentEnergy]
  );

  const handleWatchAd = async () => {
    const remainingBefore = getRemainingRewardedAds();

    try {
      setLoading(true);
      setError(null);
      void logRewardedAdRequested({
        placement,
        rewardType: plan.rewardType,
        remainingBefore,
      });

      const result = await showRewardedAd(plan.rewardType);
      const remainingAfter = getRemainingRewardedAds();

      if (result.success && result.reward) {
        onRewardClaimed(result.reward);
        void logRewardedAdResult({
          placement,
          rewardType: plan.rewardType,
          success: true,
          amount: result.reward.amount,
          remainingAfter,
        });
        return;
      }

      const errorMessage = result.error || tRuntime('ads.adFailed', undefined, 'Reklam gosterilemedi');
      setError(errorMessage);
      void logRewardedAdResult({
        placement,
        rewardType: plan.rewardType,
        success: false,
        remainingAfter,
        errorMessage,
      });
      setTimeout(() => setError(null), 3000);
    } catch (err: any) {
      const errorMessage = err?.message || tRuntime('ads.adError', undefined, 'Reklam hatasi');
      setError(errorMessage);
      void logRewardedAdResult({
        placement,
        rewardType: plan.rewardType,
        success: false,
        remainingAfter: getRemainingRewardedAds(),
        errorMessage,
      });
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = Boolean(disabled) || loading || remainingAds === 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleWatchAd}
        disabled={isDisabled}
        style={[
          styles.mainButton,
          {
            backgroundColor: `${plan.accent}22`,
            borderColor: plan.accent,
          },
          isDisabled && styles.mainButtonDisabled,
        ]}
        accessibilityLabel={tRuntime('ads.watchAdAria')}
        accessibilityRole="button"
        accessibilityHint={tRuntime('ads.watchAdHint')}
      >
        <View style={[styles.iconWrap, { backgroundColor: plan.accent }]}>
          <Feather name={plan.icon} size={16} color="#ffffff" />
        </View>

        <View style={styles.textWrap}>
          <Text style={[styles.mainButtonText, { color: theme.textPrimary }]}>
            {loading
              ? tRuntime('ads.loading', undefined, 'Yukleniyor...')
              : tRuntime('ads.watchAdForReward', undefined, 'Reklam Izle')} {plan.label}
          </Text>
          <Text style={[styles.subText, { color: theme.textSecondary }]}>
            {tRuntime('ads.remaining', { remaining: remainingAds }, `${remainingAds} hak kaldi`)}
          </Text>
        </View>

        <View style={[styles.badge, { borderColor: theme.border, backgroundColor: theme.surfaceBase }]}>
          <Text style={[styles.badgeText, { color: theme.textPrimary }]}>{remainingAds}</Text>
        </View>
      </TouchableOpacity>

      {error && (
        <View style={[styles.errorContainer, { borderColor: '#ef4444' }]}>
          <Text style={styles.errorText}>{error}</Text>
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
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
  },
  mainButtonDisabled: {
    opacity: 0.55,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  mainButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  subText: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  errorContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
  },
  errorText: {
    color: '#fecaca',
    fontSize: 12,
  },
});

export default RewardedAdButton;
