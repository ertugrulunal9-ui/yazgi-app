import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Appearance, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { useStats } from '../hooks/useStats';
import { useEvents } from '../hooks/useEvents';
import { getThemeTokens, getSystemTheme } from '../utils/themeUtils';
import {
  FadeInUpView,
  StaggeredFadeIn,
  CountUpText,
  buttonPress,
  selectionHaptic,
} from '../animations';
import StatBar from '../components/StatBar';
import { getStatCap } from '../utils/gameUtils';
import { Header } from '../components/Header';

interface GameScreenProps {
  onPhaseChange: (tab: 'hub' | 'character' | 'log' | 'settings') => void;
  onOpenSettings: () => void;
  currentTab: 'hub' | 'character' | 'log' | 'settings';
}

export const GameScreen: React.FC<GameScreenProps> = React.memo(({ onPhaseChange, currentTab }) => {
  const { gameState, playerName } = useGame();
  const { stats, statLabels } = useStats();
  const { advanceTurn } = useEvents();
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>(getSystemTheme());
  const theme = useMemo(() => getThemeTokens(resolvedTheme), [resolvedTheme]);

  React.useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setResolvedTheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => sub.remove();
  }, []);

  const cardStyle = useMemo(() => ({
    backgroundColor: theme.surfaceBase,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  }), [theme.surfaceBase, theme.border]);

  const isBaby = gameState.age < 7;
  const isEventActive = gameState.phase === 'EVENT' || gameState.phase === 'RESULT' || gameState.phase === 'GAME_OVER';

  const getAvatarEmoji = () => {
    if (gameState.age < 3) return '👶';
    if (gameState.age < 7) return '🧸';
    if (gameState.age < 13) return '🧒';
    return '🧑‍🎓';
  };

  const renderHubContent = useCallback(() => (
    <FadeInUpView>
      {/* Hayati Durum Kartı */}
      <View style={cardStyle}>
        <Text style={{ 
          color: theme.textPrimary, 
          fontSize: 12, 
          fontWeight: '700', 
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
        }}>
          Hayati Durum
        </Text>
        <StatBar 
          label="Sağlık" 
          value={stats.health} 
          statKey="health" 
          cap={getStatCap(gameState.age, 'health', gameState.family, gameState.traits)} 
          theme={theme} 
        />
        <StatBar 
          label="Enerji" 
          value={stats.energy} 
          statKey="energy" 
          theme={theme} 
        />
      </View>

      {/* Diğer Statlar Kartı */}
      <View style={cardStyle}>
        <Text style={{ 
          color: theme.textPrimary, 
          fontSize: 12, 
          fontWeight: '700', 
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
        }}>
          Diğer Statlar
        </Text>
        <StatBar 
          label={statLabels.familyRelation} 
          value={stats.familyRelation} 
          statKey="familyRelation" 
          theme={theme} 
        />
        <StatBar 
          label={statLabels.intelligence} 
          value={stats.intelligence} 
          statKey="intelligence" 
          cap={getStatCap(gameState.age, 'intelligence', gameState.family, gameState.traits)} 
          theme={theme} 
        />
        <StatBar 
          label={statLabels.charisma} 
          value={stats.charisma} 
          statKey="charisma" 
          cap={getStatCap(gameState.age, 'charisma', gameState.family, gameState.traits)} 
          theme={theme} 
        />
        <StatBar 
          label={statLabels.discipline} 
          value={stats.discipline} 
          statKey="discipline" 
          cap={getStatCap(gameState.age, 'discipline', gameState.family, gameState.traits)} 
          theme={theme} 
        />
        {!isBaby && (
          <StatBar 
            label={statLabels.money} 
            value={stats.money} 
            statKey="money" 
            theme={theme} 
          />
        )}
      </View>
    </FadeInUpView>
  ), [playerName, gameState, stats, statLabels, theme, cardStyle, isBaby]);

  const renderCharacterContent = useCallback(() => (
    <FadeInUpView delay={100}>
      <View style={cardStyle}>
        <Text style={{ color: theme.textPrimary, fontWeight: '700', marginBottom: 12 }}>Özellikler</Text>
        {gameState.traits.length > 0 ? (
          gameState.traits.map((trait, index) => (
            <FadeInUpView key={trait} delay={index * 50}>
              <View style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <Text style={{ color: theme.accentEvent, fontWeight: '600' }}>✨ {trait}</Text>
              </View>
            </FadeInUpView>
          ))
        ) : (
          <Text style={{ color: theme.textSecondary }}>Henüz özellik yok</Text>
        )}
      </View>

      <View style={cardStyle}>
        <Text style={{ color: theme.textPrimary, fontWeight: '700', marginBottom: 12 }}>Beceriler</Text>
        {Object.entries(gameState.skills).map(([key, value], index) => (
          <FadeInUpView key={key} delay={index * 30}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ color: theme.textSecondary }}>{key}</Text>
              <CountUpText
                value={Math.round(value)}
                style={{ color: theme.accentSkill, fontWeight: '700' }}
              />
            </View>
          </FadeInUpView>
        ))}
      </View>
    </FadeInUpView>
  ), [gameState.traits, gameState.skills, theme.textPrimary, theme.textSecondary, theme.accentEvent, theme.accentSkill, theme.border, cardStyle]);

  const renderLogContent = useCallback(() => (
    <StaggeredFadeIn>
      {gameState.historyLog.slice(-10).map(entry => (
        <View key={entry.id} style={{ ...cardStyle, marginBottom: 8 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4 }}>
            Yaş {entry.age}
          </Text>
          <Text style={{ color: entry.type === 'positive' ? '#34d399' : entry.type === 'negative' ? '#f87171' : theme.textPrimary }}>
            {entry.message}
          </Text>
        </View>
      ))}
    </StaggeredFadeIn>
  ), [gameState.historyLog, theme.textSecondary, theme.textPrimary, cardStyle]);

  // SafeAreaView style - Root layout
  const safeAreaStyle = useMemo(() => ({
    flex: 1 as const,
    backgroundColor: theme.appBg,
  }), [theme.appBg]);

  // Header container style - Sabit üst kısım
  const headerContainerStyle = useMemo(() => ({
    flexShrink: 0,
  }), []);

  // Main content container - Header ve Footer arasındaki alan
  const mainContainerStyle = useMemo(() => ({
    flex: 1,
    flexDirection: 'column' as const,
  }), []);

  // ScrollView style - flex: 1 ile orta alana yay
  const scrollViewStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: theme.appBg,
  }), [theme.appBg]);

  // ScrollView content container style
  const scrollViewContentStyle = useMemo(() => ({
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
  }), []);

  // Footer container style - Sabit alt kısım (Flexbox)
  const footerStyle = useMemo(() => ({
    flexShrink: 0,
    backgroundColor: theme.surfaceRaised,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  }), [theme.surfaceRaised, theme.border]);

  // End day button container style
  const endDayButtonContainerStyle = useMemo(() => ({
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  }), []);

  // End day button style
  const endDayButtonStyle = useMemo(() => ({
    backgroundColor: isEventActive ? theme.surfaceBase : theme.accentEvent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: isEventActive ? theme.border : theme.accentEvent,
    opacity: isEventActive ? 0.5 : 1,
  }), [isEventActive, theme.surfaceBase, theme.accentEvent, theme.border]);

  // Tab bar style - SDK52 Flexbox standartları ile
  const tabBarStyle = useMemo(() => ({
    backgroundColor: theme.surfaceRaised,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 10,
    flexDirection: 'row' as const,
    gap: 8,
    justifyContent: 'space-around' as const,
  }), [theme.surfaceRaised]);

  // Tab item style
  const tabItemStyle = useMemo(() => ({
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: 10,
    borderRadius: 12,
  }), []);

  const handleTabPress = useCallback((tabId: string) => {
    buttonPress();
    selectionHaptic();
    onPhaseChange(tabId as any);
  }, [onPhaseChange]);

  const handleEndDay = useCallback(() => {
    console.log("Tur ilerliyor: Adım 1 - Günü Bitir çağrıldı.");
    buttonPress();
    selectionHaptic();

    try {
      console.log("Tur ilerliyor: Adım 2 - advanceTurn başlatılıyor.");
      advanceTurn();
      console.log("Tur ilerliyor: Adım 3 - advanceTurn başarıyla tamamlandı. State güncellemeleri bekleniyor.");
    } catch (error) {
      console.error("Tur ilerliyor: HATA - advanceTurn sırasında bir sorun oluştu:", error);
    }
  }, [advanceTurn]);

  return (
    <SafeAreaView style={safeAreaStyle}>
      <View style={mainContainerStyle}>
        {/* Header - Sabit Üst Kısım */}
        <View style={headerContainerStyle}>
          <Header
            playerName={playerName}
            age={gameState.age}
            turn={gameState.turn}
            avatarEmoji={getAvatarEmoji()}
            theme={theme}
          />
        </View>

        {/* Content - flex: 1 ile orta alana yay */}
        <ScrollView style={scrollViewStyle} contentContainerStyle={scrollViewContentStyle}>
          {currentTab === 'hub' && renderHubContent()}
          {currentTab === 'character' && renderCharacterContent()}
          {currentTab === 'log' && renderLogContent()}
        </ScrollView>

        {/* Footer - Sabit Alt Kısım (Flexbox) */}
        <View style={footerStyle}>
          {/* End Day Button - Günü Bitir Butonu */}
          <View style={endDayButtonContainerStyle}>
            <TouchableOpacity
              onPress={handleEndDay}
              style={[endDayButtonStyle, { pointerEvents: isEventActive ? 'none' : 'auto' }]}
            >
              <Text style={{
                color: isEventActive ? theme.textSecondary : '#ffffff',
                fontSize: 16,
                fontWeight: '700',
              }}>
                🌙 Günü Bitir
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Bar - Ana Menü */}
          <FadeInUpView delay={200}>
            <View style={tabBarStyle}>
              {[
                { id: 'hub', label: 'Ana Sayfa', icon: 'home' },
                { id: 'character', label: 'Karakter', icon: 'user' },
                { id: 'log', label: 'Geçmiş', icon: 'book' },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => handleTabPress(tab.id)}
                  style={[
                    tabItemStyle,
                    { backgroundColor: currentTab === tab.id ? theme.accentEvent + '20' : 'transparent' }
                  ]}
                >
                  <Feather
                    name={tab.icon as any}
                    color={currentTab === tab.id ? theme.accentEvent : theme.textSecondary}
                    size={22}
                  />
                  <Text style={{
                    color: currentTab === tab.id ? theme.accentEvent : theme.textSecondary,
                    fontSize: 11,
                    marginTop: 4,
                    fontWeight: currentTab === tab.id ? '700' : '500'
                  }}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </FadeInUpView>
        </View>
      </View>
    </SafeAreaView>
  );
});
