import axios from '../axios';
import type {
  ApiResponse,
  ChangePasswordRequest,
  UserResponse,
  UpdateUserRequest,
  EmailChangeRequest,
  VerifyEmailChangeRequest,
  ResendEmailChangeOtpRequest,
  LinkedSocialAccountResponse,
  GoogleLinkIntentResponse,
  UnlinkSocialAccountRequest,
} from '@/types';

const USER_URL = '/users';

const userService = {
  getProfile: (): Promise<ApiResponse<UserResponse>> =>
    axios.get(`${USER_URL}/me`),

  updateProfile: (data: UpdateUserRequest): Promise<ApiResponse<UserResponse>> =>
    axios.put(`${USER_URL}/me`, data),

  changePassword: (data: ChangePasswordRequest): Promise<ApiResponse<void>> =>
    axios.put(`${USER_URL}/change-password`, data),

  uploadAvatar: (file: File): Promise<ApiResponse<UserResponse>> => {
    const form = new FormData();
    form.append('file', file);
    return axios.post(`${USER_URL}/me/avatar`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  requestEmailChange: (data: EmailChangeRequest): Promise<ApiResponse<void>> =>
    axios.post(`${USER_URL}/me/email/change-request`, data),

  verifyEmailChange: (data: VerifyEmailChangeRequest): Promise<ApiResponse<UserResponse>> =>
    axios.post(`${USER_URL}/me/email/verify`, data),

  resendEmailChangeOtp: (data: ResendEmailChangeOtpRequest): Promise<ApiResponse<void>> =>
    axios.post(`${USER_URL}/me/email/resend-otp`, data),

  getSocialAccounts: (): Promise<ApiResponse<LinkedSocialAccountResponse[]>> =>
    axios.get(`${USER_URL}/me/social-accounts`),

  issueGoogleLinkIntent: (): Promise<ApiResponse<GoogleLinkIntentResponse>> =>
    axios.post(`${USER_URL}/me/social-accounts/GOOGLE/link-intent`),

  unlinkGoogleSocialAccount: (data: UnlinkSocialAccountRequest): Promise<ApiResponse<void>> =>
    axios.delete(`${USER_URL}/me/social-accounts/GOOGLE`, { data }),
};

export default userService;
