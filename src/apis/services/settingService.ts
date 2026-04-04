import axios from '../axios';
import type { ApiResponse } from '@/types';
import type { ShippingConfig, PaymentMethodConfig } from '@/types';

const URL = '/settings';

const settingService = {
  /** Thông tin cửa hàng (public) */
  getShop: (): Promise<ApiResponse<Record<string, string>>> =>
    axios.get(`${URL}/shop`),

  /** Danh sách phương thức thanh toán (public) */
  getPaymentMethods: (): Promise<ApiResponse<PaymentMethodConfig[]>> =>
    axios.get(`${URL}/payment-methods`),

  /** Cấu hình vận chuyển (public) */
  getShipping: (): Promise<ApiResponse<ShippingConfig>> =>
    axios.get(`${URL}/shipping`),
};

export default settingService;
