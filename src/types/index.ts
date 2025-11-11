import { Row } from '@tanstack/react-table';

export enum StorageEnum {
  USER = 'user',
  TOKEN = 'token',
}

export interface ErrorResponse {
  message?: string;
  error?: string;
  errors?: string[] | Record<string, string[]>;
  statusCode?: number;
  code?: string;
}

export interface AxiosErrorConfig {
  url?: string;
  method?: string;
  data?: string;
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, any>;
}

export interface EnhancedError extends Error {
  statusCode?: number;
  messageCode?: string;
  code?: string;
  status?: number;
  response?: {
    data?: ErrorResponse;
    status?: number;
    statusText?: string;
  };
  config?: AxiosErrorConfig;
  request?: any;
}

export interface ActionProps<TData> {
  row: Row<TData>;
  onClick: (row: Row<TData>) => void;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface Roles {
  ADMIN: string;
  TEAM_LEAD: string;
  PROJECT_MANAGER: string;
  DEVELOPER: string;
  BDE: string;
}
