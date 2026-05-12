import axios from '../axios';
import type {
  ApiResponse,
  FlashSaleItemResponse,
  FlashSaleListParams,
  FlashSaleResponse,
  PageResponse,
} from '@/types';

const FLASH_SALE_URL = '/flash-sales';

const flashSaleService = {
  getActive: (): Promise<ApiResponse<FlashSaleResponse>> =>
    axios.get(`${FLASH_SALE_URL}/active`),
  getActiveList: (): Promise<ApiResponse<FlashSaleResponse[]>> =>
    axios.get(`${FLASH_SALE_URL}/active-list`),
  getActivePage: (params?: FlashSaleListParams): Promise<ApiResponse<PageResponse<FlashSaleResponse>>> =>
    axios.get(`${FLASH_SALE_URL}/active-page`, { params }),
  getActiveSaleItems: (
    flashSaleId: string,
    params?: FlashSaleListParams,
  ): Promise<ApiResponse<PageResponse<FlashSaleItemResponse>>> =>
    axios.get(`${FLASH_SALE_URL}/${flashSaleId}/items`, { params }),
  getActiveItemsForVariants: (variantIds: string[]): Promise<ApiResponse<FlashSaleItemResponse[]>> =>
    axios.get(`${FLASH_SALE_URL}/active-items`, {
      params: { variantIds: variantIds.join(',') },
    }),
};

export default flashSaleService;
