import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';
import { toast } from 'sonner';
import adminCmsService from '@/apis/services/adminCmsService';
import type { BannerResponse, ArticleResponse, PageResponse } from '@/types';
import { PAGE_SIZE } from '@/constants/paginationConstants';
import { PrimaryButton, AdminPagination, ActionButtons, ConfirmDialog, StatusBadge, TableRowSkeleton } from '@/components/ui';
import { formatDate } from '@/utils/format';

export default function CMS() {
  const [tab, setTab] = useState<'banners' | 'articles'>('banners');
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [articles, setArticles] = useState<ArticleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlePage, setArticlePage] = useState(1);
  const [articlePageData, setArticlePageData] = useState<PageResponse<ArticleResponse> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'banner' | 'article'; id: string } | null>(null);

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
    Promise.all([fetchBanners(), fetchArticles()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchArticles(articlePage); }, [articlePage]);

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



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Quản lý nội dung</h1>
        <PrimaryButton icon={<FiPlus className="text-base" />}>
          {tab === 'banners' ? 'Thêm banner' : 'Thêm bài viết'}
        </PrimaryButton>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('banners')} className={`px-6 py-3 rounded-xl font-medium transition-colors ${tab === 'banners' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'}`}>
          Banners
        </button>
        <button onClick={() => setTab('articles')} className={`px-6 py-3 rounded-xl font-medium transition-colors ${tab === 'articles' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'}`}>
          Bài viết
        </button>
      </div>

      {tab === 'banners' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse">
                <div className="h-40 bg-slate-200 dark:bg-slate-700" />
                <div className="p-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" /></div>
              </div>
            ))
          ) : banners.length === 0 ? (
            <div className="col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-12 text-center text-slate-400 border border-slate-100 dark:border-slate-800">Chưa có banner nào</div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 group">
                <div className="relative h-40 bg-slate-100 dark:bg-slate-800">
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button className="p-2 bg-white rounded-lg shadow-lg"><FiEdit2 /></button>
                    <button onClick={() => setDeleteTarget({ type: 'banner', id: banner.id })} className="p-2 bg-white rounded-lg shadow-lg text-red-600"><FiTrash2 /></button>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                  <th className="p-4 font-medium">Tiêu đề</th>
                  <th className="p-4 font-medium">Tác giả</th>
                  <th className="p-4 font-medium">Ngày tạo</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium text-right">Thao tác</th>
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
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {a.thumbnailUrl && <img src={a.thumbnailUrl} className="w-10 h-10 rounded-lg object-cover" />}
                          <span className="font-bold line-clamp-1">{a.title}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500">{a.authorName || '—'}</td>
                      <td className="p-4 text-slate-500">{formatDate(a.createdAt)}</td>
                      <td className="p-4">
                        <StatusBadge status={a.isPublished ? 'published' : 'draft'} />
                      </td>
                      <td className="p-4 text-right">
                        <ActionButtons
                          actions={[
                            {
                              type: 'edit',
                              onClick: () => {}
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
