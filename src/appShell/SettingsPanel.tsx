import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeatureFlag, FeatureFlagState } from '../config/featureFlags';
import { PRIVACY_POLICY_URL, TERMS_URL } from '../config/legal';
import { canOpenPremiumPaywall, isPremium } from '../services/subscriptionManager';
import { DENSITY_OPTION_COLORS, DANGER_COLOR, MOTION_OPTION_COLOR, THEME_OPTION_COLORS } from '../constants/themeColors';
import { Z_INDEX } from '../constants/zIndex';
import { useUI } from '../context/UIContext';
import { ensureTextContrast } from '../utils/colorContrast';
import { DensityMode, ThemeMode, ThemeTokens, UIPrefs } from '../utils/themeUtils';

interface SettingsPanelProps {
  open: boolean;
  theme: ThemeTokens;
  uiPrefs: UIPrefs;
  soundMuted: boolean;
  onClose: () => void;
  onThemeChange: (theme: ThemeMode) => void;
  onDensityChange: (density: DensityMode) => void;
  onToggleMotion: () => void;
  onAnalyticsEnabledChange: (enabled: boolean) => void;
  onPersonalizedAdsEnabledChange: (enabled: boolean) => void;
  onSoundMuteChange: (muted: boolean) => void;
  onOpenSavePicker: () => void;
  onOpenPaywall: () => void;
  onResetGame: () => void;
  devFeatureFlags?: FeatureFlagState;
  onDevFeatureFlagToggle?: (flag: FeatureFlag, enabled: boolean) => void;
}

const formatFlagLabel = (flag: FeatureFlag): string =>
  flag
    .toLowerCase()
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  open,
  theme,
  uiPrefs,
  soundMuted,
  onClose,
  onThemeChange,
  onDensityChange,
  onToggleMotion,
  onAnalyticsEnabledChange,
  onPersonalizedAdsEnabledChange,
  onSoundMuteChange,
  onOpenSavePicker,
  onOpenPaywall,
  onResetGame,
  devFeatureFlags,
  onDevFeatureFlagToggle,
}) => {
  const { t, locale, setLocale } = useUI();
  const settingsTranslateX = useSharedValue(400);
  const settingsOverlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (open) {
      settingsOverlayOpacity.value = withTiming(1, { duration: 200 });
      settingsTranslateX.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
      return;
    }

    settingsOverlayOpacity.value = withTiming(0, { duration: 200 });
    settingsTranslateX.value = withTiming(400, { duration: 250 });
  }, [open, settingsOverlayOpacity, settingsTranslateX]);

  const settingsOverlayStyle = useAnimatedStyle(() => ({
    opacity: settingsOverlayOpacity.value,
  }));

  const settingsPanelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: settingsTranslateX.value }],
  }));
  const showPremiumEntry = canOpenPremiumPaywall() && !isPremium();

  const readableMotionColor = ensureTextContrast(MOTION_OPTION_COLOR, theme.surfaceBase);
  const readableDangerColor = ensureTextContrast(DANGER_COLOR, theme.surfaceBase);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: Z_INDEX.SETTINGS + 100,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    panel: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: '85%',
      maxWidth: 400,
      backgroundColor: theme.appBg,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: -4, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 16,
        },
        web: {
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.3)',
        },
      }),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    closeButton: {
      padding: 12,
      borderRadius: 10,
      backgroundColor: theme.surfaceBase,
      minWidth: 48,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollView: {
      flex: 1,
      padding: 16,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    sectionTitle: {
      color: theme.textPrimary,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 12,
    },
    optionRow: {
      flexDirection: 'row',
      gap: 10,
    },
  }), [theme]);

  return (
    <View style={styles.container} pointerEvents={open ? 'auto' : 'none'}>
      <Animated.View style={[styles.overlay, settingsOverlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.panel, settingsPanelStyle]}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('settings.title')}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel={t('app.closeSettings')}
              accessibilityRole="button"
            >
              <Feather name="x" color={theme.textPrimary} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={{ marginBottom: 28 }}>
              <Text style={styles.sectionTitle}>{t('settings.theme')}</Text>
              <View style={styles.optionRow}>
                {(['light', 'dark', 'system'] as const).map(themeOption => {
                  const isActive = uiPrefs.theme === themeOption;
                  const optionColor = themeOption === 'system'
                    ? theme.accentEvent
                    : THEME_OPTION_COLORS[themeOption];
                  const readableOptionColor = ensureTextContrast(optionColor, theme.surfaceBase);
                  const icons = {
                    light: 'sun',
                    dark: 'moon',
                    system: 'monitor',
                  } as const;
                  const labels = {
                    light: t('settings.themeOptions.light'),
                    dark: t('settings.themeOptions.dark'),
                    system: t('settings.themeOptions.system'),
                  };

                  return (
                    <TouchableOpacity
                      key={themeOption}
                      onPress={() => onThemeChange(themeOption)}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 16,
                        borderRadius: 16,
                        backgroundColor: isActive ? `${readableOptionColor}20` : theme.surfaceBase,
                        borderWidth: 2,
                        borderColor: isActive ? readableOptionColor : 'transparent',
                      }}
                    >
                      <Feather name={icons[themeOption]} color={isActive ? readableOptionColor : theme.textSecondary} size={28} />
                      <Text style={{ color: isActive ? readableOptionColor : theme.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 6 }}>
                        {labels[themeOption]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={{ marginBottom: 28 }}>
              <Text style={styles.sectionTitle}>{t('settings.density')}</Text>
              <View style={styles.optionRow}>
                {(['compact', 'standard', 'comfort'] as const).map(densityOption => {
                  const isActive = uiPrefs.density === densityOption;
                  const densityColor = DENSITY_OPTION_COLORS[densityOption];
                  const readableDensityColor = ensureTextContrast(densityColor, theme.surfaceBase);
                  const icons = {
                    compact: 'zoom-out',
                    standard: 'maximize-2',
                    comfort: 'zoom-in',
                  } as const;
                  const labels = {
                    compact: t('settings.densityOptions.compact'),
                    standard: t('settings.densityOptions.standard'),
                    comfort: t('settings.densityOptions.comfort'),
                  };

                  return (
                    <TouchableOpacity
                      key={densityOption}
                      onPress={() => onDensityChange(densityOption)}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 16,
                        borderRadius: 16,
                        backgroundColor: isActive ? `${readableDensityColor}20` : theme.surfaceBase,
                        borderWidth: 2,
                        borderColor: isActive ? readableDensityColor : 'transparent',
                      }}
                    >
                      <Feather name={icons[densityOption]} color={isActive ? readableDensityColor : theme.textSecondary} size={28} />
                      <Text style={{ color: isActive ? readableDensityColor : theme.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 6 }}>
                        {labels[densityOption]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={{ marginBottom: 28 }}>
              <Text style={styles.sectionTitle}>{t('settings.motion')}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 14,
                  backgroundColor: uiPrefs.reduceMotion ? `${readableMotionColor}20` : theme.surfaceBase,
                  borderWidth: 2,
                  borderColor: uiPrefs.reduceMotion ? readableMotionColor : 'transparent',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Feather
                    name={uiPrefs.reduceMotion ? 'slash' : 'zap'}
                    color={uiPrefs.reduceMotion ? readableMotionColor : theme.textSecondary}
                    size={24}
                  />
                  <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '600' }}>
                    {t('settings.reduceMotion')}
                  </Text>
                </View>
                <Switch
                  value={uiPrefs.reduceMotion}
                  onValueChange={onToggleMotion}
                  trackColor={{ false: theme.surfaceOverlay, true: MOTION_OPTION_COLOR }}
                  thumbColor={theme.surfaceRaised}
                  accessibilityLabel={t('settings.reduceMotion')}
                />
              </View>
            </View>

            <View style={{ marginBottom: 28 }}>
              <Text style={styles.sectionTitle}>{t('settings.audio')}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 14,
                  backgroundColor: soundMuted ? `${readableDangerColor}18` : theme.surfaceBase,
                  borderWidth: 2,
                  borderColor: soundMuted ? readableDangerColor : 'transparent',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 10 }}>
                  <Feather
                    name={soundMuted ? 'volume-x' : 'volume-2'}
                    color={soundMuted ? readableDangerColor : theme.textSecondary}
                    size={24}
                  />
                  <View style={{ flexShrink: 1 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '600' }}>
                      {t('settings.muteAudio')}
                    </Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                      {soundMuted
                        ? t('settings.audioMutedState')
                        : t('settings.audioEnabledState')}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={soundMuted}
                  onValueChange={() => onSoundMuteChange(!soundMuted)}
                  trackColor={{ false: theme.surfaceOverlay, true: readableDangerColor }}
                  thumbColor={theme.surfaceRaised}
                  accessibilityLabel={t('settings.muteAudio')}
                />
              </View>
            </View>

            <View style={{ marginBottom: 28 }}>
              <Text style={styles.sectionTitle}>{t('settings.privacy')}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 14,
                  backgroundColor: theme.surfaceBase,
                  borderWidth: 2,
                  borderColor: theme.border,
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 10 }}>
                  <Feather
                    name={uiPrefs.analyticsEnabled ? 'bar-chart-2' : 'bar-chart'}
                    color={uiPrefs.analyticsEnabled ? theme.accentEvent : theme.textSecondary}
                    size={24}
                  />
                  <View style={{ flexShrink: 1 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '600' }}>
                      {t('settings.analyticsOptIn')}
                    </Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                      {t(
                        uiPrefs.analyticsEnabled
                          ? 'settings.analyticsOptInEnabled'
                          : 'settings.analyticsOptInDisabled'
                      )}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={uiPrefs.analyticsEnabled}
                  onValueChange={onAnalyticsEnabledChange}
                  trackColor={{ false: theme.surfaceOverlay, true: theme.accentEvent }}
                  thumbColor={theme.surfaceRaised}
                  accessibilityLabel={t('settings.analyticsOptIn')}
                />
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 14,
                  backgroundColor: theme.surfaceBase,
                  borderWidth: 2,
                  borderColor: theme.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 10 }}>
                  <Feather
                    name={uiPrefs.personalizedAdsEnabled ? 'target' : 'shield'}
                    color={uiPrefs.personalizedAdsEnabled ? theme.accentEvent : theme.textSecondary}
                    size={24}
                  />
                  <View style={{ flexShrink: 1 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '600' }}>
                      {t('settings.personalizedAds')}
                    </Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                      {t(
                        uiPrefs.personalizedAdsEnabled
                          ? 'settings.personalizedAdsEnabled'
                          : 'settings.personalizedAdsDisabled'
                      )}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={uiPrefs.personalizedAdsEnabled}
                  onValueChange={onPersonalizedAdsEnabledChange}
                  trackColor={{ false: theme.surfaceOverlay, true: theme.accentEvent }}
                  thumbColor={theme.surfaceRaised}
                  accessibilityLabel={t('settings.personalizedAds')}
                />
              </View>

              <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 8, paddingHorizontal: 4 }}>
                {t('settings.consentNote')}
              </Text>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity
                  onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: theme.surfaceBase,
                    borderWidth: 1,
                    borderColor: theme.border,
                    alignItems: 'center',
                  }}
                  accessibilityRole="link"
                  accessibilityLabel={t('settings.privacyPolicy')}
                >
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>
                    {t('settings.privacyPolicy')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => void Linking.openURL(TERMS_URL)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: theme.surfaceBase,
                    borderWidth: 1,
                    borderColor: theme.border,
                    alignItems: 'center',
                  }}
                  accessibilityRole="link"
                  accessibilityLabel={t('settings.termsOfService')}
                >
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>
                    {t('settings.termsOfService')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginBottom: 28 }}>
              <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
              <View style={styles.optionRow}>
                {(['tr', 'en'] as const).map(languageOption => {
                  const isActive = locale === languageOption;
                  return (
                    <TouchableOpacity
                      key={languageOption}
                      onPress={() => setLocale(languageOption)}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 14,
                        borderRadius: 12,
                        backgroundColor: isActive ? `${theme.accentEvent}20` : theme.surfaceBase,
                        borderWidth: 2,
                        borderColor: isActive ? theme.accentEvent : 'transparent',
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={t(`settings.languageOptions.${languageOption}`)}
                      accessibilityState={{ selected: isActive }}
                    >
                      <Text style={{ color: isActive ? theme.accentEvent : theme.textSecondary, fontSize: 13, fontWeight: '700' }}>
                        {t(`settings.languageOptions.${languageOption}`)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {__DEV__ && devFeatureFlags && onDevFeatureFlagToggle && (
              <View style={{ marginBottom: 28 }}>
                <Text style={styles.sectionTitle}>Feature Flags (Dev)</Text>
                {(Object.entries(devFeatureFlags) as Array<[FeatureFlag, boolean]>).map(([flag, enabled]) => (
                  <View
                    key={flag}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderRadius: 12,
                      backgroundColor: theme.surfaceBase,
                      borderWidth: 1,
                      borderColor: theme.border,
                      marginBottom: 10,
                    }}
                  >
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={{ color: theme.textPrimary, fontSize: 13, fontWeight: '700' }}>
                        {formatFlagLabel(flag)}
                      </Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
                        {flag}
                      </Text>
                    </View>
                    <Switch
                      value={enabled}
                      onValueChange={(nextValue) => onDevFeatureFlagToggle(flag, nextValue)}
                      trackColor={{ false: theme.surfaceOverlay, true: theme.accentEvent }}
                      thumbColor={theme.surfaceRaised}
                      accessibilityLabel={`${flag} flag`}
                    />
                  </View>
                ))}
              </View>
            )}

            {showPremiumEntry && (
              <View style={{ marginBottom: 28 }}>
                <TouchableOpacity
                  onPress={onOpenPaywall}
                  style={{
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    borderRadius: 14,
                    backgroundColor: '#d9770615',
                    borderWidth: 2,
                    borderColor: '#d97706',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                  accessibilityLabel={t('settings.goPremium')}
                  accessibilityRole="button"
                >
                  <Feather name="star" color="#d97706" size={22} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#d97706', fontSize: 16, fontWeight: '700' }}>
                      {t('settings.goPremium')}
                    </Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                      {t('settings.premiumDesc')}
                    </Text>
                  </View>
                  <Feather name="chevron-right" color="#d97706" size={20} />
                </TouchableOpacity>
              </View>
            )}

            <View style={{ marginBottom: 28 }}>
              <Text style={styles.sectionTitle}>{t('settings.saves')}</Text>
              <TouchableOpacity
                onPress={onOpenSavePicker}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 14,
                  backgroundColor: theme.surfaceBase,
                  borderWidth: 2,
                  borderColor: theme.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
                accessibilityLabel={t('common.saveLoad')}
                accessibilityRole="button"
              >
                <Feather name="save" color={theme.textSecondary} size={20} />
                <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '600' }}>
                  {t('common.saveLoad')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 20, marginTop: 8 }}>
              <TouchableOpacity
                onPress={onResetGame}
                style={{
                  marginTop: 20,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 14,
                  backgroundColor: `${readableDangerColor}20`,
                  borderWidth: 2,
                  borderColor: readableDangerColor,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: readableDangerColor, fontWeight: '700', fontSize: 15 }}>
                  {t('settings.newLife')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};
