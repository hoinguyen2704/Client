import { useState, useEffect, useRef, useCallback } from 'react';
import { FiPlus, FiUploadCloud, FiLoader } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
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
  Pagination,
  ActionButtons,
  ConfirmDialog,
  StatusBadge,
  TableRowSkeleton,
} from '@/components';
import {
  AdminTable,
  AdminTableBodyRow,
  AdminTableCard,
  AdminTableCell,
  AdminTableEmptyRow,
  AdminTableHeadCell,
  AdminTableHeadRow,
  AdminTableScroll,
} from '@/components/ui/AdminTable';
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
  const { t } = useTranslation(['adminContent', 'common']);
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

  const fetchBanners = useCallback(async () => {
    try {
      const res = await adminCmsService.getBanners();
      setBanners(res.data || []);
    } catch (err) { console.error('Failed to fetch banners:', err); toast.error(t('adminContent:cms.toasts.loadBannersFailed')); }
  }, [t]);

  const fetchArticles = useCallback(async (p = 1) => {
    try {
      const res = await adminCmsService.getArticles({ page: p, size: PAGE_SIZE.LARGE });
      setArticlePageData(res.data);
      setArticles(res.data.data || []);
    } catch (err) { console.error('Failed to fetch articles:', err); toast.error(t('adminContent:cms.toasts.loadArticlesFailed')); }
  }, [t]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchBanners(), fetchArticles(1)]).finally(() => setLoading(false));
  }, [fetchArticles, fetchBanners]);

  useEffect(() => {
    if (articlePage === 1) return;
    fetchArticles(articlePage);
  }, [articlePage, fetchArticles]);

  const handleDeleteBanner = async (id: string) => {
    setDeleteTarget(null);
    try {
      await adminCmsService.deleteBanner(id);
      fetchBanners();
      toast.success(t('adminContent:cms.toasts.deleteBannerSuccess'));
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(t('adminContent:cms.toasts.deleteBannerFailed'));
    }
  };

  const handleDeleteArticle = async (id: string) => {
    setDeleteTarget(null);
    try {
      await adminCmsService.deleteArticle(id);
      fetchArticles(articlePage);
      toast.success(t('adminContent:cms.toasts.deleteArticleSuccess'));
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(t('adminContent:cms.toasts.deleteArticleFailed'));
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
      toast.error(t('adminContent:cms.validation.bannerImageRequired'));
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
        toast.success(t('adminContent:cms.banners.updateSuccess'));
      } else {
        await adminCmsService.createBanner(payload);
        toast.success(t('adminContent:cms.banners.createSuccess'));
      }

      resetBannerModal();
      await fetchBanners();
    } catch (err) {
      console.error('Save banner failed:', err);
      toast.error(t('adminContent:cms.toasts.saveBannerFailed'));
    } finally {
      setSavingBanner(false);
    }
  };

  const handleSaveArticle = async () => {
    const title = articleForm.title.trim();
    const content = articleForm.content.trim();
    if (!title || !content) {
      toast.error(t('adminContent:cms.validation.articleRequired'));
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
        toast.success(t('adminContent:cms.articles.updateSuccess'));
      } else {
        await adminCmsService.createArticle(payload);
        toast.success(t('adminContent:cms.articles.createSuccess'));
      }

      resetArticleModal();
      if (articlePage !== 1) {
        setArticlePage(1);
      }
      await fetchArticles(1);
    } catch (err) {
      console.error('Save article failed:', err);
      toast.error(t('adminContent:cms.toasts.saveArticleFailed'));
    } finally {
      setSavingArticle(false);
    }
  };

  const validateImageFile = (file: File | undefined) => {
    if (!file) return false;
    if (!file.type.startsWith('image/')) {
      toast.error(t('adminContent:cms.upload.invalidType'));
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('adminContent:cms.upload.maxSize'));
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
      toast.success(t('adminContent:cms.toasts.uploadBannerSuccess'));
    } catch (err) {
      console.error('Upload banner image failed:', err);
      toast.error(t('adminContent:cms.toasts.uploadBannerFailed'));
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
      toast.success(t('adminContent:cms.toasts.uploadThumbnailSuccess'));
    } catch (err) {
      console.error('Upload article thumbnail failed:', err);
      toast.error(t('adminContent:cms.toasts.uploadThumbnailFailed'));
    } finally {
      setUploadingArticleThumbnail(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">{t('adminContent:cms.title')}</h1>
        <PrimaryButton onClick={openCreateModal} icon={<FiPlus className="text-base" />} className="w-full sm:w-auto">
          {tab === 'banners' ? t('adminContent:cms.actions.addBanner') : t('adminContent:cms.actions.addArticle')}
        </PrimaryButton>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setTab('banners')} className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium whitespace-nowrap transition-colors ${tab === 'banners' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'}`}>
          {t('adminContent:cms.tabs.banners')}
        </button>
        <button onClick={() => setTab('articles')} className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium whitespace-nowrap transition-colors ${tab === 'articles' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'}`}>
          {t('adminContent:cms.tabs.articles')}
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
            <div className="sm:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-12 text-center text-subtle border border-slate-100 dark:border-slate-800">{t('adminContent:cms.table.emptyBanners')}</div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="relative h-40 bg-slate-100 dark:bg-slate-800">
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 sm:p-4 flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-md truncate">{banner.title}</span>
                    <StatusBadge status={banner.isActive ? 'active' : 'hidden'} />
                  </div>
                  <div className="shrink-0 scale-90 sm:scale-100">
                    <ActionButtons
                      actions={[
                        { type: 'edit', onClick: () => openEditBanner(banner) },
                        { type: 'delete', onClick: () => setDeleteTarget({ type: 'banner', id: banner.id }) }
                      ]}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <AdminTableCard>
          <AdminTableScroll>
            <AdminTable className="min-w-[860px]">
              <thead>
                <AdminTableHeadRow>
                  <AdminTableHeadCell>{t('adminContent:cms.table.title')}</AdminTableHeadCell>
                  <AdminTableHeadCell>{t('adminContent:cms.table.author')}</AdminTableHeadCell>
                  <AdminTableHeadCell>{t('adminContent:cms.table.createdAt')}</AdminTableHeadCell>
                  <AdminTableHeadCell>{t('adminContent:cms.table.status')}</AdminTableHeadCell>
                  <AdminTableHeadCell className="text-right">{t('adminContent:cms.table.actions')}</AdminTableHeadCell>
                </AdminTableHeadRow>
              </thead>
              <tbody>
                {loading ? (
                  <TableRowSkeleton rows={5} cols={5} />
                ) : articles.length === 0 ? (
                  <AdminTableEmptyRow colSpan={5}>{t('adminContent:cms.table.emptyArticles')}</AdminTableEmptyRow>
                ) : (
                  articles.map((a) => (
                    <AdminTableBodyRow key={a.id}>
                      <AdminTableCell>
                        <div className="flex items-center gap-3">
                          {a.thumbnailUrl && <img src={a.thumbnailUrl} className="w-10 h-10 rounded-lg object-cover" />}
                          <span className="font-bold line-clamp-1">{a.title}</span>
                        </div>
                      </AdminTableCell>
                      <AdminTableCell className="text-muted">{a.authorName || t('common:labels.notAvailable')}</AdminTableCell>
                      <AdminTableCell className="text-muted">{formatDate(a.createdAt)}</AdminTableCell>
                      <AdminTableCell>
                        <StatusBadge status={a.isPublished ? 'published' : 'draft'} />
                      </AdminTableCell>
                      <AdminTableCell className="text-right">
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
                      </AdminTableCell>
                    </AdminTableBodyRow>
                  ))
                )}
              </tbody>
            </AdminTable>
          </AdminTableScroll>
          {articlePageData && (
            <Pagination variant="admin"
              currentPage={articlePage}
              totalPages={articlePageData.lastPage}
              totalItems={articlePageData.total}
              perPage={PAGE_SIZE.LARGE}
              label={t('adminContent:cms.table.pagination')}
              onPageChange={setArticlePage}
            />
          )}
        </AdminTableCard>
      )}

      <Modal
        open={bannerModalOpen}
        onClose={closeBannerModal}
        title={editingBannerId ? t('adminContent:cms.banners.editTitle') : t('adminContent:cms.banners.createTitle')}
        footer={(
          <>
            <ModalCancelButton onClick={closeBannerModal}>{t('common:actions.cancel')}</ModalCancelButton>
            <Button
              onClick={handleSaveBanner}
              loading={savingBanner}
              disabled={!bannerForm.imageUrl.trim() || uploadingBannerImage}
            >
              {editingBannerId ? t('adminContent:cms.actions.update') : t('adminContent:cms.actions.create')}
            </Button>
          </>
        )}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-md font-semibold">{t('adminContent:cms.banners.uploadImage')}</p>
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
              {uploadingBannerImage ? t('adminContent:cms.banners.uploadingImage') : t('adminContent:cms.banners.chooseImage')}
            </Button>
            <p className="text-sm text-muted">{t('adminContent:cms.banners.helperText')}</p>
            {bannerForm.imageUrl && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
                <img src={bannerForm.imageUrl} alt={t('adminContent:cms.banners.previewAlt')} className="w-full h-40 object-cover" />
              </div>
            )}
          </div>

          <FormInput
            label={t('adminContent:cms.banners.titleLabel')}
            value={bannerForm.title}
            onChange={(e) => setBannerForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder={t('adminContent:cms.banners.titlePlaceholder')}
          />
          <FormInput
            label={`${t('adminContent:cms.banners.imageUrl')} *`}
            value={bannerForm.imageUrl}
            onChange={(e) => setBannerForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
            placeholder="https://..."
            required
          />
          <FormInput
            label={t('adminContent:cms.banners.targetUrl')}
            value={bannerForm.targetUrl}
            onChange={(e) => setBannerForm((prev) => ({ ...prev, targetUrl: e.target.value }))}
            placeholder={t('adminContent:cms.banners.targetPlaceholder')}
          />
          <FormInput
            label={t('adminContent:cms.banners.sortOrder')}
            type="number"
            min={0}
            value={bannerForm.sortOrder}
            onChange={(e) => setBannerForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
          />
          <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
            <div>
              <p className="text-md font-semibold">{t('adminContent:cms.banners.visibilityTitle')}</p>
              <p className="text-sm text-muted mt-0.5">{t('adminContent:cms.banners.visibilityDescription')}</p>
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
        title={editingArticleId ? t('adminContent:cms.articles.editTitle') : t('adminContent:cms.articles.createTitle')}
        footer={(
          <>
            <ModalCancelButton onClick={closeArticleModal}>{t('common:actions.cancel')}</ModalCancelButton>
            <Button
              onClick={handleSaveArticle}
              loading={savingArticle}
              disabled={!articleForm.title.trim() || !articleForm.content.trim() || uploadingArticleThumbnail}
            >
              {editingArticleId ? t('adminContent:cms.actions.update') : t('adminContent:cms.actions.create')}
            </Button>
          </>
        )}
        size="2xl"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-md font-semibold">{t('adminContent:cms.articles.uploadThumbnail')}</p>
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
              {uploadingArticleThumbnail ? t('adminContent:cms.articles.uploadingThumbnail') : t('adminContent:cms.articles.chooseThumbnail')}
            </Button>
            <p className="text-sm text-muted">{t('adminContent:cms.articles.helperText')}</p>
            {articleForm.thumbnailUrl && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
                <img src={articleForm.thumbnailUrl} alt={t('adminContent:cms.articles.previewAlt')} className="w-full h-40 object-cover" />
              </div>
            )}
          </div>

          <FormInput
            label={`${t('adminContent:cms.articles.titleLabel')} *`}
            value={articleForm.title}
            onChange={(e) => setArticleForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder={t('adminContent:cms.articles.titlePlaceholder')}
            required
          />
          <FormInput
            label={t('adminContent:cms.articles.thumbnailUrl')}
            value={articleForm.thumbnailUrl}
            onChange={(e) => setArticleForm((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
            placeholder="https://..."
          />
          <FormTextarea
            label={`${t('adminContent:cms.articles.content')} *`}
            value={articleForm.content}
            onChange={(e) => setArticleForm((prev) => ({ ...prev, content: e.target.value }))}
            placeholder={t('adminContent:cms.articles.contentPlaceholder')}
            rows={10}
            required
          />
          <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
            <div>
              <p className="text-md font-semibold">{t('adminContent:cms.articles.publishTitle')}</p>
              <p className="text-sm text-muted mt-0.5">{t('adminContent:cms.articles.publishDescription')}</p>
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
        title={deleteTarget?.type === 'banner' ? t('adminContent:cms.deleteDialog.bannerTitle') : t('adminContent:cms.deleteDialog.articleTitle')}
        message={deleteTarget?.type === 'banner' ? t('adminContent:cms.deleteDialog.bannerMessage') : t('adminContent:cms.deleteDialog.articleMessage')}
        confirmLabel={t('common:actions.delete')}
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
