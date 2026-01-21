import React, { useState, useEffect } from 'react';
import { ShoppingBag, Zap, Star, Save, TrendingUp, XCircle } from 'lucide-react';
import { 
  monetizationService, 
  Product, 
  ProductId,
  getProducts,
  purchaseProduct,
  hasProduct,
  restorePurchases
} from '../services/monetization';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess?: (productId: ProductId) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, onPurchaseSuccess }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<ProductId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        setSuccessMessage(`${products.find(p => p.id === productId)?.title} satın alındı! ✅`);
        onPurchaseSuccess?.(productId);
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
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
        setSuccessMessage(`${restored.length} satın alım geri yüklendi! ✅`);
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

  const getProductIcon = (productId: ProductId) => {
    switch (productId) {
      case 'premium_traits': return <Star className="w-6 h-6" />;
      case 'save_slots_premium': return <Save className="w-6 h-6" />;
      case 'cosmetics_pack': return <Zap className="w-6 h-6" />;
      case 'energy_refill': return <Zap className="w-6 h-6" />;
      case 'season_pass': return <TrendingUp className="w-6 h-6" />;
      case 'remove_ads': return <XCircle className="w-6 h-6" />;
      default: return <ShoppingBag className="w-6 h-6" />;
    }
  };

  const getProductColor = (productId: ProductId) => {
    switch (productId) {
      case 'premium_traits': return 'from-yellow-500 to-amber-600';
      case 'save_slots_premium': return 'from-blue-500 to-indigo-600';
      case 'cosmetics_pack': return 'from-pink-500 to-purple-600';
      case 'energy_refill': return 'from-green-500 to-emerald-600';
      case 'season_pass': return 'from-purple-500 to-violet-600';
      case 'remove_ads': return 'from-red-500 to-rose-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="ui-modal w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-9xl opacity-10">💰</div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-yellow-300" />
              <div>
                <h2 className="text-2xl font-black text-white">Premium Mağaza</h2>
                <p className="text-sm text-purple-200">Oyun deneyimini geliştir!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="pressable w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 m-4 rounded-lg">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 m-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6 surface-base">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-secondary">
              <div className="text-4xl mb-4">⏳</div>
              <p>Ürünler yükleniyor...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => {
                const owned = hasProduct(product.id);
                const isPurchasing = purchasing === product.id;

                return (
                  <div
                    key={product.id}
                    className={`p-4 rounded-xl border ${
                      owned 
                        ? 'bg-green-900/20 border-green-500/50' 
                        : 'surface-raised border-default'
                    } transition-all`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${getProductColor(product.id)} text-white`}>
                        {getProductIcon(product.id)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{product.title}</h3>
                        <p className="text-xs text-secondary mt-1">{product.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-2xl font-black text-purple-400">
                        {product.price}
                      </span>
                      
                      {owned ? (
                        <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-2 rounded-lg font-bold text-sm">
                          ✓ Sahipsin
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePurchase(product.id)}
                          disabled={isPurchasing}
                          className="pressable bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPurchasing ? 'Satın alınıyor...' : 'Satın Al'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-default surface-raised flex justify-between items-center">
          <button
            onClick={handleRestore}
            disabled={loading}
            className="pressable text-sm text-blue-400 hover:text-blue-300 underline disabled:opacity-50"
          >
            Satın Alımları Geri Yükle
          </button>
          
          <button
            onClick={onClose}
            className="pressable surface-raised border border-default px-6 py-2 rounded-lg font-semibold"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopModal;
