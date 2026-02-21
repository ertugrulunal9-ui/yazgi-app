import React, { useMemo } from 'react';
import { Animated, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FadeInUpView } from '../animations';
import { Card, TypewriterText } from './ui';
import { ensureTextContrast } from '../utils/colorContrast';
import { GameEvent } from '../types';

type EventVisual = {
  color: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
};

const EVENT_VISUALS: Record<string, EventVisual> = {
  SOCIAL: { color: '#3b82f6', icon: 'users', label: 'social' },
  RISK: { color: '#ea580c', icon: 'alert-triangle', label: 'risk' },
  MORAL: { color: '#7e22ce', icon: 'shield', label: 'moral' },
  CONFLICT: { color: '#dc2626', icon: 'crosshair', label: 'conflict' },
  BREAKDOWN: { color: '#b91c1c', icon: 'activity', label: 'breakdown' },
  GROWTH: { color: '#15803d', icon: 'trending-up', label: 'growth' },
};

interface EventNarrativeProps {
  event: GameEvent;
  eventText: string;
  theme: any;
  metrics: any;
  isDramaticEvent: boolean;
  isBreakdownEvent: boolean;
  breakdownShakeX: Animated.Value;
}

export const EventNarrative: React.FC<EventNarrativeProps> = React.memo(({
  event,
  eventText,
  theme,
  metrics,
  isDramaticEvent,
  isBreakdownEvent,
  breakdownShakeX,
}) => {
  const eventVisual = EVENT_VISUALS[event.personalityCategory || ''] || {
    color: theme.accentEvent,
    icon: 'bell' as const,
    label: 'event',
  };
  const eventColor = ensureTextContrast(eventVisual.color, theme.surfaceBase, 4.5);

  const cardStyle = useMemo(() => ({
    backgroundColor: theme.surfaceBase,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: metrics.pad,
    marginBottom: 20,
  }), [metrics.pad, theme.border, theme.surfaceBase]);

  const eventTextStyle = useMemo(() => ({
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 12,
    lineHeight: 22,
  }), [theme.textPrimary]);

  return (
    <FadeInUpView>
      <Animated.View style={isBreakdownEvent ? { transform: [{ translateX: breakdownShakeX }] } : undefined}>
        <Card
          style={[
            cardStyle,
            {
              borderColor: isDramaticEvent ? '#d97706' : eventColor,
              borderLeftWidth: isDramaticEvent ? 3 : 4,
              borderWidth: isDramaticEvent ? 2 : 1,
              overflow: 'hidden',
            },
          ]}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 44,
              backgroundColor: `${eventColor}12`,
            }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
            <Feather name={eventVisual.icon} size={14} color={eventColor} />
            <Text
              allowFontScaling
              style={{
                color: eventColor,
                fontSize: 12,
                fontWeight: '700',
                fontFamily: theme.fontHeading,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {eventVisual.label}
            </Text>
          </View>

          {isDramaticEvent && (
            <View style={{
              backgroundColor: 'rgba(217, 119, 6, 0.12)',
              borderRadius: 8,
              paddingVertical: 6,
              paddingHorizontal: 10,
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}>
              <Text style={{ fontSize: 14 }}>
                {(event.tags ?? []).includes('turning_point') ? '\uD83C\uDF1F' : '\u26A1'}
              </Text>
              <Text style={{
                color: '#d97706',
                fontSize: 12,
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                {(event.tags ?? []).includes('turning_point') ? 'D\u00F6n\u00FCm Noktas\u0131' : 'Kritik Karar'}
              </Text>
            </View>
          )}

          <TypewriterText
            text={eventText}
            speed={28}
            accessibilityLabel="Event metni"
            style={eventTextStyle}
          />
        </Card>
      </Animated.View>
    </FadeInUpView>
  );
});

EventNarrative.displayName = 'EventNarrative';
