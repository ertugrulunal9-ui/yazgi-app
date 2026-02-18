# 💰 Monetization Quick Reference

## 🎯 What Was Implemented

Full monetization system with IAP (In-App Purchases) and Ads:

- **6 Premium Products**: Traits, save slots, cosmetics, energy refill, season pass, remove ads
- **Rewarded Ads**: 5/day limit, 3 reward types (energy/intelligence/money)
- **Interstitial Ads**: Game-over flow içinde tetiklenir (remove_ads varsa atlanır)
- **Mock Mode**: Currently active for dev/testing (no real payments)

---

## 📁 New Files

```
src/
├── services/
│   └── monetization.ts          # 400+ lines: MonetizationService singleton
├── components/
│   ├── ShopModal.tsx            # 200+ lines: Premium store UI
│   └── RewardedAdButton.tsx     # 150+ lines: Rewarded ad selection
```

---

## 🛍️ Product Catalog

| Product | Price | Type | Description |
|---------|-------|------|-------------|
| premium_traits | ₺29.99 | Permanent | 15+ exclusive traits |
| save_slots_premium | ₺14.99 | Permanent | Unlock slots 4-6 |
| cosmetics_pack | ₺24.99 | Permanent | 20+ portraits |
| energy_refill | ₺9.99 | Consumable | +50 Energy instant |
| season_pass | ₺59.99 | Subscription | 2x XP for 30 days |
| remove_ads | ₺39.99 | Permanent | Remove all ads |

---

## 🎮 User Flow

### Purchase Flow
1. Click **shop button** (🛍️ in header)
2. Select product → **"Satın Al"**
3. Mock purchase succeeds (1s delay)
4. Success toast: **"✅ [Product] satın alındı!"**
5. Product stored in localStorage

### Rewarded Ad Flow
1. Main HUB → **RewardedAdButton** (below action grid)
2. Select reward: Energy (+20) / Intelligence (+10) / Money (+100 TL)
3. Click **"Reklam İzle"**
4. Mock ad plays (1s delay)
5. Reward applied + counter updates (**X/5 today**)

### Interstitial Ad
- **Trigger**: Game over (age 18)
- **Implementation**: Game-over akışında `monetizationService.showInterstitialAd()` çağrısı
- **Bypassed**: If player owns `remove_ads`

---

## 🧪 Testing (Mock Mode)

### Test Purchase
```typescript
// Open shop → Buy any product → Check localStorage
localStorage.getItem('monetization_purchases')
// → ["premium_traits", "remove_ads"]
```

### Test Rewarded Ad
```typescript
// HUB → Select Energy → Watch Ad → Check stats
// Energy should increase by +20
```

### Test Ad Limit
```typescript
// Watch 5 ads → Button should disable
// Force reset:
localStorage.removeItem('monetization_ad_limit');
window.location.reload();
```

### Test Restore Purchases
```typescript
// Shop → "Satınalımları Geri Yükle" → Check toast
```

---

## 🔧 Integration Points

### 1. Shop Button (Header)
```tsx
// App.tsx line ~2390
<button onClick={() => setShowShop(true)}>
  <ShoppingBag className="icon-density" />
</button>
```

### 2. Rewarded Ad (HUB)
```tsx
// App.tsx line ~1920
{gameState.age >= 7 && (
  <RewardedAdButton 
    onRewardGranted={(reward) => {
      // Apply reward to stats
    }}
  />
)}
```

### 3. Shop Modal (Bottom)
```tsx
// App.tsx line ~2450
{showShop && (
  <ShopModal
    isOpen={showShop}
    onClose={() => setShowShop(false)}
    onPurchaseSuccess={(productId) => {
      if (productId === 'energy_refill') {
        // Grant +50 energy
      }
    }}
  />
)}
```

### 4. Interstitial Ad (Game-over flow)
```tsx
// Game-over flow (e.g. src/screens/GameOverScreen.tsx)
useEffect(() => {
  const hasRemoveAds = await monetizationService.hasProduct('remove_ads');
  if (!hasRemoveAds) {
    await monetizationService.showInterstitialAd();
  }
}, []);
```

### 5. Premium Slot Unlock (Init)
```tsx
// App.tsx line ~556
const hasPremiumSlots = await monetizationService.hasProduct('save_slots_premium');
if (hasPremiumSlots) {
  saveManager.unlockPremiumSlots(true);
}
```

---

## 📊 Revenue Targets

| Metric | Value |
|--------|-------|
| MAU | 100,000 |
| Paying Users | 3% (3,000) |
| ARPU | ₺8.00/month |
| IAP Revenue | ₺24K/month |
| Ad Revenue | ₺150K/month |
| **Total** | **₺174K/month (₺2.09M/year)** |

---

## 🚀 Production Setup (Next Steps)

### 1. Replace Mock IAP
```bash
npm install react-native-purchases
```
```typescript
// monetization.ts
import Purchases from 'react-native-purchases';
await Purchases.configure({ apiKey: 'sk_xxxxx' });
```

### 2. Replace Mock Ads
```bash
npx expo install expo-ads-admob
```
```typescript
import { AdMobRewarded } from 'expo-ads-admob';
await AdMobRewarded.setAdUnitID('ca-app-pub-xxx');
await AdMobRewarded.showAdAsync();
```

### 3. Configure Store Products
- **App Store Connect**: Create 6 IAP products
- **Play Console**: Create 6 in-app products
- **Match IDs**: Use exact IDs from `PRODUCTS` array

### 4. Add Analytics
```typescript
import { analyticsService } from './services/analytics';
analyticsService.logPurchaseMade(productId, price, 'TRY', 'permanent');
analyticsService.logAdWatched('rewarded', 'energy_boost');
```

---

## ✅ Status

- ✅ **Development**: Complete (all features working in mock mode)
- ✅ **Testing**: All flows verified (purchase/restore/ads)
- ✅ **Integration**: Fully integrated into App.tsx
- 🚧 **Production**: Pending (replace mocks with real providers)

---

## 💡 Quick Usage

### Check Product Ownership
```typescript
const isPremium = await monetizationService.hasProduct('remove_ads');
```

### Purchase Product
```typescript
const success = await monetizationService.purchaseProduct('premium_traits');
```

### Show Rewarded Ad
```typescript
const reward = await monetizationService.showRewardedAd('ENERGY');
// Returns: 'ENERGY' | 'INTELLIGENCE' | 'MONEY' | null
```

### Restore Purchases
```typescript
const restored = await monetizationService.restorePurchases();
// Returns: ProductId[] (all owned products)
```

---

## 📚 Full Documentation

See [MONETIZATION_COMPLETE.md](./MONETIZATION_COMPLETE.md) for:
- Detailed architecture
- Production setup guide
- Analytics integration
- Troubleshooting
- Revenue projections
- Premium feature activation

---

**Current Mode**: 🧪 Mock (Dev/Testing)  
**Ready For**: 🚀 Production Integration
