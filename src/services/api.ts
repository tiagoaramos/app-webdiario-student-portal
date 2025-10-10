import axios, { AxiosInstance } from 'axios';

// Configuração base do axios
const api: AxiosInstance = axios.create({
  baseURL: `${process.env.REACT_APP_API_SECURITY_URL}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log da configuração inicial
console.log('🚀 API configurada com baseURL:', api.defaults.baseURL);
console.log('🚀 Headers padrão:', api.defaults.headers);

// Função para obter token do localStorage (será atualizada pelo contexto OIDC)
const getStoredToken = (): string | null => {
  return localStorage.getItem('oidc_access_token');
};

// Função para definir token (será chamada pelo contexto OIDC)
export const setApiToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('oidc_access_token', token);
  } else {
    localStorage.removeItem('oidc_access_token');
  }
};

// Interceptor para adicionar token de autenticação e organization ID
api.interceptors.request.use(
  (config) => {
    // Obter token armazenado
    const token = getStoredToken();
    const currentOrganization = localStorage.getItem('@WebDiario:currentTenant');

    // Adicionar token de autorização
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Adicionar organization ID no header (exceto para listagem de organizations)
    if (currentOrganization && !config.url?.includes('/organizations')) {
      try {
        const organization = JSON.parse(currentOrganization);
        if (organization.id) {
          config.headers['X-Organization-ID'] = organization.id;
          console.log('🏢 Request para:', config.url, '| Organization:', organization.id);
        }
      } catch (error) {
        console.error('❌ Erro ao parsear organization:', error);
      }
    }

    return config;
  },
  (error) => {
    console.error('❌ Erro no interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log apenas erros importantes
    if (error.response?.status === 403) {
      console.error('❌ 403 Forbidden:', error.config?.url, '| Organization Header:', error.config?.headers?.['X-Organization-ID']);
    } else if (error.response?.status === 401) {
      console.error('❌ 401 Unauthorized:', error.config?.url);
    } else if (error.response?.status >= 500) {
      console.error('❌ Erro do servidor:', error.response?.status, error.config?.url);
    }

    return Promise.reject(error);
  }
);

// Função de teste para verificar se o interceptor está funcionando
export const testApiInterceptor = async () => {
  console.log('🧪 Testando interceptor da API...');

  // Verificar dados no localStorage
  const token = localStorage.getItem('oidc_access_token');
  const currentTenant = localStorage.getItem('@WebDiario:currentTenant');

  console.log('🔍 Dados do localStorage:');
  console.log('  - Token:', token ? '✅ Presente' : '❌ Ausente');
  console.log('  - Tenant:', currentTenant ? '✅ Presente' : '❌ Ausente');

  if (currentTenant) {
    try {
      const tenantData = JSON.parse(currentTenant);
      console.log('  - Tenant ID:', tenantData.id);
      console.log('  - Tenant Name:', tenantData.name || tenantData.nome);
    } catch (error) {
      console.error('❌ Erro ao parsear tenant:', error);
    }
  }

  try {
    const response = await api.get('/test');
    console.log('✅ Teste bem-sucedido:', response.data);
    return response;
  } catch (error: any) {
    console.log('❌ Teste falhou (esperado):', error.message);
    return null;
  }
};

// Utility functions for backward compatibility
export const setAuthToken = (token: string) => {
  setApiToken(token);
};

export const setTenantId = (tenantId: number) => {
  // Not needed anymore - handled by interceptor
  console.log('setTenantId is deprecated - tenant is set via interceptor');
};

export const clearTenantId = () => {
  // Not needed anymore - handled by interceptor
  console.log('clearTenantId is deprecated - tenant is cleared via interceptor');
};

export default api;
