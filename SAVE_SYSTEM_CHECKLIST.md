# 🎯 Save System Integration Checklist

Use this checklist to integrate the save system into your game step-by-step.

---

## ✅ Phase 1: Core Integration (Required)

### Step 1: Initialize Save System
- [ ] Import `initializeSaveSystem` in App.tsx
- [ ] Add initialization useEffect hook
- [ ] Test: Check console for "Save system initialized" message
- [ ] Test: Verify legacy save migrates to Slot 1 (if exists)

```typescript
import { initializeSaveSystem } from './utils/gameUtils';

useEffect(() => {
  const init = async () => {
    await initializeSaveSystem();
    console.log('✅ Save system ready');
  };
  init();
}, []);
```

**Result**: ✅ Save system active, legacy saves migrated

---

### Step 2: Add State Variables
- [ ] Add `showSaveSlots` state (boolean)
- [ ] Add `currentSlotId` state (string, default '1')
- [ ] Add `autoSaveEnabled` state (boolean, default true)

```typescript
const [showSaveSlots, setShowSaveSlots] = useState(false);
const [currentSlotId, setCurrentSlotIdState] = useState<string>('1');
const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
```

**Result**: ✅ State ready for slot management

---

### Step 3: Add Slot Load Handler
- [ ] Create `handleLoadSlot` function
- [ ] Call `SaveManager.loadFromSlot()`
- [ ] Update game state on successful load
- [ ] Update `currentSlotId` state
- [ ] Close modal after loading

```typescript
import SaveManager from './save/SaveManager';
import { setCurrentSlotId } from './utils/gameUtils';

const handleLoadSlot = async (slotId: string) => {
  try {
    const saveData = await SaveManager.loadFromSlot(slotId);
    
    if (saveData) {
      setPlayerName(saveData.playerName);
      setStats(saveData.stats);
      setGameState(saveData.gameState);
      setCurrentSlotIdState(slotId);
      setCurrentSlotId(slotId); // Update gameUtils
      setShowSaveSlots(false);
      
      console.log(`✅ Loaded Slot ${slotId}`);
    } else {
      alert('Kayıt yüklenemedi - bozuk veya boş');
    }
  } catch (error) {
    console.error('Load error:', error);
  }
};
```

**Result**: ✅ Can load from any slot

---

### Step 4: Add Save Slot Picker UI
- [ ] Import `SaveSlotPicker` component
- [ ] Add button to open modal (in settings/menu)
- [ ] Add `SaveSlotPicker` component to JSX
- [ ] Pass required props
- [ ] Test: Click button, modal opens
- [ ] Test: See all 6 slots with metadata
- [ ] Test: Click slot to load, game state updates

```typescript
import { SaveSlotPicker } from './components/SaveSlotPicker';

// In your settings/menu JSX:
<button onClick={() => setShowSaveSlots(true)}>
  💾 Kayıt Slotları
</button>

// At end of component (before closing tag):
<SaveSlotPicker
  isOpen={showSaveSlots}
  onClose={() => setShowSaveSlots(false)}
  currentPlayerName={playerName}
  currentStats={stats}
  currentGameState={gameState}
  onLoadSlot={handleLoadSlot}
  currentSlotId={currentSlotId}
/>
```

**Result**: ✅ Full slot picker UI working

---

## ⚡ Phase 2: Auto-Save (Recommended)

### Step 5: Add Auto-Save Timer
- [ ] Import `autoSaveGame` from gameUtils
- [ ] Add useEffect with setInterval (5 minutes)
- [ ] Check game phase before auto-saving
- [ ] Cleanup interval on unmount
- [ ] Test: Wait 5 minutes, check console for auto-save log

```typescript
import { autoSaveGame } from './utils/gameUtils';

useEffect(() => {
  if (!autoSaveEnabled) return;
  
  const interval = setInterval(async () => {
    if (gameState.phase !== 'SETUP' && gameState.phase !== 'GAME_OVER' && playerName) {
      const success = await autoSaveGame({ playerName, stats, gameState });
      if (success) {
        console.log('✅ Auto-saved');
        // Optional: showToast('Otomatik kaydedildi');
      }
    }
  }, 5 * 60 * 1000); // 5 minutes
  
  return () => clearInterval(interval);
}, [playerName, stats, gameState, autoSaveEnabled]);
```

**Result**: ✅ Auto-save every 5 minutes

---

### Step 6: Add Auto-Save Toggle
- [ ] Add checkbox to settings UI
- [ ] Bind to `autoSaveEnabled` state
- [ ] Test: Toggle off, verify auto-save stops
- [ ] Test: Toggle on, verify auto-save resumes

```typescript
<label className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={autoSaveEnabled}
    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
    className="w-5 h-5"
  />
  <span>Otomatik Kayıt (5 dakikada bir)</span>
</label>
```

**Result**: ✅ User can enable/disable auto-save

---

## 📤 Phase 3: Import/Export (Optional)

### Step 7: Add Export/Import Modal
- [ ] Import `SaveExportModal` component
- [ ] Add `showExportModal` state
- [ ] Add button to open modal
- [ ] Add `SaveExportModal` component to JSX
- [ ] Test: Click export button, modal opens
- [ ] Test: Export tab shows copy/download/QR options
- [ ] Test: Import tab accepts JSON paste/upload

```typescript
import { SaveExportModal } from './components/SaveExportModal';

const [showExportModal, setShowExportModal] = useState(false);

// In settings/menu:
<button onClick={() => setShowExportModal(true)}>
  📤 İçe/Dışa Aktar
</button>

// At end of component:
<SaveExportModal
  isOpen={showExportModal}
  onClose={() => setShowExportModal(false)}
  currentSlotId={currentSlotId}
/>
```

**Result**: ✅ Can export/import saves

---

### Step 8: Test Import/Export
- [ ] Export save to JSON file
- [ ] Copy save to clipboard
- [ ] Generate QR code
- [ ] Import from JSON file
- [ ] Import from clipboard
- [ ] Verify imported save loads correctly

**Result**: ✅ Cross-device save transfer working

---

## ☁️ Phase 4: Cloud Sync (Future)

### Step 9: Setup Firebase (Optional)
- [ ] Add Firebase config to project
- [ ] Enable Firestore in Firebase console
- [ ] Add cloud sync button to UI
- [ ] Call `CloudSync.syncSlot()` on button click
- [ ] Test: Upload save to cloud
- [ ] Test: Download save from cloud
- [ ] Test: Conflict resolution (modify both local & cloud)

```typescript
import { CloudSync } from './save/CloudSync';

const handleCloudSync = async () => {
  try {
    await CloudSync.syncSlot(currentSlotId);
    console.log('✅ Synced to cloud');
  } catch (error) {
    console.error('Cloud sync failed:', error);
  }
};

// In UI:
<button onClick={handleCloudSync}>
  ☁️ Buluta Yedekle
</button>
```

**Result**: ✅ Cloud backup/restore working

---

## 🧪 Phase 5: Testing

### Step 10: Manual Testing
- [ ] **Legacy Migration**: Delete all saves, create old format save, restart app
  - Expected: Old save migrates to Slot 1, backup created
- [ ] **Save to Slot**: Save game to Slot 1
  - Expected: Metadata updates (name, age, playtime, timestamp)
- [ ] **Load from Slot**: Load from Slot 1
  - Expected: Game state restores correctly
- [ ] **Multiple Slots**: Save to Slots 1-3
  - Expected: Each slot has unique metadata
- [ ] **Delete Slot**: Delete Slot 2
  - Expected: Slot becomes empty, metadata cleared
- [ ] **Auto-Save**: Wait 5 minutes during gameplay
  - Expected: Console logs "Auto-saved", auto-save slot updated
- [ ] **Export JSON**: Export Slot 1 to file
  - Expected: JSON file downloads with save data
- [ ] **Import JSON**: Import exported JSON to Slot 3
  - Expected: Slot 3 now contains imported save
- [ ] **Clipboard Copy**: Copy Slot 1 to clipboard
  - Expected: Clipboard contains JSON data
- [ ] **Clipboard Paste**: Paste from clipboard to Slot 2
  - Expected: Slot 2 now contains pasted save
- [ ] **QR Code**: Generate QR code for Slot 1
  - Expected: QR code image displays
- [ ] **Premium Lock**: Check Slots 4-6
  - Expected: Lock icon shown, cannot load/save
- [ ] **Premium Unlock**: Call `SaveManager.setPremiumUnlocked(true)`
  - Expected: Slots 4-6 now usable
- [ ] **Corruption Recovery**: Manually corrupt save, attempt load
  - Expected: Backup restore attempted, error message if no backup

**Result**: ✅ All features tested and working

---

### Step 11: Edge Cases
- [ ] **Empty Slot Load**: Try loading empty slot
  - Expected: Error message, no crash
- [ ] **Full Storage**: Fill storage, try saving
  - Expected: Error message, existing saves safe
- [ ] **Invalid Import**: Import malformed JSON
  - Expected: Error message, no crash
- [ ] **Checksum Mismatch**: Import save with wrong checksum
  - Expected: Error message, import rejected
- [ ] **Old Version**: Import V0 save
  - Expected: Auto-migrates to V1, adds new fields
- [ ] **Delete Auto-Save**: Try deleting auto-save slot
  - Expected: Operation blocked, error message
- [ ] **Concurrent Saves**: Save to multiple slots rapidly
  - Expected: All saves complete, no data loss

**Result**: ✅ Edge cases handled gracefully

---

## 📋 Post-Integration Checklist

### Code Quality
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] All imports resolved
- [ ] Proper error handling

### User Experience
- [ ] Slot picker UI responsive (mobile/desktop)
- [ ] Loading indicators show for async operations
- [ ] Success/error messages display correctly
- [ ] Slot metadata updates in real-time

### Performance
- [ ] No lag when opening slot picker
- [ ] Save/load operations complete quickly (<1s)
- [ ] Auto-save doesn't interrupt gameplay
- [ ] No memory leaks from intervals

### Documentation
- [ ] Team knows how to use save system
- [ ] Code comments added for custom logic
- [ ] README updated with save system info

---

## 🎉 Integration Complete!

When all checkboxes are marked, your save system is fully integrated and ready for production!

### Final Verification
- [ ] All Phase 1 steps complete (Required)
- [ ] All Phase 2 steps complete (Recommended)
- [ ] All Phase 3 steps complete (Optional)
- [ ] All Phase 5 steps complete (Testing)
- [ ] No errors in console
- [ ] User can save/load/delete from UI
- [ ] Auto-save works in background
- [ ] Legacy saves migrated successfully

---

## 📞 Need Help?

**Documentation Files:**
- `SAVE_SYSTEM_SUMMARY.md` - Complete feature overview
- `SAVE_SYSTEM_MIGRATION.md` - Migration guide and API reference
- `SAVE_SYSTEM_QUICK_REFERENCE.md` - Quick API lookup
- `SAVE_SYSTEM_INTEGRATION_EXAMPLE.tsx` - Copy-paste code snippets

**Common Issues:**
- Check console logs for error messages
- Verify all imports are correct
- Ensure AsyncStorage/localStorage available
- Test with fresh install (clear all storage)

---

**🚀 Ready to ship production-grade saves!**
