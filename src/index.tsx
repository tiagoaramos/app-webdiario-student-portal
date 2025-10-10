import ReactDOM from 'react-dom/client';
import { AuthProvider } from "react-oidc-context";
import App from './App';
import { OrganizationProvider } from './contexts/OrganizationContext';
import './index.css';

// Captura a URL atual para redirecionar o usuário de volta após autenticação
const currentUrl = window.location.href;

const oidcConfig = {
  authority: process.env.REACT_APP_KEYCLOACK_SERVER_URL + '/realms/' + process.env.REACT_APP_KEYCLOACK_REALM,
  client_id: process.env.REACT_APP_KEYCLOACK_CLIENT_ID,
  redirect_uri: currentUrl,
  client_secret: process.env.REACT_APP_KEYCLOACK_CLIENT_SECRET,
  response_type: 'code',
  scope: 'openid profile email organization',

  // Configurações para renovação automática de token
  automaticSilentRenew: true,
  loadUserInfo: true,
  post_logout_redirect_uri: process.env.REACT_APP_KEYCLOAK_REDIRECT_URI || window.location.origin,
  silent_redirect_uri: process.env.REACT_APP_KEYCLOAK_REDIRECT_URI || window.location.origin,

  // Configurações de tempo para tokens mais longos
  accessTokenExpiringNotificationTime: 300,
  checkSessionInterval: 30000,
  silentRequestTimeout: 10000,

  // Configurações adicionais
  includeIdTokenInSilentRenew: true,
  revokeTokensOnSignout: true,

  // Configurações de monitoramento de sessão
  monitorSession: true,
  filterProtocolClaims: true
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <AuthProvider {...oidcConfig}>
    <OrganizationProvider>
      <App />
    </OrganizationProvider>
  </AuthProvider>
);
