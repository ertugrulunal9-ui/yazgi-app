import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Sparkles } from 'lucide-react';
import { audioManager } from '../audio/AudioManager';
import { musicPlayer } from '../audio/MusicPlayer';

interface AudioSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({ isOpen, onClose }) => {
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [musicVolume, setMusicVolume] = useState(0.8);
  const [sfxVolume, setSfxVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    // Load current settings
    const settings = audioManager.getSettings();
    setMasterVolume(settings.masterVolume);
    setMusicVolume(settings.musicVolume);
    setSfxVolume(settings.sfxVolume);
    setMuted(settings.muted);
  }, [isOpen]);

  const handleMasterVolumeChange = async (value: number) => {
    setMasterVolume(value);
    await audioManager.setMasterVolume(value);
    await musicPlayer.updateVolume();
  };

  const handleMusicVolumeChange = async (value: number) => {
    setMusicVolume(value);
    await audioManager.setMusicVolume(value);
    await musicPlayer.updateVolume();
  };

  const handleSFXVolumeChange = async (value: number) => {
    setSfxVolume(value);
    await audioManager.setSFXVolume(value);
    // Play test sound
    await audioManager.playSFX('button_click');
  };

  const handleMuteToggle = async () => {
    const newMuted = !muted;
    setMuted(newMuted);
    await audioManager.setMuted(newMuted);
    await musicPlayer.updateVolume();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-md border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800/70 p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="text-blue-400" size={24} />
              <h2 className="text-xl font-bold text-white">Ses Ayarları</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mute Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">Ses</span>
            <button
              onClick={handleMuteToggle}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                ${muted 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
                }
              `}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              {muted ? 'Kapalı' : 'Açık'}
            </button>
          </div>

          {/* Master Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="master-volume" className="text-gray-300 flex items-center gap-2">
                <Volume2 size={16} />
                Ana Ses
              </label>
              <span className="text-white font-medium">{Math.round(masterVolume * 100)}%</span>
            </div>
            <input
              id="master-volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
              disabled={muted}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Music Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="music-volume" className="text-gray-300 flex items-center gap-2">
                <Music size={16} />
                Müzik
              </label>
              <span className="text-white font-medium">{Math.round(musicVolume * 100)}%</span>
            </div>
            <input
              id="music-volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
              disabled={muted}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* SFX Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="sfx-volume" className="text-gray-300 flex items-center gap-2">
                <Sparkles size={16} />
                Efektler
              </label>
              <span className="text-white font-medium">{Math.round(sfxVolume * 100)}%</span>
            </div>
            <input
              id="sfx-volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sfxVolume}
              onChange={(e) => handleSFXVolumeChange(parseFloat(e.target.value))}
              disabled={muted}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Info Text */}
          <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-800">
            Ayarlar otomatik kaydedilir
          </div>
        </div>
      </div>
    </div>
  );
};
