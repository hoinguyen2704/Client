import { adminAxios } from '../axios';
import type {
  ApiResponse,
  PageResponse,
  BannerResponse,
  ArticleResponse,
} from '@/types';

const URL = '/cms';

const adminCmsService = {
  // ─── Banners ────────────────────────────────────
  getBanners: (): Promise<ApiResponse<BannerResponse[]>> =>
    adminAxios.get(`${URL}/banners`),

  createBanner: (data: { title: string; imageUrl: string; targetUrl?: string; sortOrder?: number; isActive?: boolean }): Promise<ApiResponse<BannerResponse>> =>
    adminAxios.post(`${URL}/banners`, data),

  updateBanner: (id: string, data: Partial<{ title: string; imageUrl: string; targetUrl?: string; sortOrder?: number; isActive?: boolean }>): Promise<ApiResponse<BannerResponse>> =>
    adminAxios.put(`${URL}/banners/${id}`, data),

  deleteBanner: (id: string): Promise<ApiResponse<void>> =>
    adminAxios.delete(`${URL}/banners/${id}`),

  // ─── Articles ───────────────────────────────────
  getArticles: (params?: { page?: number; size?: number }): Promise<ApiResponse<PageResponse<ArticleResponse>>> =>
    adminAxios.get(`${URL}/articles`, { params }),

  createArticle: (data: { title: string; content: string; thumbnailUrl?: string; status?: string }): Promise<ApiResponse<ArticleResponse>> =>
    adminAxios.post(`${URL}/articles`, data),

  updateArticle: (id: string, data: Partial<{ title: string; content: string; thumbnailUrl?: string; status?: string }>): Promise<ApiResponse<ArticleResponse>> =>
    adminAxios.put(`${URL}/articles/${id}`, data),

  deleteArticle: (id: string): Promise<ApiResponse<void>> =>
    adminAxios.delete(`${URL}/articles/${id}`),
};

export default adminCmsService;
