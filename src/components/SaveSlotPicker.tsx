import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SaveSlotMetadata } from '../save/SaveSlot';
import { SaveSlotCard } from './SaveSlotCard';
import SaveManager from '../save/SaveManager';

interface SaveSlotPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayerName: string;
  currentStats: any;
  currentGameState: any;
  onLoadSlot: (slotId: string) => void;
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

  useEffect(() => {
    if (isOpen) {
      loadSlots();
    }
  }, [isOpen]);

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
        onLoadSlot(slotId);
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
    setShowExportModal(true);
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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

          {/* Premium Banner */}
          <View style={styles.premiumBanner}>
            <View style={styles.premiumLeft}>
              <Feather name="lock" size={24} color="#eab308" />
              <View>
                <Text style={styles.premiumTitle}>Premium Slotlar</Text>
                <Text style={styles.premiumSubtitle}>3 ekstra slot aç</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.premiumButton}
              accessibilityLabel="Premium slotların kilidini aç"
              accessibilityRole="button"
            >
              <Text style={styles.premiumButtonText}>Kilidi Aç</Text>
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
              onPress={() => setShowExportModal(true)}
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

      {/* Export Modal */}
      {showExportModal && exportSlotId && (
        <Modal visible={showExportModal} animationType="fade" transparent>
          <View style={styles.exportOverlay}>
            <View style={[styles.exportContainer, { backgroundColor: theme.surfaceBase, borderColor: theme.border }]}>
              <View style={styles.exportHeader}>
                <Text style={[styles.exportTitle, { color: theme.textPrimary }]}>Kayıt Dışa Aktar</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowExportModal(false);
                    setExportSlotId(null);
                  }}
                  style={[styles.closeButton, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
                  accessibilityLabel="Kapat"
                  accessibilityRole="button"
                >
                  <Feather name="x" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.exportDescription, { color: theme.textSecondary }]}>
                Export/import işlemleri için SaveExportModal component'i kullanılacak
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowExportModal(false);
                  setExportSlotId(null);
                }}
                style={[styles.exportCloseButton, { backgroundColor: theme.accentEvent }]}
                accessibilityLabel="Kapat"
                accessibilityRole="button"
              >
                <Text style={styles.exportCloseButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    borderRadius: 16,
    borderWidth: 1,
    maxHeight: '90%',
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
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    borderRadius: 16,
  },
  premiumLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  premiumTitle: {
    color: '#eab308',
    fontWeight: '700',
    fontSize: 14,
  },
  premiumSubtitle: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 2,
  },
  premiumButton: {
    backgroundColor: '#ca8a04',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#eab308',
    minHeight: 44,
    justifyContent: 'center',
  },
  premiumButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
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
  exportOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  exportContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
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
