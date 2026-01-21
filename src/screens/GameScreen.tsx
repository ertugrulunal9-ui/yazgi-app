import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Appearance, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { useStats } from '../hooks/useStats';
import { useEvents } from '../hooks/useEvents';
import { getThemeTokens, getDensityMetrics, getSystemTheme } from '../utils/themeUtils';
import {
  FadeInUpView,
  StaggeredFadeIn,
  CountUpText,
  buttonPress,
  selectionHaptic,
} from '../animations';
import Sidebar from '../components/Sidebar';

interface GameScreenProps {
  onPhaseChange: (tab: 'hub' | 'character' | 'log' | 'settings') => void;
  onOpenSettings: () => void;
  currentTab: 'hub' | 'character' | 'log' | 'settings';
}

export const GameScreen: React.FC<GameScreenProps> = ({ onPhaseChange, onOpenSettings, currentTab }) => {
  const { gameState, playerName } = useGame();
  const { stats, statLabels } = useStats();
  const { advanceTurn } = useEvents();
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>(getSystemTheme());
  const theme = getThemeTokens(resolvedTheme);
  const metrics = getDensityMetrics('standard');

  React.useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setResolvedTheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => sub.remove();
  }, []);

  const cardStyle = {
    backgroundColor: theme.surfaceBase,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: metrics.pad,
    marginBottom: 12,
  } as const;

  const renderHubContent = () => (
    <FadeInUpView>
      <View>
      <View style={cardStyle}>
        <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
          {playerName} • {gameState.age} yaş
        </Text>
        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
          Enerji: <CountUpText value={stats.energy} style={{ color: theme.accentStat, fontWeight: '700' }} />/{gameState.maxEnergy}
        </Text>
      </View>

      <View style={cardStyle}>
        <Text style={{ color: theme.textPrimary, fontWeight: '700', marginBottom: 8 }}>İstatistikler</Text>
        {(['health', 'intelligence', 'charisma', 'discipline', 'familyRelation'] as const).map(key => (
          <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{statLabels[key]}</Text>
            <CountUpText
              value={Math.round(stats[key])}
              style={{ color: theme.accentStat, fontWeight: '700' }}
            />
          </View>
        ))}
        </View>
      </View>
    </FadeInUpView>
  );

  const renderCharacterContent = () => (
    <FadeInUpView delay={100}>
      <View>
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
      </View>
    </FadeInUpView>
  );

  const renderLogContent = () => (
    <StaggeredFadeIn staggerDelay={50}>
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
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.appBg, flexDirection: 'row' }}>
      {/* Sidebar */}
      <Sidebar
        age={gameState.age}
        stats={stats}
        playerName={playerName}
        family={gameState.family}
        gameState={gameState}
        onAdvanceTurn={advanceTurn}
        maxTurns={80}
        onOpenSettings={onOpenSettings}
        theme={theme}
      />

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 8 }}>
          {currentTab === 'hub' && renderHubContent()}
          {currentTab === 'character' && renderCharacterContent()}
          {currentTab === 'log' && renderLogContent()}
        </ScrollView>

        {/* Bottom Tab Bar */}
        <FadeInUpView delay={200}>
          <View style={{ backgroundColor: theme.surfaceRaised, borderTopWidth: 1, borderTopColor: theme.border, paddingHorizontal: 8, paddingVertical: 8, flexDirection: 'row', gap: 8, justifyContent: 'space-around' }}>
            {[
              { id: 'hub', label: 'Ana Sayfa', icon: 'home' },
              { id: 'character', label: 'Karakter', icon: 'user' },
              { id: 'log', label: 'Geçmiş', icon: 'book' },
            ].map((tab, index) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => {
                  buttonPress();
                  selectionHaptic();
                  onPhaseChange(tab.id as any);
                }}
                style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, backgroundColor: currentTab === tab.id ? theme.accentEvent + '20' : 'transparent' }}
              >
                <Feather name={tab.icon as any} color={currentTab === tab.id ? theme.accentEvent : theme.textSecondary} size={20} />
                <Text style={{ color: currentTab === tab.id ? theme.accentEvent : theme.textSecondary, fontSize: 10, marginTop: 2, fontWeight: currentTab === tab.id ? '700' : '500' }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FadeInUpView>
      </View>
    </SafeAreaView>
  );
};
