import axios from '../axios';
import type { ApiResponse, AddressResponse } from '@/types';

const ADDRESS_URL = '/addresses';

const addressService = {
  getMyAddresses: (): Promise<ApiResponse<AddressResponse[]>> =>
    axios.get(ADDRESS_URL),

  create: (data: Omit<AddressResponse, 'id' | 'isDefault'>): Promise<ApiResponse<AddressResponse>> =>
    axios.post(ADDRESS_URL, data),

  update: (id: string, data: Partial<AddressResponse>): Promise<ApiResponse<AddressResponse>> =>
    axios.put(`${ADDRESS_URL}/${id}`, data),

  setDefault: (id: string): Promise<ApiResponse<AddressResponse>> =>
    axios.patch(`${ADDRESS_URL}/${id}/default`),

  delete: (id: string): Promise<ApiResponse<void>> =>
    axios.delete(`${ADDRESS_URL}/${id}`),
};

export default addressService;
