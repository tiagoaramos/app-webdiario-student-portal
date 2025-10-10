# Configuração de Autenticação Keycloak - App Student Portal

## Resumo da Implementação

A autenticação no `app-student-portal` foi configurada para usar **Keycloak via OIDC (OpenID Connect)**, seguindo o mesmo padrão implementado no `app-academic`, `app-application-hub` e `app-financial`.

## Arquivos Criados/Modificados

### Criados:
- `src/hooks/useTokenReady.ts` - Hook para verificar se token está disponível
- `src/utils/oidcUtils.ts` - Utilitários para gerenciar estado OIDC
- `src/components/ApiTokenSync.tsx` - Sincroniza token OIDC com API
- `src/components/TokenExpiryMonitor.tsx` - Monitora expiração do token
- `src/components/OIDCErrorHandler.tsx` - Trata erros OIDC
- `src/components/TokenLoadingGuard.tsx` - Aguarda token antes de renderizar
- `src/components/OrganizationSelector.tsx` - Seletor de organizações
- `src/contexts/OrganizationContext.tsx` - Gerencia estado das organizações
- `src/services/keycloakOrganizationService.ts` - Integração com Keycloak Admin API
- `env.example` - Exemplo de variáveis de ambiente
- `KEYCLOAK_AUTHENTICATION_SETUP.md` - Esta documentação

### Modificados:
- `src/index.tsx` - Configurado AuthProvider do react-oidc-context
- `src/App.tsx` - Atualizado para usar useAuth
- `src/services/api.ts` - Atualizado para usar token OIDC

## Variáveis de Ambiente Necessárias

Configure no arquivo `.env`:

```env
# Keycloak
REACT_APP_KEYCLOAK_URL=http://localhost:8180
REACT_APP_KEYCLOAK_REALM=webdiario
REACT_APP_KEYCLOAK_CLIENT_ID=app-student-portal-client
REACT_APP_KEYCLOAK_CLIENT_SECRET=your-client-secret-here
REACT_APP_KEYCLOAK_REDIRECT_URI=http://localhost:3004

# API de Segurança
REACT_APP_API_SECURITY_URL=http://localhost:8081
```

## Configurar Cliente no Keycloak

1. Criar client `app-student-portal-client` no realm `webdiario`
2. Configurar redirect URIs: `http://localhost:3004/*`
3. Gerar client secret
4. Adicionar scope `organization`
5. Habilitar Client Authentication
6. Configurar Access Type como `confidential`

## Testar Autenticação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com valores corretos

# Iniciar aplicação
npm start
```

## Documentação Completa

Para documentação completa, consulte:
- `app-application-hub/KEYCLOAK_AUTHENTICATION_SETUP.md`
- `app-academic` - Implementação de referência
