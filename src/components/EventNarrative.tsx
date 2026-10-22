import React, { useMemo } from 'react';
import { Animated, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { FadeInUpView } from '../animations';
import { Card, TypewriterText } from './ui';
import { ensureTextContrast } from '../utils/colorContrast';
import { GameEvent } from '../types';
import { tRuntime } from '../i18n/strings';

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
  causalLink?: { narrativeLine: string; emotion: string } | null;
  /** Seçim yapıldıktan sonra kaç alternatif yolun kapandığını gösterir. */
  blockedPathCount?: number;
  /** Olay geçmişteki bir seçimin yankısıysa: o yaş ve seçilen cevap */
  echo?: { age: number; choiceText: string } | null;
}

const ECHO_COLOR = '#a78bfa';

export const EventNarrative: React.FC<EventNarrativeProps> = React.memo(({
  event,
  eventText,
  theme,
  metrics,
  isDramaticEvent,
  isBreakdownEvent,
  breakdownShakeX,
  causalLink,
  blockedPathCount,
  echo,
}) => {
  const eventVisual = EVENT_VISUALS[event.personalityCategory || ''] || {
    color: theme.accentEvent,
    icon: 'bell' as const,
    label: 'event',
  };
  const eventColor = ensureTextContrast(eventVisual.color, theme.surfaceBase, 4.5);
  const eventLabel = tRuntime(
    `ui.event.types.${eventVisual.label}`,
    undefined,
    tRuntime('ui.event.types.event')
  );

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
    fontSize: 17,
    fontWeight: '600' as const,
    marginBottom: 4,
    lineHeight: 25,
  }), [theme.textPrimary]);

  return (
    <FadeInUpView>
      <Animated.View style={isBreakdownEvent ? { transform: [{ translateX: breakdownShakeX }] } : undefined}>
        <Card
          style={[
            cardStyle,
            {
              borderColor: isDramaticEvent ? '#d97706' : `${eventColor}88`,
              borderWidth: isDramaticEvent ? 2 : 1,
              overflow: 'hidden',
            },
          ]}
        >
          {/* Olay türünün renginde başlık bandı (kartın kenarlarına taşar) */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginTop: -metrics.pad,
              marginHorizontal: -metrics.pad,
              marginBottom: 14,
              paddingHorizontal: metrics.pad,
              paddingVertical: 10,
              backgroundColor: `${eventColor}26`,
              borderBottomWidth: 1,
              borderBottomColor: `${eventColor}55`,
            }}
          >
            <View style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: `${eventColor}33`,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Feather name={eventVisual.icon} size={15} color={eventColor} />
            </View>
            <Text
              allowFontScaling
              style={{
                color: eventColor,
                fontSize: 14,
                fontWeight: '800',
                fontFamily: theme.fontHeading,
                letterSpacing: 0.3,
              }}
            >
              {eventLabel}
            </Text>
          </View>

          {echo && (
            <Reanimated.View
              entering={FadeInDown.duration(450).delay(150)}
              accessible
              accessibilityRole="text"
              accessibilityLabel={`${tRuntime('ui.event.echo.title')}. ${tRuntime('ui.event.echo.line', { age: echo.age, choice: echo.choiceText })}`}
              style={{
                backgroundColor: `${ECHO_COLOR}1f`,
                borderColor: `${ECHO_COLOR}66`,
                borderWidth: 1,
                borderRadius: 10,
                paddingVertical: 8,
                paddingHorizontal: 10,
                marginBottom: 10,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <Feather name="rotate-ccw" size={13} color={ECHO_COLOR} />
                <Text style={{
                  color: ECHO_COLOR,
                  fontSize: 12,
                  fontWeight: '800',
                  letterSpacing: 0.3,
                }}>
                  {tRuntime('ui.event.echo.title')}
                </Text>
              </View>
              <Text style={{ color: theme.textPrimary, fontSize: 13, lineHeight: 18 }}>
                {tRuntime('ui.event.echo.line', { age: echo.age, choice: echo.choiceText })}
              </Text>
            </Reanimated.View>
          )}

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
                fontSize: 13,
                fontWeight: '800',
                letterSpacing: 0.3,
              }}>
                {(event.tags ?? []).includes('turning_point')
                ? tRuntime('ui.event.turningPoint')
                : tRuntime('ui.event.criticalDecision')}
              </Text>
            </View>
          )}

          {(blockedPathCount ?? 0) > 0 && (
            <View style={{
              backgroundColor: 'rgba(251, 146, 60, 0.08)',
              borderRadius: 8,
              paddingVertical: 5,
              paddingHorizontal: 10,
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}>
              <Feather name="lock" size={11} color="#fb923c" />
              <Text style={{
                color: '#fb923c',
                fontSize: 11,
                fontStyle: 'italic',
                flex: 1,
                lineHeight: 16,
              }}>
                {tRuntime('ui.event.blockedPaths')}
              </Text>
            </View>
          )}

          {causalLink?.narrativeLine && !echo && (
            <Text style={{
              color: theme.textSecondary,
              fontSize: 13,
              fontStyle: 'italic',
              lineHeight: 18,
              marginBottom: 8,
            }}>
              {causalLink.narrativeLine}
            </Text>
          )}
          <TypewriterText
            text={eventText}
            speed={28}
            accessibilityLabel={tRuntime('ui.event.accessibilityText')}
            style={eventTextStyle}
          />
        </Card>
      </Animated.View>
    </FadeInUpView>
  );
});

EventNarrative.displayName = 'EventNarrative';
