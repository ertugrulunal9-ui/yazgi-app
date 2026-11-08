/**
 * Android/Google yedeğinden geri yükleme regresyon testi (Y-032 kanıtından, Y-038).
 *
 * Oyuncu telefon değiştirir ya da sil-yeniden kur yapar; Android Auto Backup AsyncStorage
 * (tüm kayıtlar) ve expo-secure-store'un SharedPreferences dosyasını geri getirir, ancak
 * Android Keystore anahtarı GELMEZ. SaveManager yine de kaydı yüklemeli, silmemeli.
 *
 * Taklit edilen Android davranışı (expo-secure-store 15.0.8 SecureStoreModule.kt):
 *  - prefs'te girdi yok -> null
 *  - girdi var, Keystore'da anahtar yok -> girdiyi siler, null döner
 *  - girdi başka anahtarla şifreli (BadPadding) -> girdiyi siler, null döner
 *  - diğer GeneralSecurityException -> DecryptException fırlatır
 *  - setItemAsync anahtar yoksa yenisini üretir
 *
 * Yapılandırma tarafı (app.json + manifest) `__tests__/config/androidBackupConfig.test.ts` içinde korunur.
 */
const SRC = '../../src';

// Her açılış modülleri yeniden yükler (SaveManager, gameUtils); yavaş makinede 5 sn yetmeyebilir.
jest.setTimeout(60000);

type Entry = { value: string; keyGen: number };
let keyGenCounter = 0;

const SECRET_KEY = 'yazgi_save.integrity_secret.v1';
const ENC_SECRET_KEY = 'yazgi_save.encryption_secret.v1';
const SIG_PREFIX = 'yazgi_save.integrity_signature.';

const shortKey = (key: string): string => {
  if (key === SECRET_KEY) return 'integrity_secret';
  if (key === ENC_SECRET_KEY) return 'encryption_secret';
  if (key.startsWith(SIG_PREFIX)) {
    const hex = key.slice(SIG_PREFIX.length).replace(/\.v\d+$/, '');
    let slot = '';
    for (let i = 0; i < hex.length; i += 4) slot += String.fromCharCode(parseInt(hex.slice(i, i + 4), 16));
    return `signature(${slot})`;
  }
  return key;
};

class FakeAndroidSecureStore {
  prefs: Map<string, Entry>;
  keystoreGen: number | null;
  throwOnRead = false;
  log: string[] = [];

  constructor(prefs: Map<string, Entry> = new Map(), keystoreGen: number | null = null) {
    this.prefs = prefs;
    this.keystoreGen = keystoreGen;
  }

  module() {
    return {
      __esModule: true,
      getItemAsync: async (key: string) => {
        if (this.throwOnRead) {
          this.log.push(`get ${shortKey(key)} -> THROW DecryptException`);
          throw new Error('DecryptException (simulated GeneralSecurityException)');
        }
        const entry = this.prefs.get(key);
        if (!entry) {
          this.log.push(`get ${shortKey(key)} -> null (prefs'te yok)`);
          return null;
        }
        if (this.keystoreGen === null) {
          this.prefs.delete(key);
          this.log.push(`get ${shortKey(key)} -> null (Keystore anahtarı yok; girdi silindi)`);
          return null;
        }
        if (entry.keyGen !== this.keystoreGen) {
          this.prefs.delete(key);
          this.log.push(`get ${shortKey(key)} -> null (BadPadding: başka anahtar; girdi silindi)`);
          return null;
        }
        this.log.push(`get ${shortKey(key)} -> değer`);
        return entry.value;
      },
      setItemAsync: async (key: string, value: string) => {
        if (this.keystoreGen === null) {
          keyGenCounter += 1;
          this.keystoreGen = keyGenCounter;
          this.log.push(`keystore: yeni AES anahtarı #${this.keystoreGen}`);
        }
        this.prefs.set(key, { value, keyGen: this.keystoreGen });
        this.log.push(`set ${shortKey(key)}`);
      },
      deleteItemAsync: async (key: string) => {
        this.prefs.delete(key);
        this.log.push(`delete ${shortKey(key)}`);
      },
    };
  }
}

type Device = {
  async: Record<string, string>;
  secure: FakeAndroidSecureStore;
  onSet?: (key: string) => void;
};

const makeAsyncStorage = (device: Device, writes: string[]) => ({
  getItem: async (k: string) => (Object.prototype.hasOwnProperty.call(device.async, k) ? device.async[k] : null),
  setItem: async (k: string, v: string) => {
    writes.push(`set ${k}`);
    device.async[k] = v;
    device.onSet?.(k);
  },
  removeItem: async (k: string) => {
    if (Object.prototype.hasOwnProperty.call(device.async, k)) writes.push(`remove ${k}`);
    delete device.async[k];
  },
  clear: async () => {
    writes.push('CLEAR');
    for (const k of Object.keys(device.async)) delete device.async[k];
  },
  getAllKeys: async () => Object.keys(device.async),
  multiGet: async (keys: string[]) => keys.map(k => [k, device.async[k] ?? null]),
  multiSet: async (pairs: [string, string][]) => {
    pairs.forEach(([k, v]) => {
      writes.push(`set ${k}`);
      device.async[k] = v;
    });
  },
  multiRemove: async (keys: string[]) => {
    keys.forEach(k => {
      writes.push(`remove ${k}`);
      delete device.async[k];
    });
  },
});

const cloneAsync = (a: Record<string, string>) => ({ ...a });
const clonePrefs = (p: Map<string, Entry>) => new Map(Array.from(p.entries()).map(([k, v]) => [k, { ...v }]));

/** Yeni bir uygulama süreci: modüller sıfır, depolar cihazdan. NODE_ENV her durumda geri alınır. */
const boot = async (device: Device) => {
  const writes: string[] = [];
  jest.resetModules();
  const env = process.env as Record<string, string | undefined>;
  const prevEnv = env.NODE_ENV;
  const asyncFake = makeAsyncStorage(device, writes);
  jest.doMock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: asyncFake }));
  jest.doMock('expo-secure-store', () => device.secure.module());
  let gameUtils: any;
  let SaveManager: any;
  let compression: any;
  try {
    // IS_DEV_RUNTIME false olsun: geliştirmede imza uyuşmazlığı sessizce yeniden mühürleniyor.
    env.NODE_ENV = 'production';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    gameUtils = require(`${SRC}/utils/gameUtils`);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    SaveManager = require(`${SRC}/save/SaveManager`).default;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    compression = require(`${SRC}/save/SaveCompression`);
  } finally {
    env.NODE_ENV = prevEnv;
  }
  device.secure.log = [];
  await gameUtils.initializeSaveSystem();
  return { gameUtils, SaveManager, compression, writes };
};

const SETTINGS_KEYS = {
  '@yazgi/achievements/v1': JSON.stringify({ unlocked: ['first_word', 'graduate'] }),
  '@yazgi/privacy_choices/v1': JSON.stringify({ personalizedAds: false, analytics: true }),
  '@yazgi/audio_settings/v1': JSON.stringify({ music: 0.4, sfx: 0.8 }),
  '@yazgi/locale/v1': 'tr',
  '@yazgi/reminders_opt_in/v1': 'true',
};

let backupSnapshot: { async: Record<string, string>; prefs: Map<string, Entry>; keystoreGen: number | null };
let originalSecret: string | undefined;

const summarize = async (ctx: Awaited<ReturnType<typeof boot>>, device: Device, loaded: any) => {
  const meta = await ctx.SaveManager.getMetaProgression();
  const settingsIntact = Object.entries(SETTINGS_KEYS).every(([k, v]) => device.async[k] === v);
  const secretNow = device.secure.prefs.get(SECRET_KEY)?.value;
  const r = {
    loaded: Boolean(loaded),
    age: loaded?.gameState?.age ?? null,
    galleryEndings: meta.lifetimeEndingIds,
    settingsIntact,
    integritySecretRegenerated: Boolean(originalSecret && secretNow && secretNow !== originalSecret),
    asyncWrites: ctx.writes,
  };
  ctx.SaveManager.dispose();
  return r;
};

const baseGameState = (gameUtils: any, age: number, totalTurns: number) => ({
  ...gameUtils.getInitialGameState(),
  age,
  totalTurns,
});

afterAll(() => {
  jest.dontMock('@react-native-async-storage/async-storage');
  jest.dontMock('expo-secure-store');
  jest.resetModules();
});

describe('Android yedeğinden geri yükleme', () => {
  it('cihaz A: oyna, kaydet, yedeği al (temel durum)', async () => {
    const deviceA: Device = { async: {}, secure: new FakeAndroidSecureStore(new Map(), null) };
    const ctx = await boot(deviceA);
    const { gameUtils, SaveManager } = ctx;

    Object.assign(deviceA.async, SETTINGS_KEYS);
    gameUtils.setCurrentSlotId('auto');
    const stats = { ...gameUtils.getInitialStats(), money: 120 };
    expect(await gameUtils.saveGame({ playerName: 'Ada', stats, gameState: baseGameState(gameUtils, 11, 60) })).toBe(true);
    expect(await gameUtils.saveGame({ playerName: 'Ada', stats, gameState: baseGameState(gameUtils, 12, 65) })).toBe(true);
    expect(await SaveManager.saveToSlot('1', 'Ada', stats, baseGameState(gameUtils, 9, 40))).toBe(true);
    await SaveManager.setMetaProgression({
      ...(await SaveManager.getMetaProgression()),
      lifetimeEndingIds: ['academic_gold', 'wealth_silver'],
    });

    const loaded = await gameUtils.loadGame();
    expect(loaded?.gameState.age).toBe(12);
    originalSecret = deviceA.secure.prefs.get(SECRET_KEY)?.value;
    const r = await summarize(ctx, deviceA, loaded);
    expect(r.loaded).toBe(true);
    // Aynı cihazda imza eşleşir.
    expect(deviceA.secure.log.some(l => l.startsWith('get signature(auto) -> değer'))).toBe(true);

    backupSnapshot = {
      async: cloneAsync(deviceA.async),
      prefs: clonePrefs(deviceA.secure.prefs),
      keystoreGen: deviceA.secure.keystoreGen,
    };
  });

  it('S1 bugünkü yapılandırma: yeni cihaz / sil-yeniden kur (AsyncStorage + SecureStore prefs geri gelir, Keystore anahtarı gelmez)', async () => {
    const device: Device = {
      async: cloneAsync(backupSnapshot.async),
      secure: new FakeAndroidSecureStore(clonePrefs(backupSnapshot.prefs), null),
    };
    const ctx = await boot(device);
    const loaded = await ctx.gameUtils.loadGame();
    const r = await summarize(ctx, device, loaded);
    expect(r.loaded).toBe(true);
    expect(r.age).toBe(12);
    expect(r.galleryEndings).toEqual(['academic_gold', 'wealth_silver']);
    expect(r.settingsIntact).toBe(true);
    expect(r.integritySecretRegenerated).toBe(true);
    // Slot verisi silinmedi, üzerine yazılmadı.
    expect(device.async['@yazgi_save/slot_auto/v5']).toBe(backupSnapshot.async['@yazgi_save/slot_auto/v5']);
    expect(ctx.writes.filter(w => w.startsWith('remove'))).toEqual([]);

    // İkinci açılış: yeni sır + yeni imza ile "match".
    const ctx2 = await boot(device);
    const loaded2 = await ctx2.gameUtils.loadGame();
    const r2 = await summarize(ctx2, device, loaded2);
    expect(r2.age).toBe(12);
    expect(device.secure.log.some(l => l.startsWith('get signature(auto) -> değer'))).toBe(true);

    // Elle kayıt yuvası 1 de açılır.
    const ctx3 = await boot(device);
    const slot1 = await ctx3.SaveManager.loadFromSlot('1');
    expect(slot1?.gameState.age).toBe(9);
    ctx3.SaveManager.dispose();
  });

  it('S1b bugünkü yapılandırma: uygulama geri yüklemeden önce bir kez açılmış (yeni Keystore anahtarı var, eski girdiler BadPadding)', async () => {
    const device: Device = { async: {}, secure: new FakeAndroidSecureStore(new Map(), null) };
    const first = await boot(device);
    first.SaveManager.dispose();
    const genOnB = device.secure.keystoreGen;
    expect(genOnB).not.toBeNull();
    // Geri yükleme dosyaları ezer, Keystore'a dokunmaz.
    device.async = cloneAsync(backupSnapshot.async);
    device.secure.prefs = clonePrefs(backupSnapshot.prefs);
    const ctx = await boot(device);
    const loaded = await ctx.gameUtils.loadGame();
    const r = await summarize(ctx, device, loaded);
    expect(r.loaded).toBe(true);
    expect(r.age).toBe(12);
    expect(device.secure.log.some(l => l.includes('BadPadding'))).toBe(true);
  });

  it('S2 seçenek C: SecureStore yedekten dışlanmış (prefs boş, AsyncStorage geri gelir)', async () => {
    const device: Device = {
      async: cloneAsync(backupSnapshot.async),
      secure: new FakeAndroidSecureStore(new Map(), null),
    };
    const ctx = await boot(device);
    const loaded = await ctx.gameUtils.loadGame();
    const r = await summarize(ctx, device, loaded);
    expect(r.loaded).toBe(true);
    expect(r.age).toBe(12);
    expect(r.galleryEndings).toEqual(['academic_gold', 'wealth_silver']);
    expect(device.async['@yazgi_save/slot_auto/v5']).toBe(backupSnapshot.async['@yazgi_save/slot_auto/v5']);
  });

  it('S3 SecureStore okuması hata fırlatıyor (üretici tuhaflığı / DecryptException)', async () => {
    const secure = new FakeAndroidSecureStore(clonePrefs(backupSnapshot.prefs), null);
    secure.throwOnRead = true;
    const device: Device = { async: cloneAsync(backupSnapshot.async), secure };
    const ctx = await boot(device);
    const loaded = await ctx.gameUtils.loadGame();
    const r = await summarize(ctx, device, loaded);
    expect(r.loaded).toBe(true);
    expect(r.age).toBe(12);
  });

  it('S5 (belgeleme) AsyncStorage yedekten dışlansaydı (allowBackup=false ya da Expo hazır yedek kuralları) kayıt ve galeri boş olurdu; yapılandırma testi bu duruma düşülmesini engeller', async () => {
    const device: Device = { async: {}, secure: new FakeAndroidSecureStore(new Map(), null) };
    const ctx = await boot(device);
    const loaded = await ctx.gameUtils.loadGame();
    const r = await summarize(ctx, device, loaded);
    expect(r.loaded).toBe(false);
    expect(r.galleryEndings).toEqual([]);
  });
});
