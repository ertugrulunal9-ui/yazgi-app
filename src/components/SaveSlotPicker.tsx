import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Download, Upload, Lock } from 'lucide-react';
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
}

export const SaveSlotPicker: React.FC<SaveSlotPickerProps> = ({
  isOpen,
  onClose,
  currentPlayerName,
  currentStats,
  currentGameState,
  onLoadSlot,
  currentSlotId,
}) => {
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
    if (confirm('Bu kayıt silinecek. Emin misin?')) {
      setIsLoading(true);
      try {
        await SaveManager.deleteSlot(slotId);
        await loadSlots();
      } catch (error) {
        console.error('Delete failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExport = (slotId: string) => {
    setExportSlotId(slotId);
    setShowExportModal(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur flex items-center justify-center p-4 animate-fade-in">
      <div className="ui-modal w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary">Kayıt Slotları</h2>
            <p className="text-sm text-secondary mt-1">
              {SaveManager.getAvailableSlots()} slot kullanılabilir
            </p>
          </div>
          <button
            onClick={onClose}
            className="pressable surface-raised border border-default rounded-lg p-2"
          >
            <X className="icon-density" />
          </button>
        </div>

        {/* Premium Banner */}
        <div className="surface-raised border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="font-bold text-yellow-500">Premium Slotlar</p>
              <p className="text-sm text-gray-400">3 ekstra slot aç</p>
            </div>
          </div>
          <button className="pressable bg-yellow-600 hover:bg-yellow-500 border-2 border-yellow-500 text-white font-bold py-2 px-4 rounded-lg text-sm">
            Kilidi Aç
          </button>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={loadSlots}
            disabled={isLoading}
            className="pressable surface-raised border border-default rounded-lg px-3 py-2 flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>

        {/* Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map((metadata) => (
            <SaveSlotCard
              key={metadata.slotId}
              metadata={metadata}
              onLoad={handleLoad}
              onSave={handleSave}
              onDelete={handleDelete}
              onExport={handleExport}
              isCurrentSlot={metadata.slotId === currentSlotId}
              isAutoSave={metadata.slotId === 'auto'}
            />
          ))}
        </div>

        {/* Import/Export Footer */}
        <div className="mt-6 pt-4 border-t border-default flex gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex-1 pressable surface-raised border border-default rounded-lg py-3 flex items-center justify-center gap-2 font-semibold"
          >
            <Download className="w-4 h-4" />
            İçe Aktar
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && exportSlotId && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur flex items-center justify-center p-4">
          <div className="ui-modal w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-primary">Kayıt Dışa Aktar</h3>
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportSlotId(null);
                }}
                className="pressable surface-raised border border-default rounded-lg p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-secondary mb-4">
              Export/import işlemleri için SaveExportModal component'i kullanılacak
            </p>
            <button
              onClick={() => {
                setShowExportModal(false);
                setExportSlotId(null);
              }}
              className="w-full pressable accent-event-bg accent-event-border text-white font-bold py-3 rounded-xl"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
