# Save System V3 - Quick Reference Card

## 📌 Most Common Operations

### Initialize (Call once on app start)
```typescript
import { initializeSaveSystem } from './utils/gameUtils';

await initializeSaveSystem(); // Auto-migrates legacy saves
```

### Save to Current Slot (Backwards compatible)
```typescript
import { saveGame } from './utils/gameUtils';

await saveGame({ playerName, stats, gameState });
```

### Load from Current Slot (Backwards compatible)
```typescript
import { loadGame } from './utils/gameUtils';

const data = await loadGame();
if (data) {
  setPlayerName(data.playerName);
  setStats(data.stats);
  setGameState(data.gameState);
}
```

### Auto-Save (Every 5 minutes)
```typescript
import { autoSaveGame } from './utils/gameUtils';

useEffect(() => {
  const interval = setInterval(() => {
    if (gameState.phase !== 'SETUP' && playerName) {
      autoSaveGame({ playerName, stats, gameState });
    }
  }, 5 * 60 * 1000);
  
  return () => clearInterval(interval);
}, [playerName, stats, gameState]);
```

### Change Current Slot
```typescript
import { setCurrentSlotId } from './utils/gameUtils';

setCurrentSlotId('2'); // Switch to Slot 2
// All subsequent saveGame() calls will use Slot 2
```

---

## 🔥 Advanced Operations

### Direct SaveManager Access
```typescript
import SaveManager from './save/SaveManager';

// Save to specific slot
await SaveManager.saveToSlot('1', playerName, stats, gameState);

// Load from specific slot
const saveData = await SaveManager.loadFromSlot('1');

// Delete slot
await SaveManager.deleteSlot('1');

// Export to JSON
const jsonData = await SaveManager.exportSlot('1');

// Import from JSON
await SaveManager.importSlot('2', jsonData);

// Copy slot
await SaveManager.copySlot('1', '2');

// Get all slots metadata
const allMetadata = await SaveManager.getAllMetadata();

// Get available slots (respects premium lock)
const available = SaveManager.getAvailableSlots();

// Unlock premium slots
SaveManager.setPremiumUnlocked(true);
```

### Cloud Sync
```typescript
import { CloudSync } from './save/CloudSync';

// Sync slot to cloud
await CloudSync.syncSlot('1');

// Manual cloud operations
const remoteData = await CloudSync.fetchRemoteData('1');
await CloudSync.uploadData('1', saveData);
```

### Utilities
```typescript
import { 
  formatPlaytime, 
  formatLastPlayed,
  copyToClipboard,
  readFromClipboard,
  generateQRCode,
  downloadFile,
  readFile,
  getStorageInfo
} from './utils/saveUtils';

// Format playtime
const timeStr = formatPlaytime(120); // "2h 0m"

// Format timestamp
const dateStr = formatLastPlayed(Date.now()); // "Az önce"

// Copy to clipboard
await copyToClipboard(jsonData);

// Paste from clipboard
const data = await readFromClipboard();

// Generate QR code
const qrUrl = generateQRCode(jsonData);

// Download file
downloadFile(jsonData, 'save.json');

// Read file
const fileData = await readFile(file);

// Get storage info
const { used, total, percentage } = await getStorageInfo(storage);
```

---

## 🎨 UI Components

### Save Slot Picker
```typescript
import { SaveSlotPicker } from './components/SaveSlotPicker';

<SaveSlotPicker
  isOpen={showSaveSlots}
  onClose={() => setShowSaveSlots(false)}
  currentPlayerName={playerName}
  currentStats={stats}
  currentGameState={gameState}
  onLoadSlot={(slotId) => handleLoadSlot(slotId)}
  currentSlotId={currentSlotId}
  onSlotChange={(slotId) => setCurrentSlotId(slotId)}
/>
```

### Export/Import Modal
```typescript
import { SaveExportModal } from './components/SaveExportModal';

<SaveExportModal
  isOpen={showExportModal}
  onClose={() => setShowExportModal(false)}
  currentSlotId={currentSlotId}
/>
```

### Individual Slot Card
```typescript
import { SaveSlotCard } from './components/SaveSlotCard';

<SaveSlotCard
  slotId="1"
  metadata={slotMetadata}
  onLoad={(id) => handleLoad(id)}
  onSave={(id) => handleSave(id)}
  onDelete={(id) => handleDelete(id)}
  onExport={(id) => handleExport(id)}
  isActive={currentSlotId === '1'}
  canSave={true}
/>
```

---

## 📊 Data Types

### SaveSlotMetadata
```typescript
interface SaveSlotMetadata {
  slotId: string;           // '1', '2', '3', '4', '5', '6', 'auto'
  characterName: string;    // Player character name
  age: number;              // Character age
  playtime: number;         // Total playtime in minutes
  lastPlayed: number;       // Unix timestamp
  version: number;          // Save version (1)
  checksum: string;         // Data validation hash
  status: 'empty' | 'active' | 'corrupted'; // Slot status
  isPremium: boolean;       // Is premium slot (4-6)
}
```

### SaveSlotData
```typescript
interface SaveSlotData {
  metadata: SaveSlotMetadata;
  playerName: string;
  stats: Stats;
  gameState: GameState;
}
```

### CompressedSaveData
```typescript
interface CompressedSaveData {
  compressed: string;  // Base64 encoded JSON
  checksum: string;    // Validation hash
  version: number;     // Save version
}
```

---

## 🚨 Error Handling

### Corrupted Save
```typescript
const saveData = await SaveManager.loadFromSlot('1');
if (!saveData) {
  // Slot corrupted or empty
  // SaveManager already attempted backup restore
  console.error('Failed to load slot');
  showToast('Kayıt yüklenemedi - bozuk veya boş');
}
```

### Storage Full
```typescript
try {
  await SaveManager.saveToSlot('1', playerName, stats, gameState);
} catch (error) {
  if (error.message.includes('storage full')) {
    showToast('Depolama dolu! Eski kayıtları sil.');
  }
}
```

### Import Validation
```typescript
try {
  await SaveManager.importSlot('2', jsonData);
} catch (error) {
  if (error.message.includes('invalid format')) {
    showToast('Geçersiz kayıt formatı!');
  } else if (error.message.includes('checksum')) {
    showToast('Kayıt bozuk - checksum eşleşmiyor!');
  }
}
```

---

## ⚙️ Configuration

### Slot Constants
```typescript
// In src/save/SaveSlot.ts
export const MAX_FREE_SLOTS = 3;      // Free slots (1-3)
export const MAX_PREMIUM_SLOTS = 3;   // Premium slots (4-6)
export const AUTO_SAVE_SLOT_ID = 'auto'; // Auto-save slot ID
export const SAVE_VERSION = 1;        // Current save version
```

### Auto-Save Interval
```typescript
// Default: 5 minutes
const AUTO_SAVE_INTERVAL = 5 * 60 * 1000;

// Customize:
const interval = setInterval(() => {
  autoSaveGame({ playerName, stats, gameState });
}, 10 * 60 * 1000); // 10 minutes
```

---

## 🔄 Migration

### Detect Legacy Save
```typescript
import { detectLegacySave } from './save/SaveMigration';

const hasLegacy = await detectLegacySave();
if (hasLegacy) {
  console.log('Legacy save found - will auto-migrate');
}
```

### Manual Migration
```typescript
import { migrateLegacySave } from './save/SaveMigration';

await migrateLegacySave('1'); // Migrate to Slot 1
```

### Version Upgrade
```typescript
import { migrateToVersion } from './save/SaveMigration';

const upgraded = await migrateToVersion(saveData, 1);
// Automatically handles V0 → V1 upgrades
```

---

## 🎯 Best Practices

1. **Always initialize on app start**
   ```typescript
   useEffect(() => {
     initializeSaveSystem();
   }, []);
   ```

2. **Track current slot in state**
   ```typescript
   const [currentSlotId, setCurrentSlotIdState] = useState('1');
   ```

3. **Handle load errors gracefully**
   ```typescript
   const data = await loadGame();
   if (!data) {
     // Show error, don't crash
     showToast('Kayıt yüklenemedi');
     return;
   }
   ```

4. **Auto-save during gameplay**
   ```typescript
   // Only during active gameplay, not SETUP/GAME_OVER
   if (gameState.phase !== 'SETUP' && gameState.phase !== 'GAME_OVER') {
     await autoSaveGame({ playerName, stats, gameState });
   }
   ```

5. **Provide feedback for all operations**
   ```typescript
   const success = await saveGame({ playerName, stats, gameState });
   if (success) {
     showToast('✅ Kaydedildi');
   } else {
     showToast('❌ Kaydetme başarısız');
   }
   ```

---

## 🔧 Troubleshooting

### Auto-save not working
- Check `autoSaveEnabled` state
- Verify 5-minute interval is active
- Check console for errors
- Ensure `playerName` is not empty

### Cannot load slot
- Check console for error messages
- Verify slot is not empty (`metadata.status === 'empty'`)
- Check if slot is corrupted (backup restore attempted)
- Try loading different slot

### Premium slots locked
- Call `SaveManager.setPremiumUnlocked(true)`
- Or implement IAP to unlock

### Import fails
- Verify JSON format is correct
- Check checksum validation
- Ensure version is compatible
- Try exporting from another slot first

---

## 📈 Performance Tips

1. **Minimize save frequency**: Don't save every frame/second
2. **Use auto-save**: Let it handle periodic saves
3. **Batch operations**: Load/save in bulk when possible
4. **Cache metadata**: SaveManager caches metadata automatically
5. **Compress large saves**: Compression is automatic

---

## 🎁 Features at a Glance

| Feature | Status | Details |
|---------|--------|---------|
| Multi-slot saves | ✅ | 6 slots (3 free, 3 premium, 1 auto) |
| Auto-save | ✅ | Every 5 minutes to dedicated slot |
| Compression | ✅ | btoa/atob, ~50% size reduction |
| Checksums | ✅ | Corruption detection |
| Backups | ✅ | Automatic before each save |
| Versioning | ✅ | V1 with migration support |
| Import/Export | ✅ | JSON, clipboard, QR code |
| Cloud sync | ✅ | Infrastructure ready |
| Legacy migration | ✅ | Automatic on first launch |

---

**💡 Tip**: Most operations are backwards compatible - existing `saveGame()` calls work unchanged!

**📚 Full Docs**: See `SAVE_SYSTEM_MIGRATION.md` and `SAVE_SYSTEM_SUMMARY.md`
