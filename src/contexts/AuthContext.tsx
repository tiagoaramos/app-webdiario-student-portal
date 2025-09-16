import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, AuthContextType, User } from '../types/auth';
import authService from '../services/authService';

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: true,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: any): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        loading: false,
        error: null,
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        loading: false,
        error: action.payload,
      };
    
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        loading: false,
        error: null,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Função para verificar parâmetros SSO na URL
  const checkSSOParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const tenantId = urlParams.get('tenantId');
    const tenantName = urlParams.get('tenantName');
    
    console.log('🔍 Verificando parâmetros SSO:', { token: token ? '✅' : '❌', tenantId, tenantName });
    
    if (token && tenantId && tenantName) {
      return {
        token,
        tenantId: parseInt(tenantId),
        tenantName: decodeURIComponent(tenantName)
      };
    }
    
    return null;
  };

  // Verificar token na inicialização
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      console.log('🚀 Inicializando autenticação, token encontrado:', token ? '✅' : '❌');
      
      // Verificar se há parâmetros SSO na URL
      const ssoParams = checkSSOParams();
      if (ssoParams && !token) {
        console.log('🔐 Parâmetros SSO encontrados, usando para autenticação:', ssoParams);
        
        try {
          // Salvar token SSO no localStorage
          localStorage.setItem('accessToken', ssoParams.token);
          
          // Buscar informações do usuário com o token SSO
          const userInfo = await authService.getUserInfo(ssoParams.token);
          console.log('👤 Usuário SSO encontrado:', userInfo?.username || 'N/A');
          
          // Estabelecer autenticação
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: userInfo,
              accessToken: ssoParams.token,
              refreshToken: '' // SSO não fornece refresh token
            }
          });
          
          // Limpar parâmetros SSO da URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          
          console.log('✅ Autenticação SSO concluída com sucesso');
          return;
        } catch (error) {
          console.error('❌ Erro na autenticação SSO:', error);
          // Limpar dados em caso de erro
          localStorage.removeItem('accessToken');
        }
      }
      
      if (token && !authService.isTokenExpired(token)) {
        try {
          console.log('🔍 Token válido, buscando informações do usuário...');
          const userInfo = await authService.getUserInfo(token);
          console.log('👤 Usuário encontrado:', userInfo?.username || 'N/A');
          
          // Estabelecer autenticação
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: userInfo,
              accessToken: token,
              refreshToken: localStorage.getItem('refreshToken') || ''
            }
          });
          
          console.log('✅ Autenticação restaurada com sucesso');
        } catch (error) {
          console.error('❌ Erro ao restaurar autenticação:', error);
          // Limpar dados inválidos
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          dispatch({
            type: 'AUTH_FAILURE',
            payload: 'Sessão expirada'
          });
        }
      } else {
        console.log('❌ Token não encontrado ou expirado');
        dispatch({
          type: 'AUTH_FAILURE',
          payload: 'Não autenticado'
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: { login: string; senha: string }) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authService.login(credentials);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        }
      });
      
      console.log('✅ Login realizado com sucesso');
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Erro no login'
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      // Mesmo com erro, limpar estado local
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(refreshTokenValue);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: state.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        }
      });
      
      console.log('✅ Token renovado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao renovar token:', error);
      dispatch({
        type: 'AUTH_FAILURE',
        payload: 'Sessão expirada'
      });
      throw error;
    }
  };

  // Process SSO tokens function
  const processSSOTokens = async (accessToken: string, refreshToken: string, user: User) => {
    try {
      console.log('🔄 Processando tokens SSO...');
      
      // Salvar tokens no localStorage
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Estabelecer autenticação
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: user,
          accessToken: accessToken,
          refreshToken: refreshToken
        }
      });
      
      console.log('✅ Tokens SSO processados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao processar tokens SSO:', error);
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshTokenMethod: refreshToken,
    processSSOTokens,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
