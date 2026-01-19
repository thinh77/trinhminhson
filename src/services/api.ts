// API Configuration
// - Production (built + served by Nginx): use same-origin reverse proxy at /api
// - Development: default to local backend unless overridden via VITE_API_URL
const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:4000/api"
  : "/api";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) || DEFAULT_API_BASE_URL;

// Base URL for static assets (without /api prefix)
const STATIC_BASE_URL = import.meta.env.DEV ? "http://localhost:4000" : "";

function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

// API Response types
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  data?: T[];
  posts?: T[];
  users?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Normalize & merge headers safely (HeadersInit is a union and can't be spread reliably)
  const headers = new Headers(options.headers);

  // Auto-attach auth token if available
  const token = getAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Default JSON content type for requests with a body (unless caller already set it)
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Create error object with all fields from backend
      const error = new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      ) as Error & { code?: string; email?: string };
      
      // Preserve additional error fields (code, email, etc.)
      if (errorData.code) {
        error.code = errorData.code;
      }
      if (errorData.email) {
        error.email = errorData.email;
      }
      
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

// API service object
export const api = {
  // GET request
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  // POST request
  post: <T>(endpoint: string, data: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  // PUT request
  put: <T>(endpoint: string, data: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // PATCH request
  patch: <T>(endpoint: string, data: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // DELETE request
  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};

export { API_BASE_URL, STATIC_BASE_URL };
