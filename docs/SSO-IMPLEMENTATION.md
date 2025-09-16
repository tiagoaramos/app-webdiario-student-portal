# 🔐 SSO Implementation - WebDiário Student Portal

## 📋 Visão Geral

Este documento descreve a implementação completa do sistema de Single Sign-On (SSO) no WebDiário Student Portal, integrado com o WebDiário Security.

## 🎯 Objetivos

- **Autenticação Centralizada**: Integração com sistema SSO do WebDiário
- **Segurança**: Gerenciamento seguro de tokens e sessões
- **Experiência do Usuário**: Login transparente e redirecionamento automático
- **Compatibilidade**: Funcionamento idêntico ao projeto webdiario principal

## 🏗️ Arquitetura SSO

### **Componentes Principais**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Student Portal│───▶│   SSOGuard       │───▶│  SSO Service    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  AuthContext     │    │  Security API   │
                       └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  ProtectedRoute  │    │  Security App   │
                       └──────────────────┘    └─────────────────┘
```

### **Fluxo de Autenticação**

1. **Acesso**: Usuário acessa aplicação
2. **Verificação**: SSOGuard verifica autenticação
3. **Redirecionamento**: Se não autenticado, redireciona para SSO
4. **Login**: Usuário faz login no Security App
5. **Callback**: SSO retorna com token e dados
6. **Processamento**: AuthContext processa tokens
7. **Acesso**: Usuário acessa aplicação autenticado

## 🔧 Implementação

### **1. SSOService**

```typescript
class SSOService {
  private readonly SECURITY_API_URL = 'http://localhost:8081/api/security';
  private readonly SECURITY_APP_URL = 'http://localhost:3003';
  
  // Redirecionar para SSO
  redirectToSSO(appName: string = 'student-portal'): void {
    const currentUrl = window.location.href;
    const returnUrl = encodeURIComponent(currentUrl);
    const finalRedirectUrl = `${this.SECURITY_APP_URL}/login?returnUrl=${returnUrl}&appName=${appName}`;
    window.location.href = finalRedirectUrl;
  }

  // Processar callback SSO
  async handleSSOCallback(token: string, returnUrl?: string): Promise<any> {
    const response = await fetch(`${this.SECURITY_API_URL}/auth/sso/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, returnUrl: returnUrl || window.location.href })
    });
    return response.json();
  }

  // Verificar autenticação
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token;
  }
}
```

### **2. AuthContext**

```typescript
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar parâmetros SSO na URL
  const checkSSOParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const tenantId = urlParams.get('tenantId');
    const tenantName = urlParams.get('tenantName');
    
    if (token && tenantId && tenantName) {
      return { token, tenantId: parseInt(tenantId), tenantName: decodeURIComponent(tenantName) };
    }
    return null;
  };

  // Processar tokens SSO
  const processSSOTokens = async (accessToken: string, refreshToken: string, user: User) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    
    dispatch({
      type: 'AUTH_SUCCESS',
      payload: { user, accessToken, refreshToken }
    });
  };
};
```

### **3. SSOGuard**

```typescript
const SSOGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { isAuthenticated: authContextAuthenticated, processSSOTokens } = useAuth();

  useEffect(() => {
    const checkSSOCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get('token');
      
      if (token && !hasProcessedSSO) {
        const authData = await ssoService.handleSSOCallback(token);
        await processSSOTokens(authData.accessToken, authData.refreshToken, authData.user);
        setIsAuthenticated(true);
      }
    };

    if (!authContextLoading && hasSSOParams) {
      checkSSOCallback();
    }
  }, [location, authContextLoading, processSSOTokens]);

  // Redirecionar para SSO se não autenticado
  useEffect(() => {
    if (isAuthenticated === false && !hasRedirected && !isLoading) {
      ssoService.requireAuth();
    }
  }, [isAuthenticated, hasRedirected, isLoading]);
};
```

## 📊 Configuração

### **Variáveis de Ambiente**

```bash
# .env
REACT_APP_SECURITY_API_URL=http://localhost:8081/api/security
REACT_APP_SECURITY_APP_URL=http://localhost:3003
REACT_APP_APP_NAME=student-portal
```

### **Configuração do Security App**

O Security App deve estar configurado para aceitar o `appName=student-portal` e redirecionar de volta para a aplicação com os tokens apropriados.

### **Configuração da API de Segurança**

A API de segurança deve ter o endpoint `/auth/sso/callback` configurado para processar os tokens SSO.

## 🔄 Fluxos de Processamento

### **Fluxo de Login SSO**

1. **Acesso**: Usuário acessa `http://localhost:3004`
2. **Verificação**: SSOGuard verifica se há token válido
3. **Redirecionamento**: Se não autenticado, redireciona para `http://localhost:3003/login?returnUrl=...&appName=student-portal`
4. **Login**: Usuário faz login no Security App
5. **Callback**: Security App redireciona para `http://localhost:3004?token=...&tenantId=...&tenantName=...`
6. **Processamento**: SSOGuard detecta parâmetros SSO e processa tokens
7. **Autenticação**: AuthContext estabelece sessão autenticada
8. **Acesso**: Usuário pode acessar rotas protegidas

### **Fluxo de Logout**

1. **Logout**: Usuário clica em logout
2. **Limpeza**: AuthContext limpa tokens e estado
3. **Redirecionamento**: Redireciona para página de login
4. **SSO Logout**: Opcionalmente, pode fazer logout do SSO também

## 🛡️ Segurança

### **Gerenciamento de Tokens**

- **Armazenamento**: Tokens armazenados em localStorage
- **Validação**: Verificação de expiração e validade
- **Renovação**: Refresh token para renovação automática
- **Limpeza**: Limpeza automática em caso de erro

### **Proteção de Rotas**

- **SSOGuard**: Proteção global da aplicação
- **ProtectedRoute**: Proteção individual de rotas
- **Verificação**: Verificação contínua de autenticação

### **Tratamento de Erros**

- **Token Expirado**: Redirecionamento automático para login
- **Erro de SSO**: Tratamento de erros de callback
- **Falha de API**: Fallback para login manual

## 🧪 Testes

### **Teste de Autenticação SSO**

```bash
# 1. Acessar aplicação
curl http://localhost:3004

# 2. Verificar redirecionamento
# Deve retornar 302 para Security App

# 3. Simular callback SSO
curl "http://localhost:3004?token=test-token&tenantId=1&tenantName=Test%20Tenant"

# 4. Verificar autenticação
# Deve estabelecer sessão autenticada
```

### **Teste de Proteção de Rotas**

```bash
# 1. Acessar rota protegida sem autenticação
curl http://localhost:3004/dashboard

# 2. Verificar redirecionamento para login
# Deve redirecionar para Security App

# 3. Acessar com autenticação
# Deve permitir acesso
```

## 📈 Monitoramento

### **Métricas de SSO**

- **Taxa de Sucesso**: Percentual de logins SSO bem-sucedidos
- **Tempo de Autenticação**: Tempo médio para autenticação SSO
- **Erros de Callback**: Número de erros no processamento de callback
- **Sessões Ativas**: Número de sessões SSO ativas

### **Logs de Debug**

```typescript
// Ativar logs detalhados
console.log('🔍 Verificando parâmetros SSO:', { token, tenantId, tenantName });
console.log('🔄 SSO callback detected, processing token');
console.log('✅ SSO authentication successful');
```

## 🚨 Troubleshooting

### **Problemas Comuns**

#### **Erro de Redirecionamento SSO**
```bash
# Verificar se Security App está rodando
curl http://localhost:3003/health

# Verificar configuração de CORS
# Security App deve permitir origem da aplicação
```

#### **Erro de Callback SSO**
```bash
# Verificar se API de segurança está rodando
curl http://localhost:8081/api/security/health

# Verificar logs da API de segurança
# Deve processar callback corretamente
```

#### **Token Inválido**
```bash
# Verificar formato do token
# Deve ser JWT válido

# Verificar expiração
# Token não deve estar expirado
```

### **Debug de SSO**

```typescript
// Ativar logs detalhados
localStorage.setItem('debug', 'true');

// Verificar estado de autenticação
console.log('Auth State:', authState);
console.log('SSO Params:', checkSSOParams());
```

---

**📝 Última Atualização**: Janeiro 2025  
**👨‍💻 Responsável**: Equipe de Desenvolvimento WebDiário  
**🏗️ Projeto**: WebDiário Student Portal  
**🎯 Status**: ✅ **SSO IMPLEMENTADO**
