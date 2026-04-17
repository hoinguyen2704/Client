import axios from '../axios';
import type {
  ApiResponse,
  AuthResponse,
  GoogleLoginExchangeResponse,
  GoogleTicketExchangeRequest,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  SocialLoginRequest,
} from '@/types';

const AUTH_URL = '/auth';

const authService = {
  login: (data: LoginRequest): Promise<ApiResponse<AuthResponse>> =>
    axios.post(`${AUTH_URL}/login`, data),

  register: (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> =>
    axios.post(`${AUTH_URL}/register`, data),

  refreshToken: (refreshToken: string): Promise<ApiResponse<AuthResponse>> =>
    axios.post(`${AUTH_URL}/refresh-token`, { refreshToken }),

  forgotPassword: (data: ForgotPasswordRequest): Promise<ApiResponse<void>> =>
    axios.post(`${AUTH_URL}/forgot-password`, data),

  verifyOtp: (data: VerifyOtpRequest): Promise<ApiResponse<boolean>> =>
    axios.post(`${AUTH_URL}/verify-otp`, data),

  resetPassword: (data: ResetPasswordRequest): Promise<ApiResponse<void>> =>
    axios.post(`${AUTH_URL}/reset-password`, data),

  socialLogin: (data: SocialLoginRequest): Promise<ApiResponse<AuthResponse>> =>
    axios.post(`${AUTH_URL}/social-login`, data),

  exchangeGoogleTicket: (data: GoogleTicketExchangeRequest): Promise<ApiResponse<GoogleLoginExchangeResponse>> =>
    axios.post(`${AUTH_URL}/google/exchange-ticket`, data),

  logout: (): Promise<ApiResponse<void>> =>
    axios.post(`${AUTH_URL}/logout`),
};

export default authService;
