import React, { useState } from 'react';
import { Linking, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { PrivacyChoices } from '../appShell/usePrivacyChoicesGate';
import { PRIVACY_POLICY_URL } from '../config/legal';
import { t } from '../i18n/strings';
import type { AppLocale } from '../i18n/strings';
import type { DensityMetrics, ThemeTokens } from '../utils/themeUtils';

interface PrivacyChoicesCardProps {
  theme: ThemeTokens;
  metrics: DensityMetrics;
  locale: AppLocale;
  initialPersonalizedAds: boolean;
  initialAnalytics: boolean;
  onSubmit: (choices: PrivacyChoices) => void;
}

interface ChoiceRowProps {
  theme: ThemeTokens;
  title: string;
  body: string;
  value: boolean;
  switchTestID: string;
  onValueChange: (value: boolean) => void;
}

const ChoiceRow: React.FC<ChoiceRowProps> = ({ theme, title, body, value, switchTestID, onValueChange }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: theme.appBg,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 10,
    }}
  >
    <View style={{ flex: 1, paddingRight: 12 }}>
      <Text style={{
        color: theme.textPrimary,
        fontFamily: theme.fontHeading,
        fontSize: 15,
        fontWeight: '700',
      }}>
        {title}
      </Text>
      <Text style={{
        color: theme.textSecondary,
        fontFamily: theme.fontBody,
        fontSize: 13,
        lineHeight: 19,
        marginTop: 4,
      }}>
        {body}
      </Text>
    </View>
    {/* Kapalı durum koyu temada da seçilebilsin diye kenarlık rengi + ikincil metin rengi. */}
    <Switch
      testID={switchTestID}
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: theme.border, true: theme.accentEvent }}
      thumbColor={value ? theme.surfaceRaised : theme.textSecondary}
      accessibilityLabel={title}
      accessibilityHint={body}
    />
  </View>
);

/**
 * İlk açılışta bir kez gösterilen gizlilik tercihleri kartı.
 * İki ayrı isteğe bağlı izin; ikisi de varsayılan kapalı.
 */
export const PrivacyChoicesCard: React.FC<PrivacyChoicesCardProps> = ({
  theme,
  metrics,
  locale,
  initialPersonalizedAds,
  initialAnalytics,
  onSubmit,
}) => {
  const [personalizedAds, setPersonalizedAds] = useState(initialPersonalizedAds);
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const tr = (key: string) => t(locale, key);

  return (
    <View style={{ flex: 1, backgroundColor: theme.appBg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: Math.max(16, metrics.pad * 1.5),
            paddingVertical: 24,
          }}
        >
          <View style={{
            width: '100%',
            maxWidth: 520,
            alignSelf: 'center',
            backgroundColor: theme.surfaceBase,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.border,
            padding: metrics.pad * 1.4,
          }}>
            <Text
              accessibilityRole="header"
              style={{
                color: theme.textPrimary,
                fontFamily: theme.fontHeading,
                fontSize: 24,
                fontWeight: '800',
                textAlign: 'center',
              }}
            >
              {tr('privacyChoices.title')}
            </Text>
            <Text style={{
              color: theme.textSecondary,
              fontFamily: theme.fontBody,
              fontSize: 14,
              lineHeight: 21,
              textAlign: 'center',
              marginTop: 8,
              marginBottom: 16,
            }}>
              {tr('privacyChoices.intro')}
            </Text>

            <ChoiceRow
              theme={theme}
              switchTestID="privacy-choice-personalized-ads"
              title={tr('privacyChoices.personalizedAdsTitle')}
              body={tr('privacyChoices.personalizedAdsBody')}
              value={personalizedAds}
              onValueChange={setPersonalizedAds}
            />
            <ChoiceRow
              theme={theme}
              switchTestID="privacy-choice-analytics"
              title={tr('privacyChoices.analyticsTitle')}
              body={tr('privacyChoices.analyticsBody')}
              value={analytics}
              onValueChange={setAnalytics}
            />

            <Text style={{
              color: theme.textSecondary,
              fontFamily: theme.fontBody,
              fontSize: 12,
              lineHeight: 18,
              marginTop: 2,
            }}>
              {tr('privacyChoices.note')}
            </Text>

            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel={tr('privacyChoices.privacyPolicyAria')}
              onPress={() => {
                void Linking.openURL(PRIVACY_POLICY_URL).catch(() => {
                  // Tarayıcı açılamazsa kart çalışmaya devam eder.
                });
              }}
              style={{ minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' }}
              activeOpacity={0.7}
            >
              <Text style={{
                color: theme.accentEvent,
                fontFamily: theme.fontBody,
                fontSize: 13,
                fontWeight: '600',
                textDecorationLine: 'underline',
              }}>
                {tr('privacyChoices.privacyPolicy')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={tr('privacyChoices.continueAria')}
              onPress={() => onSubmit({ personalizedAds, analytics })}
              style={{
                minHeight: 50,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.accentBrand,
                marginTop: 8,
              }}
              activeOpacity={0.85}
            >
              <Text style={{
                color: '#0b1220',
                fontFamily: theme.fontHeading,
                fontSize: 15,
                fontWeight: '700',
              }}>
                {tr('privacyChoices.continue')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default PrivacyChoicesCard;
