import { api } from "./api";

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: number;
        email: string;
        name: string;
        role: string;
        isActive: boolean;
    };
}

export interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
}

export const authApi = {
    login: async (data: LoginData) => {
        return api.post<AuthResponse>("/auth/login", data);
    },

    register: async (data: RegisterData) => {
        return api.post<AuthResponse>("/auth/register", data);
    },

    verify: async (token: string) => {
        return api.get<{ user: User }>("/auth/verify", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
};
