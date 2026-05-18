import axios from '../axios';
import type { ApiResponse } from '@/types';
import type { BankTransferConfig, ShippingConfig, PaymentMethodConfig, TaxConfig } from '@/types';

const URL = '/settings';

const settingService = {
  /** Thông tin cửa hàng (public) */
  getShop: (): Promise<ApiResponse<Record<string, string>>> =>
    axios.get(`${URL}/shop`),

  /** Danh sách phương thức thanh toán (public) */
  getPaymentMethods: (): Promise<ApiResponse<PaymentMethodConfig[]>> =>
    axios.get(`${URL}/payment-methods`),

  /** Thông tin tài khoản nhận chuyển khoản (public) */
  getBankTransfer: (): Promise<ApiResponse<BankTransferConfig>> =>
    axios.get(`${URL}/bank-transfer`),

  /** Cấu hình vận chuyển (public) */
  getShipping: (): Promise<ApiResponse<ShippingConfig>> =>
    axios.get(`${URL}/shipping`),

  /** Cấu hình thuế (public) */
  getTax: (): Promise<ApiResponse<TaxConfig>> =>
    axios.get(`${URL}/tax`),
};

export default settingService;
