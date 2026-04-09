//  Payment Method (local UI — from PaymentMethods.tsx)
export interface PaymentMethod {
  id: number;
  type: string;
  last4: string;
  name: string;
  expiry: string;
  isDefault: boolean;
}
