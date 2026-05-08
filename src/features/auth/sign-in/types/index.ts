/* eslint-disable @typescript-eslint/no-explicit-any */
export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

// Permission structure
export interface Permission {
  readonly id: string;
  readonly name: string;
}

// Permission group with nested permissions
export interface PermissionGroup {
  readonly id: string;
  readonly name: string;
  readonly children: readonly Permission[];
}

// User data structure from login response
export interface LoginUser {
  readonly user_id: string;
  readonly user: any;
  readonly name: string;
  readonly role: any;
  readonly email: string;
  readonly mobile: string | null;
  readonly token: string;
  readonly permissions: readonly PermissionGroup[];
  isAuthenticated: boolean;
}

// Complete login response structure
export interface LoginResponse {
  readonly data: LoginUser;
  readonly message?: string;
  readonly success?: boolean;
}
