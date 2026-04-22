import BaseService from './baseService';
import { adminAxios } from '../axios';
import type {
  ApiResponse,
  CategoryResponse,
  CategoryRequest,
  CreateVariantAttributeRequest,
  CreateVariantOptionRequest,
  VariantAttributeSchemaResponse,
  VariantOptionResponse,
} from '@/types';

class AdminCategoryService extends BaseService<CategoryResponse, CategoryRequest> {
  constructor() {
    super('/categories', adminAxios);
  }

  getSchema = async (id: string): Promise<ApiResponse<CategoryResponse>> => {
    return this.http.get(`${this.endpoint}/${id}/schema`);
  };

  createVariantAttribute = async (
    categoryId: string,
    data: CreateVariantAttributeRequest,
  ): Promise<ApiResponse<VariantAttributeSchemaResponse>> => {
    return this.http.post(
      `${this.endpoint}/${categoryId}/variant-attributes`,
      data,
    );
  };

  createVariantAttributeOption = async (
    categoryId: string,
    attributeId: string,
    data: CreateVariantOptionRequest,
  ): Promise<ApiResponse<VariantOptionResponse>> => {
    return this.http.post(
      `${this.endpoint}/${categoryId}/variant-attributes/${attributeId}/options`,
      data,
    );
  };

  toggleStatus = async (id: string): Promise<ApiResponse<CategoryResponse>> => {
    return this.http.patch(`${this.endpoint}/${id}/status`);
  };
}

export default new AdminCategoryService();
