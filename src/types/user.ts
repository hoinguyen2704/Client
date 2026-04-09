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
}
