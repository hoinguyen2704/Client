//  Banner
export interface BannerResponse {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
}

//  Banner UI (for HeroBanner component)
export interface Banner {
  id: number;
  image: string;
  title: string;
  subtitle: string;
}

//  Banner Form (admin CMS)
export interface BannerForm {
  title: string;
  imageUrl: string;
  targetUrl: string;
  sortOrder: string;
  isActive: boolean;
}

export interface BannerMutationRequest {
  title: string;
  imageUrl: string;
  targetUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

//  Article
export interface ArticleResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  authorName?: string;
  createdAt: string;
  updatedAt?: string;
}

//  Article Form (admin CMS)
export interface ArticleForm {
  title: string;
  content: string;
  thumbnailUrl: string;
  isPublished: boolean;
}

export interface ArticleMutationRequest {
  title: string;
  content: string;
  thumbnailUrl?: string;
  isPublished?: boolean;
}

export interface ArticleListParams {
  page?: number;
  size?: number;
}

export interface CmsImageUploadResponse {
  imageUrl: string;
}
