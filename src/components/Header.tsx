import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { ThemeTokens } from '../utils/themeUtils';

interface HeaderProps {
  playerName: string;
  age: number;
  turn: number;
  avatarEmoji: string;
  theme: ThemeTokens;
}

/**
 * Header Component
 * 
 * Oyun ekranının üst kısmında sabit duran header.
 * Profil bilgisi, yaş ve dönem bilgisini gösterir.
 * 
 * Expo SDK 52 & React 18 New Architecture uyumlu
 */
export const Header: React.FC<HeaderProps> = React.memo(({ playerName, age, turn, avatarEmoji, theme }) => {
  const headerStyle = useMemo(() => ({
    ...styles.header,
    backgroundColor: theme.surfaceRaised,
    borderBottomColor: theme.border,
  }), [theme.surfaceRaised, theme.border]);

  const playerNameStyle = useMemo(() => ({
    ...styles.playerName,
    color: theme.textPrimary,
  }), [theme.textPrimary]);

  const ageStyle = useMemo(() => ({
    ...styles.age,
    color: theme.textSecondary,
  }), [theme.textSecondary]);

  const avatarContainerStyle = useMemo(() => ({
    ...styles.avatarContainer,
    backgroundColor: theme.surfaceBase,
    borderColor: theme.accentEvent,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
      },
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.15)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  }), [theme.surfaceBase, theme.accentEvent]);

  const avatarStyle = useMemo(() => ({
    ...styles.avatar,
  }), []);

  return (
    <View style={headerStyle}>
      {/* Sol taraf - Oyuncu bilgileri */}
      <View style={styles.headerLeft}>
        <Text style={playerNameStyle}>{playerName}</Text>
        <Text style={ageStyle}>{age} Yaş • {turn}/4. Dönem</Text>
      </View>

      {/* Sağ taraf - Avatar */}
      <View style={avatarContainerStyle}>
        <Text style={avatarStyle}>{avatarEmoji}</Text>
      </View>
    </View>
  );
});

Header.displayName = 'Header';

const styles = StyleSheet.create({
  header: {
    flexShrink: 0, // Header'ın küçülmesini engelle
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  age: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    fontSize: 24,
    lineHeight: 24,
  },
});
