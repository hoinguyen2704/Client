import axios from '../axios';
import type { ApiResponse, FlashSaleResponse } from '@/types';

const FLASH_SALE_URL = '/flash-sales';

const flashSaleService = {
  getActive: (): Promise<ApiResponse<FlashSaleResponse>> =>
    axios.get(`${FLASH_SALE_URL}/active`),
  getActiveList: (): Promise<ApiResponse<FlashSaleResponse[]>> =>
    axios.get(`${FLASH_SALE_URL}/active-list`),
};

export default flashSaleService;
