/**
 * Monetization Service - IAP & Ads Management
 * Yazgı - Life Simulation Game
 */

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

class MonetizationService {
  private isInitialized = false;
  private ownedProducts: Set<ProductId> = new Set();
  private adProvider: 'admob' | 'unity' | 'mock' = 'mock';
  private adsEnabled = true;
  private rewardedAdCount = 0;
  private dailyAdLimit = 5;
  private lastAdResetDate: string | null = null;

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
      
      // In production:
      // await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
      // await AdMob.initialize();
      
      // Load owned products from storage
      await this.loadOwnedProducts();
      
      // Reset daily ad counter if needed
      this.resetDailyAdCountIfNeeded();
      
      this.isInitialized = true;
      console.log(`✅ Monetization Service initialized (provider: ${this.adProvider})`);
    } catch (error) {
      console.error('❌ Monetization initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get all available products
   */
  async getProducts(): Promise<Product[]> {
    if (!this.isInitialized) await this.initialize();
    
    // In production: fetch from store
    // const offerings = await Purchases.getOfferings();
    // return offerings.current?.availablePackages || [];
    
    return Object.values(PRODUCTS);
  }

  /**
   * Purchase a product
   */
  async purchaseProduct(productId: ProductId): Promise<PurchaseResult> {
    if (!this.isInitialized) await this.initialize();

    try {
      console.log(`💳 Purchasing: ${productId}`);

      // In production:
      // const { customerInfo } = await Purchases.purchasePackage(package);
      // const isPremium = customerInfo.entitlements.active[productId] !== undefined;
      
      // Mock purchase (always succeeds in dev)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.ownedProducts.add(productId);
      await this.saveOwnedProducts();

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

      // In production:
      // const customerInfo = await Purchases.restorePurchases();
      // const activeEntitlements = Object.keys(customerInfo.entitlements.active);
      
      // Mock restore
      const restored = Array.from(this.ownedProducts);
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
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('@yazgi/owned_products');
        if (saved) {
          this.ownedProducts = new Set(JSON.parse(saved));
          console.log(`📦 Loaded ${this.ownedProducts.size} owned products`);
        }
      }
    } catch (error) {
      console.error('Failed to load owned products:', error);
    }
  }

  private async saveOwnedProducts(): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        const products = Array.from(this.ownedProducts);
        localStorage.setItem('@yazgi/owned_products', JSON.stringify(products));
        console.log(`💾 Saved ${products.length} owned products`);
      }
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
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('@yazgi/ad_count', JSON.stringify({
          count: this.rewardedAdCount,
          date: this.lastAdResetDate
        }));
      }
    } catch (error) {
      console.error('Failed to save ad count:', error);
    }
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
