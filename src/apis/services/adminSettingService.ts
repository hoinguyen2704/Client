import { adminAxios } from '../axios';
import type { ApiResponse, SettingResponse } from '@/types';

const URL = '/settings';

export interface SettingUpdateRequest {
  settingKey: string;
  settingValue: string;
}

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
};

export default adminSettingService;
