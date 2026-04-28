import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiCalendar, FiUser } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import cmsService from '@/apis/services/cmsService';
import { formatDateLong as formatDate } from '@/utils/format';
import { Pagination } from '@/components';
import type { ArticleResponse } from '@/types';

export default function Blog() {
  const { t } = useTranslation('layout');
  const [articles, setArticles] = useState<ArticleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchArticles(); }, [page]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await cmsService.getArticles(page, 12);
      setArticles(res.data?.data || []);
      setTotalPages(res.data?.lastPage || 1);
    } catch { setArticles([]); }
    finally { setLoading(false); }
  };
  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 py-8 sm:py-10 md:py-12 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-2">{t('blogPage.title')}</h1>
        <p className="text-muted">{t('blogPage.description')}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <FiBook className="text-5xl text-subtle mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">{t('blogPage.empty.title')}</h3>
          <p className="text-muted">{t('blogPage.empty.description')}</p>
        </div>
      ) : (
        <>
          {/* Featured Article */}
          {articles.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Link to={`/blog/${articles[0].slug}`} className="group block relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-[4/3]">
                {articles[0].thumbnailUrl ? (
                  <img src={articles[0].thumbnailUrl} alt={articles[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-subtle"><FiBook className="text-6xl" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-300 transition-colors">{articles[0].title}</h2>
                  <div className="flex items-center gap-3 text-md text-white/80">
                    {articles[0].authorName && <span className="flex items-center gap-1"><FiUser /> {articles[0].authorName}</span>}
                    <span className="flex items-center gap-1"><FiCalendar /> {formatDate(articles[0].createdAt)}</span>
                  </div>
                </div>
              </Link>

              <div className="space-y-4">
                {articles.slice(1, 4).map(art => (
                  <Link key={art.id} to={`/blog/${art.slug}`} className="flex gap-4 group hover:bg-slate-50 dark:hover:bg-slate-800/50 p-3 -mx-3 rounded-xl transition-colors">
                    {art.thumbnailUrl ? (
                      <img src={art.thumbnailUrl} alt={art.title} className="w-28 h-20 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0" />
                    ) : (
                      <div className="w-28 h-20 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold line-clamp-2 group-hover:text-blue-600 transition-colors">{art.title}</h3>
                      <span className="text-sm text-muted mt-1 block">{formatDate(art.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All Articles Grid */}
          {articles.length > 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(4).map(art => (
                <Link key={art.id} to={`/blog/${art.slug}`} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow group">
                  <div className="aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {art.thumbnailUrl ? (
                      <img src={art.thumbnailUrl} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-subtle"><FiBook className="text-3xl" /></div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">{art.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted">
                      {art.authorName && <span>{art.authorName}</span>}
                      <span>{formatDate(art.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
