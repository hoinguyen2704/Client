import BaseService from './baseService';
import { adminAxios } from '../axios';
import type {
  ApiResponse,
  FeedbackExportParams,
  FeedbackReplyRequest,
  FeedbackResponse,
  FeedbackStatusUpdateRequest,
} from '@/types';

class AdminFeedbackService extends BaseService<FeedbackResponse> {
  constructor() {
    super('/feedbacks', adminAxios);
  }

  async updateStatus(id: string, status: string): Promise<ApiResponse<FeedbackResponse>> {
    const data: FeedbackStatusUpdateRequest = { status };
    return this.http.patch(`${this.endpoint}/${id}/status`, data);
  }

  async reply(id: string, reply: string): Promise<ApiResponse<FeedbackResponse>> {
    const data: FeedbackReplyRequest = { reply };
    return this.http.post(`${this.endpoint}/${id}/reply`, data);
  }

  async export(params?: FeedbackExportParams): Promise<Blob> {
    return this.http.get(`${this.endpoint}/export`, { params, responseType: 'blob' });
  }
}

export default new AdminFeedbackService();
