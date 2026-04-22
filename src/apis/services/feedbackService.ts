import axios from '../axios';
import type {
  ApiResponse,
  FeedbackResponse,
  FeedbackRequest,
  ProductFeedbackPageResponse,
} from '@/types';

const FEEDBACK_URL = '/feedbacks';

const feedbackService = {
  getByProduct: (
    productId: string,
    params?: { page?: number; size?: number; rating?: number; hasComment?: boolean },
  ): Promise<ApiResponse<ProductFeedbackPageResponse>> =>
    axios.get(`${FEEDBACK_URL}/product/${productId}`, {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 10,
        ...(params?.rating ? { rating: params.rating } : {}),
        ...(typeof params?.hasComment === 'boolean' ? { hasComment: params.hasComment } : {}),
      },
    }),

  submit: (data: FeedbackRequest): Promise<ApiResponse<FeedbackResponse>> =>
    axios.post(FEEDBACK_URL, data),

  checkProduct: (productId: string): Promise<ApiResponse<boolean>> =>
    axios.get(`${FEEDBACK_URL}/check/${productId}`),

  getMyFeedback: (productId: string, variantId: string, orderId: string): Promise<ApiResponse<FeedbackResponse[]>> =>
    axios.get(`${FEEDBACK_URL}/my-feedback`, { params: { productId, variantId, orderId } }),

  delete: (feedbackId: string): Promise<ApiResponse<void>> =>
    axios.delete(`${FEEDBACK_URL}/${feedbackId}`),
};

export default feedbackService;
