import React from 'react';
import { useAuth } from "react-oidc-context";
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiTokenSync from './components/ApiTokenSync';
import OIDCErrorHandler from './components/OIDCErrorHandler';
import OrganizationSelector from './components/OrganizationSelector';
import TokenExpiryMonitor from './components/TokenExpiryMonitor';
import TokenLoadingGuard from './components/TokenLoadingGuard';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  const auth = useAuth();

  // Redirecionar automaticamente para Keycloak se não autenticado
  React.useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated && !auth.error) {
      console.log('🔄 Usuário não autenticado, redirecionando para Keycloak...');
      auth.signinRedirect();
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.error, auth]);

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.name} caused {auth.error.message}</div>;
  }

  if (!auth.isAuthenticated) {
    return <div>Redirecionando para login...</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <TokenLoadingGuard>
        <Router>
          <ApiTokenSync />
          <TokenExpiryMonitor />
          <OIDCErrorHandler />
          <div className="App">
            <Routes>
              {/* All routes are protected by SSO */}
              <Route path="/*" element={

                <Routes>
                  {/* Main dashboard */}
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* Organization selector */}
                  <Route path="/select-company" element={<OrganizationSelector />} />

                  {/* Default redirect to dashboard */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              } />
            </Routes>

            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              aria-label="Notifications"
            />
          </div>
        </Router>
      </TokenLoadingGuard>
    );
  }
};

export default App;
