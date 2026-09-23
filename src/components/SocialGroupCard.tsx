import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { NPC, SocialGroup } from '../types';
import type { ThemeTokens } from '../utils/themeUtils';
import { NPCCard } from './NPCCard';

interface SocialGroupCardProps {
  group: SocialGroup;
  members: NPC[];
  theme: ThemeTokens;
  onLeaveGroup?: (groupId: string) => void;
}

const GROUP_TYPE_LABELS: Record<SocialGroup['type'], string> = {
  CLIQUE: 'Clique',
  CLUB: 'Kulup',
  FRIEND_GROUP: 'Arkadas',
  STUDY_GROUP: 'Calisma',
};

const GROUP_TYPE_COLORS: Record<SocialGroup['type'], string> = {
  CLIQUE: '#f59e0b',
  CLUB: '#3b82f6',
  FRIEND_GROUP: '#10b981',
  STUDY_GROUP: '#8b5cf6',
};

export const SocialGroupCard: React.FC<SocialGroupCardProps> = ({
  group,
  members,
  theme,
  onLeaveGroup,
}) => {
  const typeColor = GROUP_TYPE_COLORS[group.type] ?? theme.accentBrand;
  const reputationPercent = Math.max(0, Math.min(100, group.reputation || 0));

  return (
    <View
      style={{
        backgroundColor: theme.surfaceBase,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '700' }} numberOfLines={1}>
            {group.name}
          </Text>
          <View
            style={{
              marginTop: 5,
              alignSelf: 'flex-start',
              borderRadius: 999,
              borderWidth: 1,
              borderColor: `${typeColor}88`,
              backgroundColor: `${typeColor}22`,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: typeColor, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>
              {GROUP_TYPE_LABELS[group.type]}
            </Text>
          </View>
        </View>

        {group.isPlayerMember && onLeaveGroup && (
          <TouchableOpacity
            onPress={() => onLeaveGroup(group.id)}
            style={{
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#ef4444aa',
              backgroundColor: '#ef444422',
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}
            accessibilityRole="button"
            accessibilityLabel="Grubu birak"
          >
            <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '700' }}>Grubu Birak</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ marginTop: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 11, textTransform: 'uppercase' }}>Reputation</Text>
          <Text style={{ color: typeColor, fontSize: 12, fontWeight: '700' }}>{reputationPercent}%</Text>
        </View>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.border, overflow: 'hidden' }}>
          <View
            style={{
              width: `${reputationPercent}%`,
              height: '100%',
              backgroundColor: typeColor,
            }}
          />
        </View>
      </View>

      <View style={{ marginTop: 10, flexDirection: 'row', flexWrap: 'wrap' }}>
        {members.length > 0 ? (
          members.slice(0, 6).map(member => (
            <NPCCard
              key={`${group.id}_${member.id}`}
              npc={member}
              compact
              theme={{
                surface: theme.surfaceRaised,
                textPrimary: theme.textPrimary,
                textSecondary: theme.textSecondary,
                border: theme.border,
                accent: theme.accentBrand,
              }}
            />
          ))
        ) : (
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Bu grupta uye yok.</Text>
        )}
      </View>
    </View>
  );
};
