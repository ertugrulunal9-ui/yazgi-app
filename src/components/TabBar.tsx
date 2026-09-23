import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { buttonPress, selectionHaptic } from '../animations';
import { useUI } from '../context/UIContext';

export interface TabItem {
  id: string;
  label: string;
  icon: string;
}

interface TabBarProps {
  tabs?: TabItem[];
  currentTab: string;
  onTabPress: (tabId: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  currentTab,
  onTabPress,
}) => {
  const { theme, t } = useUI();

  const defaultTabs = useMemo<TabItem[]>(() => ([
    { id: 'hub', label: t('tabs.hub', undefined, 'Ana Sayfa'), icon: 'home' },
    { id: 'character', label: t('tabs.character', undefined, 'Karakter'), icon: 'user' },
    { id: 'skilltree', label: t('tabs.skilltree', undefined, 'Yetenekler'), icon: 'git-branch' },
    { id: 'social', label: t('tabs.social', undefined, 'Sosyal'), icon: 'users' },
  ]), [t]);

  const resolvedTabs = tabs || defaultTabs;

  const handlePress = useCallback((tabId: string) => {
    buttonPress();
    selectionHaptic();
    onTabPress(tabId);
  }, [onTabPress]);

  const tabBarStyle = useMemo(() => ({
    backgroundColor: theme.surfaceRaised,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 10,
    flexDirection: 'row' as const,
    gap: 8,
    justifyContent: 'space-around' as const,
  }), [theme.surfaceRaised]);

  const tabItemStyle = useMemo(() => ({
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: 10,
    borderRadius: 12,
  }), []);

  return (
    <View style={tabBarStyle}>
      {resolvedTabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => handlePress(tab.id)}
            style={[
              tabItemStyle,
              { backgroundColor: isActive ? theme.accentEvent + '20' : 'transparent' }
            ]}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityHint={`${tab.label} sekmesine gecer`}
            accessibilityState={{ selected: isActive }}
          >
            <Feather
              name={tab.icon as any}
              color={isActive ? theme.accentEvent : theme.textSecondary}
              size={22}
            />
            <Text style={{
              color: isActive ? theme.accentEvent : theme.textSecondary,
              fontSize: 11,
              marginTop: 4,
              fontWeight: isActive ? '700' : '500'
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
