import axios, { adminAxios } from "../axios";
import type {
  ApiResponse,
  PageResponse,
  ReturnRequestResponse,
  CreateReturnRequestPayload,
  ReviewReturnRequestPayload,
  UpdateReturnStatusRequestPayload,
  ProcessRefundRequestPayload,
} from "@/types";

const RETURN_URL = "/returns";

const returnService = {
  // User endpoints (api/v1/returns)
  create: (
    data: CreateReturnRequestPayload,
    idempotencyKey?: string,
  ): Promise<ApiResponse<ReturnRequestResponse>> =>
    axios.post(RETURN_URL, data, {
      headers: idempotencyKey
        ? { "Idempotency-Key": idempotencyKey }
        : undefined,
    }),

  getMine: (params?: {
    status?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<ReturnRequestResponse>>> =>
    axios.get(RETURN_URL, { params }),

  getByNumber: (
    returnNumber: string,
  ): Promise<ApiResponse<ReturnRequestResponse>> =>
    axios.get(`${RETURN_URL}/${returnNumber}`),

  cancel: (
    returnRequestId: string,
  ): Promise<ApiResponse<ReturnRequestResponse>> =>
    axios.patch(`${RETURN_URL}/${returnRequestId}/cancel`),

  // Admin endpoints (admin/api/v1/returns)
  adminGetAll: (params?: {
    status?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<ReturnRequestResponse>>> =>
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
};

export default returnService;

