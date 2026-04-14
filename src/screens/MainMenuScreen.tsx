import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegacyPanel } from '../components/LegacyPanel';
import { EndingGallery } from '../components/EndingGallery';
import { AvatarConfig, CharacterInfo, LifeGoal, MetaProgression, PlayerGender } from '../types';
import { Avatar } from '../components/Avatar';
import { getEndingHints } from '../utils/endingResolver';
import { AppLocale, t as translateStatic } from '../i18n/strings';
import { isFeatureEnabled } from '../config/featureFlags';
import { getUnlockedLegacyPerks, hasLegacyPerk, getLegacyPerkTitle, getLegacyPerkDescription } from '../data/legacyPerks';
import {
  calculateZodiacSign,
  generateRandomCharacter,
  getLocalizedMonths,
  getLocalizedZodiacInfo,
  getMaxDaysInMonth,
  NewGameBootstrapOptions,
  turkishCities,
} from '../utils/gameUtils';
import { getDensityMetrics, getThemeTokens } from '../utils/themeUtils';
import { checkDailyLogin, getLegacyBonusBreakdown } from '../utils/metaProgression';
import {
  FadeInDownView,
  FadeInUpView,
  buttonPress,
  successHaptic,
} from '../animations';

interface MainMenuScreenProps {
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
  locale?: AppLocale;
  onGameStart: () => void;
  startNewGame: (name: string, characterInfo?: CharacterInfo, options?: NewGameBootstrapOptions) => void;
  metaProgression: MetaProgression | null;
  metaProgressionLoaded: boolean;
  updateMetaProgression: (next: MetaProgression) => void;
}

interface DropdownPickerProps {
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder: string;
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
}

const DropdownPicker: React.FC<DropdownPickerProps> = ({
  value,
  options,
  onSelect,
  placeholder,
  theme,
  metrics,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          backgroundColor: theme.surfaceRaised,
          borderRadius: 8,
          paddingVertical: metrics.pad * 0.75,
          paddingHorizontal: metrics.pad,
          borderWidth: 1,
          borderColor: theme.border,
          minHeight: 44,
          justifyContent: 'center',
        }}
        activeOpacity={0.85}
      >
        <Text
          style={{
            color: value ? theme.textPrimary : theme.textSecondary,
            fontSize: metrics.font - 1,
          }}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.48)', justifyContent: 'center', padding: 20 }}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={{
              maxHeight: '62%',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.surfaceRaised,
              overflow: 'hidden',
            }}
          >
            <FlatList
              data={options}
              keyExtractor={(item, index) => `${item}_${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                  }}
                  style={{
                    paddingVertical: metrics.pad,
                    paddingHorizontal: metrics.pad,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                    backgroundColor: item === value ? theme.surfaceOverlay : 'transparent',
                  }}
                >
                  <Text style={{ color: theme.textPrimary, fontSize: metrics.font }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export const MainMenuScreen: React.FC<MainMenuScreenProps> = React.memo(({
  theme,
  metrics,
  locale = 'tr',
  onGameStart,
  startNewGame,
  metaProgression,
  metaProgressionLoaded,
  updateMetaProgression,
}) => {
  const legacyBonuses = useMemo(() => {
    if (!metaProgression) {
      return {
        visible: false,
        level: 0,
        health: 0,
        intelligence: 0,
        charisma: 0,
        discipline: 0,
        familyRelation: 0,
        money: 0,
      };
    }

    const bonus = getLegacyBonusBreakdown(metaProgression);
    return {
      visible: bonus.level > 0,
      level: bonus.level,
      health: bonus.statBonus,
      intelligence: bonus.statBonus,
      charisma: bonus.statBonus,
      discipline: bonus.statBonus,
      familyRelation: bonus.relationBonus,
      money: bonus.moneyBonus,
    };
  }, [metaProgression]);

  const tStatic = useCallback(
    (key: string, params?: Record<string, string | number | boolean>, fallback?: string) =>
      translateStatic(locale, key, params, fallback),
    [locale]
  );
  const [dailyRewardMessage, setDailyRewardMessage] = useState<string | null>(null);
  const dailyRewardCheckedRef = useRef(false);

  useEffect(() => {
    if (!metaProgressionLoaded || !metaProgression || dailyRewardCheckedRef.current) return;

    dailyRewardCheckedRef.current = true;
    const result = checkDailyLogin(metaProgression);
    if (!result.isNewDay) return;

    updateMetaProgression(result.updatedMeta);
    setDailyRewardMessage(
      result.streak > 1
        ? tStatic('app.dailyRewardMessageStreak', {
          points: result.legacyPointsBonus,
          streak: result.streak,
        }, `Welcome back! +${result.legacyPointsBonus} Legacy Points (${result.streak}-day streak!)`)
        : tStatic('app.dailyRewardMessage', {
          points: result.legacyPointsBonus,
        }, `Welcome back! +${result.legacyPointsBonus} Legacy Points`)
    );
  }, [metaProgression, metaProgressionLoaded, tStatic, updateMetaProgression]);
  const legacyLevel = metaProgression?.legacyLevel ?? 0;
  const endingHints = useMemo(() => {
    if (!metaProgression) return [];

    const tierOrder = ['FAILURE', 'NORMAL', 'SUCCESS', 'LEGENDARY'];
    const completions = metaProgression.goalCompletions ?? {};
    const rankedGoals = (Object.keys(completions) as LifeGoal[])
      .map(goal => ({
        goal,
        rank: tierOrder.indexOf(completions[goal] ?? 'FAILURE'),
      }))
      .sort((a, b) => b.rank - a.rank);

    const dominantGoal = rankedGoals[0]?.goal ?? 'SOCIAL';
    return getEndingHints(metaProgression, metaProgression.highestCompatibilityScore ?? 50, dominantGoal);
  }, [metaProgression]);
  const legacyPerksEnabled = isFeatureEnabled('LEGACY_PERKS');
  const unlockedLegacyPerks = useMemo(
    () => legacyPerksEnabled ? getUnlockedLegacyPerks(legacyLevel) : [],
    [legacyLevel, legacyPerksEnabled]
  );
  const fastStartUnlocked = legacyPerksEnabled && hasLegacyPerk(legacyLevel, 'FAST_START');

  const [activeTab, setActiveTab] = useState<'play' | 'lives'>('play');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<PlayerGender>('MALE');
  const [avatar, setAvatar] = useState<AvatarConfig>({ hairStyle: 0, skinTone: 0, accessory: 0 });
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(1);
  const [birthCity, setBirthCity] = useState('');
  const [useFastStart, setUseFastStart] = useState(false);

  const maxDays = useMemo(() => getMaxDaysInMonth(birthMonth), [birthMonth]);
  const dayOptions = useMemo(
    () => Array.from({ length: maxDays }, (_, index) => String(index + 1)),
    [maxDays]
  );
  const monthOptions = useMemo(() => getLocalizedMonths(locale), [locale]);
  const zodiacInfo = useMemo(() => getLocalizedZodiacInfo(locale), [locale]);
  const zodiacSign = useMemo(() => calculateZodiacSign(birthMonth, birthDay), [birthMonth, birthDay]);
  const zodiac = zodiacInfo[zodiacSign];
  const accessoryOptions = useMemo(() => ([
    tStatic('app.accessoryNone', undefined, 'Yok'),
    tStatic('app.accessoryGlasses', undefined, 'Gozluk'),
    tStatic('app.accessoryHat', undefined, 'Sapka'),
  ]), [tStatic]);
  useEffect(() => {
    if (birthDay > maxDays) {
      setBirthDay(maxDays);
    }
  }, [birthDay, maxDays]);

  useEffect(() => {
    if (!fastStartUnlocked && useFastStart) {
      setUseFastStart(false);
    }
  }, [fastStartUnlocked, useFastStart]);

  const isFormReady = Boolean(firstName.trim() && lastName.trim() && birthCity);

  const handleRandomize = useCallback(() => {
    buttonPress();
    const random = generateRandomCharacter();
    setFirstName(random.firstName);
    setLastName(random.lastName);
    setGender(random.gender);
    setBirthMonth(random.birthMonth);
    setBirthDay(random.birthDay);
    setBirthCity(random.birthCity);
  }, []);

  const buildCharacterInfo = useCallback((): CharacterInfo => ({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    gender,
    birthMonth,
    birthDay,
    birthCity,
    zodiacSign,
  }), [birthCity, birthDay, birthMonth, firstName, gender, lastName, zodiacSign]);

  const startGame = useCallback(() => {
    const characterInfo = buildCharacterInfo();
    successHaptic();
    startNewGame(
      `${characterInfo.firstName} ${characterInfo.lastName}`,
      characterInfo,
      { fastStart: useFastStart, avatar }
    );
    onGameStart();
  }, [avatar, buildCharacterInfo, onGameStart, startNewGame, useFastStart]);

  const handleStartGame = useCallback(() => {
    if (!isFormReady) {
      buttonPress();
      Alert.alert(
        tStatic('app.missingInfoTitle', undefined, 'Eksik Bilgi'),
        tStatic(
          'app.completeRequiredFields',
          undefined,
          'Baslamak icin ad, soyad ve sehir gerekli.'
        )
      );
      return;
    }

    buttonPress();
    startGame();
  }, [isFormReady, startGame, tStatic]);

  const handleQuickPlay = useCallback(() => {
    if (!isFormReady) {
      buttonPress();
      Alert.alert(
        tStatic('app.missingInfoTitle', undefined, 'Eksik Bilgi'),
        tStatic('app.completeRequiredFields', undefined, 'Baslamak icin ad, soyad ve sehir gerekli.')
      );
      return;
    }
    const characterInfo = buildCharacterInfo();
    successHaptic();
    startNewGame(
      `${characterInfo.firstName} ${characterInfo.lastName}`,
      characterInfo,
      { quickPlay: true, avatar }
    );
    onGameStart();
  }, [avatar, buildCharacterInfo, isFormReady, onGameStart, startNewGame, tStatic]);

  const containerStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: theme.appBg,
  }), [theme.appBg]);

  const headerStyle = useMemo(() => ({
    paddingHorizontal: metrics.pad * 2,
    paddingTop: metrics.pad * 1.6,
    paddingBottom: metrics.pad,
  }), [metrics.pad]);

  const contentStyle = useMemo(() => ({
    flex: 1,
    paddingHorizontal: metrics.pad * 1.4,
    paddingBottom: metrics.pad * 1.2,
  }), [metrics.pad]);

  const sectionStyle = useMemo(() => ({
    backgroundColor: theme.surfaceBase,
    borderRadius: 14,
    padding: metrics.pad,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 10,
  }), [theme.surfaceBase, theme.border, metrics.pad]);

  const tabRowStyle = useMemo(() => ({
    flexDirection: 'row' as const,
    backgroundColor: theme.surfaceOverlay,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 4,
    marginBottom: 12,
  }), [theme.surfaceOverlay, theme.border]);

  const tabButtonStyle = useCallback((tab: 'play' | 'lives') => ({
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center' as const,
    backgroundColor: activeTab === tab ? theme.surfaceBase : 'transparent',
    borderWidth: activeTab === tab ? 1 : 0,
    borderColor: activeTab === tab ? theme.border : 'transparent',
  }), [activeTab, theme.surfaceBase, theme.border]);

  const inputStyle = useMemo(() => ({
    backgroundColor: theme.surfaceRaised,
    color: theme.textPrimary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    fontSize: metrics.font,
  }), [theme.surfaceRaised, theme.textPrimary, theme.border, metrics.font]);

  return (
    <SafeAreaView style={containerStyle}>
      <View style={headerStyle}>
        <FadeInDownView delay={0}>
          <Text
            style={{
              fontSize: 30,
              fontWeight: '800',
              color: theme.textPrimary,
              textAlign: 'center',
            }}
          >
            {tStatic('app.title', undefined, 'Yazgi')}
          </Text>
        </FadeInDownView>

        <FadeInUpView delay={90}>
          <Text style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center' }}>
            {tStatic('app.tagline', undefined, 'Kaderini sen yaz.')}
          </Text>
        </FadeInUpView>

        {dailyRewardMessage && (
          <FadeInUpView delay={120}>
            <View style={{
              marginTop: 10,
              paddingVertical: 8,
              paddingHorizontal: 14,
              backgroundColor: 'rgba(34,197,94,0.10)',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#22c55e50',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <Text style={{ color: '#22c55e', fontWeight: '700', fontSize: 12, flex: 1 }}>
                {dailyRewardMessage}
              </Text>
              <TouchableOpacity
                onPress={() => setDailyRewardMessage(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={tStatic('app.dismissDailyReward', undefined, 'Miras puani bildirimini kapat')}
              >
                <Text style={{ color: '#22c55e', fontSize: 14, fontWeight: '800' }}>x</Text>
              </TouchableOpacity>
            </View>
          </FadeInUpView>
        )}
      </View>

      <View style={contentStyle}>
        <View style={tabRowStyle}>
          <TouchableOpacity
            onPress={() => setActiveTab('play')}
            style={tabButtonStyle('play')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={tStatic('app.openHubTab', undefined, 'Basla sekmesi')}
          >
            <Text style={{ color: activeTab === 'play' ? theme.textPrimary : theme.textSecondary, fontWeight: '700' }}>
              {tStatic('app.tabStart', undefined, 'Basla')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('lives')}
            style={tabButtonStyle('lives')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={tStatic('app.openLivesTab', undefined, 'Hayatlar sekmesi')}
          >
            <Text style={{ color: activeTab === 'lives' ? theme.textPrimary : theme.textSecondary, fontWeight: '700' }}>
              {tStatic('app.tabLives', undefined, 'Hayatlar')}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'play' ? (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 18 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            overScrollMode="never"
            bounces={false}
          >
            <TouchableOpacity
              onPress={handleRandomize}
              activeOpacity={0.8}
              style={{
                alignSelf: 'center',
                marginBottom: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.surfaceOverlay,
                paddingHorizontal: 14,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: theme.accentEvent, fontWeight: '700', fontSize: 12 }}>
                {tStatic('app.randomCharacter', undefined, 'Rastgele Karakter')}
              </Text>
            </TouchableOpacity>

            <View style={sectionStyle}>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                {tStatic('app.identity', undefined, 'Kimlik')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  style={[inputStyle, { flex: 1 }]}
                  placeholder={tStatic('app.firstName', undefined, 'Ad')}
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="words"
                />
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  style={[inputStyle, { flex: 1 }]}
                  placeholder={tStatic('app.lastName', undefined, 'Soyad')}
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="words"
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setGender('MALE')}
                  style={{
                    flex: 1,
                    minHeight: 42,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: gender === 'MALE' ? theme.accentEvent : theme.border,
                    backgroundColor: gender === 'MALE' ? theme.accentEvent : theme.surfaceRaised,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: gender === 'MALE' ? '#ffffff' : theme.textPrimary, fontWeight: '700', fontSize: 13 }}>
                    {tStatic('app.genderMale', undefined, 'Erkek')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setGender('FEMALE')}
                  style={{
                    flex: 1,
                    minHeight: 42,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: gender === 'FEMALE' ? theme.accentEvent : theme.border,
                    backgroundColor: gender === 'FEMALE' ? theme.accentEvent : theme.surfaceRaised,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: gender === 'FEMALE' ? '#ffffff' : theme.textPrimary, fontWeight: '700', fontSize: 13 }}>
                    {tStatic('app.genderFemale', undefined, 'Kadin')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Avatar Seçici — Faz 6A */}
            <View style={sectionStyle}>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                {tStatic('app.appearanceTitle', undefined, 'Gorunum')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                {/* Avatar önizleme */}
                <Avatar config={avatar} age={10} size={52} />

                <View style={{ flex: 1, gap: 8 }}>
                  {/* Saç */}
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {([0, 1, 2, 3] as const).map(i => (
                      <TouchableOpacity
                        key={`hair_${i}`}
                        onPress={() => setAvatar(prev => ({ ...prev, hairStyle: i }))}
                        style={{
                          width: 28, height: 28, borderRadius: 14,
                          backgroundColor: ['#1a1a1a', '#6B3A2A', '#C8A951', '#A0522D'][i],
                          borderWidth: avatar.hairStyle === i ? 2 : 1,
                          borderColor: avatar.hairStyle === i ? theme.accentBrand ?? theme.textPrimary : theme.border,
                        }}
                      />
                    ))}
                  </View>
                  {/* Ten tonu */}
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {([0, 1, 2, 3] as const).map(i => (
                      <TouchableOpacity
                        key={`skin_${i}`}
                        onPress={() => setAvatar(prev => ({ ...prev, skinTone: i }))}
                        style={{
                          width: 28, height: 28, borderRadius: 14,
                          backgroundColor: ['#FDDBB4', '#F0C27F', '#C68642', '#8D5524'][i],
                          borderWidth: avatar.skinTone === i ? 2 : 1,
                          borderColor: avatar.skinTone === i ? theme.accentBrand ?? theme.textPrimary : theme.border,
                        }}
                      />
                    ))}
                  </View>
                  {/* Aksesuar */}
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {accessoryOptions.map((label, i) => (
                      <TouchableOpacity
                        key={`acc_${i}`}
                        onPress={() => setAvatar(prev => ({ ...prev, accessory: i as 0 | 1 | 2 }))}
                        style={{
                          paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
                          borderWidth: 1,
                          borderColor: avatar.accessory === i ? theme.accentBrand ?? theme.textPrimary : theme.border,
                          backgroundColor: avatar.accessory === i ? `${theme.accentBrand ?? '#3b82f6'}22` : 'transparent',
                        }}
                      >
                        <Text style={{ color: theme.textPrimary, fontSize: 11 }}>{label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            <View style={sectionStyle}>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                {tStatic('app.birthInfo', undefined, 'Dogum Bilgisi')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 11, marginBottom: 4 }}>
                    {tStatic('app.month', undefined, 'Ay')}
                  </Text>
                  <DropdownPicker
                    value={monthOptions[birthMonth - 1]}
                    options={monthOptions}
                    onSelect={(monthLabel) => {
                      const monthIndex = monthOptions.indexOf(monthLabel);
                      if (monthIndex >= 0) {
                        setBirthMonth(monthIndex + 1);
                      }
                    }}
                    placeholder={tStatic('app.selectMonth', undefined, 'Ay sec')}
                    theme={theme}
                    metrics={metrics}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 11, marginBottom: 4 }}>
                    {tStatic('app.day', undefined, 'Gun')}
                  </Text>
                  <DropdownPicker
                    value={String(birthDay)}
                    options={dayOptions}
                    onSelect={(day) => setBirthDay(Number(day))}
                    placeholder={tStatic('app.selectDay', undefined, 'Gun sec')}
                    theme={theme}
                    metrics={metrics}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 11, marginBottom: 4 }}>
                  {tStatic('app.city', undefined, 'Sehir')}
                </Text>
                <DropdownPicker
                  value={birthCity}
                  options={turkishCities}
                  onSelect={setBirthCity}
                  placeholder={tStatic('app.selectCity', undefined, 'Sehir sec')}
                  theme={theme}
                  metrics={metrics}
                />
              </View>

              <View
                style={{
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceOverlay,
                  padding: 10,
                }}
              >
                <Text style={{ color: theme.accentBrand, fontWeight: '800', marginBottom: 6 }}>
                  {zodiac.emoji} {zodiac.name.toUpperCase()}  {'\u2022'}  {zodiac.dateRange}
                </Text>
                <Text style={{ color: theme.textPrimary, fontSize: 13, lineHeight: 20, marginBottom: 6 }}>
                  "{zodiac.personality}"
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  {'\u{1F4AA}'} {tStatic('app.zodiacStrong', undefined, 'Guclu')}: {zodiac.strength}   {'\u26A0\uFE0F'} {tStatic('app.zodiacChallenge', undefined, 'Zorluk')}: {zodiac.challenge}
                </Text>
              </View>
            </View>

            <LegacyPanel
              meta={metaProgression}
              theme={theme}
              metrics={metrics}
            />

            {fastStartUnlocked && (
              <View style={sectionStyle}>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                  {tStatic('app.fastStartTitle', undefined, 'Hizli Baslangic')}
                </Text>
                <TouchableOpacity
                  onPress={() => setUseFastStart(prev => !prev)}
                  activeOpacity={0.85}
                  style={{
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: useFastStart ? theme.accentEvent : theme.border,
                    backgroundColor: useFastStart ? `${theme.accentEvent}22` : theme.surfaceRaised,
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={{ color: useFastStart ? theme.accentEvent : theme.textPrimary, fontWeight: '700', fontSize: 13 }}>
                    {useFastStart
                      ? tStatic('app.fastStartEnabled', undefined, 'Acik - 7 Yas Baslangici')
                      : tStatic('app.fastStartDisabled', undefined, 'Kapali - 0 Yas Baslangici')}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 4 }}>
                    {tStatic('app.fastStartHint', undefined, 'Legacy Seviye 1 ile acilir. Bebeklik fazini atlar.')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {legacyPerksEnabled && unlockedLegacyPerks.length > 0 && (
              <View style={sectionStyle}>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                  {tStatic('app.legacyPerksTitle', undefined, 'Acilan Legacy Perkler')}
                </Text>
                <View style={{ gap: 6 }}>
                  {unlockedLegacyPerks.map(perk => (
                    <View
                      key={perk.id}
                      style={{
                        backgroundColor: theme.surfaceOverlay,
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                      }}
                    >
                      <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 12 }}>
                        {perk.icon} Lv.{perk.levelRequired} - {getLegacyPerkTitle(perk.id)}
                      </Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
                        {getLegacyPerkDescription(perk.id)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {legacyBonuses.visible && (
              <View style={sectionStyle}>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                  {tStatic('app.legacyAdvantages', undefined, 'Miras Avantajlari')}
                </Text>
                <Text style={{ color: theme.textPrimary, fontWeight: '700', marginBottom: 8 }}>
                  {tStatic('app.legacyLevel', { level: legacyBonuses.level }, `Legacy Seviye ${legacyBonuses.level}`)}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <View style={{ backgroundColor: theme.surfaceOverlay, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 12 }}>{tStatic('labels.stats.health', undefined, 'Saglik')} +{legacyBonuses.health}</Text>
                  </View>
                  <View style={{ backgroundColor: theme.surfaceOverlay, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 12 }}>{tStatic('labels.stats.intelligence', undefined, 'Zeka')} +{legacyBonuses.intelligence}</Text>
                  </View>
                  <View style={{ backgroundColor: theme.surfaceOverlay, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 12 }}>{tStatic('labels.stats.charisma', undefined, 'Karizma')} +{legacyBonuses.charisma}</Text>
                  </View>
                  <View style={{ backgroundColor: theme.surfaceOverlay, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 12 }}>{tStatic('labels.stats.discipline', undefined, 'Disiplin')} +{legacyBonuses.discipline}</Text>
                  </View>
                  <View style={{ backgroundColor: theme.surfaceOverlay, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 12 }}>{tStatic('labels.stats.familyRelation', undefined, 'Aile')} +{legacyBonuses.familyRelation}</Text>
                  </View>
                  <View style={{ backgroundColor: theme.surfaceOverlay, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 12 }}>{tStatic('labels.stats.money', undefined, 'Para')} +{legacyBonuses.money} TL</Text>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={handleStartGame}
              disabled={!isFormReady}
              style={{
                marginTop: 2,
                borderRadius: 12,
                minHeight: 52,
                borderWidth: 1,
                borderColor: isFormReady ? theme.accentEvent : theme.border,
                backgroundColor: isFormReady ? theme.accentEvent : theme.surfaceOverlay,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: isFormReady ? 1 : 0.65,
              }}
              activeOpacity={0.85}
              accessibilityLabel={tStatic('app.startGameAria', undefined, 'Oyuna basla')}
              accessibilityRole="button"
              accessibilityState={{ disabled: !isFormReady }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: metrics.font }}>
                {tStatic('app.startLife', undefined, 'Hayata Basla')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleQuickPlay}
                disabled={!isFormReady}
                style={{
                  marginTop: 8,
                  borderRadius: 12,
                  minHeight: 44,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceOverlay,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: isFormReady ? 1 : 0.55,
                }}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={tStatic('app.quickPlay', undefined, 'Hizli Oyun - 13 Yastan Basla')}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '700', fontSize: metrics.font - 1 }}>
                  {tStatic('app.quickPlay', undefined, 'Hizli Oyun — 13 Yastan Basla')}
                </Text>
              </TouchableOpacity>
              {(metaProgression?.recentRuns?.length ?? 0) === 0 && (
                <Text style={{ color: theme.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                  {tStatic('app.quickPlayHint', undefined, 'Hizli oynamak isteyenler icin — 13 yasindan basla')}
                </Text>
              )}
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 18 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            overScrollMode="never"
            bounces={false}
          >
            <EndingGallery
              meta={metaProgression}
              theme={theme}
              metrics={metrics}
              hints={endingHints}
            />
          </ScrollView>
        )}
      </View>

    </SafeAreaView>
  );
});

MainMenuScreen.displayName = 'MainMenuScreen';
