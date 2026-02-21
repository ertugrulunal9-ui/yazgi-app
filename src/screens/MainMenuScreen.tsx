import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { GoalVisionOnboarding } from '../components/Onboarding';
import { useGame } from '../context/GameContext';
import { useMetaProgression } from '../context/MetaProgressionContext';
import { useLegacyBonuses } from '../hooks/useGameSelectors';
import { CharacterInfo, LifeGoal, PlayerGender } from '../types';
import { LIFE_GOAL_META, LIFE_GOAL_ORDER } from '../utils/lifeGoalSystem';
import {
  calculateZodiacSign,
  generateRandomCharacter,
  getMaxDaysInMonth,
  turkishCities,
  turkishMonths,
  zodiacInfo,
} from '../utils/gameUtils';
import { getDensityMetrics, getThemeTokens } from '../utils/themeUtils';
import {
  FadeInDownView,
  FadeInUpView,
  buttonPress,
  successHaptic,
} from '../animations';

interface MainMenuScreenProps {
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
  onGameStart: () => void;
}

const GOAL_PICKER_ICONS: Record<LifeGoal, string> = {
  ACADEMIC: '🧠',
  ATHLETIC: '🏃',
  CREATIVE: '🎨',
  WEALTH: '💼',
  SOCIAL: '🤝',
};

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

export const MainMenuScreen: React.FC<MainMenuScreenProps> = React.memo(({ theme, metrics, onGameStart }) => {
  const { startNewGame, updateGameState } = useGame();
  const { metaProgression } = useMetaProgression();
  const legacyBonuses = useLegacyBonuses();

  const [activeTab, setActiveTab] = useState<'play' | 'lives'>('play');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<PlayerGender>('MALE');
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(1);
  const [birthCity, setBirthCity] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<LifeGoal | null>(null);
  const [showGoalVision, setShowGoalVision] = useState(false);

  const maxDays = useMemo(() => getMaxDaysInMonth(birthMonth), [birthMonth]);
  const dayOptions = useMemo(
    () => Array.from({ length: maxDays }, (_, index) => String(index + 1)),
    [maxDays]
  );
  const zodiacSign = useMemo(() => calculateZodiacSign(birthMonth, birthDay), [birthMonth, birthDay]);
  const zodiac = zodiacInfo[zodiacSign];

  useEffect(() => {
    if (birthDay > maxDays) {
      setBirthDay(maxDays);
    }
  }, [birthDay, maxDays]);

  const isFormReady = Boolean(firstName.trim() && lastName.trim() && birthCity && selectedGoal);

  const handleRandomize = useCallback(() => {
    buttonPress();
    const random = generateRandomCharacter();
    setFirstName(random.firstName);
    setLastName(random.lastName);
    setGender(random.gender);
    setBirthMonth(random.birthMonth);
    setBirthDay(random.birthDay);
    setBirthCity(random.birthCity);
    setSelectedGoal(LIFE_GOAL_ORDER[Math.floor(Math.random() * LIFE_GOAL_ORDER.length)] ?? 'ACADEMIC');
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

  const handleStartGame = useCallback(() => {
    if (!isFormReady || !selectedGoal) {
      buttonPress();
      Alert.alert('Eksik Bilgi', 'Baslamak icin ad, soyad, sehir ve hedef secimi gerekli.');
      return;
    }

    buttonPress();
    setShowGoalVision(true);
  }, [isFormReady, selectedGoal]);

  const handleGoalVisionContinue = useCallback(() => {
    if (!selectedGoal) return;

    const characterInfo = buildCharacterInfo();
    successHaptic();
    startNewGame(`${characterInfo.firstName} ${characterInfo.lastName}`, characterInfo);
    updateGameState({ selectedGoal });
    setShowGoalVision(false);
    onGameStart();
  }, [buildCharacterInfo, onGameStart, selectedGoal, startNewGame, updateGameState]);

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
            Yazgi
          </Text>
        </FadeInDownView>

        <FadeInUpView delay={90}>
          <Text style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center' }}>
            Kaderini sen yaz.
          </Text>
        </FadeInUpView>
      </View>

      <View style={contentStyle}>
        <View style={tabRowStyle}>
          <TouchableOpacity
            onPress={() => setActiveTab('play')}
            style={tabButtonStyle('play')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Basla sekmesi"
          >
            <Text style={{ color: activeTab === 'play' ? theme.textPrimary : theme.textSecondary, fontWeight: '700' }}>
              Basla
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('lives')}
            style={tabButtonStyle('lives')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Hayatlar sekmesi"
          >
            <Text style={{ color: activeTab === 'lives' ? theme.textPrimary : theme.textSecondary, fontWeight: '700' }}>
              Hayatlar
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
                Rastgele Karakter
              </Text>
            </TouchableOpacity>

            <View style={sectionStyle}>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                Kimlik
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  style={[inputStyle, { flex: 1 }]}
                  placeholder="Ad"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="words"
                />
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  style={[inputStyle, { flex: 1 }]}
                  placeholder="Soyad"
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
                    Erkek
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
                    Kadin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={sectionStyle}>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                Dogum Bilgisi
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 11, marginBottom: 4 }}>Ay</Text>
                  <DropdownPicker
                    value={turkishMonths[birthMonth - 1]}
                    options={turkishMonths}
                    onSelect={(monthLabel) => {
                      const monthIndex = turkishMonths.indexOf(monthLabel);
                      if (monthIndex >= 0) {
                        setBirthMonth(monthIndex + 1);
                      }
                    }}
                    placeholder="Ay sec"
                    theme={theme}
                    metrics={metrics}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 11, marginBottom: 4 }}>Gun</Text>
                  <DropdownPicker
                    value={String(birthDay)}
                    options={dayOptions}
                    onSelect={(day) => setBirthDay(Number(day))}
                    placeholder="Gun sec"
                    theme={theme}
                    metrics={metrics}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 11, marginBottom: 4 }}>Sehir</Text>
                <DropdownPicker
                  value={birthCity}
                  options={turkishCities}
                  onSelect={setBirthCity}
                  placeholder="Sehir sec"
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
                  {'\u{1F4AA}'} Guclu: {zodiac.strength}   {'\u26A0\uFE0F'} Zorluk: {zodiac.challenge}
                </Text>
              </View>
            </View>

            <View style={sectionStyle}>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                Bu Hayattaki Hedefin
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {LIFE_GOAL_ORDER.map((goal) => {
                  const goalMeta = LIFE_GOAL_META[goal];
                  const isSelected = selectedGoal === goal;
                  const goalColor = goalMeta.accentColor;

                  return (
                    <TouchableOpacity
                      key={goal}
                      onPress={() => setSelectedGoal(goal)}
                      activeOpacity={0.85}
                      style={{
                        width: '48.8%',
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: isSelected ? goalColor : theme.border,
                        backgroundColor: isSelected ? `${goalColor}22` : theme.surfaceRaised,
                        paddingVertical: 10,
                        paddingHorizontal: 10,
                      }}
                    >
                      <Text style={{ color: isSelected ? goalColor : theme.textPrimary, fontWeight: '800', fontSize: 13 }}>
                        {GOAL_PICKER_ICONS[goal]} {goalMeta.shortLabel}
                      </Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 4 }}>
                        {goalMeta.statHint}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <LegacyPanel
              meta={metaProgression}
              theme={theme}
              metrics={metrics}
            />

            {legacyBonuses.visible && (
              <View style={sectionStyle}>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                  Miras Avantajlari
                </Text>
                <Text style={{ color: theme.textPrimary, fontWeight: '700', marginBottom: 8 }}>
                  Legacy Seviye {legacyBonuses.level}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <View style={{ backgroundColor: theme.surfaceOverlay, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 12 }}>Saglik +{legacyBonuses.health}</Text>
                  </View>
                  <View style={{ backgroundColor: theme.surfaceOverlay, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 12 }}>Zeka +{legacyBonuses.intelligence}</Text>
                  </View>
                  <View style={{ backgroundColor: theme.surfaceOverlay, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 12 }}>Karizma +{legacyBonuses.charisma}</Text>
                  </View>
                  <View style={{ backgroundColor: theme.surfaceOverlay, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 12 }}>Disiplin +{legacyBonuses.discipline}</Text>
                  </View>
                  <View style={{ backgroundColor: theme.surfaceOverlay, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 12 }}>Aile +{legacyBonuses.familyRelation}</Text>
                  </View>
                  <View style={{ backgroundColor: theme.surfaceOverlay, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 12 }}>Para +{legacyBonuses.money} TL</Text>
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
              accessibilityLabel="Oyuna basla"
              accessibilityRole="button"
              accessibilityState={{ disabled: !isFormReady }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: metrics.font }}>
                Hayata Basla
              </Text>
            </TouchableOpacity>
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
            />
          </ScrollView>
        )}
      </View>

      <Modal
        visible={showGoalVision && selectedGoal !== null}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowGoalVision(false)}
      >
        {selectedGoal ? (
          <GoalVisionOnboarding
            theme={theme}
            metrics={metrics}
            selectedGoal={selectedGoal}
            onContinue={handleGoalVisionContinue}
            onBack={() => setShowGoalVision(false)}
          />
        ) : null}
      </Modal>
    </SafeAreaView>
  );
});

MainMenuScreen.displayName = 'MainMenuScreen';
