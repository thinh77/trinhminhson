import { api, PaginatedResponse } from './api';

// Backend Post type
export interface BackendPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  slug: string;
  tags: string;
  readTime: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
}

// Frontend Post create/update data
export interface CreatePostData {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  slug: string;
  tags: string;
  readTime?: string;
  userId: number;
}

export interface UpdatePostData {
  title?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  slug?: string;
  tags?: string;
  readTime?: string;
}

// Query parameters
export interface PostQueryParams {
  page?: number;
  limit?: number;
  userId?: number;
  search?: string;
}

// Posts API service
export const postsApi = {
  // Get all posts with pagination and filters
  getAll: async (params: PostQueryParams = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const endpoint = queryString ? `/posts?${queryString}` : '/posts';
    return api.get<PaginatedResponse<BackendPost>>(endpoint);
  },

  // Get post by ID
  getById: async (id: number) => {
    return api.get<BackendPost>(`/posts/${id}`);
  },

  // Get post by slug
  getBySlug: async (slug: string) => {
    return api.get<BackendPost>(`/posts/slug/${slug}`);
  },

  // Create new post
  create: async (data: CreatePostData) => {
    return api.post<BackendPost>('/posts', data);
  },

  // Update post
  update: async (id: number, data: UpdatePostData) => {
    return api.put<BackendPost>(`/posts/${id}`, data);
  },

  // Delete post
  delete: async (id: number) => {
    return api.delete<{ message: string }>(`/posts/${id}`);
  },
};
