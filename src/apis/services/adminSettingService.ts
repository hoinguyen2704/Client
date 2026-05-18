import { adminAxios } from '../axios';
import type { ApiResponse, SettingResponse, SettingUpdateRequest } from '@/types';

const URL = '/settings';

const adminSettingService = {
  /** Lấy toàn bộ settings (grouped by SHOP, PAYMENT, SHIPPING, AI) */
  getAll: (): Promise<ApiResponse<Record<string, SettingResponse[]>>> =>
    adminAxios.get(URL),

  /** Lấy settings theo nhóm */
  getByGroup: (group: string): Promise<ApiResponse<SettingResponse[]>> =>
    adminAxios.get(`${URL}/${group}`),

  /** Cập nhật batch settings */
  batchUpdate: (data: SettingUpdateRequest[]): Promise<ApiResponse<void>> =>
    adminAxios.put(URL, data),

  uploadBankTransferQr: (file: File): Promise<ApiResponse<{ imageUrl: string }>> => {
    const form = new FormData();
    form.append('file', file);
    return adminAxios.post(`${URL}/bank-transfer/upload-qr`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default adminSettingService;
