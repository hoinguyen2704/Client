// ─── Auth Request DTOs ──────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}

export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  newPassword: string;
}

export interface SocialLoginRequest {
  provider: 'GOOGLE' | 'FACEBOOK';
  accessToken: string;
}

// ─── Auth Response ──────────────────────────────────────────────
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserSummary;
}

export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'ADMIN' | 'USER' | 'SHIPPER';
  status: string;
}
