import { api } from "./api";

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface ResendCodeData {
  email: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    name: string;
    email: string;
    emailVerified: boolean;
    avatar?: string | null;
    role: string;
    isActive: boolean;
  };
}

export interface RegisterResponse {
  user: {
    id: number;
    username: string;
    name: string;
    email: string;
    emailVerified: boolean;
    role: string;
  };
  message: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatar?: string | null;
  role: string;
  isActive: boolean;
}

export const authApi = {
  login: async (data: LoginData) => {
    return api.post<AuthResponse>("/auth/login", data);
  },

  register: async (data: RegisterData) => {
    return api.post<RegisterResponse>("/auth/register", data);
  },

  verifyEmail: async (data: VerifyEmailData) => {
    return api.post<AuthResponse>("/auth/verify-email", data);
  },

  resendCode: async (data: ResendCodeData) => {
    return api.post<{ message: string }>("/auth/resend-code", data);
  },

  verify: async (token: string) => {
    return api.get<{ user: User }>("/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
