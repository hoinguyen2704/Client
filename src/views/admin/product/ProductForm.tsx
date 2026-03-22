import { useState, useEffect, useCallback, useRef, ChangeEvent, DragEvent } from 'react';
import { FiArrowLeft, FiImage, FiPlus, FiTrash2, FiSave, FiLoader, FiCheckSquare, FiSquare, FiChevronDown, FiCheck, FiSearch, FiUploadCloud } from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import adminProductService from '@/apis/services/adminProductService';
import adminCategoryService from '@/apis/services/adminCategoryService';
import adminBrandService from '@/apis/services/adminBrandService';
import type {
  ProductRequest,
  ProductVariantRequest,
  CategoryResponse,
  BrandResponse,
} from '@/types';
import { toast } from 'sonner';

interface VariantFormData {
  id?: string;
  sku: string;
  variantName: string;
  price: number | '';
  stock: number | '';
}

interface SpecRow {
  key: string;
  value: string;
}

const CATEGORY_TEMPLATES: Record<string, string[]> = {
  'Điện thoại': ['Màn hình', 'Hệ điều hành', 'Camera sau', 'Camera trước', 'Chip', 'RAM', 'Dung lượng lưu trữ', 'Pin, Sạc'],
  'Laptop': ['CPU', 'RAM', 'Ổ cứng', 'Màn hình', 'Card đồ họa', 'Cổng kết nối', 'Trọng lượng', 'Pin'],
  'Máy tính bảng': ['Màn hình', 'Hệ điều hành', 'Chip', 'RAM', 'Dung lượng lưu trữ', 'Phụ kiện', 'Pin, Sạc'],
  'Tai nghe': ['Kiểu dáng', 'Thời gian sử dụng', 'Thời gian sạc', 'Cổng sạc', 'Chống ồn', 'Mic thoại', 'Tương thích'],
  'Loa': ['Công suất', 'Kết nối', 'Thời lượng pin', 'Thời gian sạc', 'Phím điều khiển', 'Trọng lượng', 'Thương hiệu'],
  'Bàn phím': ['Kiểu bàn phím', 'Loại Switch', 'Kết nối', 'Đèn LED', 'Kích thước', 'Trọng lượng', 'Tương thích'],
  'Chuột': ['Độ phân giải (DPI)', 'Số nút bấm', 'Kết nối', 'Loại pin', 'Đèn LED', 'Trọng lượng', 'Tương thích'],
  'Màn hình': ['Kích thước', 'Độ phân giải', 'Tần số quét', 'Độ sáng', 'Độ tương phản', 'Cổng kết nối', 'Tấm nền', 'Tương thích VESA'],
};

const SPEC_HINTS: Record<string, string> = {
  'Màn hình': 'VD: 6.7 inch OLED, 120Hz',
  'Hệ điều hành': 'VD: Android 14, iOS 17',
  'Camera sau': 'VD: 48MP + 12MP + 12MP',
  'Camera trước': 'VD: 12MP, TrueDepth',
  'Chip': 'VD: Apple A17 Pro, Snapdragon 8 Gen 3',
  'RAM': 'VD: 8GB, 16GB',
  'Dung lượng lưu trữ': 'VD: 128GB, 256GB, 512GB',
  'Pin, Sạc': 'VD: 5000mAh, Sạc nhanh 67W',
  'CPU': 'VD: Intel Core i7-13700H',
  'Ổ cứng': 'VD: SSD 512GB NVMe',
  'Card đồ họa': 'VD: NVIDIA RTX 4060 6GB',
  'Cổng kết nối': 'VD: USB-C, HDMI, Jack 3.5mm',
  'Trọng lượng': 'VD: 150g, 1.8kg',
  'Pin': 'VD: 10 tiếng, 72Wh',
  'Phụ kiện': 'VD: Bút S Pen, Bao da',
  'Kiểu dáng': 'VD: In-ear, Over-ear, True Wireless',
  'Thời gian sử dụng': 'VD: 8 tiếng, 30 tiếng (với hộp sạc)',
  'Thời gian sạc': 'VD: 1.5 tiếng, Sạc nhanh 10 phút',
  'Cổng sạc': 'VD: USB-C, Lightning',
  'Chống ồn': 'VD: Chống ồn chủ động ANC',
  'Mic thoại': 'VD: 3 mic, Lọc ồn AI',
  'Tương thích': 'VD: iOS, Android, Windows',
  'Công suất': 'VD: 20W, 50W RMS',
  'Kết nối': 'VD: Bluetooth 5.3, USB, 2.4GHz',
  'Thời lượng pin': 'VD: 12 tiếng, 24 tiếng',
  'Phím điều khiển': 'VD: Cảm ứng, Nút vật lý',
  'Thương hiệu': 'VD: JBL, Sony, Marshall',
  'Kiểu bàn phím': 'VD: Cơ, Membrance, TKL, Full-size',
  'Loại Switch': 'VD: Cherry MX Red, Gateron Brown',
  'Đèn LED': 'VD: RGB 16 triệu màu, Đơn sắc',
  'Kích thước': 'VD: 27 inch, 34 inch',
  'Độ phân giải (DPI)': 'VD: 25600 DPI, Điều chỉnh được',
  'Số nút bấm': 'VD: 6 nút, 11 nút',
  'Loại pin': 'VD: Pin sạc, 1x AA',
  'Độ phân giải': 'VD: 2560x1440 (2K QHD)',
  'Tần số quét': 'VD: 144Hz, 165Hz, 240Hz',
  'Độ sáng': 'VD: 350 nits, HDR 400',
  'Độ tương phản': 'VD: 1000:1, 3000:1',
  'Tấm nền': 'VD: IPS, VA, OLED',
  'Tương thích VESA': 'VD: 100x100mm',
  'Màu sắc': 'VD: Đen, Trắng, Xám',
  'Chất liệu': 'VD: Nhựa ABS, Kim loại, Nhôm',
  'Bảo hành': 'VD: 12 tháng, 24 tháng',
};

const emptyVariant: VariantFormData = { sku: '', variantName: '', price: '', stock: '' };

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // ─── Form state ───────────────────────────────────────────────
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [originPrice, setOriginPrice] = useState<number | ''>('');
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [status, setStatus] = useState('ACTIVE');
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [variants, setVariants] = useState<VariantFormData[]>([{ ...emptyVariant }]);
  const [existingImages, setExistingImages] = useState<{ id: string; imageUrl: string }[]>([]);

  // ─── Dropdown data ────────────────────────────────────────────
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);

  // ─── UI state ─────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const templatePopupRef = useRef<HTMLDivElement>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close popups on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (templatePopupRef.current && !templatePopupRef.current.contains(e.target as Node)) setShowTemplatePopup(false);
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) { setShowCategoryDropdown(false); setCategorySearch(''); }
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(e.target as Node)) { setShowBrandDropdown(false); setBrandSearch(''); }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) setShowStatusDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTemplateKeys = (): string[] => {
    const catName = categories.find(c => c.id === categoryId)?.name || '';
    return Object.entries(CATEGORY_TEMPLATES).find(([key]) => catName.includes(key))?.[1] || ['Thương hiệu', 'Bảo hành'];
  };

  // ─── Fetch dropdown data ──────────────────────────────────────
  const fetchDropdowns = useCallback(async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        adminCategoryService.getAll({ size: 100 }),
        adminBrandService.getAll({ size: 100 }),
      ]);
      setCategories(catRes.data?.data ?? []);
      setBrands(brandRes.data?.data ?? []);
    } catch {
      console.error('Failed to fetch categories/brands');
    }
  }, []);

  // ─── Fetch product for edit ───────────────────────────────────
  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await adminProductService.getById(id);
      const p = res.data;
      if (!p) {
        setError('Không tìm thấy sản phẩm');
        return;
      }
      setName(p.name ?? '');
      setDescription(p.description ?? '');
      setCategoryId(p.category?.id ?? '');
      setBrandId(p.brandId ?? '');
      setOriginPrice(p.originPrice ?? '');
      setStatus(p.status ?? 'ACTIVE');
      
      try {
        if (p.specsJson) {
           const parsed = JSON.parse(p.specsJson);
           setSpecs(Object.entries(parsed).map(([k, v]) => ({ key: k, value: String(v) })));
        } else {
           setSpecs([]);
        }
      } catch (e) {
        setSpecs([]);
      }

      // Map variants
      if (p.variants && p.variants.length > 0) {
        setVariants(
          p.variants.map((v) => ({
            id: v.id,
            sku: v.sku ?? '',
            variantName: v.variantName ?? '',
            price: v.price ?? '',
            stock: v.stockQuantity ?? '',
          }))
        );
      }

      // Load product-level images from API response
      const imgs: { id: string; imageUrl: string }[] = [];
      if (p.images && p.images.length > 0) {
        p.images.forEach((img: any) => {
          imgs.push({ id: img.id, imageUrl: img.imageUrl });
        });
      }
      setExistingImages(imgs);
    } catch (err: any) {
      setError(err?.message || 'Lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [id]);



  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [isEditMode, fetchProduct]);

  // ─── Variant helpers ──────────────────────────────────────────
  const addVariant = () => {
    setVariants([...variants, { ...emptyVariant }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof VariantFormData, value: string) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        if (field === 'price' || field === 'stock') {
          return { ...v, [field]: value === '' ? '' : Number(value) };
        }
        return { ...v, [field]: value };
      })
    );
  };

  // ─── Submit ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Vui lòng nhập tên sản phẩm');
      return;
    }
    setSaving(true);
    setError('');

    const variantRequests: ProductVariantRequest[] = variants
      .filter((v) => v.variantName.trim())
      .map((v) => ({
        sku: v.sku,
        variantName: v.variantName,
        price: Number(v.price) || 0,
        stock: Number(v.stock) || 0,
      }));

    const filteredSpecs = specs.filter(s => s.key.trim() && s.value.trim());
    const specsObj = filteredSpecs.reduce((acc, curr) => ({ ...acc, [curr.key.trim()]: curr.value.trim() }), {});
    const finalSpecsJson = Object.keys(specsObj).length > 0 ? JSON.stringify(specsObj) : undefined;

    const payload: ProductRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,
      originPrice: Number(originPrice) || 0,
      specsJson: finalSpecsJson,
      status,
      variants: variantRequests.length > 0 ? variantRequests : undefined,
    };

    try {
      if (isEditMode && id) {
        await adminProductService.update(id, payload);
        // Upload pending files for edit mode too
        if (pendingFiles.length > 0) {
          await adminProductService.uploadImages(id, pendingFiles);
        }
      } else {
        const res = await adminProductService.create(payload);
        // After creating, upload pending files with the new product ID
        const newProductId = res.data?.id;
        if (newProductId && pendingFiles.length > 0) {
          await adminProductService.uploadImages(newProductId, pendingFiles);
        }
      }
      navigate('/admin/products');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Lỗi khi lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading state ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="text-3xl text-purple-500 animate-spin" />
          <span className="text-slate-500 font-medium">Đang tải sản phẩm...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <FiArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn btn-primary btn-md gap-2"
          >
            {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
            {isEditMode ? 'Cập nhật' : 'Lưu sản phẩm'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold mb-4">Thông tin cơ bản</h2>

            <div>
              <label className="block font-medium mb-2">Tên sản phẩm *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên sản phẩm..."
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category Dropdown */}
              <div>
                <label className="block font-medium mb-2">Danh mục *</label>
                <div className="relative" ref={categoryDropdownRef}>
                  <button
                    type="button"
                    onClick={() => { setShowCategoryDropdown(!showCategoryDropdown); setCategorySearch(''); }}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 flex items-center justify-between text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <span className={categoryId ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}>
                      {categoryId ? categories.find(c => c.id === categoryId)?.name || 'Chọn danh mục' : 'Chọn danh mục'}
                    </span>
                    <FiChevronDown className={`text-slate-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showCategoryDropdown && (
                    <div className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                        <div className="relative">
                          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                          <input
                            type="text"
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            placeholder="Tìm danh mục..."
                            className="w-full h-9 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-slate-900 border-none text-sm focus:ring-1 focus:ring-purple-500"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto p-1">
                        <button
                          type="button"
                          onClick={() => { setCategoryId(''); setShowCategoryDropdown(false); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                            !categoryId ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {!categoryId && <FiCheck className="text-purple-500 flex-shrink-0" />}
                          <span className={!categoryId ? '' : 'ml-5'}>Chọn danh mục</span>
                        </button>
                        {categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase())).map(cat => (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => { setCategoryId(cat.id); setShowCategoryDropdown(false); setCategorySearch(''); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                              categoryId === cat.id ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {categoryId === cat.id && <FiCheck className="text-purple-500 flex-shrink-0" />}
                            <span className={categoryId === cat.id ? '' : 'ml-5'}>{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Brand Dropdown */}
              <div>
                <label className="block font-medium mb-2">Thương hiệu</label>
                <div className="relative" ref={brandDropdownRef}>
                  <button
                    type="button"
                    onClick={() => { setShowBrandDropdown(!showBrandDropdown); setBrandSearch(''); }}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 flex items-center justify-between text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <span className={brandId ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}>
                      {brandId ? brands.find(b => b.id === brandId)?.name || 'Chọn thương hiệu' : 'Chọn thương hiệu'}
                    </span>
                    <FiChevronDown className={`text-slate-400 transition-transform ${showBrandDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showBrandDropdown && (
                    <div className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                        <div className="relative">
                          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                          <input
                            type="text"
                            value={brandSearch}
                            onChange={(e) => setBrandSearch(e.target.value)}
                            placeholder="Tìm thương hiệu..."
                            className="w-full h-9 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-slate-900 border-none text-sm focus:ring-1 focus:ring-purple-500"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto p-1">
                        <button
                          type="button"
                          onClick={() => { setBrandId(''); setShowBrandDropdown(false); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                            !brandId ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {!brandId && <FiCheck className="text-purple-500 flex-shrink-0" />}
                          <span className={!brandId ? '' : 'ml-5'}>Chọn thương hiệu</span>
                        </button>
                        {brands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase())).map(brand => (
                          <button
                            type="button"
                            key={brand.id}
                            onClick={() => { setBrandId(brand.id); setShowBrandDropdown(false); setBrandSearch(''); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                              brandId === brand.id ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {brandId === brand.id && <FiCheck className="text-purple-500 flex-shrink-0" />}
                            <span className={brandId === brand.id ? '' : 'ml-5'}>{brand.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2">Mô tả sản phẩm</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả chi tiết sản phẩm..."
                className="w-full h-64 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 resize-y outline-none"
              />
            </div>
          </div>

          {/* Specs JSON Builder */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Thông số kỹ thuật</h2>
              <div className="relative" ref={templatePopupRef}>
                <button
                  onClick={() => setShowTemplatePopup(!showTemplatePopup)}
                  className="text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  title="Chọn các thông số gợi ý theo Danh mục"
                >
                  Gợi ý mẫu
                </button>
                {showTemplatePopup && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Chọn thông số muốn thêm</p>
                    {!categoryId ? (
                      <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">Vui lòng chọn Danh mục trước!</p>
                    ) : (
                      <>
                        <div className="max-h-60 overflow-y-auto space-y-1">
                          {getTemplateKeys().map((templateKey) => {
                            const alreadyAdded = specs.some(s => s.key === templateKey);
                            return (
                              <button
                                key={templateKey}
                                onClick={() => {
                                  if (alreadyAdded) {
                                    setSpecs(specs.filter(s => s.key !== templateKey));
                                  } else {
                                    setSpecs([...specs, { key: templateKey, value: '' }]);
                                  }
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                                  alreadyAdded
                                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {alreadyAdded ? <FiCheckSquare className="text-purple-500 flex-shrink-0" /> : <FiSquare className="text-slate-400 flex-shrink-0" />}
                                {templateKey}
                              </button>
                            );
                          })}
                        </div>
                        <div className="border-t border-slate-100 dark:border-slate-700 pt-2 mt-2 flex justify-between">
                          <button
                            onClick={() => {
                              const newSpecs = [...specs];
                              getTemplateKeys().forEach(k => {
                                if (!newSpecs.some(s => s.key === k)) newSpecs.push({ key: k, value: '' });
                              });
                              setSpecs(newSpecs);
                            }}
                            className="text-xs font-medium text-blue-600 hover:underline"
                          >Chọn tất cả</button>
                          <button
                            onClick={() => setShowTemplatePopup(false)}
                            className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          >Đóng</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {specs.map((spec, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => {
                      const newSpecs = [...specs];
                      newSpecs[index].key = e.target.value;
                      setSpecs(newSpecs);
                    }}
                    placeholder="Tên thông số (VD: Màn hình)"
                    className="flex-1 h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => {
                      const newSpecs = [...specs];
                      newSpecs[index].value = e.target.value;
                      setSpecs(newSpecs);
                    }}
                    placeholder={SPEC_HINTS[spec.key] || 'Nhập giá trị...'}
                    className="flex-1 h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <button
                    onClick={() => {
                      const newSpecs = [...specs];
                      newSpecs.splice(index, 1);
                      setSpecs(newSpecs);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Xóa thông số này"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              
              {specs.length === 0 && (
                <div className="text-center py-6 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-sm">Chưa có thông số kỹ thuật nào.</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSpecs([...specs, { key: '', value: '' }])}
              className="text-sm font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 mt-2"
            >
              <FiPlus /> Thêm thông số mới
            </button>
          </div>

          {/* Variants */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold">Phân loại hàng</h2>
                <span className="text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-full">
                  {variants.length} phân loại
                </span>
              </div>
              <button
                onClick={addVariant}
                className="text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all"
              >
                <FiPlus /> Thêm phân loại
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden group hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-800/40 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {variant.variantName || `Phân loại ${index + 1}`}
                      </span>
                    </div>
                    {variants.length > 1 && (
                      <button
                        onClick={() => removeVariant(index)}
                        className="opacity-0 group-hover:opacity-100 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1"
                      >
                        <FiTrash2 className="text-sm" /> Xóa
                      </button>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider">SKU</label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        placeholder="VD: SP-001-BK"
                        className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tên phân loại</label>
                      <input
                        type="text"
                        value={variant.variantName}
                        onChange={(e) => updateVariant(index, 'variantName', e.target.value)}
                        placeholder="VD: Đen - 256GB"
                        className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider">Giá bán (VNĐ)</label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        placeholder="0"
                        className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tồn kho</label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                        placeholder="0"
                        className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {variants.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-3">
                    <FiPlus className="text-2xl text-purple-500" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Chưa có phân loại nào</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Bấm "Thêm phân loại" để bắt đầu</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Images */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Hình ảnh sản phẩm</h2>
                {existingImages.length > 0 && (
                  <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                    {existingImages.length} ảnh
                  </span>
                )}
              </div>
              {uploadingImages && <FiLoader className="animate-spin text-purple-500" />}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                if (isEditMode && id) {
                  // Edit mode: upload immediately
                  setUploadingImages(true);
                  adminProductService.uploadImages(id, files)
                    .then(res => {
                      setExistingImages(prev => [...prev, ...res.data]);
                      toast.success(`Tải lên ${files.length} ảnh thành công!`);
                    })
                    .catch(() => toast.error('Upload thất bại, vui lòng thử lại.'))
                    .finally(() => setUploadingImages(false));
                } else {
                  // Create mode: store locally for later upload
                  setPendingFiles(prev => [...prev, ...files]);
                }
                e.target.value = '';
              }}
            />

            {/* Drop zone - always visible */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e: DragEvent) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e: DragEvent) => {
                e.preventDefault();
                setIsDragging(false);
                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                if (!files.length) return;
                if (isEditMode && id) {
                  setUploadingImages(true);
                  adminProductService.uploadImages(id, files)
                    .then(res => {
                      setExistingImages(prev => [...prev, ...res.data]);
                      toast.success(`Tải lên ${files.length} ảnh thành công!`);
                    })
                    .catch(() => toast.error('Upload thất bại, vui lòng thử lại.'))
                    .finally(() => setUploadingImages(false));
                } else {
                  setPendingFiles(prev => [...prev, ...files]);
                }
              }}
              className={`border-2 border-dashed rounded-xl py-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 scale-[1.02]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-purple-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all ${
                isDragging ? 'bg-purple-100 dark:bg-purple-900/30 scale-110' : 'bg-slate-100 dark:bg-slate-800'
              }`}>
                <FiUploadCloud className={`text-2xl ${isDragging ? 'text-purple-500' : 'text-slate-400'}`} />
              </div>
              <span className="font-semibold text-sm text-slate-600 dark:text-slate-300">
                {isDragging ? 'Thả ảnh vào đây!' : 'Kéo thả hoặc bấm để chọn ảnh'}
              </span>
              <span className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP (Max 5MB)</span>
            </div>

            {/* Pending files preview (create mode) */}
            {pendingFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {pendingFiles.map((file, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden group border border-amber-300 dark:border-amber-700 aspect-square bg-slate-100 dark:bg-slate-800">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Pending ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-md shadow">
                      Chưa lưu
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingFiles(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 backdrop-blur-sm text-white rounded-lg flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Existing images (already uploaded to S3) */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {existingImages.map((img, idx) => (
                  <div key={img.id} className="relative rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-700 aspect-square bg-slate-100 dark:bg-slate-800">
                    <img
                      src={img.imageUrl}
                      alt={`Product ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === 0 && pendingFiles.length === 0 && (
                      <span className="absolute top-2 left-2 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-0.5 rounded-md shadow">
                        Ảnh chính
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await adminProductService.deleteImage(id!, img.id);
                          setExistingImages(prev => prev.filter(i => i.id !== img.id));
                          toast.success('Xóa ảnh thành công!');
                        } catch {
                          toast.error('Xóa ảnh thất bại.');
                        }
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 backdrop-blur-sm text-white rounded-lg flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold mb-4">Trạng thái & Giá</h2>

            <div>
              <label className="block font-medium mb-2">Trạng thái</label>
              <div className="relative" ref={statusDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 flex items-center justify-between text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      status === 'ACTIVE' ? 'bg-emerald-500' : status === 'DRAFT' ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />
                    <span className="text-slate-900 dark:text-slate-100">
                      {status === 'ACTIVE' ? 'Đang bán' : status === 'DRAFT' ? 'Bản nháp' : 'Đã ẩn'}
                    </span>
                  </div>
                  <FiChevronDown className={`text-slate-400 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showStatusDropdown && (
                  <div className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden p-1">
                    {[
                      { value: 'ACTIVE', label: 'Đang bán', color: 'bg-emerald-500' },
                      { value: 'DRAFT', label: 'Bản nháp', color: 'bg-amber-500' },
                      { value: 'INACTIVE', label: 'Đã ẩn', color: 'bg-slate-400' },
                    ].map(opt => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => { setStatus(opt.value); setShowStatusDropdown(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                          status === opt.value ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${opt.color} flex-shrink-0`} />
                        <span className="flex-1">{opt.label}</span>
                        {status === opt.value && <FiCheck className="text-purple-500 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2">Giá gốc (VNĐ)</label>
              <input
                type="number"
                value={originPrice}
                onChange={(e) => setOriginPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Giá khuyến mãi (VNĐ)</label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
