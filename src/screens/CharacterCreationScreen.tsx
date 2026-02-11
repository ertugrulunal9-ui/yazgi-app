import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { getThemeTokens, getDensityMetrics } from '../utils/themeUtils';
import {
  generateRandomCharacter,
  calculateZodiacSign,
  zodiacInfo,
  turkishCities,
  turkishMonths,
  getMaxDaysInMonth,
} from '../utils/gameUtils';
import { CharacterInfo, PlayerGender } from '../types';
import {
  FadeInDownView,
  FadeInUpView,
  buttonPress,
  successHaptic,
} from '../animations';

interface CharacterCreationScreenProps {
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
  onGameStart: () => void;
}

// Dropdown Picker bileşeni
const DropdownPicker: React.FC<{
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder: string;
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
}> = ({ value, options, onSelect, placeholder, theme, metrics }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          backgroundColor: theme.surfaceRaised,
          borderRadius: 8,
          paddingVertical: metrics.pad * 0.8,
          paddingHorizontal: metrics.pad,
          borderWidth: 1,
          borderColor: theme.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minWidth: 100,
        }}
      >
        <Text style={{ color: value ? theme.textPrimary : theme.textSecondary, fontSize: metrics.font - 1 }}>
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" size={16} color={theme.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={{
            backgroundColor: theme.surfaceRaised,
            borderRadius: 12,
            maxHeight: '60%',
            borderWidth: 1,
            borderColor: theme.border,
          }}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                  }}
                  style={{
                    paddingVertical: metrics.pad,
                    paddingHorizontal: metrics.pad * 1.5,
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

// Karakter form state tipi
interface CharacterFormState {
  firstName: string;
  lastName: string;
  gender: PlayerGender;
  birthMonth: number;
  birthDay: number;
  birthCity: string;
}

const initialFormState: CharacterFormState = {
  firstName: '',
  lastName: '',
  gender: 'MALE',
  birthMonth: 1,
  birthDay: 1,
  birthCity: '',
};

export const CharacterCreationScreen: React.FC<CharacterCreationScreenProps> = ({
  theme,
  metrics,
  onGameStart,
}) => {
  const { startNewGame } = useGame();

  // Tek state nesnesi - tüm form verileri burada
  const [form, setForm] = useState<CharacterFormState>(initialFormState);

  // Form güncelleme yardımcısı
  const updateForm = useCallback((updates: Partial<CharacterFormState>) => {
    setForm(prev => ({ ...prev, ...updates }));
  }, []);

  // Burç hesaplama
  const zodiacSign = useMemo(() => calculateZodiacSign(form.birthMonth, form.birthDay), [form.birthMonth, form.birthDay]);
  const zodiac = zodiacInfo[zodiacSign];

  // Gün sayısını aya göre ayarla
  const maxDays = useMemo(() => getMaxDaysInMonth(form.birthMonth), [form.birthMonth]);
  const dayOptions = useMemo(() => Array.from({ length: maxDays }, (_, i) => String(i + 1)), [maxDays]);

  // Ay değiştiğinde gün geçersiz kalırsa düzelt
  useEffect(() => {
    if (form.birthDay > maxDays) {
      updateForm({ birthDay: maxDays });
    }
  }, [maxDays, form.birthDay, updateForm]);

  // Rastgele karakter oluştur - tüm form'u tek seferde güncelle
  const handleRandomize = useCallback(() => {
    buttonPress();
    const randomChar = generateRandomCharacter();
    setForm({
      firstName: randomChar.firstName,
      lastName: randomChar.lastName,
      gender: randomChar.gender,
      birthMonth: randomChar.birthMonth,
      birthDay: randomChar.birthDay,
      birthCity: randomChar.birthCity,
    });
  }, []);

  // Oyuna başla
  const handleStartGame = useCallback(() => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.birthCity) {
      buttonPress();
      return;
    }

    const characterInfo: CharacterInfo = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender,
      birthMonth: form.birthMonth,
      birthDay: form.birthDay,
      birthCity: form.birthCity,
      zodiacSign,
    };

    buttonPress();
    successHaptic();
    startNewGame(`${characterInfo.firstName} ${characterInfo.lastName}`, characterInfo);
    onGameStart();
  }, [form, zodiacSign, startNewGame, onGameStart]);

  const isFormValid = form.firstName.trim() && form.lastName.trim() && form.birthCity;

  // Stiller
  const containerStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: theme.appBg,
  }), [theme.appBg]);

  const headerStyle = useMemo(() => ({
    paddingHorizontal: metrics.pad * 1.5,
    paddingTop: metrics.pad * 1.5,
    paddingBottom: metrics.pad,
    alignItems: 'center' as const,
  }), [metrics.pad]);

  const sectionStyle = useMemo(() => ({
    backgroundColor: theme.surfaceBase,
    borderRadius: 12,
    padding: metrics.pad,
    marginBottom: metrics.pad,
    borderWidth: 1,
    borderColor: theme.border,
  }), [theme.surfaceBase, theme.border, metrics.pad]);

  const labelStyle = useMemo(() => ({
    color: theme.textSecondary,
    fontSize: metrics.font - 2,
    marginBottom: 6,
    fontWeight: '600' as const,
  }), [theme.textSecondary, metrics.font]);

  const inputStyle = useMemo(() => ({
    backgroundColor: theme.surfaceRaised,
    color: theme.textPrimary,
    padding: metrics.pad,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    fontSize: metrics.font,
  }), [theme.surfaceRaised, theme.textPrimary, theme.border, metrics.pad, metrics.font]);

  const genderButtonStyle = useCallback((isSelected: boolean) => ({
    flex: 1,
    paddingVertical: metrics.pad * 0.8,
    alignItems: 'center' as const,
    backgroundColor: isSelected ? theme.accentEvent : theme.surfaceRaised,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isSelected ? theme.accentEvent : theme.border,
  }), [theme.accentEvent, theme.surfaceRaised, theme.border, metrics.pad]);

  return (
    <SafeAreaView style={containerStyle}>
      {/* Header */}
      <View style={headerStyle}>
        <FadeInDownView delay={0}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: theme.textPrimary, textAlign: 'center' }}>
            Karakter Oluştur
          </Text>
        </FadeInDownView>
        <FadeInUpView delay={100}>
          <Text style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', marginTop: 4 }}>
            Hayatına başlayacak karakterini tasarla
          </Text>
        </FadeInUpView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: metrics.pad * 1.5, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Rastgele Oluştur Butonu */}
        <FadeInUpView delay={150}>
          <TouchableOpacity
            onPress={handleRandomize}
            style={{
              backgroundColor: theme.surfaceOverlay,
              paddingVertical: metrics.pad * 0.8,
              paddingHorizontal: metrics.pad * 1.5,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              marginBottom: metrics.pad * 1.5,
              borderWidth: 1,
              borderColor: theme.border,
            }}
            activeOpacity={0.7}
          >
            <Feather name="shuffle" size={16} color={theme.accentEvent} style={{ marginRight: 8 }} />
            <Text style={{ color: theme.accentEvent, fontWeight: '600', fontSize: metrics.font - 1 }}>
              Rastgele Oluştur
            </Text>
          </TouchableOpacity>
        </FadeInUpView>

        {/* İsim Soyisim */}
        <FadeInUpView delay={200}>
          <View style={sectionStyle}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Ad</Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Adınız"
                  placeholderTextColor={theme.textSecondary}
                  value={form.firstName}
                  onChangeText={(text) => updateForm({ firstName: text })}
                  autoCapitalize="words"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={labelStyle}>Soyad</Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Soyadınız"
                  placeholderTextColor={theme.textSecondary}
                  value={form.lastName}
                  onChangeText={(text) => updateForm({ lastName: text })}
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>
        </FadeInUpView>

        {/* Cinsiyet */}
        <FadeInUpView delay={250}>
          <View style={sectionStyle}>
            <Text style={labelStyle}>Cinsiyet</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => updateForm({ gender: 'FEMALE' })}
                style={genderButtonStyle(form.gender === 'FEMALE')}
                activeOpacity={0.7}
              >
                <Text style={{
                  color: form.gender === 'FEMALE' ? '#fff' : theme.textPrimary,
                  fontWeight: '600',
                  fontSize: metrics.font,
                }}>
                  Kadın
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updateForm({ gender: 'MALE' })}
                style={genderButtonStyle(form.gender === 'MALE')}
                activeOpacity={0.7}
              >
                <Text style={{
                  color: form.gender === 'MALE' ? '#fff' : theme.textPrimary,
                  fontWeight: '600',
                  fontSize: metrics.font,
                }}>
                  Erkek
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </FadeInUpView>

        {/* Doğum Tarihi */}
        <FadeInUpView delay={300}>
          <View style={sectionStyle}>
            <Text style={labelStyle}>Doğum Tarihi</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textSecondary, fontSize: metrics.font - 3, marginBottom: 4 }}>Ay</Text>
                <DropdownPicker
                  value={turkishMonths[form.birthMonth - 1]}
                  options={turkishMonths}
                  onSelect={(val) => updateForm({ birthMonth: turkishMonths.indexOf(val) + 1 })}
                  placeholder="Ay seç"
                  theme={theme}
                  metrics={metrics}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textSecondary, fontSize: metrics.font - 3, marginBottom: 4 }}>Gün</Text>
                <DropdownPicker
                  value={String(form.birthDay)}
                  options={dayOptions}
                  onSelect={(val) => updateForm({ birthDay: Number(val) })}
                  placeholder="Gün seç"
                  theme={theme}
                  metrics={metrics}
                />
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: theme.textSecondary, fontSize: metrics.font - 3, marginBottom: 4 }}>Burç</Text>
                <View style={{
                  backgroundColor: theme.surfaceOverlay,
                  borderRadius: 8,
                  paddingVertical: metrics.pad * 0.8,
                  paddingHorizontal: metrics.pad,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <Text style={{ fontSize: 18 }}>{zodiac.emoji}</Text>
                  <Text style={{ color: theme.accentGrade, fontWeight: '600', fontSize: metrics.font - 1 }}>
                    {zodiac.name}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </FadeInUpView>

        {/* Doğum Şehri */}
        <FadeInUpView delay={350}>
          <View style={sectionStyle}>
            <Text style={labelStyle}>Doğmak İstediğin Şehir</Text>
            <DropdownPicker
              value={form.birthCity}
              options={turkishCities}
              onSelect={(val) => updateForm({ birthCity: val })}
              placeholder="Şehir seç..."
              theme={theme}
              metrics={metrics}
            />
          </View>
        </FadeInUpView>

        {/* Karakter Özeti */}
        {isFormValid && (
          <FadeInUpView delay={400}>
            <View style={{
              backgroundColor: theme.surfaceOverlay,
              borderRadius: 12,
              padding: metrics.pad,
              marginBottom: metrics.pad,
              borderWidth: 1,
              borderColor: theme.accentEvent,
            }}>
              <Text style={{ color: theme.textSecondary, fontSize: metrics.font - 2, marginBottom: 8 }}>
                Karakter Özeti
              </Text>
              <Text style={{ color: theme.textPrimary, fontSize: metrics.font + 2, fontWeight: '700' }}>
                {form.firstName} {form.lastName}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: metrics.font - 1, marginTop: 4 }}>
                {form.gender === 'MALE' ? 'Erkek' : 'Kadın'} • {form.birthDay} {turkishMonths[form.birthMonth - 1]} • {zodiac.emoji} {zodiac.name} • {form.birthCity}
              </Text>
            </View>
          </FadeInUpView>
        )}
      </ScrollView>

      {/* Alt Buton */}
      <View style={{
        backgroundColor: theme.surfaceRaised,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        padding: metrics.pad * 1.5,
      }}>
        <TouchableOpacity
          onPress={handleStartGame}
          disabled={!isFormValid}
          style={{
            backgroundColor: isFormValid ? theme.accentEvent : theme.surfaceOverlay,
            paddingVertical: metrics.pad * 1.2,
            borderRadius: 12,
            alignItems: 'center',
            opacity: isFormValid ? 1 : 0.5,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#fff', fontSize: metrics.font + 1, fontWeight: '700' }}>
            Hayata Başla
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
