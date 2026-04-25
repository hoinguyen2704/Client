import axios from "../axios";
import { adminAxios } from "../axios";
import type {
  ApiResponse,
  OrderListParams,
  OrderResponse,
  OrderStatusUpdateRequest,
  PageResponse,
  CheckoutRequest,
} from "@/types";

const ORDER_URL = "/orders";

const orderService = {
  //  User endpoints (api/v1/orders)
  checkout: (
    data: CheckoutRequest,
    idempotencyKey?: string,
  ): Promise<ApiResponse<OrderResponse>> =>
    axios.post(`${ORDER_URL}/checkout`, data, {
      headers: idempotencyKey
        ? { "Idempotency-Key": idempotencyKey }
        : undefined,
    }),

  getByNumber: (orderNumber: string): Promise<ApiResponse<OrderResponse>> =>
    axios.get(`${ORDER_URL}/${orderNumber}`),

  getMyOrders: (
    params?: OrderListParams,
  ): Promise<ApiResponse<PageResponse<OrderResponse>>> =>
    axios.get(ORDER_URL, { params }),

  cancel: (orderId: string): Promise<ApiResponse<OrderResponse>> =>
    axios.patch(`${ORDER_URL}/${orderId}/cancel`),

  //  Admin endpoints (admin/api/v1/orders)
  updateStatus: (
    orderId: string,
    status: string,
  ): Promise<ApiResponse<OrderResponse>> => {
    const data: OrderStatusUpdateRequest = { status };
    return adminAxios.patch(`${ORDER_URL}/${orderId}/status`, data);
  },
};

export default orderService;
