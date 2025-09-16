// @ts-nocheck
import {
  LoginRequest,
  AuthLoginResponse,
  AuthRefreshTokenResponse,
  LogoutResponse
} from '../types/auth';

class AuthService {
  private readonly BASE_URL = 'http://localhost:8081/api/security';
  
  // Login
  async login(credentials: LoginRequest): Promise<AuthLoginResponse> {
    try {
      // Usar axios diretamente para a API de segurança
      const axios = await import('axios');
      const response = await axios.default.post(`${this.BASE_URL}/auth/login`, credentials);
      
      console.log('🔍 Login - Resposta recebida da API');
      
      // Verificar estrutura da resposta
      if (!response.data.accessToken) {
        console.error('❌ accessToken não encontrado na resposta');
      }
      
      if (!response.data.user) {
        console.error('❌ user não encontrado na resposta');
      }
      
      // Salvar tokens no localStorage imediatamente
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        console.log('✅ accessToken salvo no localStorage');
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
        console.log('✅ refreshToken salvo no localStorage');
      }
      
      console.log('✅ Retornando resposta do login');
      return response.data;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw this.handleError(error, 'Erro no login');
    }
  }

  // Refresh Token
  async refreshToken(refreshToken: string): Promise<AuthRefreshTokenResponse> {
    try {
      const axios = await import('axios');
      const response = await axios.default.post(`${this.BASE_URL}/auth/refresh`, {
        refreshToken: refreshToken
      });
      
      // Salvar novo token
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Erro no refresh token:', error);
      throw this.handleError(error, 'Erro ao renovar token');
    }
  }

  // Logout
  async logout(): Promise<LogoutResponse> {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const axios = await import('axios');
        await axios.default.post(`${this.BASE_URL}/auth/logout`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      // Limpar localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentTenantId');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      // Mesmo com erro, limpar localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentTenantId');
      throw this.handleError(error, 'Erro no logout');
    }
  }

  // Get User Info
  async getUserInfo(token?: string): Promise<any> {
    try {
      const authToken = token || localStorage.getItem('accessToken');
      if (!authToken) {
        throw new Error('No token available');
      }

      const axios = await import('axios');
      const response = await axios.default.get(`${this.BASE_URL}/user/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar informações do usuário:', error);
      throw this.handleError(error, 'Erro ao buscar informações do usuário');
    }
  }

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('❌ Erro ao verificar expiração do token:', error);
      return true;
    }
  }

  // Handle errors
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    } else if (error.message) {
      return new Error(error.message);
    } else {
      return new Error(defaultMessage);
    }
  }
}

const authService = new AuthService();
export default authService;
