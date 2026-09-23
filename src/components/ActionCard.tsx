import React, { useMemo } from 'react';
import { TouchableOpacity, Text, View, Platform } from 'react-native';

interface ActionCardProps {
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  onPress: () => void;
  theme: any;
}

export const ActionCard: React.FC<ActionCardProps> = ({ title, icon, color, bgColor, onPress, theme }) => {
  const cardStyle = useMemo(() => ({
    flex: 1,
    aspectRatio: 1.1,
    backgroundColor: theme.surfaceBase,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
      },
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.08)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  }), [theme.surfaceBase, theme.border]);

  const iconContainerStyle = useMemo(() => ({
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: bgColor,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: color,
  }), [bgColor, color]);

  const iconTextStyle = useMemo(() => ({
    fontSize: 18,
  }), []);

  const titleStyle = useMemo(() => ({
    color: theme.textPrimary,
    fontSize: 11,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    lineHeight: 14,
  }), [theme.textPrimary]);

  return (
    <TouchableOpacity
      onPress={(e) => {
        if (e && e.stopPropagation) {
          e.stopPropagation();
        }
        onPress();
      }}
      style={cardStyle}
      activeOpacity={0.7}
    >
      <View style={iconContainerStyle}>
        <Text style={iconTextStyle}>{icon}</Text>
      </View>
      <Text style={titleStyle}>{title}</Text>
    </TouchableOpacity>
  );
};
