import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUploadCloud, FiLoader } from 'react-icons/fi';
import { toast } from 'sonner';
import adminCmsService from '@/apis/services/adminCmsService';
import type { BannerResponse, ArticleResponse, PageResponse, BannerForm, ArticleForm } from '@/types';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import {
  PrimaryButton,
  Button,
  Modal,
  ModalCancelButton,
  FormInput,
  FormTextarea,
  SwitchToggle,
  AdminPagination,
  ActionButtons,
  ConfirmDialog,
  StatusBadge,
  TableRowSkeleton,
} from '@/components';
import { formatDate } from '@/utils/format';



const EMPTY_BANNER_FORM: BannerForm = {
  title: '',
  imageUrl: '',
  targetUrl: '',
  sortOrder: '0',
  isActive: true,
};

const EMPTY_ARTICLE_FORM: ArticleForm = {
  title: '',
  content: '',
  thumbnailUrl: '',
  isPublished: false,
};

export default function CMS() {
  const [tab, setTab] = useState<'banners' | 'articles'>('banners');
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [articles, setArticles] = useState<ArticleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlePage, setArticlePage] = useState(1);
  const [articlePageData, setArticlePageData] = useState<PageResponse<ArticleResponse> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'banner' | 'article'; id: string } | null>(null);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState<BannerForm>(EMPTY_BANNER_FORM);
  const [articleForm, setArticleForm] = useState<ArticleForm>(EMPTY_ARTICLE_FORM);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);
  const [uploadingArticleThumbnail, setUploadingArticleThumbnail] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement | null>(null);
  const articleFileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchBanners = async () => {
    try {
      const res = await adminCmsService.getBanners();
      setBanners(res.data || []);
    } catch (err) { console.error('Failed to fetch banners:', err); toast.error('Tải banner thất bại!'); }
  };

  const fetchArticles = async (p = 1) => {
    try {
      const res = await adminCmsService.getArticles({ page: p, size: PAGE_SIZE.LARGE });
      setArticlePageData(res.data);
      setArticles(res.data.data || []);
    } catch (err) { console.error('Failed to fetch articles:', err); toast.error('Tải bài viết thất bại!'); }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchBanners(), fetchArticles(1)]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (articlePage === 1) return;
    fetchArticles(articlePage);
  }, [articlePage]);

  const handleDeleteBanner = async (id: string) => {
    setDeleteTarget(null);
    try {
      await adminCmsService.deleteBanner(id);
      fetchBanners();
      toast.success('Xóa banner thành công!');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Xóa banner thất bại!');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    setDeleteTarget(null);
    try {
      await adminCmsService.deleteArticle(id);
      fetchArticles(articlePage);
      toast.success('Xóa bài viết thành công!');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Xóa bài viết thất bại!');
    }
  };

  const openCreateModal = () => {
    if (tab === 'banners') {
      setEditingBannerId(null);
      setBannerForm(EMPTY_BANNER_FORM);
      setBannerModalOpen(true);
      return;
    }
    setEditingArticleId(null);
    setArticleForm(EMPTY_ARTICLE_FORM);
    setArticleModalOpen(true);
  };

  const openEditBanner = (banner: BannerResponse) => {
    setEditingBannerId(banner.id);
    setBannerForm({
      title: banner.title || '',
      imageUrl: banner.imageUrl || '',
      targetUrl: banner.targetUrl || '',
      sortOrder: String(banner.sortOrder ?? 0),
      isActive: Boolean(banner.isActive),
    });
    setBannerModalOpen(true);
  };

  const openEditArticle = (article: ArticleResponse) => {
    setEditingArticleId(article.id);
    setArticleForm({
      title: article.title || '',
      content: article.content || '',
      thumbnailUrl: article.thumbnailUrl || '',
      isPublished: Boolean(article.isPublished),
    });
    setArticleModalOpen(true);
  };

  const resetBannerModal = () => {
    setBannerModalOpen(false);
    setEditingBannerId(null);
    setBannerForm(EMPTY_BANNER_FORM);
  };

  const resetArticleModal = () => {
    setArticleModalOpen(false);
    setEditingArticleId(null);
    setArticleForm(EMPTY_ARTICLE_FORM);
  };

  const closeBannerModal = () => {
    if (savingBanner) return;
    resetBannerModal();
  };

  const closeArticleModal = () => {
    if (savingArticle) return;
    resetArticleModal();
  };

  const handleSaveBanner = async () => {
    const imageUrl = bannerForm.imageUrl.trim();
    if (!imageUrl) {
      toast.error('Vui lòng nhập URL ảnh banner');
      return;
    }

    setSavingBanner(true);
    try {
      const sortOrderRaw = Number.parseInt(bannerForm.sortOrder, 10);
      const payload = {
        title: bannerForm.title.trim(),
        imageUrl,
        targetUrl: bannerForm.targetUrl.trim() || undefined,
        sortOrder: Number.isNaN(sortOrderRaw) ? 0 : sortOrderRaw,
        isActive: bannerForm.isActive,
      };

      if (editingBannerId) {
        await adminCmsService.updateBanner(editingBannerId, payload);
        toast.success('Cập nhật banner thành công!');
      } else {
        await adminCmsService.createBanner(payload);
        toast.success('Thêm banner thành công!');
      }

      resetBannerModal();
      await fetchBanners();
    } catch (err) {
      console.error('Save banner failed:', err);
      toast.error('Lưu banner thất bại!');
    } finally {
      setSavingBanner(false);
    }
  };

  const handleSaveArticle = async () => {
    const title = articleForm.title.trim();
    const content = articleForm.content.trim();
    if (!title || !content) {
      toast.error('Vui lòng nhập tiêu đề và nội dung bài viết');
      return;
    }

    setSavingArticle(true);
    try {
      const payload = {
        title,
        content,
        thumbnailUrl: articleForm.thumbnailUrl.trim() || undefined,
        isPublished: articleForm.isPublished,
      };

      if (editingArticleId) {
        await adminCmsService.updateArticle(editingArticleId, payload);
        toast.success('Cập nhật bài viết thành công!');
      } else {
        await adminCmsService.createArticle(payload);
        toast.success('Thêm bài viết thành công!');
      }

      resetArticleModal();
      if (articlePage !== 1) {
        setArticlePage(1);
      }
      await fetchArticles(1);
    } catch (err) {
      console.error('Save article failed:', err);
      toast.error('Lưu bài viết thất bại!');
    } finally {
      setSavingArticle(false);
    }
  };

  const validateImageFile = (file: File | undefined) => {
    if (!file) return false;
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ hỗ trợ file ảnh (PNG, JPG, WEBP...)');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 5MB');
      return false;
    }
    return true;
  };

  const handleBannerFileChange = async (file: File | undefined) => {
    if (!validateImageFile(file)) return;

    setUploadingBannerImage(true);
    try {
      const res = await adminCmsService.uploadBannerImage(file!);
      setBannerForm((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
      toast.success('Tải ảnh banner thành công!');
    } catch (err) {
      console.error('Upload banner image failed:', err);
      toast.error('Tải ảnh banner thất bại!');
    } finally {
      setUploadingBannerImage(false);
    }
  };

  const handleArticleThumbnailChange = async (file: File | undefined) => {
    if (!validateImageFile(file)) return;

    setUploadingArticleThumbnail(true);
    try {
      const res = await adminCmsService.uploadArticleThumbnail(file!);
      setArticleForm((prev) => ({ ...prev, thumbnailUrl: res.data.imageUrl }));
      toast.success('Tải ảnh thumbnail thành công!');
    } catch (err) {
      console.error('Upload article thumbnail failed:', err);
      toast.error('Tải ảnh thumbnail thất bại!');
    } finally {
      setUploadingArticleThumbnail(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Quản lý nội dung</h1>
        <PrimaryButton onClick={openCreateModal} icon={<FiPlus className="text-base" />} className="w-full sm:w-auto">
          {tab === 'banners' ? 'Thêm banner' : 'Thêm bài viết'}
        </PrimaryButton>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setTab('banners')} className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium whitespace-nowrap transition-colors ${tab === 'banners' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'}`}>
          Banners
        </button>
        <button onClick={() => setTab('articles')} className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium whitespace-nowrap transition-colors ${tab === 'articles' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'}`}>
          Bài viết
        </button>
      </div>

      {tab === 'banners' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse">
                <div className="h-40 bg-slate-200 dark:bg-slate-700" />
                <div className="p-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" /></div>
              </div>
            ))
          ) : banners.length === 0 ? (
            <div className="sm:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-12 text-center text-slate-400 border border-slate-100 dark:border-slate-800">Chưa có banner nào</div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 group">
                <div className="relative h-40 bg-slate-100 dark:bg-slate-800">
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => openEditBanner(banner)} className="p-2 bg-white rounded-lg shadow-lg"><FiEdit2 /></button>
                    <button onClick={() => setDeleteTarget({ type: 'banner', id: banner.id })} className="p-2 bg-white rounded-lg shadow-lg text-red-600"><FiTrash2 /></button>
                  </div>
                </div>
                <div className="p-3 sm:p-4 flex justify-between items-center gap-2">
                  <span className="font-bold text-sm">{banner.title}</span>
                  <StatusBadge status={banner.isActive ? 'active' : 'hidden'} />
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                  <th className="p-3 sm:p-4 font-medium">Tiêu đề</th>
                  <th className="p-3 sm:p-4 font-medium">Tác giả</th>
                  <th className="p-3 sm:p-4 font-medium">Ngày tạo</th>
                  <th className="p-3 sm:p-4 font-medium">Trạng thái</th>
                  <th className="p-3 sm:p-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableRowSkeleton rows={5} cols={5} />
                ) : articles.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-400">Chưa có bài viết nào</td></tr>
                ) : (
                  articles.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-3">
                          {a.thumbnailUrl && <img src={a.thumbnailUrl} className="w-10 h-10 rounded-lg object-cover" />}
                          <span className="font-bold line-clamp-1">{a.title}</span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 text-slate-500">{a.authorName || '—'}</td>
                      <td className="p-3 sm:p-4 text-slate-500">{formatDate(a.createdAt)}</td>
                      <td className="p-3 sm:p-4">
                        <StatusBadge status={a.isPublished ? 'published' : 'draft'} />
                      </td>
                      <td className="p-3 sm:p-4 text-right">
                        <ActionButtons
                          actions={[
                            {
                              type: 'edit',
                              onClick: () => openEditArticle(a)
                            },
                            {
                              type: 'delete',
                              onClick: () => setDeleteTarget({ type: 'article', id: a.id })
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {articlePageData && (
            <AdminPagination
              currentPage={articlePage}
              totalPages={articlePageData.lastPage}
              totalItems={articlePageData.total}
              perPage={PAGE_SIZE.LARGE}
              label="bài viết"
              onPageChange={setArticlePage}
            />
          )}
        </div>
      )}

      <Modal
        open={bannerModalOpen}
        onClose={closeBannerModal}
        title={editingBannerId ? 'Sửa banner' : 'Thêm banner mới'}
        footer={(
          <>
            <ModalCancelButton onClick={closeBannerModal}>Hủy</ModalCancelButton>
            <Button
              onClick={handleSaveBanner}
              loading={savingBanner}
              disabled={!bannerForm.imageUrl.trim() || uploadingBannerImage}
            >
              {editingBannerId ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </>
        )}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Upload ảnh banner</p>
            <input
              ref={bannerFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => {
                void handleBannerFileChange(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => bannerFileInputRef.current?.click()}
              disabled={uploadingBannerImage}
              icon={uploadingBannerImage ? <FiLoader className="animate-spin" /> : <FiUploadCloud />}
            >
              {uploadingBannerImage ? 'Đang tải ảnh...' : 'Chọn ảnh từ máy'}
            </Button>
            <p className="text-xs text-slate-500">Hỗ trợ PNG/JPG/WEBP, tối đa 5MB.</p>
            {bannerForm.imageUrl && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
                <img src={bannerForm.imageUrl} alt="Banner preview" className="w-full h-40 object-cover" />
              </div>
            )}
          </div>

          <FormInput
            label="Tiêu đề"
            value={bannerForm.title}
            onChange={(e) => setBannerForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="VD: Flash Sale cuối tuần"
          />
          <FormInput
            label="URL ảnh banner *"
            value={bannerForm.imageUrl}
            onChange={(e) => setBannerForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
            placeholder="https://..."
            required
          />
          <FormInput
            label="Link đích"
            value={bannerForm.targetUrl}
            onChange={(e) => setBannerForm((prev) => ({ ...prev, targetUrl: e.target.value }))}
            placeholder="/products hoặc https://..."
          />
          <FormInput
            label="Thứ tự hiển thị"
            type="number"
            min={0}
            value={bannerForm.sortOrder}
            onChange={(e) => setBannerForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
          />
          <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
            <div>
              <p className="text-sm font-semibold">Hiển thị banner</p>
              <p className="text-xs text-slate-500 mt-0.5">Tắt nếu muốn ẩn banner khỏi trang chủ</p>
            </div>
            <SwitchToggle
              checked={bannerForm.isActive}
              onChange={(checked) => setBannerForm((prev) => ({ ...prev, isActive: checked }))}
              tone="blue"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={articleModalOpen}
        onClose={closeArticleModal}
        title={editingArticleId ? 'Sửa bài viết' : 'Thêm bài viết mới'}
        footer={(
          <>
            <ModalCancelButton onClick={closeArticleModal}>Hủy</ModalCancelButton>
            <Button
              onClick={handleSaveArticle}
              loading={savingArticle}
              disabled={!articleForm.title.trim() || !articleForm.content.trim() || uploadingArticleThumbnail}
            >
              {editingArticleId ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </>
        )}
        size="2xl"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Upload thumbnail</p>
            <input
              ref={articleFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => {
                void handleArticleThumbnailChange(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => articleFileInputRef.current?.click()}
              disabled={uploadingArticleThumbnail}
              icon={uploadingArticleThumbnail ? <FiLoader className="animate-spin" /> : <FiUploadCloud />}
            >
              {uploadingArticleThumbnail ? 'Đang tải ảnh...' : 'Chọn ảnh từ máy'}
            </Button>
            <p className="text-xs text-slate-500">Hỗ trợ PNG/JPG/WEBP, tối đa 5MB.</p>
            {articleForm.thumbnailUrl && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
                <img src={articleForm.thumbnailUrl} alt="Thumbnail preview" className="w-full h-40 object-cover" />
              </div>
            )}
          </div>

          <FormInput
            label="Tiêu đề *"
            value={articleForm.title}
            onChange={(e) => setArticleForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Nhập tiêu đề bài viết"
            required
          />
          <FormInput
            label="URL thumbnail"
            value={articleForm.thumbnailUrl}
            onChange={(e) => setArticleForm((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
            placeholder="https://..."
          />
          <FormTextarea
            label="Nội dung *"
            value={articleForm.content}
            onChange={(e) => setArticleForm((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="Nhập nội dung bài viết"
            rows={10}
            required
          />
          <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
            <div>
              <p className="text-sm font-semibold">Xuất bản ngay</p>
              <p className="text-xs text-slate-500 mt-0.5">Nếu tắt, bài viết sẽ ở trạng thái nháp</p>
            </div>
            <SwitchToggle
              checked={articleForm.isPublished}
              onChange={(checked) => setArticleForm((prev) => ({ ...prev, isPublished: checked }))}
              tone="blue"
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget?.type === 'banner' ? 'Xóa banner' : 'Xóa bài viết'}
        message={deleteTarget?.type === 'banner' ? 'Bạn có chắc muốn xóa banner này?' : 'Bạn có chắc muốn xóa bài viết này?'}
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget?.type === 'banner') handleDeleteBanner(deleteTarget.id);
          else if (deleteTarget?.type === 'article') handleDeleteArticle(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
