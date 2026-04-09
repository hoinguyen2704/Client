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
export type BannerForm = {
  title: string;
  imageUrl: string;
  targetUrl: string;
  sortOrder: string;
  isActive: boolean;
};

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
export type ArticleForm = {
  title: string;
  content: string;
  thumbnailUrl: string;
  isPublished: boolean;
};
