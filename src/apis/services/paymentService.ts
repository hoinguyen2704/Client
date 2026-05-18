import axios from '../axios';
import type { ApiResponse, OrderResponse } from '@/types';

export interface MomoReturnPayload {
  partnerCode?: string | null;
  orderId?: string | null;
  requestId?: string | null;
  amount?: number | null;
  orderInfo?: string | null;
  orderType?: string | null;
  transId?: number | null;
  resultCode?: number | null;
  message?: string | null;
  payType?: string | null;
  responseTime?: number | null;
  extraData?: string | null;
  signature?: string | null;
  paymentOption?: string | null;
  userFee?: number | null;
}

const PAYMENT_URL = '/public/payments';

const paymentService = {
  processMomoReturn: (data: MomoReturnPayload): Promise<ApiResponse<OrderResponse>> =>
    axios.post(`${PAYMENT_URL}/momo/return`, data),

  processVnpayReturn: (data: Record<string, string>): Promise<ApiResponse<OrderResponse>> =>
    axios.post(`${PAYMENT_URL}/vnpay/return`, data),
};

export default paymentService;
