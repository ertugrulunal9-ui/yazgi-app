import React from 'react';
import { SaveSlotMetadata } from '../save/SaveSlot';
import { formatPlaytime, formatLastPlayed } from '../utils/saveUtils';
import { User, Clock, Calendar, AlertTriangle, Lock } from 'lucide-react';

interface SaveSlotCardProps {
  metadata: SaveSlotMetadata;
  onLoad: (slotId: string) => void;
  onSave: (slotId: string) => void;
  onDelete: (slotId: string) => void;
  onExport: (slotId: string) => void;
  isCurrentSlot: boolean;
  isAutoSave?: boolean;
}

export const SaveSlotCard: React.FC<SaveSlotCardProps> = ({
  metadata,
  onLoad,
  onSave,
  onDelete,
  onExport,
  isCurrentSlot,
  isAutoSave = false,
}) => {
  const isEmpty = metadata.status === 'empty';
  const isCorrupted = metadata.status === 'corrupted';
  const isLocked = metadata.isPremium && metadata.status === 'empty';

  const getStatusColor = () => {
    if (isCorrupted) return 'border-red-500 bg-red-950/20';
    if (isCurrentSlot) return 'border-blue-500 bg-blue-950/20';
    if (isEmpty) return 'border-gray-700 bg-gray-900/50';
    return 'border-gray-600 surface-base';
  };

  const handleLoad = () => {
    if (!isEmpty && !isCorrupted && !isLocked) {
      onLoad(metadata.slotId);
    }
  };

  const handleSave = () => {
    if (!isLocked) {
      onSave(metadata.slotId);
    }
  };

  const handleDelete = () => {
    if (!isEmpty && !isAutoSave && !isLocked) {
      onDelete(metadata.slotId);
    }
  };

  const handleExport = () => {
    if (!isEmpty && !isCorrupted && !isLocked) {
      onExport(metadata.slotId);
    }
  };

  if (isLocked) {
    return (
      <div className={`border-2 ${getStatusColor()} rounded-xl p-4 relative`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl">
          <Lock className="w-12 h-12 text-yellow-500 mb-2" />
          <p className="text-yellow-500 font-bold">Premium Slot</p>
          <p className="text-gray-400 text-sm">Unlock to use</p>
        </div>
        <div className="opacity-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500">Slot {metadata.slotId}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div
        className={`border-2 ${getStatusColor()} rounded-xl p-4 cursor-pointer hover:border-gray-500 transition-colors`}
        onClick={handleSave}
      >
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-3">
            <span className="text-3xl">➕</span>
          </div>
          <p className="text-gray-400 font-semibold">Boş Slot</p>
          <p className="text-gray-500 text-sm">Kaydetmek için tıkla</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-2 ${getStatusColor()} rounded-xl p-4 transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isAutoSave ? (
            <span className="font-bold text-blue-400">⏱️ Otomatik</span>
          ) : (
            <span className="font-bold text-primary">Slot {metadata.slotId}</span>
          )}
          {isCorrupted && (
            <span className="flex items-center gap-1 text-red-500 text-xs">
              <AlertTriangle className="w-3 h-3" />
              Bozuk
            </span>
          )}
          {isCurrentSlot && !isAutoSave && (
            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-semibold">
              Aktif
            </span>
          )}
        </div>
        {!isAutoSave && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-400 text-sm font-semibold transition-colors"
          >
            Sil
          </button>
        )}
      </div>

      {/* Character Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-bold text-primary">{metadata.characterName}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-secondary">
          <span>Yaş: {metadata.age}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatPlaytime(metadata.playtime)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          {formatLastPlayed(metadata.lastPlayed)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleLoad}
          disabled={isCorrupted}
          className="flex-1 pressable accent-event-bg accent-event-border text-white font-semibold py-2 px-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Yükle
        </button>
        <button
          onClick={handleSave}
          className="flex-1 pressable surface-raised border border-default font-semibold py-2 px-3 rounded-lg text-sm"
        >
          Kaydet
        </button>
        <button
          onClick={handleExport}
          disabled={isCorrupted}
          className="pressable surface-raised border border-default font-semibold py-2 px-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📤
        </button>
      </div>
    </div>
  );
};
