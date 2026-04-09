//  Address
export interface AddressResponse {
  id: string;
  fullName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault: boolean;
}

export interface AddressRequest {
  fullName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault?: boolean;
}
