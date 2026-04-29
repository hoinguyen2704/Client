import axios, { adminAxios } from "../axios";
import type {
  ApiResponse,
  PageResponse,
  ReturnRequestResponse,
  CreateReturnRequestPayload,
  ReviewReturnRequestPayload,
  UpdateReturnStatusRequestPayload,
  ProcessRefundRequestPayload,
  ReturnExportParams,
  ReturnListParams,
  ReturnReportExportParams,
} from "@/types";

const RETURN_URL = "/returns";

const buildCreateReturnRequestFormData = (
  data: CreateReturnRequestPayload,
  evidenceFiles?: File[],
) => {
  const formData = new FormData();
  formData.append(
    "payload",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );

  evidenceFiles?.forEach((file) => {
    formData.append("files", file);
  });

  return formData;
};

const returnService = {
  // User endpoints (api/v1/returns)
  create: (
    data: CreateReturnRequestPayload,
    evidenceFiles?: File[],
    idempotencyKey?: string,
  ): Promise<ApiResponse<ReturnRequestResponse>> =>
    axios.post(RETURN_URL, buildCreateReturnRequestFormData(data, evidenceFiles), {
      headers: idempotencyKey
        ? {
            "Content-Type": "multipart/form-data",
            "Idempotency-Key": idempotencyKey,
          }
        : {
            "Content-Type": "multipart/form-data",
          },
    }),

  getMine: (
    params?: ReturnListParams,
  ): Promise<ApiResponse<PageResponse<ReturnRequestResponse>>> =>
    axios.get(RETURN_URL, { params }),

  getByNumber: (
    returnNumber: string,
  ): Promise<ApiResponse<ReturnRequestResponse>> =>
    axios.get(`${RETURN_URL}/${returnNumber}`),

  cancel: (
    returnNumber: string,
  ): Promise<ApiResponse<ReturnRequestResponse>> =>
    axios.patch(`${RETURN_URL}/${returnNumber}/cancel`),

  // Admin endpoints (admin/api/v1/returns)
  adminGetAll: (
    params?: ReturnListParams,
  ): Promise<ApiResponse<PageResponse<ReturnRequestResponse>>> =>
    adminAxios.get(RETURN_URL, { params }),

  adminGetByNumber: (
    returnNumber: string,
  ): Promise<ApiResponse<ReturnRequestResponse>> =>
    adminAxios.get(`${RETURN_URL}/${returnNumber}`),

  adminReview: (
    returnRequestId: string,
    data: ReviewReturnRequestPayload,
  ): Promise<ApiResponse<ReturnRequestResponse>> =>
    adminAxios.patch(`${RETURN_URL}/${returnRequestId}/review`, data),

  adminUpdateStatus: (
    returnRequestId: string,
    data: UpdateReturnStatusRequestPayload,
  ): Promise<ApiResponse<ReturnRequestResponse>> =>
    adminAxios.patch(`${RETURN_URL}/${returnRequestId}/status`, data),

  adminProcessRefund: (
    returnRequestId: string,
    data: ProcessRefundRequestPayload,
    idempotencyKey?: string,
  ): Promise<ApiResponse<ReturnRequestResponse>> =>
    adminAxios.post(`${RETURN_URL}/${returnRequestId}/refund`, data, {
      headers: idempotencyKey
        ? { "Idempotency-Key": idempotencyKey }
        : undefined,
    }),

  adminExport: (params?: ReturnExportParams): Promise<Blob> =>
    adminAxios.get(`${RETURN_URL}/export`, { params, responseType: 'blob' }),

  adminExportReportByRange: (params: ReturnReportExportParams): Promise<Blob> =>
    adminAxios.get(`${RETURN_URL}/report-export`, { params, responseType: 'blob' }),
};

export default returnService;
