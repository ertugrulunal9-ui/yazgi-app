/**
 * PaywallModal.tsx — Yazgi Premium paywall (Paket 12)
 *
 * Displays premium offerings (monthly / yearly),
 * feature list, purchase & restore buttons.
 */

import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useUI } from '../context/UIContext';
import {
  canOpenPremiumPaywall,
  getOfferings,
  PremiumErrorCode,
  getPremiumRuntimeStatus,
  isPremium,
  PremiumRuntimeStatus,
  PurchaseResult,
  purchaseProduct,
  restorePurchases,
  SubscriptionProduct,
} from '../services/subscriptionManager';
import {
  logPurchaseAttempted,
  logPurchaseResult,
  logShopProductClicked,
  logShopViewed,
} from '../utils/analyticsEvents';
import { Modal } from './ui/Modal';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

const PREMIUM_COLOR = '#d97706'; // amber/gold brand accent

const FEATURES: Array<{ icon: React.ComponentProps<typeof Feather>['name']; key: string }> = [
  { icon: 'slash', key: 'premium.featureNoAds' },
  { icon: 'rotate-ccw', key: 'premium.featureUnlimitedUndo' },
  { icon: 'save', key: 'premium.featureExtraSlots' },
  { icon: 'star', key: 'premium.featurePremiumEvents' },
];

type TranslateFn = (
  key: string,
  params?: Record<string, string | number | boolean>,
  fallback?: string
) => string;

const parsePriceFromLabel = (label: string): number | undefined => {
  if (typeof label !== 'string') return undefined;
  const normalized = label.replace(',', '.').replace(/[^0-9.]/g, '');
  if (!normalized) return undefined;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const resolvePremiumError = (
  result: PurchaseResult,
  mode: 'purchase' | 'restore',
  t: TranslateFn
): string => {
  let baseMessage: string;

  switch (result.code) {
    case 'premium_disabled':
    case 'premium_kill_switch':
      baseMessage = t('premium.temporarilyUnavailable');
      break;
    case 'purchases_disabled':
      baseMessage = t('premium.purchaseDisabled');
      break;
    case 'restore_disabled':
      baseMessage = t('premium.restoreDisabled');
      break;
    case 'billing_unavailable':
      baseMessage = t('premium.billingUnavailable');
      break;
    case 'revenuecat_unavailable':
    case 'missing_config':
    case 'not_initialized':
      baseMessage = t('premium.storeUnavailable');
      break;
    case 'offerings_unavailable':
      baseMessage = t('premium.offeringsUnavailable');
      break;
    case 'product_not_found':
      baseMessage = t('premium.productNotFound');
      break;
    case 'entitlement_not_granted':
      baseMessage = t('premium.entitlementNotGranted');
      break;
    case 'no_active_subscription':
      baseMessage = t('premium.noActiveSubscription');
      break;
    case 'network_error':
      baseMessage = t('premium.networkError');
      break;
    default:
      if (result.error && result.error !== 'cancelled') {
        baseMessage = result.error;
        break;
      }
      baseMessage = mode === 'purchase'
        ? t('premium.purchaseFailed')
        : t('premium.restoreFailed');
      break;
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__ && result.code) {
    return `${baseMessage} [${result.code}]`;
  }

  return baseMessage;
};

const getRuntimeBlockedMessage = (runtimeStatus: PremiumRuntimeStatus, t: TranslateFn): string => {
  if (!runtimeStatus.featureEnabled || runtimeStatus.killSwitchActive) {
    return t('premium.temporarilyUnavailable');
  }

  if (!runtimeStatus.hasApiKey || !runtimeStatus.revenueCatAvailable) {
    return t('premium.storeUnavailable');
  }

  if (runtimeStatus.canMakePayments === false) {
    return t('premium.billingUnavailable');
  }

  if (!runtimeStatus.purchasesEnabled && !runtimeStatus.restoreEnabled) {
    return t('premium.temporarilyUnavailable');
  }

  return t('premium.temporarilyUnavailable');
};

export const PaywallModal: React.FC<PaywallModalProps> = ({ visible, onClose }) => {
  const { theme, metrics, t } = useUI();
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingOfferings, setLoadingOfferings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runtimeStatus = getPremiumRuntimeStatus();
  const billingAvailable = runtimeStatus.canMakePayments !== false;
  const purchaseAllowed = runtimeStatus.purchasesEnabled
    && runtimeStatus.hasApiKey
    && runtimeStatus.revenueCatAvailable
    && billingAvailable;
  const restoreAllowed = runtimeStatus.restoreEnabled
    && runtimeStatus.hasApiKey
    && runtimeStatus.revenueCatAvailable
    && billingAvailable;

  useEffect(() => {
    if (!visible) return;
    void logShopViewed({ placement: 'settings' });
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    setError(null);
    setLoadingOfferings(true);

    let cancelled = false;
    (async () => {
      const runtimeStatus = getPremiumRuntimeStatus();
      if (!canOpenPremiumPaywall()) {
        if (!cancelled) {
          setProducts([]);
          setSelectedId(null);
          setError(getRuntimeBlockedMessage(runtimeStatus, t));
          setLoadingOfferings(false);
        }
        return;
      }

      const offerings = await getOfferings();
      if (!cancelled) {
        setProducts(offerings);
        void logShopViewed({
          placement: 'settings',
          productCount: offerings.length,
        });
        setSelectedId((previous) => {
          if (offerings.length === 0) return null;
          if (previous && offerings.some(item => item.id === previous)) return previous;
          return offerings[0].id;
        });
        if (offerings.length === 0) {
          setError(t('premium.offeringsUnavailable'));
        }
        setLoadingOfferings(false);
      }
    })();

    return () => { cancelled = true; };
  }, [visible, t]);

  const handlePurchase = useCallback(async () => {
    if (!selectedId || loading || restoring || loadingOfferings) return;

    const selectedProduct = products.find((item) => item.id === selectedId);
    const selectedPrice = parsePriceFromLabel(selectedProduct?.price ?? '');
    const selectedCurrency = selectedPrice !== undefined ? 'USD' : undefined;

    void logShopProductClicked({
      placement: 'settings',
      productId: selectedId,
      owned: false,
      price: selectedPrice,
      currency: selectedCurrency,
    });

    if (!purchaseAllowed) {
      let blockedCode: PremiumErrorCode = 'missing_config';
      if (runtimeStatus.hasApiKey && !billingAvailable) {
        blockedCode = 'billing_unavailable';
      } else if (runtimeStatus.hasApiKey) {
        blockedCode = 'purchases_disabled';
      }
      void logPurchaseResult({
        placement: 'settings',
        productId: selectedId,
        success: false,
        price: selectedPrice,
        currency: selectedCurrency,
        category: 'premium',
        errorMessage: blockedCode,
      });
      setError(resolvePremiumError(
        {
          success: false,
          code: blockedCode,
        },
        'purchase',
        t
      ));
      return;
    }

    setLoading(true);
    setError(null);

    void logPurchaseAttempted({
      placement: 'settings',
      productId: selectedId,
      price: selectedPrice,
      currency: selectedCurrency,
      category: 'premium',
    });

    const result = await purchaseProduct(selectedId);
    setLoading(false);
    void logPurchaseResult({
      placement: 'settings',
      productId: selectedId,
      success: result.success,
      price: selectedPrice,
      currency: selectedCurrency,
      category: 'premium',
      errorMessage: result.error ?? result.code,
    });
    if (result.success) {
      onClose();
      return;
    }

    if (result.code === 'cancelled' || result.error === 'cancelled') {
      return;
    }

    setError(resolvePremiumError(result, 'purchase', t));
  }, [selectedId, loading, restoring, loadingOfferings, products, onClose, purchaseAllowed, runtimeStatus.hasApiKey, billingAvailable, t]);

  const handleRestore = useCallback(async () => {
    if (restoring || loading || loadingOfferings) return;
    if (!restoreAllowed) {
      let blockedCode: PremiumErrorCode = 'missing_config';
      if (runtimeStatus.hasApiKey && !billingAvailable) {
        blockedCode = 'billing_unavailable';
      } else if (runtimeStatus.hasApiKey) {
        blockedCode = 'restore_disabled';
      }
      setError(resolvePremiumError(
        {
          success: false,
          code: blockedCode,
        },
        'restore',
        t
      ));
      return;
    }

    setRestoring(true);
    setError(null);

    const result = await restorePurchases();
    setRestoring(false);
    if (result.success) {
      onClose();
    } else {
      setError(resolvePremiumError(result, 'restore', t));
    }
  }, [restoring, loading, loadingOfferings, onClose, restoreAllowed, runtimeStatus.hasApiKey, billingAvailable, t]);

  if (isPremium()) {
    return (
      <Modal visible={visible} title={t('premium.title')} onClose={onClose}>
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Feather name="check-circle" color="#16a34a" size={48} />
          <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '700', marginTop: 12 }}>
            {t('premium.alreadyActive')}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 6, textAlign: 'center' }}>
            {t('premium.enjoyBenefits')}
          </Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      title={t('premium.title')}
      onClose={onClose}
      contentStyle={{ maxHeight: '85%' }}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
        {/* Feature list */}
        <View style={{ marginBottom: 16 }}>
          {FEATURES.map((feat) => (
            <View
              key={feat.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 8,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: `${PREMIUM_COLOR}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name={feat.icon} color={PREMIUM_COLOR} size={18} />
              </View>
              <Text style={{ color: theme.textPrimary, fontSize: Math.max(14, metrics.font), fontWeight: '500', flex: 1 }}>
                {t(feat.key)}
              </Text>
            </View>
          ))}
        </View>

        {/* Product cards */}
        <View style={{ gap: 10, marginBottom: 16 }}>
          {loadingOfferings && (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
              <ActivityIndicator color={theme.textSecondary} size="small" />
            </View>
          )}

          {!loadingOfferings && products.map((product) => {
            const isSelected = selectedId === product.id;
            const isYearly = product.period === 'yearly';
            return (
              <TouchableOpacity
                key={product.id}
                onPress={() => setSelectedId(product.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 14,
                  backgroundColor: isSelected ? `${PREMIUM_COLOR}15` : theme.surfaceBase,
                  borderWidth: 2,
                  borderColor: isSelected ? PREMIUM_COLOR : theme.border,
                }}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '700' }}>
                      {product.title}
                    </Text>
                    {isYearly && (
                      <View style={{
                        backgroundColor: '#16a34a',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 6,
                      }}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>
                          {t('premium.savePercent', { percent: 44 })}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                    {product.description}
                  </Text>
                </View>
                <Text style={{ color: isSelected ? PREMIUM_COLOR : theme.textPrimary, fontSize: 18, fontWeight: '800', marginLeft: 12 }}>
                  {product.price}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Error */}
        {error && (
          <Text style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 10 }}>
            {error}
          </Text>
        )}

        {/* Purchase button */}
        <TouchableOpacity
          onPress={handlePurchase}
          disabled={loading || restoring || loadingOfferings || !selectedId || !purchaseAllowed}
          style={{
            paddingVertical: 16,
            borderRadius: 14,
            backgroundColor: loading || !purchaseAllowed ? `${PREMIUM_COLOR}80` : PREMIUM_COLOR,
            alignItems: 'center',
            marginBottom: 10,
          }}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>
              {t('premium.subscribe')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity
          onPress={handleRestore}
          disabled={restoring || loading || loadingOfferings || !restoreAllowed}
          style={{ alignItems: 'center', paddingVertical: 10 }}
          activeOpacity={0.7}
        >
          {restoring ? (
            <ActivityIndicator color={theme.textSecondary} size="small" />
          ) : (
            <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>
              {t('premium.restore')}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
};


