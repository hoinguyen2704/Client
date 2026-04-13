import axios from '../axios';
import type {
  ApiResponse,
  UserResponse,
  UpdateUserRequest,
  EmailChangeRequest,
  VerifyEmailChangeRequest,
  ResendEmailChangeOtpRequest,
  LinkedSocialAccountResponse,
  LinkSocialAccountRequest,
  UnlinkSocialAccountRequest,
} from '@/types';

const USER_URL = '/users';

const userService = {
  getProfile: (): Promise<ApiResponse<UserResponse>> =>
    axios.get(`${USER_URL}/me`),

  updateProfile: (data: UpdateUserRequest): Promise<ApiResponse<UserResponse>> =>
    axios.put(`${USER_URL}/me`, data),

  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> =>
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

  linkSocialAccount: (data: LinkSocialAccountRequest): Promise<ApiResponse<LinkedSocialAccountResponse>> =>
    axios.post(`${USER_URL}/me/social-accounts/link`, data),

  unlinkGoogleSocialAccount: (data: UnlinkSocialAccountRequest): Promise<ApiResponse<void>> =>
    axios.delete(`${USER_URL}/me/social-accounts/GOOGLE`, { data }),
};

export default userService;
