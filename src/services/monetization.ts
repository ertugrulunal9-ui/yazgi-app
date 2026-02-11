/**
 * Monetization Service - IAP & Ads Management
 * Yazgı - Life Simulation Game
 */

import { Platform } from 'react-native';
import SaveManager from '../save/SaveManager';

export type ProductId = 
  | 'premium_traits'
  | 'save_slots_premium'
  | 'cosmetics_pack'
  | 'energy_refill'
  | 'season_pass'
  | 'remove_ads';

export type AdType = 'rewarded' | 'interstitial';

export interface Product {
  id: ProductId;
  title: string;
  description: string;
  price: string;
  localizedPrice?: string;
  currencyCode?: string;
}

export interface PurchaseResult {
  success: boolean;
  productId: ProductId;
  error?: string;
}

export interface RewardedAdResult {
  success: boolean;
  reward?: {
    type: 'energy' | 'intelligence' | 'money';
    amount: number;
  };
  error?: string;
}

const STORAGE_PRODUCTS_KEY = '@yazgi/owned_products';
const STORAGE_AD_COUNT_KEY = '@yazgi/ad_count';
const hasLocalStorage = typeof localStorage !== 'undefined';
let asyncStorageModule: any = null;

const getAsyncStorage = async () => {
  if (asyncStorageModule) return asyncStorageModule;
  try {
    const mod = await import('@react-native-async-storage/async-storage');
    asyncStorageModule = (mod as any).default ?? mod;
    return asyncStorageModule;
  } catch {
    return null;
  }
};

const readStorageItem = async (key: string): Promise<string | null> => {
  if (hasLocalStorage) return localStorage.getItem(key);
  const AsyncStorage = await getAsyncStorage();
  if (AsyncStorage) return AsyncStorage.getItem(key);
  return null;
};

const writeStorageItem = async (key: string, value: string): Promise<void> => {
  if (hasLocalStorage) {
    localStorage.setItem(key, value);
    return;
  }
  const AsyncStorage = await getAsyncStorage();
  if (AsyncStorage) {
    await AsyncStorage.setItem(key, value);
  }
};

const optionalRequire = (moduleName: string): any => {
  try {
    // Avoid Metro trying to resolve optional deps at bundle time
    const req = eval('require');
    return req(moduleName);
  } catch {
    return null;
  }
};

// Mock product catalog (replace with actual RevenueCat/Expo IAP in production)
const PRODUCTS: Record<ProductId, Product> = {
  premium_traits: {
    id: 'premium_traits',
    title: 'Premium Özellikler',
    description: 'GENIUS, LUCKY veya CHARMING özelliğini seç ve oyununa başla!',
    price: '₺29.99',
    localizedPrice: '29.99',
    currencyCode: 'TRY'
  },
  save_slots_premium: {
    id: 'save_slots_premium',
    title: '+3 Kayıt Slotu',
    description: '3 ek kayıt slotu ile daha fazla karakter yaşat!',
    price: '₺14.99',
    localizedPrice: '14.99',
    currencyCode: 'TRY'
  },
  cosmetics_pack: {
    id: 'cosmetics_pack',
    title: 'Kozmetik Paketi',
    description: 'Özel avatar skinleri ve aile isimleri',
    price: '₺24.99',
    localizedPrice: '24.99',
    currencyCode: 'TRY'
  },
  energy_refill: {
    id: 'energy_refill',
    title: 'Enerji Doldurma',
    description: 'Hemen +50 enerji kazan!',
    price: '₺9.99',
    localizedPrice: '9.99',
    currencyCode: 'TRY'
  },
  season_pass: {
    id: 'season_pass',
    title: 'Sezon Kartı',
    description: '30 gün: Günlük ödüller, %50 XP bonusu, reklamsız deneyim',
    price: '₺59.99',
    localizedPrice: '59.99',
    currencyCode: 'TRY'
  },
  remove_ads: {
    id: 'remove_ads',
    title: 'Reklamları Kaldır',
    description: 'Tüm reklamlardan sonsuza kadar kurtul!',
    price: '₺39.99',
    localizedPrice: '39.99',
    currencyCode: 'TRY'
  }
};

const PRODUCT_SKUS: Record<ProductId, { ios: string; android: string }> = {
  premium_traits: { ios: 'premium_traits', android: 'premium_traits' },
  save_slots_premium: { ios: 'save_slots_premium', android: 'save_slots_premium' },
  cosmetics_pack: { ios: 'cosmetics_pack', android: 'cosmetics_pack' },
  energy_refill: { ios: 'energy_refill', android: 'energy_refill' },
  season_pass: { ios: 'season_pass', android: 'season_pass' },
  remove_ads: { ios: 'remove_ads', android: 'remove_ads' },
};

class MonetizationService {
  private isInitialized = false;
  private ownedProducts: Set<ProductId> = new Set();
  private adProvider: 'admob' | 'unity' | 'mock' = 'mock';
  private adsEnabled = true;
  private rewardedAdCount = 0;
  private dailyAdLimit = 5;
  private lastAdResetDate: string | null = null;
  private iapProvider: 'expo-iap' | 'mock' = 'mock';
  private iapModule: any = null;

  /**
   * Reset service state (for testing)
   */
  __reset__() {
    this.isInitialized = false;
    this.ownedProducts.clear();
    this.rewardedAdCount = 0;
    this.lastAdResetDate = null;
  }

  /**
   * Initialize monetization service
   * In production, this would initialize RevenueCat/Expo IAP and AdMob
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🛒 Initializing Monetization Service...');

      await this.initializeIap();
      
      // Load owned products from storage
      await this.loadOwnedProducts();
      await this.loadAdCount();
      await this.syncEntitlements();
      
      // Reset daily ad counter if needed
      this.resetDailyAdCountIfNeeded();
      
      this.isInitialized = true;
      console.log(`✅ Monetization Service initialized (provider: ${this.adProvider})`);
    } catch (error) {
      console.error('❌ Monetization initialization failed:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Get all available products
   */
  async getProducts(): Promise<Product[]> {
    if (!this.isInitialized) await this.initialize();

    if (this.iapProvider === 'expo-iap' && this.iapModule?.getProductsAsync) {
      try {
        const skus = Object.values(PRODUCT_SKUS).map(sku => Platform.OS === 'ios' ? sku.ios : sku.android);
        const result = await this.iapModule.getProductsAsync(skus);
        const products = result?.products || result || [];
        if (Array.isArray(products) && products.length > 0) {
          return products.map((product: any) => ({
            id: (Object.keys(PRODUCT_SKUS) as ProductId[]).find(key => {
              const sku = Platform.OS === 'ios' ? PRODUCT_SKUS[key].ios : PRODUCT_SKUS[key].android;
              return sku === product.productId || sku === product.productId;
            }) || 'save_slots_premium',
            title: product.title || product.description || 'Premium',
            description: product.description || '',
            price: product.price || product.localizedPrice || '',
            localizedPrice: product.localizedPrice,
            currencyCode: product.currencyCode,
          }));
        }
      } catch (error) {
        console.warn('IAP products fetch failed, falling back to local catalog:', error);
      }
    }

    return Object.values(PRODUCTS);
  }

  /**
   * Purchase a product
   */
  async purchaseProduct(productId: ProductId): Promise<PurchaseResult> {
    if (!this.isInitialized) await this.initialize();

    try {
      console.log(`💳 Purchasing: ${productId}`);

      if (this.iapProvider === 'expo-iap' && this.iapModule?.purchaseItemAsync) {
        const sku = Platform.OS === 'ios' ? PRODUCT_SKUS[productId].ios : PRODUCT_SKUS[productId].android;
        await this.iapModule.purchaseItemAsync(sku);
      } else {
        // Mock purchase (always succeeds in dev)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      this.ownedProducts.add(productId);
      await this.saveOwnedProducts();
      await this.syncEntitlements();

      console.log(`✅ Purchase successful: ${productId}`);
      
      return {
        success: true,
        productId
      };
    } catch (error: any) {
      console.error('❌ Purchase failed:', error);
      return {
        success: false,
        productId,
        error: error.message || 'Satın alma başarısız'
      };
    }
  }

  /**
   * Restore purchases (for users who reinstalled)
   */
  async restorePurchases(): Promise<ProductId[]> {
    if (!this.isInitialized) await this.initialize();

    try {
      console.log('🔄 Restoring purchases...');

      let restored = Array.from(this.ownedProducts);
      if (this.iapProvider === 'expo-iap' && this.iapModule?.getAvailablePurchasesAsync) {
        const purchases = await this.iapModule.getAvailablePurchasesAsync();
        const restoredIds = (purchases || [])
          .map((purchase: any) => {
            const match = (Object.keys(PRODUCT_SKUS) as ProductId[]).find(key => {
              const sku = Platform.OS === 'ios' ? PRODUCT_SKUS[key].ios : PRODUCT_SKUS[key].android;
              return sku === purchase.productId;
            });
            return match;
          })
          .filter(Boolean) as ProductId[];
        restoredIds.forEach(id => this.ownedProducts.add(id));
        restored = Array.from(this.ownedProducts);
      }
      await this.saveOwnedProducts();
      await this.syncEntitlements();
      console.log(`✅ Restored ${restored.length} purchases`);
      
      return restored;
    } catch (error) {
      console.error('❌ Restore failed:', error);
      return [];
    }
  }

  /**
   * Check if user owns a product
   */
  hasProduct(productId: ProductId): boolean {
    return this.ownedProducts.has(productId);
  }

  /**
   * Check if user has premium (any premium product)
   */
  isPremium(): boolean {
    return this.ownedProducts.size > 0;
  }

  /**
   * Show rewarded ad and give reward
   */
  async showRewardedAd(rewardType: 'energy' | 'intelligence' | 'money'): Promise<RewardedAdResult> {
    if (!this.isInitialized) await this.initialize();

    // Check if ads are disabled
    if (!this.adsEnabled || this.hasProduct('remove_ads') || this.hasProduct('season_pass')) {
      return {
        success: false,
        error: 'Reklamlar devre dışı (Premium kullanıcı)'
      };
    }

    // Check daily limit
    if (this.rewardedAdCount >= this.dailyAdLimit) {
      return {
        success: false,
        error: `Günlük reklam limiti (${this.dailyAdLimit}) aşıldı. Yarın tekrar dene!`
      };
    }

    try {
      console.log(`📺 Showing rewarded ad for: ${rewardType}`);

      // In production:
      // const ad = RewardedAd.createForAdRequest('ca-app-pub-xxx');
      // await ad.show();
      
      // Mock ad viewing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Determine reward amount
      let amount = 0;
      switch (rewardType) {
        case 'energy':
          amount = 20;
          break;
        case 'intelligence':
          amount = 10;
          break;
        case 'money':
          amount = 100;
          break;
      }

      this.rewardedAdCount++;
      this.saveAdCount();

      console.log(`✅ Ad watched! Reward: +${amount} ${rewardType}`);

      return {
        success: true,
        reward: { type: rewardType, amount }
      };
    } catch (error: any) {
      console.error('❌ Ad failed:', error);
      return {
        success: false,
        error: error.message || 'Reklam gösterilemedi'
      };
    }
  }

  /**
   * Show interstitial ad (game over, etc.)
   */
  async showInterstitialAd(): Promise<boolean> {
    if (!this.isInitialized) await this.initialize();

    // Don't show if premium
    if (!this.adsEnabled || this.hasProduct('remove_ads') || this.hasProduct('season_pass')) {
      console.log('🚫 Interstitial ad skipped (Premium user)');
      return false;
    }

    try {
      console.log('📺 Showing interstitial ad...');

      // In production:
      // const ad = InterstitialAd.createForAdRequest('ca-app-pub-xxx');
      // await ad.show();
      
      // Mock ad
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('✅ Interstitial ad shown');
      return true;
    } catch (error) {
      console.error('❌ Interstitial ad failed:', error);
      return false;
    }
  }

  /**
   * Get remaining rewarded ads for today
   */
  getRemainingRewardedAds(): number {
    return Math.max(0, this.dailyAdLimit - this.rewardedAdCount);
  }

  /**
   * Enable/disable ads (for testing)
   */
  setAdsEnabled(enabled: boolean): void {
    this.adsEnabled = enabled;
    console.log(`📺 Ads ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Private methods

  private async loadOwnedProducts(): Promise<void> {
    try {
      const saved = await readStorageItem(STORAGE_PRODUCTS_KEY);
      if (saved) {
        this.ownedProducts = new Set(JSON.parse(saved));
        console.log(`📦 Loaded ${this.ownedProducts.size} owned products`);
      }
    } catch (error) {
      console.error('Failed to load owned products:', error);
    }
  }

  private async saveOwnedProducts(): Promise<void> {
    try {
      const products = Array.from(this.ownedProducts);
      await writeStorageItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
      console.log(`💾 Saved ${products.length} owned products`);
    } catch (error) {
      console.error('Failed to save owned products:', error);
    }
  }

  private resetDailyAdCountIfNeeded(): void {
    const today = new Date().toISOString().split('T')[0];
    
    if (this.lastAdResetDate !== today) {
      this.rewardedAdCount = 0;
      this.lastAdResetDate = today;
      this.saveAdCount();
      console.log('🔄 Daily ad count reset');
    }
  }

  private saveAdCount(): void {
    try {
      void writeStorageItem(STORAGE_AD_COUNT_KEY, JSON.stringify({
        count: this.rewardedAdCount,
        date: this.lastAdResetDate
      }));
    } catch (error) {
      console.error('Failed to save ad count:', error);
    }
  }

  private async loadAdCount(): Promise<void> {
    try {
      const raw = await readStorageItem(STORAGE_AD_COUNT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.rewardedAdCount = parsed.count ?? 0;
        this.lastAdResetDate = parsed.date ?? null;
      }
    } catch (error) {
      console.error('Failed to load ad count:', error);
    }
  }

  private async initializeIap(): Promise<void> {
    if (Platform.OS === 'web') {
      this.iapProvider = 'mock';
      return;
    }
    try {
      const mod = optionalRequire('expo-in-app-purchases');
      if (mod?.connectAsync) {
        await mod.connectAsync();
        this.iapProvider = 'expo-iap';
        this.iapModule = mod;
        console.log('✅ IAP provider initialized: expo-in-app-purchases');
        return;
      }
    } catch (error) {
      console.warn('IAP provider not available, using mock.', error);
    }
    this.iapProvider = 'mock';
  }

  private async syncEntitlements(): Promise<void> {
    const hasPremiumSlots = this.ownedProducts.has('save_slots_premium') || this.ownedProducts.has('season_pass');
    const hasRemoveAds = this.ownedProducts.has('remove_ads') || this.ownedProducts.has('season_pass');
    SaveManager.setPremiumUnlocked(hasPremiumSlots);
    SaveManager.setAdsDisabled(hasRemoveAds);
    this.adsEnabled = !hasRemoveAds;
  }
}

// Singleton instance
export const monetizationService = new MonetizationService();

// Convenience exports
export const initMonetization = () => monetizationService.initialize();
export const getProducts = () => monetizationService.getProducts();
export const purchaseProduct = (id: ProductId) => monetizationService.purchaseProduct(id);
export const hasProduct = (id: ProductId) => monetizationService.hasProduct(id);
export const isPremium = () => monetizationService.isPremium();
export const showRewardedAd = (type: 'energy' | 'intelligence' | 'money') => 
  monetizationService.showRewardedAd(type);
export const showInterstitialAd = () => monetizationService.showInterstitialAd();
export const getRemainingRewardedAds = () => monetizationService.getRemainingRewardedAds();
export const restorePurchases = () => monetizationService.restorePurchases();
