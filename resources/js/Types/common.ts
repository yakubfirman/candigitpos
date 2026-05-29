export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface ApiResponse<T = null> {
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface FlashMessage {
  success?: string;
  error?: string;
  warning?: string;
  info?: string;
}

export interface PageProps {
  [key: string]: any;
}