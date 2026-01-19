import { api } from "./api";

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatar?: string | null;
  role: "admin" | "member";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  username: string;
  name: string;
  email: string;
  password: string;
  role?: "admin" | "member";
}

export interface UpdateUserInput {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: "admin" | "member";
  isActive?: boolean;
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "admin" | "member" | "all";
  status?: "active" | "inactive" | "all";
}

export interface PaginatedUsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const usersApi = {
  getAll: async (params: UsersQueryParams = {}): Promise<PaginatedUsersResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.role) queryParams.append("role", params.role);
    if (params.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : "/users";
    
    return api.get<PaginatedUsersResponse>(endpoint);
  },

  getById: async (id: number): Promise<User> => {
    return api.get<User>(`/users/${id}`);
  },

  create: async (data: CreateUserInput): Promise<User> => {
    return api.post<User>("/users", data);
  },

  update: async (id: number, data: UpdateUserInput): Promise<User> => {
    return api.put<User>(`/users/${id}`, data);
  },

  delete: async (id: number): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/users/${id}`);
  },

  toggleStatus: async (id: number, isActive: boolean): Promise<User> => {
    return api.patch<User>(`/users/${id}/status`, { isActive });
  },

  updateRole: async (id: number, role: "admin" | "member"): Promise<User> => {
    return api.patch<User>(`/users/${id}/role`, { role });
  },
};
