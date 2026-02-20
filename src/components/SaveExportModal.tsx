import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import SaveManager from '../save/SaveManager';
import { copyToClipboard, readFromClipboard, downloadFile, readFile } from '../utils/saveUtils';
import { getCurrentSlotId } from '../utils/gameUtils';

interface SaveExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotId?: string;
  initialTab?: 'export' | 'import';
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

export const SaveExportModal: React.FC<SaveExportModalProps> = ({
  isOpen,
  onClose,
  slotId,
  initialTab = 'export',
  theme,
}) => {
  const insets = useSafeAreaInsets();
  const resolvedSlotId = slotId ?? getCurrentSlotId();
  const [activeTab, setActiveTab] = useState<'export' | 'import'>(initialTab);
  const [exportData, setExportData] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [importData, setImportData] = useState<string>('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExport = useCallback(async () => {
    const data = await SaveManager.exportSlot(resolvedSlotId);
    if (data) {
      setExportData(data);
    }
  }, [resolvedSlotId]);

  const handleGenerateQRCode = useCallback(async () => {
    if (exportData) {
      setShowQRCode(true);
      return;
    }

    const data = await SaveManager.exportSlot(resolvedSlotId);
    if (!data) return;

    setExportData(data);
    setShowQRCode(true);
  }, [exportData, resolvedSlotId]);

  const handleCopyToClipboard = async () => {
    if (!exportData) return;
    const success = await copyToClipboard(exportData);
    if (success) {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  const handleDownloadJSON = () => {
    if (!exportData) return;
    const filename = `yazgi_save_slot${resolvedSlotId}_${Date.now()}.json`;
    downloadFile(filename, exportData);
  };

  const handlePasteFromClipboard = async () => {
    const data = await readFromClipboard();
    if (data) {
      setImportData(data);
    }
  };

  const handleImportFromFile = async () => {
    const data = await readFile();
    if (data) {
      setImportData(data);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) return;

    try {
      const success = await SaveManager.importSlot(resolvedSlotId, importData);
      setImportStatus(success ? 'success' : 'error');
      if (success) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch {
      setImportStatus('error');
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    setExportData(null);
    setShowQRCode(false);
    setCopiedToClipboard(false);
    setImportStatus('idle');
  }, [isOpen, resolvedSlotId]);

  useEffect(() => {
    if (isOpen && activeTab === 'export' && !exportData) {
      void handleExport();
    }
  }, [isOpen, activeTab, exportData, handleExport]);

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="fade" transparent>
      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={[styles.container, { backgroundColor: theme.surfaceBase, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Kayıt İçe/Dışa Aktar</Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
              accessibilityLabel="Kapat"
              accessibilityRole="button"
            >
              <Feather name="x" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => setActiveTab('export')}
              style={[
                styles.tab,
                activeTab === 'export'
                  ? { backgroundColor: theme.accentEvent }
                  : { backgroundColor: theme.surfaceRaised, borderColor: theme.border, borderWidth: 1 },
              ]}
              accessibilityLabel="Dışa aktar sekmesi"
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'export' }}
            >
              <Feather name="download" size={16} color={activeTab === 'export' ? '#fff' : theme.textSecondary} />
              <Text style={[styles.tabText, { color: activeTab === 'export' ? '#fff' : theme.textPrimary }]}>
                Dışa Aktar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('import')}
              style={[
                styles.tab,
                activeTab === 'import'
                  ? { backgroundColor: theme.accentEvent }
                  : { backgroundColor: theme.surfaceRaised, borderColor: theme.border, borderWidth: 1 },
              ]}
              accessibilityLabel="İçe aktar sekmesi"
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'import' }}
            >
              <Feather name="upload" size={16} color={activeTab === 'import' ? '#fff' : theme.textSecondary} />
              <Text style={[styles.tabText, { color: activeTab === 'import' ? '#fff' : theme.textPrimary }]}>
                İçe Aktar
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {/* Export Tab */}
            {activeTab === 'export' && (
              <View style={styles.tabContent}>
                <Text style={[styles.description, { color: theme.textSecondary }]}>
                  Kayıt dosyanı JSON formatında dışa aktar, panoya kopyala veya QR kod ile paylaş.
                </Text>

                {/* Export Actions */}
                <View style={styles.actionsGrid}>
                  <TouchableOpacity
                    onPress={handleCopyToClipboard}
                    disabled={!exportData}
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                      !exportData && styles.actionButtonDisabled,
                    ]}
                    accessibilityLabel="Panoya kopyala"
                    accessibilityRole="button"
                  >
                    {copiedToClipboard ? (
                      <>
                        <Feather name="check" size={24} color="#22c55e" />
                        <Text style={[styles.actionButtonText, { color: '#22c55e' }]}>Kopyalandı!</Text>
                      </>
                    ) : (
                      <>
                        <Feather name="copy" size={24} color={theme.textPrimary} />
                        <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>Panoya Kopyala</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleDownloadJSON}
                    disabled={!exportData}
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                      !exportData && styles.actionButtonDisabled,
                    ]}
                    accessibilityLabel="JSON dosyası indir"
                    accessibilityRole="button"
                  >
                    <Feather name="file-text" size={24} color={theme.textPrimary} />
                    <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>JSON İndir</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleGenerateQRCode}
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
                    ]}
                    accessibilityLabel="QR kod oluştur"
                    accessibilityRole="button"
                  >
                    <Feather name="grid" size={24} color={theme.textPrimary} />
                    <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>QR Kod</Text>
                  </TouchableOpacity>
                </View>

                {/* QR Code Display */}
                {showQRCode && exportData && (
                  <View style={[styles.qrContainer, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
                    <Text style={[styles.qrLabel, { color: theme.textSecondary }]}>QR Kodu Tara:</Text>
                    <View style={styles.qrCodeFrame}>
                      <QRCode value={exportData} size={192} quietZone={8} />
                    </View>
                    <Text style={[styles.qrHint, { color: theme.textSecondary }]}>
                      Bu QR kodu tarayarak kayıt dosyasını başka cihaza aktarabilirsin
                    </Text>
                  </View>
                )}

                {/* Export Data Preview */}
                {exportData && (
                  <View style={[styles.previewContainer, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
                    <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>JSON Önizleme:</Text>
                    <ScrollView horizontal style={styles.previewScroll}>
                      <Text style={[styles.previewText, { color: theme.textSecondary }]}>
                        {exportData.substring(0, 500)}...
                      </Text>
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {/* Import Tab */}
            {activeTab === 'import' && (
              <View style={styles.tabContent}>
                <Text style={[styles.description, { color: theme.textSecondary }]}>
                  Dışa aktarılan kayıt dosyasını JSON veya panodan içe aktar.
                </Text>

                {/* Import Actions */}
                <View style={styles.importActionsGrid}>
                  <TouchableOpacity
                    onPress={handlePasteFromClipboard}
                    style={[styles.actionButton, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
                    accessibilityLabel="Panodan yapıştır"
                    accessibilityRole="button"
                  >
                    <Feather name="clipboard" size={24} color={theme.textPrimary} />
                    <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>Panodan Yapıştır</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleImportFromFile}
                    style={[styles.actionButton, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
                    accessibilityLabel="Dosyadan yükle"
                    accessibilityRole="button"
                  >
                    <Feather name="file-text" size={24} color={theme.textPrimary} />
                    <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>Dosyadan Yükle</Text>
                  </TouchableOpacity>
                </View>

                {/* Import Data Input */}
                <TextInput
                  value={importData}
                  onChangeText={setImportData}
                  placeholder="Kayıt verisini buraya yapıştır veya yukarıdaki butonları kullan..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: theme.surfaceBase,
                      borderColor: theme.border,
                      color: theme.textPrimary,
                    },
                  ]}
                  accessibilityLabel="Kayıt verisi girişi"
                />

                {/* Import Status */}
                {importStatus === 'success' && (
                  <View style={styles.successBanner}>
                    <Feather name="check-circle" size={24} color="#22c55e" />
                    <View>
                      <Text style={styles.successTitle}>İçe Aktarma Başarılı!</Text>
                      <Text style={styles.successSubtitle}>Kayıt yüklendi.</Text>
                    </View>
                  </View>
                )}

                {importStatus === 'error' && (
                  <View style={styles.errorBanner}>
                    <Feather name="x-circle" size={24} color="#ef4444" />
                    <View>
                      <Text style={styles.errorTitle}>İçe Aktarma Başarısız</Text>
                      <Text style={styles.errorSubtitle}>Geçersiz kayıt formatı.</Text>
                    </View>
                  </View>
                )}

                {/* Import Button */}
                <TouchableOpacity
                  onPress={handleImport}
                  disabled={!importData.trim() || importStatus === 'success'}
                  style={[
                    styles.importButton,
                    { backgroundColor: theme.accentEvent },
                    (!importData.trim() || importStatus === 'success') && styles.importButtonDisabled,
                  ]}
                  accessibilityLabel="İçe aktar"
                  accessibilityRole="button"
                >
                  <Text style={styles.importButtonText}>İçe Aktar</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
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
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    paddingBottom: 0,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minHeight: 48,
  },
  tabText: {
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  tabContent: {
    gap: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  importActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 80,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 13,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  qrLabel: {
    fontSize: 14,
    marginBottom: 16,
  },
  qrCodeFrame: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
  },
  qrHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  previewContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  previewLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  previewScroll: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
    maxHeight: 100,
  },
  previewText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  textArea: {
    minHeight: 150,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(6, 78, 59, 0.3)',
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: 16,
    padding: 16,
  },
  successTitle: {
    fontWeight: '700',
    color: '#22c55e',
    fontSize: 14,
  },
  successSubtitle: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(127, 29, 29, 0.3)',
    borderWidth: 2,
    borderColor: '#ef4444',
    borderRadius: 16,
    padding: 16,
  },
  errorTitle: {
    fontWeight: '700',
    color: '#ef4444',
    fontSize: 14,
  },
  errorSubtitle: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 2,
  },
  importButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  importButtonDisabled: {
    opacity: 0.5,
  },
  importButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default SaveExportModal;
