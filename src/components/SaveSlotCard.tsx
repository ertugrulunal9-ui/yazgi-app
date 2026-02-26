import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SaveSlotMetadata } from '../save/SaveSlot';
import { formatPlaytime, formatLastPlayed } from '../utils/saveUtils';
import { tRuntime } from '../i18n/strings';

interface SaveSlotCardProps {
  metadata: SaveSlotMetadata;
  onLoad: (slotId: string) => void;
  onSave: (slotId: string) => void;
  onDelete: (slotId: string) => void;
  onExport: (slotId: string) => void;
  isCurrentSlot: boolean;
  isAutoSave?: boolean;
  theme: {
    surfaceBase: string;
    surfaceRaised: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    accentEvent: string;
  };
}

export const SaveSlotCard: React.FC<SaveSlotCardProps> = ({
  metadata,
  onLoad,
  onSave,
  onDelete,
  onExport,
  isCurrentSlot,
  isAutoSave = false,
  theme,
}) => {
  const isEmpty = metadata.status === 'empty';
  const isCorrupted = metadata.status === 'corrupted';

  const getStatusStyle = () => {
    if (isCorrupted) return { borderColor: '#ef4444', backgroundColor: 'rgba(127, 29, 29, 0.2)' };
    if (isCurrentSlot) return { borderColor: '#3b82f6', backgroundColor: 'rgba(30, 58, 138, 0.2)' };
    if (isEmpty) return { borderColor: '#374151', backgroundColor: 'rgba(17, 24, 39, 0.5)' };
    return { borderColor: '#4b5563', backgroundColor: theme.surfaceBase };
  };

  const handleLoad = () => {
    if (!isEmpty && !isCorrupted) {
      onLoad(metadata.slotId);
    }
  };

  const handleSave = () => {
    onSave(metadata.slotId);
  };

  const handleDelete = () => {
    if (!isEmpty && !isAutoSave) {
      onDelete(metadata.slotId);
    }
  };

  const handleExport = () => {
    if (!isEmpty && !isCorrupted) {
      onExport(metadata.slotId);
    }
  };

  const statusStyle = getStatusStyle();

  if (isEmpty) {
    return (
      <TouchableOpacity
        onPress={handleSave}
        style={[styles.card, styles.emptyCard, { borderColor: statusStyle.borderColor, backgroundColor: statusStyle.backgroundColor }]}
        accessibilityLabel={tRuntime('save.emptySlotAria', { slotId: metadata.slotId })}
        accessibilityRole="button"
      >
        <View style={styles.emptyContent}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>➕</Text>
          </View>
          <Text style={styles.emptyTitle}>{tRuntime('save.emptySlot')}</Text>
          <Text style={styles.emptySubtitle}>{tRuntime('save.tapToSave')}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, { borderColor: statusStyle.borderColor, backgroundColor: statusStyle.backgroundColor }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {isAutoSave ? (
            <Text style={styles.autoSaveLabel}>{tRuntime('save.autoSave')}</Text>
          ) : (
            <Text style={[styles.slotLabel, { color: theme.textPrimary }]}>{tRuntime('save.slotLabel', { slotId: metadata.slotId })}</Text>
          )}
          {isCorrupted && (
            <View style={styles.corruptedBadge}>
              <Feather name="alert-triangle" size={12} color="#ef4444" />
              <Text style={styles.corruptedText}>{tRuntime('save.corrupted')}</Text>
            </View>
          )}
          {isCurrentSlot && !isAutoSave && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>{tRuntime('save.active')}</Text>
            </View>
          )}
        </View>
        {!isAutoSave && (
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteButton}
            accessibilityLabel={tRuntime('save.deleteSave')}
            accessibilityRole="button"
          >
            <Text style={styles.deleteButtonText}>{tRuntime('save.deleteBtn')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Character Info */}
      <View style={styles.characterInfo}>
        <View style={styles.infoRow}>
          <Feather name="user" size={16} color={theme.textSecondary} />
          <Text style={[styles.characterName, { color: theme.textPrimary }]}>{metadata.characterName}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={[styles.statText, { color: theme.textSecondary }]}>{tRuntime('save.ageLabel', { age: metadata.age })}</Text>
          <Text style={[styles.statDivider, { color: theme.textSecondary }]}>•</Text>
          <View style={styles.playtimeRow}>
            <Feather name="clock" size={12} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>{formatPlaytime(metadata.playtime)}</Text>
          </View>
        </View>
        <View style={styles.lastPlayedRow}>
          <Feather name="calendar" size={12} color="#9ca3af" />
          <Text style={styles.lastPlayedText}>{formatLastPlayed(metadata.lastPlayed)}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={handleLoad}
          disabled={isCorrupted}
          style={[styles.loadButton, { backgroundColor: theme.accentEvent }, isCorrupted && styles.buttonDisabled]}
          accessibilityLabel={tRuntime('save.loadSave')}
          accessibilityRole="button"
        >
          <Text style={styles.loadButtonText}>{tRuntime('save.loadBtn')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
          accessibilityLabel={tRuntime('save.saveBtn')}
          accessibilityRole="button"
        >
          <Text style={[styles.saveButtonText, { color: theme.textPrimary }]}>{tRuntime('save.saveBtn')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleExport}
          disabled={isCorrupted}
          style={[styles.exportButton, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }, isCorrupted && styles.buttonDisabled]}
          accessibilityLabel={tRuntime('save.exportSave')}
          accessibilityRole="button"
        >
          <Text style={styles.exportIcon}>📤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
  },
  emptyCard: {
    minHeight: 160,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autoSaveLabel: {
    color: '#60a5fa',
    fontWeight: '700',
    fontSize: 14,
  },
  slotLabel: {
    fontWeight: '700',
    fontSize: 14,
  },
  corruptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  corruptedText: {
    color: '#ef4444',
    fontSize: 12,
  },
  activeBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 14,
  },
  characterInfo: {
    marginBottom: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  characterName: {
    fontWeight: '700',
    fontSize: 15,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 13,
  },
  statDivider: {
    fontSize: 13,
  },
  playtimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastPlayedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastPlayedText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  loadButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  loadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  saveButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  exportButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  exportIcon: {
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    color: '#9ca3af',
    fontWeight: '600',
    fontSize: 14,
  },
  emptySubtitle: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 4,
  },
});

export default SaveSlotCard;
