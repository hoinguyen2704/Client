import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCalendar, FiUser, FiBook } from 'react-icons/fi';
import cmsService from '@/apis/services/cmsService';
import { formatDateLong as formatDate } from '@/utils/format';
import type { ArticleResponse } from '@/types';
import { BackButton } from '@/components';

export default function BlogDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState<ArticleResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    cmsService.getArticleBySlug(slug).then(r => setArticle(r.data)).catch(() => setArticle(null)).finally(() => setLoading(false));
  }, [slug]);
  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
      <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />)}</div>
    </div>
  );

  if (!article) return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <FiBook className="text-6xl text-slate-300 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Không tìm thấy bài viết</h2>
      <Link to="/blog" className="text-purple-600 hover:underline">← Quay lại Blog</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BackButton to="/blog" label="Quay lại Blog" className="mb-6" />

      <article className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
        {article.thumbnailUrl && (
          <img src={article.thumbnailUrl} alt={article.title} className="w-full aspect-video object-cover" />
        )}
        <div className="p-8">
          <h1 className="text-3xl font-black mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
            {article.authorName && <span className="flex items-center gap-1"><FiUser /> {article.authorName}</span>}
            <span className="flex items-center gap-1"><FiCalendar /> {formatDate(article.createdAt)}</span>
          </div>
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </article>
    </div>
  );
}
