# SAVE SYSTEM V3 - APP.TSX INTEGRATION EXAMPLE

This file shows exactly what to add to App.tsx to integrate the multi-slot save system.
Copy-paste these snippets into the appropriate sections of your App.tsx.

## Required Imports

```typescript
import React, { useState, useEffect } from 'react';
import { SaveSlotPicker } from './components/SaveSlotPicker';
import { SaveExportModal } from './components/SaveExportModal';
import { initializeSaveSystem, setCurrentSlotId, autoSaveGame } from './utils/gameUtils';
import SaveManager from './save/SaveManager';
```

---

## 1. ADD STATE VARIABLES (near other useState declarations)

```typescript
const [showSaveSlots, setShowSaveSlots] = useState(false);
const [showExportModal, setShowExportModal] = useState(false);
const [currentSlotId, setCurrentSlotIdState] = useState<string>('1');
const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
```
```

---

## 2. INITIALIZE SAVE SYSTEM (add to existing useEffect or create new one)

```typescript
useEffect(() => {
  const init = async () => {
    // Initialize multi-slot save system (migrates legacy saves automatically)
    await initializeSaveSystem();
    
    console.log('✅ Save system initialized - legacy saves migrated to Slot 1');
  };
  
  init();
}, []);
```

---

## 3. AUTO-SAVE TIMER (add as new useEffect)

```typescript
```typescript
useEffect(() => {
  if (!autoSaveEnabled) return;
  
  const interval = setInterval(async () => {
    // Only auto-save during active gameplay (not SETUP or GAME_OVER)
    if (gameState.phase !== 'SETUP' && gameState.phase !== 'GAME_OVER' && playerName) {
      const success = await autoSaveGame({ playerName, stats, gameState });
      
      if (success) {
        console.log('✅ Auto-saved to dedicated auto-save slot');
        // Optional: Show toast notification
        // showToast('Oyun otomatik kaydedildi');
      }
    }
  }, 5 * 60 * 1000); // Every 5 minutes
  
  return () => clearInterval(interval);
}, [playerName, stats, gameState, autoSaveEnabled]);
```

---

## 4. SLOT LOAD HANDLER (add as new function)

```typescript
```typescript
const handleLoadSlot = async (slotId: string) => {
  try {
    const saveData = await SaveManager.loadFromSlot(slotId);
    
    if (saveData) {
      // Update game state with loaded data
      setPlayerName(saveData.playerName);
      setStats(saveData.stats);
      setGameState(saveData.gameState);
      
      // Update current slot tracker
      setCurrentSlotIdState(slotId);
      setCurrentSlotId(slotId); // Update gameUtils tracker
      
      // Close modal
      setShowSaveSlots(false);
      
      console.log(`✅ Loaded save from Slot ${slotId}: ${saveData.playerName}, Age ${saveData.gameState.age}`);
      
      // Optional: Show success toast
      // showToast(`Slot ${slotId} yüklendi: ${saveData.playerName}`);
    } else {
      console.error(`❌ Failed to load Slot ${slotId} - corrupted or empty`);
      // Optional: Show error toast
      // showToast('Kayıt yüklenemedi - bozuk veya boş');
    }
  } catch (error) {
    console.error('Error loading save:', error);
  }
};
```

---

## 5. ADD UI COMPONENTS (add to your JSX render)

### Example: Add buttons to settings menu

```jsx
```jsx
<div className="settings-menu">
  {/* Existing settings buttons... */}
  
  <button
    onClick={() => setShowSaveSlots(true)}
    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
  >
    💾 Kayıt Slotları
  </button>
  
  <button
    onClick={() => setShowExportModal(true)}
    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
  >
    📤 İçe/Dışa Aktar
  </button>
  
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={autoSaveEnabled}
      onChange={(e) => setAutoSaveEnabled(e.target.checked)}
      className="w-5 h-5"
    />
    <span>Otomatik Kayıt (5 dakikada bir)</span>
  </label>
</div>
```

### Example: Add modals at end of component

```jsx
```jsx
<>
  {/* Existing game UI... */}
  
  {/* Save Slot Picker Modal */}
  <SaveSlotPicker
    isOpen={showSaveSlots}
    onClose={() => setShowSaveSlots(false)}
    currentPlayerName={playerName}
    currentStats={stats}
    currentGameState={gameState}
    onLoadSlot={handleLoadSlot}
    currentSlotId={currentSlotId}
  />
  
  {/* Import/Export Modal */}
  <SaveExportModal
    isOpen={showExportModal}
    onClose={() => setShowExportModal(false)}
    currentSlotId={currentSlotId}
  />
</>
```

---

## 6. OPTIONAL: SHOW CURRENT SLOT IN UI

```jsx
```jsx
<div className="status-bar">
  <span>Kayıt: Slot {currentSlotId}</span>
  <span>Karakter: {playerName}</span>
  <span>Yaş: {gameState.age}</span>
</div>
```

---

## 7. EXISTING SAVEGAME() CALLS WORK AUTOMATICALLY!

No changes needed to existing save calls - they now use SaveManager internally:

```typescript
// Example from your existing code:
useEffect(() => {
  if (gameState.phase !== 'SETUP') {
    saveGame({ playerName, stats, gameState }); // ✅ Now saves to current slot
  }
}, [stats, gameState, playerName]);
```

---

## 8. OPTIONAL: SAVE ON GAME END

Add to your end screen or game over handler:

```typescript
```typescript
const handleGameEnd = async () => {
  // Final save before showing end screen
  await saveGame({ playerName, stats, gameState });
  
  // Optional: Upload to cloud
  // await CloudSync.syncSlot(currentSlotId);
  
  setGameState(prev => ({ ...prev, phase: 'GAME_OVER' }));
};
```

---

## THAT'S IT! YOUR SAVE SYSTEM IS NOW INTEGRATED 🎉

### FEATURES AVAILABLE:

✅ 6 Save Slots (3 free, 3 premium, 1 auto-save)  
✅ Auto-save every 5 minutes  
✅ Save/Load/Delete via UI  
✅ Export to JSON file  
✅ Import from JSON file  
✅ Copy/Paste via clipboard  
✅ QR code generation for sharing  
✅ Legacy save auto-migration  
✅ Data compression (~50% size reduction)  
✅ Checksum validation (corruption detection)  
✅ Automatic backups before save  
✅ Cloud sync ready (Firebase Firestore)

### TESTING:

1. Start game - legacy save should migrate to Slot 1 automatically
2. Click "Kayıt Slotları" button - should show slot picker
3. Save to different slots - should see metadata update
4. Load from slot - should restore game state
5. Wait 5 minutes - should see auto-save in console
6. Click "İçe/Dışa Aktar" - should show import/export options
7. Export to JSON - should download file
8. Import from JSON - should load save

### TROUBLESHOOTING:

- **"Slot corrupted"** - SaveManager auto-restores from backup
- **"Cannot load slot"** - Check console for error messages
- **"Auto-save not working"** - Check autoSaveEnabled state
- **"Premium slots locked"** - Call `SaveManager.setPremiumUnlocked(true)`
