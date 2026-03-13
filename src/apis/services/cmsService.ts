import axios from '../axios';
import type {
  ApiResponse,
  PageResponse,
  BannerResponse,
  ArticleResponse,
} from '@/types';

const CMS_URL = '/cms';

const cmsService = {
  getBanners: (): Promise<ApiResponse<BannerResponse[]>> =>
    axios.get(`${CMS_URL}/banners`),

  getArticles: (page = 1, size = 10): Promise<ApiResponse<PageResponse<ArticleResponse>>> =>
    axios.get(`${CMS_URL}/articles`, { params: { page, size } }),

  getArticleBySlug: (slug: string): Promise<ApiResponse<ArticleResponse>> =>
    axios.get(`${CMS_URL}/articles/${slug}`),
};

export default cmsService;
