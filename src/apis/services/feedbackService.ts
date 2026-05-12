import axios from '../axios';
import type {
  ApiResponse,
  FeedbackResponse,
  FeedbackRequest,
  ProductFeedbackPageResponse,
  ProductFeedbackQueryParams,
} from '@/types';

const FEEDBACK_URL = '/feedbacks';
const PRODUCT_FEEDBACK_PAGE_SIZE = 10;

const normalizeProductFeedbackSize = (size?: number) =>
  Math.min(Math.max(size ?? PRODUCT_FEEDBACK_PAGE_SIZE, 1), PRODUCT_FEEDBACK_PAGE_SIZE);

const buildFeedbackFormData = (data: FeedbackRequest, imageFiles?: File[]) => {
  const formData = new FormData();
  formData.append(
    'payload',
    new Blob([JSON.stringify(data)], { type: 'application/json' }),
  );

  imageFiles?.forEach((file) => {
    formData.append('files', file);
  });

  return formData;
};

const feedbackService = {
  getByProduct: (
    productSlug: string,
    params?: ProductFeedbackQueryParams,
  ): Promise<ApiResponse<ProductFeedbackPageResponse>> =>
    axios.get(`${FEEDBACK_URL}/product/${productSlug}`, {
      params: {
        page: params?.page ?? 1,
        size: normalizeProductFeedbackSize(params?.size),
        ...(params?.rating ? { rating: params.rating } : {}),
        ...(typeof params?.hasComment === 'boolean' ? { hasComment: params.hasComment } : {}),
      },
    }),

  submit: (data: FeedbackRequest, imageFiles?: File[]): Promise<ApiResponse<FeedbackResponse>> =>
    axios.post(FEEDBACK_URL, buildFeedbackFormData(data, imageFiles), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  checkProduct: (productSlug: string): Promise<ApiResponse<boolean>> =>
    axios.get(`${FEEDBACK_URL}/check/${productSlug}`),

  getMyFeedback: (
    productSlug: string,
    variantSku?: string,
    orderNumber?: string,
  ): Promise<ApiResponse<FeedbackResponse[]>> =>
    axios.get(`${FEEDBACK_URL}/my-feedback`, { params: { productSlug, variantSku, orderNumber } }),

  delete: (feedbackId: string): Promise<ApiResponse<void>> =>
    axios.delete(`${FEEDBACK_URL}/${feedbackId}`),
};

export default feedbackService;
