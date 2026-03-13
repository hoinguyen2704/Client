import axios from '../axios';
import type { ApiResponse, PageResponse, FeedbackResponse, FeedbackRequest } from '@/types';

const FEEDBACK_URL = '/feedbacks';

const feedbackService = {
  getByProduct: (productId: string, page = 1, size = 10): Promise<ApiResponse<PageResponse<FeedbackResponse>>> =>
    axios.get(`${FEEDBACK_URL}/product/${productId}`, { params: { page, size } }),

  submit: (data: FeedbackRequest): Promise<ApiResponse<FeedbackResponse>> =>
    axios.post(FEEDBACK_URL, data),
};

export default feedbackService;
