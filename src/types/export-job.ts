export type ExportJobType = 'ORDERS' | 'RETURNS' | 'PRODUCTS' | 'FEEDBACKS' | 'USERS';

export type ExportJobStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED';

export interface ExportJobRequest {
  type: ExportJobType;
  params?: Record<string, unknown>;
}

export interface ExportJobResponse {
  jobId: string;
  type: ExportJobType;
  status: ExportJobStatus;
  totalRows?: number;
  processedRows?: number;
  progress?: number;
  fileName?: string;
  contentType?: string;
  errorMessage?: string;
  downloadable?: boolean;
  downloadUrl?: string;
  createdAt?: string;
  completedAt?: string;
  expiresAt?: string;
}
