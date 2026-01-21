import React, { useState } from 'react';
import { X, Download, Upload, Copy, QrCode, FileJson, Check } from 'lucide-react';
import SaveManager from '../save/SaveManager';
import { copyToClipboard, readFromClipboard, downloadFile, readFile, generateQRCode } from '../utils/saveUtils';
import { getCurrentSlotId } from '../utils/gameUtils';

interface SaveExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaveExportModal: React.FC<SaveExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [slotId, setSlotId] = useState<string>(getCurrentSlotId());
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportData, setExportData] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [importData, setImportData] = useState<string>('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExport = async () => {
    const data = await SaveManager.exportSlot(slotId);
    if (data) {
      setExportData(data);
      const qrUrl = generateQRCode(data);
      setQrCodeUrl(qrUrl);
    }
  };

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
    const filename = `yazgi_save_slot${slotId}_${Date.now()}.json`;
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
      const success = await SaveManager.importSlot(slotId, importData);
      setImportStatus(success ? 'success' : 'error');
      if (success) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      setImportStatus('error');
    }
  };

  React.useEffect(() => {
    if (isOpen && activeTab === 'export' && !exportData) {
      handleExport();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur flex items-center justify-center p-4 animate-fade-in">
      <div className="ui-modal w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Kayıt İçe/Dışa Aktar</h2>
          <button
            onClick={onClose}
            className="pressable surface-raised border border-default rounded-lg p-2"
          >
            <X className="icon-density" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
              activeTab === 'export'
                ? 'accent-event-bg accent-event-border text-white'
                : 'surface-raised border border-default'
            }`}
          >
            <Download className="w-4 h-4 inline-block mr-2" />
            Dışa Aktar
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
              activeTab === 'import'
                ? 'accent-event-bg accent-event-border text-white'
                : 'surface-raised border border-default'
            }`}
          >
            <Upload className="w-4 h-4 inline-block mr-2" />
            İçe Aktar
          </button>
        </div>

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <p className="text-sm text-secondary">
              Kayıt dosyanı JSON formatında dışa aktar, panoya kopyala veya QR kod ile paylaş.
            </p>

            {/* Export Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={handleCopyToClipboard}
                disabled={!exportData}
                className="pressable surface-raised border border-default rounded-lg py-4 flex flex-col items-center gap-2 disabled:opacity-50"
              >
                {copiedToClipboard ? (
                  <>
                    <Check className="w-6 h-6 text-green-500" />
                    <span className="font-semibold text-green-500">Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-6 h-6" />
                    <span className="font-semibold">Panoya Kopyala</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadJSON}
                disabled={!exportData}
                className="pressable surface-raised border border-default rounded-lg py-4 flex flex-col items-center gap-2 disabled:opacity-50"
              >
                <FileJson className="w-6 h-6" />
                <span className="font-semibold">JSON İndir</span>
              </button>

              <button
                onClick={handleExport}
                disabled={!exportData}
                className="pressable surface-raised border border-default rounded-lg py-4 flex flex-col items-center gap-2 disabled:opacity-50"
              >
                <QrCode className="w-6 h-6" />
                <span className="font-semibold">QR Kod</span>
              </button>
            </div>

            {/* QR Code Display */}
            {qrCodeUrl && (
              <div className="surface-raised border border-default rounded-xl p-6 flex flex-col items-center">
                <p className="text-sm text-secondary mb-4">QR Kodu Tara:</p>
                <img src={qrCodeUrl} alt="Save QR Code" className="w-48 h-48 rounded-lg" />
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Bu QR kodu tarayarak kayıt dosyasını başka cihaza aktarabilirsin
                </p>
              </div>
            )}

            {/* Export Data Preview */}
            {exportData && (
              <div className="surface-raised border border-default rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2">JSON Önizleme:</p>
                <pre className="text-xs text-secondary overflow-x-auto max-h-32 p-3 bg-black/30 rounded-lg">
                  {exportData.substring(0, 500)}...
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <p className="text-sm text-secondary">
              Dışa aktarılan kayıt dosyasını JSON veya panodan içe aktar.
            </p>

            {/* Import Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={handlePasteFromClipboard}
                className="pressable surface-raised border border-default rounded-lg py-4 flex flex-col items-center gap-2"
              >
                <Copy className="w-6 h-6" />
                <span className="font-semibold">Panodan Yapıştır</span>
              </button>

              <button
                onClick={handleImportFromFile}
                className="pressable surface-raised border border-default rounded-lg py-4 flex flex-col items-center gap-2"
              >
                <FileJson className="w-6 h-6" />
                <span className="font-semibold">Dosyadan Yükle</span>
              </button>
            </div>

            {/* Import Data Input */}
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Kayıt verisini buraya yapıştır veya yukarıdaki butonları kullan..."
              className="w-full h-48 surface-base border border-default rounded-xl p-4 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />

            {/* Import Status */}
            {importStatus === 'success' && (
              <div className="surface-raised border-2 border-green-500 bg-green-950/20 rounded-xl p-4 flex items-center gap-3">
                <Check className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-bold text-green-500">İçe Aktarma Başarılı!</p>
                  <p className="text-sm text-gray-400">Kayıt yüklendi.</p>
                </div>
              </div>
            )}

            {importStatus === 'error' && (
              <div className="surface-raised border-2 border-red-500 bg-red-950/20 rounded-xl p-4 flex items-center gap-3">
                <X className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-bold text-red-500">İçe Aktarma Başarısız</p>
                  <p className="text-sm text-gray-400">Geçersiz kayıt formatı.</p>
                </div>
              </div>
            )}

            {/* Import Button */}
            <button
              onClick={handleImport}
              disabled={!importData.trim() || importStatus === 'success'}
              className="w-full pressable accent-event-bg accent-event-border text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              İçe Aktar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
