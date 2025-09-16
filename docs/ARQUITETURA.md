# 🏗️ Arquitetura - WebDiário Student Portal

## 📋 Visão Geral

O **WebDiário Student Portal** é uma aplicação React desenvolvida para fornecer aos estudantes acesso às suas informações acadêmicas, integrada ao ecossistema WebDiário com autenticação SSO.

## 🎯 Objetivos

- **Portal Estudantil**: Interface dedicada para estudantes acessarem suas informações acadêmicas
- **Autenticação SSO**: Integração completa com o sistema de Single Sign-On do WebDiário
- **Interface Moderna**: Design responsivo e intuitivo usando React e Tailwind CSS
- **Segurança**: Implementação de rotas protegidas e gerenciamento de sessão

## 🏗️ Arquitetura do Sistema

### **Diagrama de Componentes**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │───▶│  AuthContext     │───▶│  SSO Service    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  ProtectedRoute  │    │  Security API   │
                       └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Dashboard      │    │  WebDiário API  │
                       └──────────────────┘    └─────────────────┘
```

### **Componentes Principais**

#### 1. **AuthContext**
- **Responsabilidade**: Gerenciamento de estado de autenticação
- **Tecnologia**: React Context API
- **Funcionalidades**: Login, logout, verificação de token, processamento SSO

#### 2. **SSOGuard**
- **Responsabilidade**: Proteção de rotas e verificação de autenticação SSO
- **Tecnologia**: React Router + SSO Service
- **Funcionalidades**: Redirecionamento para SSO, processamento de callback

#### 3. **ProtectedRoute**
- **Responsabilidade**: Proteção de rotas baseada em autenticação
- **Tecnologia**: React Router
- **Funcionalidades**: Verificação de autenticação, redirecionamento

#### 4. **SSOService**
- **Responsabilidade**: Comunicação com sistema de autenticação SSO
- **Tecnologia**: Axios + WebDiário Security API
- **Funcionalidades**: Redirecionamento SSO, callback handling, verificação de token

## 📊 Arquitetura de Dados

### **Fluxo de Dados**

```
1. Usuário acessa aplicação → SSOGuard verifica autenticação
2. Se não autenticado → Redireciona para SSO
3. SSO autentica → Retorna com token
4. AuthContext processa token → Estabelece sessão
5. Usuário acessa rotas protegidas → ProtectedRoute verifica autenticação
6. Dashboard renderiza → Exibe informações do estudante
```

### **Estrutura de Estado**

#### `AuthState`
- `isAuthenticated`: boolean - Status de autenticação
- `user`: User | null - Dados do usuário
- `accessToken`: string | null - Token de acesso
- `refreshToken`: string | null - Token de renovação
- `loading`: boolean - Status de carregamento
- `error`: string | null - Mensagens de erro

## 🔄 Fluxos de Processamento

### **Fluxo de Autenticação SSO**

1. **Acesso Inicial**: Usuário acessa aplicação
2. **Verificação**: SSOGuard verifica se há token válido
3. **Redirecionamento**: Se não autenticado, redireciona para SSO
4. **Autenticação**: Usuário faz login no sistema SSO
5. **Callback**: SSO retorna com token e dados do usuário
6. **Processamento**: AuthContext processa tokens e estabelece sessão
7. **Acesso**: Usuário pode acessar rotas protegidas

### **Fluxo de Proteção de Rotas**

1. **Navegação**: Usuário tenta acessar rota protegida
2. **Verificação**: ProtectedRoute verifica autenticação
3. **Decisão**: Se autenticado, renderiza componente; se não, redireciona
4. **Renderização**: Componente é renderizado com dados do usuário

## 🛡️ Segurança

### **Autenticação e Autorização**
- **SSO Integration**: Integração com WebDiário Security
- **Token Management**: Gerenciamento seguro de tokens JWT
- **Route Protection**: Proteção de rotas sensíveis
- **Session Management**: Gerenciamento de sessão com localStorage

### **Validação**
- **Token Validation**: Verificação de validade e expiração de tokens
- **API Security**: Headers de autorização em todas as requisições
- **Error Handling**: Tratamento seguro de erros de autenticação

## 📈 Escalabilidade

### **Estratégias de Escalabilidade**

#### Horizontal Scaling
- **Microfrontend Architecture**: Integração com outros apps WebDiário
- **API Gateway**: Centralização de chamadas de API
- **CDN**: Distribuição de assets estáticos

#### Vertical Scaling
- **Code Splitting**: Carregamento lazy de componentes
- **Bundle Optimization**: Otimização de bundle JavaScript
- **Caching**: Cache de dados e assets

## 🔧 Tecnologias Utilizadas

### **Frontend**
- **React**: 18.2.0 - Biblioteca principal
- **TypeScript**: 4.9.5 - Tipagem estática
- **React Router**: 6.20.1 - Roteamento
- **Tailwind CSS**: 3.3.6 - Estilização
- **Axios**: 1.6.2 - Cliente HTTP

### **Autenticação**
- **WebDiário Security**: API de autenticação SSO
- **JWT**: Tokens de autenticação
- **React Context**: Gerenciamento de estado de autenticação

### **Desenvolvimento**
- **Create React App**: 5.0.1 - Ferramenta de build
- **PostCSS**: 8.4.32 - Processamento CSS
- **Autoprefixer**: 10.4.16 - Prefixos CSS

## 📊 Monitoramento

### **Health Checks**
- **Authentication Status**: Verificação de status de autenticação
- **API Connectivity**: Verificação de conectividade com APIs
- **Token Validity**: Verificação de validade de tokens

### **Métricas Disponíveis**
- **User Sessions**: Número de sessões ativas
- **Authentication Success Rate**: Taxa de sucesso de autenticação
- **API Response Times**: Tempos de resposta das APIs
- **Error Rates**: Taxa de erros por endpoint

---

**📝 Última Atualização**: Janeiro 2025  
**👨‍💻 Responsável**: Equipe de Desenvolvimento WebDiário  
**🏗️ Projeto**: WebDiário Student Portal  
**🎯 Status**: 🚧 **EM DESENVOLVIMENTO**
