import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiCheck, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import adminProductService from '@/apis/services/adminProductService';
import type { ProductResponse, ProductVariantResponse } from '@/types';
import { Modal, FormInput, PrimaryButton } from '.';
import { formatPrice } from '@/utils/format';
import { useDebounce } from '@/hooks/useDebounce';

interface ProductPickerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedVariants: SelectedVariant[]) => void;
  // pre-selected variant ids
  initialSelectedIds?: string[];
}

export interface SelectedVariant {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  originalPrice: number;
  imageUrl: string;
}

export default function ProductPickerModal({ open, onClose, onConfirm, initialSelectedIds = [] }: ProductPickerModalProps) {
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 500);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(false);
  
  // variant_id -> SelectedVariant
  const [selectedMap, setSelectedMap] = useState<Record<string, SelectedVariant>>({});
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setKeyword('');
      fetchProducts('');
      // We don't populate initialSelectedIds into selectedMap here because we typically want the picker
      // to only return *newly* selected items, OR we initialize it so they can deselect.
      // Usually, appending is easier. Let's just track newly selected items.
      setSelectedMap({});
      setExpandedProducts({});
    }
  }, [open]);

  const fetchProducts = useCallback(async (search: string) => {
    setLoading(true);
    try {
      const res = await adminProductService.getAll({ keyword: search, size: 20 });
      setProducts(res.data?.data || []);
      
      // Auto-expand first 3 products if searching
      if (search) {
        const expandMap: Record<string, boolean> = {};
        res.data?.data?.slice(0, 3).forEach(p => expandMap[p.id] = true);
        setExpandedProducts(prev => ({ ...prev, ...expandMap }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchProducts(debouncedKeyword);
  }, [debouncedKeyword, fetchProducts, open]);

  const handleToggleProduct = (productId: string) => {
    setExpandedProducts(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleToggleVariant = (product: ProductResponse, variant: ProductVariantResponse) => {
    setSelectedMap(prev => {
      const next = { ...prev };
      if (next[variant.id]) {
        delete next[variant.id];
      } else {
        next[variant.id] = {
          variantId: variant.id,
          productId: product.id,
          productName: product.name,
          variantName: variant.variantName || 'Mặc định',
          originalPrice: variant.price,
          imageUrl: variant.images?.[0]?.imageUrl || product.mainImageUrl || '',
        };
      }
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirm(Object.values(selectedMap));
    onClose();
  };

  const selectedCount = Object.keys(selectedMap).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chọn sản phẩm tham gia"
      size="xl"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-slate-500">
            Đã chọn: <strong className="text-primary-600">{selectedCount}</strong> phân loại
          </div>
          <div className="gap-2 flex">
            <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
              Hủy
            </button>
            <PrimaryButton onClick={handleConfirm} disabled={selectedCount === 0} icon={<FiCheck />}>
              Xác nhận
            </PrimaryButton>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="max-h-[50vh] overflow-y-auto border border-slate-100 rounded-xl bg-white">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Đang tìm kiếm...</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-slate-400">Không tìm thấy sản phẩm nào</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {products.map(product => {
                const isExpanded = expandedProducts[product.id];
                const variants = product.variants || [];
                // Check if ALL variants of this product are selected
                const allSelected = variants.length > 0 && variants.every(v => selectedMap[v.id] || initialSelectedIds.includes(v.id));
                const someSelected = variants.some(v => selectedMap[v.id] || initialSelectedIds.includes(v.id));

                return (
                  <div key={product.id} className="flex flex-col">
                    {/* Product Row */}
                    <div 
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 transition-colors ${someSelected ? 'bg-indigo-50/30' : ''}`}
                      onClick={() => handleToggleProduct(product.id)}
                    >
                      <div className="text-slate-400">
                        {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                      </div>
                      <img src={product.mainImageUrl || '/placeholder.png'} alt={product.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-800 truncate">{product.name}</div>
                        <div className="text-xs text-slate-500">{variants.length} phân loại</div>
                      </div>
                    </div>

                    {/* Variants */}
                    {isExpanded && (
                      <div className="bg-slate-50/50 pl-11 pr-3 py-2 divide-y divide-slate-100">
                        {variants.map(variant => {
                          const isAlreadyInSale = initialSelectedIds.includes(variant.id);
                          const isChecked = !!selectedMap[variant.id] || isAlreadyInSale;

                          return (
                           <div 
                              key={variant.id} 
                              className={`flex items-center gap-3 py-2 ${isAlreadyInSale ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100'}`}
                              onClick={() => !isAlreadyInSale && handleToggleVariant(product, variant)}
                            >
                              <div className="flex-shrink-0">
                                <div className={`w-[22px] h-[22px] rounded-md border-2 flex items-center justify-center transition-all duration-150
                                  ${isAlreadyInSale
                                    ? 'bg-slate-200 border-slate-300'
                                    : isChecked
                                      ? 'bg-purple-600 border-purple-600 shadow-[0_0_0_2px_rgba(147,51,234,0.2)]'
                                      : 'bg-white border-slate-300 hover:border-purple-400'}
                                `}>
                                  {isChecked && <FiCheck className="text-white" strokeWidth={3} size={14} />}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-slate-700">
                                  {variant.variantName ? variant.variantName : 'Mặc định'}
                                </div>
                                <div className="text-xs text-slate-500">Mã: {variant.sku} • Kho: {variant.stockQuantity}</div>
                              </div>
                              <div className="font-semibold text-sm text-slate-700">
                                {formatPrice(variant.price)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
