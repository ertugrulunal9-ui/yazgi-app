import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator, StyleSheet, Pressable, Platform, BackHandler } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SaveSlotData, SaveSlotMetadata } from '../save/SaveSlot';
import { SaveSlotCard } from './SaveSlotCard';
import SaveExportModal from './SaveExportModal';
import SaveManager from '../save/SaveManager';
import { GameState, Stats } from '../types';

interface SaveSlotPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayerName: string;
  currentStats: Stats;
  currentGameState: GameState;
  onLoadSlot: (slotId: string, saveData: SaveSlotData) => void;
  currentSlotId?: string;
  theme: {
    appBg: string;
    surfaceBase: string;
    surfaceRaised: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    accentEvent: string;
  };
}

export const SaveSlotPicker: React.FC<SaveSlotPickerProps> = ({
  isOpen,
  onClose,
  currentPlayerName,
  currentStats,
  currentGameState,
  onLoadSlot,
  currentSlotId,
  theme,
}) => {
  const insets = useSafeAreaInsets();
  const [slots, setSlots] = useState<SaveSlotMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSlotId, setExportSlotId] = useState<string | null>(null);
  const [saveModalTab, setSaveModalTab] = useState<'export' | 'import'>('export');

  useEffect(() => {
    if (isOpen) {
      loadSlots();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [isOpen, onClose]);

  const loadSlots = async () => {
    setIsLoading(true);
    try {
      const metadata = await SaveManager.getAllSlotMetadata();
      setSlots(metadata);
    } catch (error) {
      console.error('Failed to load slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (slotId: string) => {
    setIsLoading(true);
    try {
      const success = await SaveManager.saveToSlot(
        slotId,
        currentPlayerName,
        currentStats,
        currentGameState
      );
      if (success) {
        await loadSlots();
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async (slotId: string) => {
    setIsLoading(true);
    try {
      const saveData = await SaveManager.loadFromSlot(slotId);
      if (saveData) {
        onLoadSlot(slotId, saveData);
        onClose();
      }
    } catch (error) {
      console.error('Load failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (slotId: string) => {
    Alert.alert(
      'Kaydı Sil',
      'Bu kayıt silinecek. Emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await SaveManager.deleteSlot(slotId);
              await loadSlots();
            } catch (error) {
              console.error('Delete failed:', error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleExport = (slotId: string) => {
    setExportSlotId(slotId);
    setSaveModalTab('export');
    setShowExportModal(true);
  };

  if (!isOpen) return null;

  const content = (
    <View
      style={[
        styles.modalRoot,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
        },
      ]}
    >
      <View style={[styles.container, { backgroundColor: theme.surfaceBase, borderColor: theme.border }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Kayıt Slotları</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {SaveManager.getAvailableSlots()} slot kullanılabilir
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
            accessibilityLabel="Kapat"
            accessibilityRole="button"
          >
            <Feather name="x" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Refresh Button */}
        <View style={styles.refreshRow}>
          <TouchableOpacity
            onPress={loadSlots}
            disabled={isLoading}
            style={[
              styles.refreshButton,
              { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
              isLoading && styles.buttonDisabled,
            ]}
            accessibilityLabel="Yenile"
            accessibilityRole="button"
          >
            <Feather name="refresh-cw" size={16} color={theme.textPrimary} />
            <Text style={[styles.refreshButtonText, { color: theme.textPrimary }]}>Yenile</Text>
          </TouchableOpacity>
        </View>

        {/* Slots List */}
        <ScrollView style={styles.slotsList} contentContainerStyle={styles.slotsListContent}>
          {isLoading && slots.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.accentEvent} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Yükleniyor...</Text>
            </View>
          ) : (
            slots.map((metadata) => (
              <View key={metadata.slotId} style={styles.slotCardWrapper}>
                <SaveSlotCard
                  metadata={metadata}
                  onLoad={handleLoad}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onExport={handleExport}
                  isCurrentSlot={metadata.slotId === currentSlotId}
                  isAutoSave={metadata.slotId === 'auto'}
                  theme={theme}
                />
              </View>
            ))
          )}
        </ScrollView>

        {/* Import Footer */}
        <View style={[styles.footer, { backgroundColor: theme.surfaceRaised, borderTopColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => {
              setExportSlotId(null);
              setSaveModalTab('import');
              setShowExportModal(true);
            }}
            style={[styles.importButton, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
            accessibilityLabel="İçe aktar"
            accessibilityRole="button"
          >
            <Feather name="download" size={16} color={theme.textPrimary} />
            <Text style={[styles.importButtonText, { color: theme.textPrimary }]}>İçe Aktar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  const overlay = (
    <View style={styles.overlayRoot} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={onClose} />
      {content}
    </View>
  );

  if (Platform.OS === 'android') {
    return (
      <>
        {overlay}
        <SaveExportModal
          isOpen={showExportModal}
          onClose={() => {
            setShowExportModal(false);
            setExportSlotId(null);
          }}
          slotId={exportSlotId ?? undefined}
          initialTab={saveModalTab}
          theme={theme}
        />
      </>
    );
  }

  return (
    <>
      <Modal
        visible={isOpen}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={onClose}
      >
        {overlay}
      </Modal>
      <SaveExportModal
        isOpen={showExportModal}
        onClose={() => {
          setShowExportModal(false);
          setExportSlotId(null);
        }}
        slotId={exportSlotId ?? undefined}
        initialTab={saveModalTab}
        theme={theme}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
    elevation: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalRoot: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    borderRadius: 16,
    borderWidth: 1,
    height: '90%',
    minHeight: 320,
    width: '100%',
    maxWidth: 680,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(107, 114, 128, 0.3)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 44,
  },
  refreshButtonText: {
    fontWeight: '600',
    fontSize: 13,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  slotsList: {
    flex: 1,
  },
  slotsListContent: {
    padding: 16,
    gap: 12,
  },
  slotCardWrapper: {
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  importButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  exportContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    width: '100%',
    maxWidth: 680,
  },
  exportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exportTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  exportDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  exportCloseButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  exportCloseButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default SaveSlotPicker;


