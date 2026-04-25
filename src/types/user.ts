//  User (admin view)
export interface UserResponse {
  id: string;
  userName?: string;
  fullName: string;
  phoneNumber?: string;
  email: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface UpdateUserRequest {
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface EmailChangeRequest {
  newEmail: string;
  currentPassword: string;
}

export interface VerifyEmailChangeRequest {
  newEmail: string;
  otpCode: string;
}

export interface ResendEmailChangeOtpRequest {
  newEmail: string;
}

export interface AdminUpdatePhoneRequest {
  phoneNumber: string;
  reason: string;
}

export interface AdminUserExportParams {
  keyword?: string;
  role?: string;
}

export interface LinkedSocialAccountResponse {
  provider: string;
  linked: boolean;
  email?: string;
  linkedAt?: string;
}

export interface GoogleLinkIntentResponse {
  ticket: string;
}

export interface UnlinkSocialAccountRequest {
  currentPassword: string;
}
