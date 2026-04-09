//  Setting
export interface SettingResponse {
  id: string;
  groupName: string;
  settingKey: string;
  settingValue: string;
  valueType: string;
  description?: string;
  updatedAt?: string;
}

export interface ShippingConfig {
  defaultShippingFee: number;
  freeShippingThreshold: number;
}

export interface TaxConfig {
  enabled: boolean;
  taxPercent: number;
  taxMode: "INCLUDED" | "EXCLUDED";
  applyOnShipping: boolean;
}

export interface PaymentMethodConfig {
  id: string;
  label: string;
  enabled: boolean;
}
