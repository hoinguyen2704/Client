import { adminAxios } from '../axios';
import type { ApiResponse, PageResponse, FeedbackResponse } from '@/types';

const URL = '/feedbacks';

const adminFeedbackService = {
  getAll: (params?: {
    status?: string;
    productId?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<FeedbackResponse>>> =>
    adminAxios.get(URL, { params }),

  updateStatus: (id: string, status: string): Promise<ApiResponse<FeedbackResponse>> =>
    adminAxios.patch(`${URL}/${id}/status`, { status }),

  reply: (id: string, reply: string): Promise<ApiResponse<FeedbackResponse>> =>
    adminAxios.post(`${URL}/${id}/reply`, { reply }),

  export: (params?: { status?: string; productId?: string }): Promise<Blob> =>
    adminAxios.get(`${URL}/export`, { params, responseType: 'blob' }),
};

export default adminFeedbackService;
