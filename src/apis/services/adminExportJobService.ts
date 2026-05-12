import { adminAxios } from '../axios';
import type { ApiResponse, ExportJobRequest, ExportJobResponse } from '@/types';

const EXPORT_JOBS_URL = '/export-jobs';

const adminExportJobService = {
  create(data: ExportJobRequest): Promise<ApiResponse<ExportJobResponse>> {
    return adminAxios.post(EXPORT_JOBS_URL, data);
  },

  get(jobId: string): Promise<ApiResponse<ExportJobResponse>> {
    return adminAxios.get(`${EXPORT_JOBS_URL}/${jobId}`);
  },

  download(jobId: string): Promise<Blob> {
    return adminAxios.get(`${EXPORT_JOBS_URL}/${jobId}/download`, { responseType: 'blob', timeout: 0 });
  },
};

export default adminExportJobService;
