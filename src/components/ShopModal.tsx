import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Product,
  ProductId,
  getProducts,
  purchaseProduct,
  hasProduct,
  restorePurchases
} from '../services/monetization';
import { logPurchase } from '../utils/analyticsEvents';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess?: (productId: ProductId) => void;
  theme: {
    appBg: string;
    surfaceBase: string;
    surfaceRaised: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    accentEvent: string;
  };
}

const PRODUCT_ICONS: Record<ProductId, keyof typeof Feather.glyphMap> = {
  premium_traits: 'star',
  save_slots_premium: 'save',
  cosmetics_pack: 'zap',
  energy_refill: 'zap',
  season_pass: 'trending-up',
  remove_ads: 'x-circle',
};

const PRODUCT_COLORS: Record<ProductId, string> = {
  premium_traits: '#f59e0b',
  save_slots_premium: '#3b82f6',
  cosmetics_pack: '#ec4899',
  energy_refill: '#22c55e',
  season_pass: '#8b5cf6',
  remove_ads: '#ef4444',
};

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, onPurchaseSuccess, theme }) => {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<ProductId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const parsePrice = (price?: string): number => {
    if (!price) return 0;
    const normalized = price.replace(/[^\d,.-]/g, '').replace(',', '.');
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const prods = await getProducts();
      setProducts(prods);
    } catch (err) {
      setError('Ürünler yüklenemedi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId: ProductId) => {
    try {
      setPurchasing(productId);
      setError(null);

      const result = await purchaseProduct(productId);

      if (result.success) {
        setSuccessMessage(`${products.find(p => p.id === productId)?.title} satın alındı!`);
        onPurchaseSuccess?.(productId);
        const product = products.find(p => p.id === productId);
        const price = parsePrice(product?.localizedPrice || product?.price);
        const category = productId === 'energy_refill'
          ? 'boosts'
          : productId === 'cosmetics_pack'
            ? 'cosmetics'
            : 'premium';
        void logPurchase(productId, price, category);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || 'Satın alma başarısız');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      setError(null);

      const restored = await restorePurchases();

      if (restored.length > 0) {
        setSuccessMessage(`${restored.length} satın alım geri yüklendi!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Geri yüklenecek satın alım bulunamadı');
      }
    } catch (err) {
      setError('Geri yükleme başarısız');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={[styles.container, { backgroundColor: theme.surfaceBase, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerEmoji}>💰</Text>
              <View>
                <Text style={styles.headerTitle}>Premium Mağaza</Text>
                <Text style={styles.headerSubtitle}>Oyun deneyimini geliştir!</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Mağazayı kapat"
              accessibilityRole="button"
            >
              <Feather name="x" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Success/Error Messages */}
          {successMessage && (
            <View style={styles.successBanner}>
              <Feather name="check-circle" size={20} color="#4ade80" />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorBanner}>
              <Feather name="alert-circle" size={20} color="#f87171" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Products */}
          <ScrollView style={styles.productList} contentContainerStyle={styles.productListContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.accentEvent} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                  Ürünler yükleniyor...
                </Text>
              </View>
            ) : (
              products.map((product) => {
                const owned = hasProduct(product.id);
                const isPurchasing = purchasing === product.id;
                const productColor = PRODUCT_COLORS[product.id] || '#6b7280';
                const productIcon = PRODUCT_ICONS[product.id] || 'shopping-bag';

                return (
                  <View
                    key={product.id}
                    style={[
                      styles.productCard,
                      {
                        backgroundColor: owned ? 'rgba(34, 197, 94, 0.1)' : theme.surfaceRaised,
                        borderColor: owned ? 'rgba(34, 197, 94, 0.3)' : theme.border,
                      }
                    ]}
                  >
                    <View style={styles.productHeader}>
                      <View style={[styles.productIcon, { backgroundColor: productColor }]}>
                        <Feather name={productIcon} size={24} color="#fff" />
                      </View>
                      <View style={styles.productInfo}>
                        <Text style={[styles.productTitle, { color: theme.textPrimary }]}>
                          {product.title}
                        </Text>
                        <Text style={[styles.productDescription, { color: theme.textSecondary }]}>
                          {product.description}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.productFooter}>
                      <Text style={styles.productPrice}>{product.price}</Text>

                      {owned ? (
                        <View style={styles.ownedBadge}>
                          <Feather name="check" size={16} color="#4ade80" />
                          <Text style={styles.ownedText}>Sahipsin</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handlePurchase(product.id)}
                          disabled={isPurchasing}
                          style={[styles.purchaseButton, isPurchasing && styles.purchaseButtonDisabled]}
                          accessibilityLabel={`${product.title} satın al`}
                          accessibilityRole="button"
                        >
                          <Text style={styles.purchaseButtonText}>
                            {isPurchasing ? 'Satın alınıyor...' : 'Satın Al'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { backgroundColor: theme.surfaceRaised, borderTopColor: theme.border }]}>
            <TouchableOpacity
              onPress={handleRestore}
              disabled={loading}
              style={styles.restoreButton}
              accessibilityLabel="Satın alımları geri yükle"
              accessibilityRole="button"
            >
              <Text style={[styles.restoreText, loading && { opacity: 0.5 }]}>
                Satın Alımları Geri Yükle
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeFooterButton, { backgroundColor: theme.surfaceBase, borderColor: theme.border }]}
              accessibilityLabel="Kapat"
              accessibilityRole="button"
            >
              <Text style={[styles.closeFooterText, { color: theme.textPrimary }]}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    borderRadius: 16,
    borderWidth: 1,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(88, 28, 135, 0.8)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerEmoji: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(216, 180, 254, 0.8)',
    marginTop: 2,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 12,
  },
  successText: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '600',
  },
  productList: {
    flex: 1,
  },
  productListContent: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
  },
  productCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  productHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  productDescription: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#a78bfa',
  },
  ownedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ownedText: {
    color: '#4ade80',
    fontWeight: '700',
    fontSize: 13,
  },
  purchaseButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  purchaseButtonDisabled: {
    opacity: 0.5,
  },
  purchaseButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  restoreButton: {
    padding: 8,
  },
  restoreText: {
    color: '#60a5fa',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  closeFooterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  closeFooterText: {
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ShopModal;
