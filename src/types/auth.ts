// Auth Types for WebDiário Student Portal

export interface LoginRequest {
  login: string;
  senha: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  nome: string;
  roles: string[];
  tenantId?: number;
  tenantName?: string;
}

export interface AuthLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface AuthRefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LogoutResponse {
  success: boolean;
}

export interface AuthErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType {
  // Auth state properties
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  
  // Auth methods
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokenMethod: () => Promise<void>;
  processSSOTokens: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
  clearError: () => void;
}
