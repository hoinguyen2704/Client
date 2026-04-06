import { adminAxios } from "../axios";
import type {
  ApiResponse,
  PageResponse,
  BannerResponse,
  ArticleResponse,
} from "@/types";

const URL = "/cms";

type BannerMutationRequest = {
  title: string;
  imageUrl: string;
  targetUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
};

type ArticleMutationRequest = {
  title: string;
  content: string;
  thumbnailUrl?: string;
  isPublished?: boolean;
};

type CmsImageUploadResponse = {
  imageUrl: string;
};

const adminCmsService = {
  //  Banners
  getBanners: (): Promise<ApiResponse<BannerResponse[]>> =>
    adminAxios.get(`${URL}/banners`),

  createBanner: (
    data: BannerMutationRequest,
  ): Promise<ApiResponse<BannerResponse>> =>
    adminAxios.post(`${URL}/banners`, data),

  updateBanner: (
    id: string,
    data: Partial<BannerMutationRequest>,
  ): Promise<ApiResponse<BannerResponse>> =>
    adminAxios.put(`${URL}/banners/${id}`, data),

  deleteBanner: (id: string): Promise<ApiResponse<void>> =>
    adminAxios.delete(`${URL}/banners/${id}`),

  uploadBannerImage: (
    file: File,
  ): Promise<ApiResponse<CmsImageUploadResponse>> => {
    const formData = new FormData();
    formData.append("file", file);
    return adminAxios.post(`${URL}/banners/upload-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  //  Articles
  getArticles: (params?: {
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<ArticleResponse>>> =>
    adminAxios.get(`${URL}/articles`, { params }),

  createArticle: (
    data: ArticleMutationRequest,
  ): Promise<ApiResponse<ArticleResponse>> =>
    adminAxios.post(`${URL}/articles`, data),

  updateArticle: (
    id: string,
    data: Partial<ArticleMutationRequest>,
  ): Promise<ApiResponse<ArticleResponse>> =>
    adminAxios.put(`${URL}/articles/${id}`, data),

  deleteArticle: (id: string): Promise<ApiResponse<void>> =>
    adminAxios.delete(`${URL}/articles/${id}`),

  uploadArticleThumbnail: (
    file: File,
  ): Promise<ApiResponse<CmsImageUploadResponse>> => {
    const formData = new FormData();
    formData.append("file", file);
    return adminAxios.post(`${URL}/articles/upload-thumbnail`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default adminCmsService;
