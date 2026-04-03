import BaseService from './baseService';
import { adminAxios } from '../axios';
import type { ApiResponse, FeedbackResponse } from '@/types';

class AdminFeedbackService extends BaseService<FeedbackResponse> {
  constructor() {
    super('/feedbacks', adminAxios);
  }

  async updateStatus(id: string, status: string): Promise<ApiResponse<FeedbackResponse>> {
    return this.http.patch(`${this.endpoint}/${id}/status`, { status });
  }

  async reply(id: string, reply: string): Promise<ApiResponse<FeedbackResponse>> {
    return this.http.post(`${this.endpoint}/${id}/reply`, { reply });
  }

  async export(params?: { status?: string; productId?: string }): Promise<Blob> {
    return this.http.get(`${this.endpoint}/export`, { params, responseType: 'blob' });
  }
}

export default new AdminFeedbackService();
