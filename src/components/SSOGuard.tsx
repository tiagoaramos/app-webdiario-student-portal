import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ssoService from '../services/ssoService';
import { useAuth } from '../contexts/AuthContext';

interface SSOGuardProps {
  children: React.ReactNode;
}

const SSOGuard: React.FC<SSOGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [hasProcessedSSO, setHasProcessedSSO] = useState(false);
  const location = useLocation();
  const { isAuthenticated: authContextAuthenticated, loading: authContextLoading, processSSOTokens } = useAuth();

  // Wait for AuthContext to finish loading
  useEffect(() => {
    if (!authContextLoading) {
      console.log('🔍 SSOGuard: AuthContext finished loading, isAuthenticated:', authContextAuthenticated);
      setIsAuthenticated(authContextAuthenticated);
      setIsLoading(false);
    }
  }, [authContextLoading, authContextAuthenticated]);

  useEffect(() => {
    const checkSSOCallback = async () => {
      try {
        console.log('🔍 SSOGuard: Checking for SSO callback...', { 
          pathname: location.pathname, 
          search: location.search,
          hasProcessedSSO
        });
        
        // Check if we're coming back from SSO callback
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        const returnUrl = urlParams.get('returnUrl');
        
        if (token && !hasProcessedSSO) {
          console.log('🔄 SSO callback detected, processing token');
          console.log('📍 Current URL:', window.location.href);
          console.log('📍 Return URL from params:', returnUrl);
          console.log('📍 Current pathname:', window.location.pathname);
          
          // Marcar como processado imediatamente para evitar múltiplos processamentos
          setHasProcessedSSO(true);
          
          try {
            const authData = await ssoService.handleSSOCallback(token, returnUrl || undefined);
            
            console.log('✅ SSO authentication successful');
            console.log('🔄 Processing SSO tokens with AuthContext...');
            
            // Process SSO tokens with AuthContext
            try {
              await processSSOTokens(
                authData.accessToken,
                authData.refreshToken,
                authData.user
              );
              console.log('✅ SSO tokens processed successfully by AuthContext');
            } catch (error) {
              console.error('❌ Error processing SSO tokens:', error);
              // Even if processing fails, we still have valid tokens
              // The AuthContext will pick them up on next initialization
            }
            
            setIsAuthenticated(true);
            setHasRedirected(false);
            
            // Clean up URL parameters but preserve the original path
            if (returnUrl) {
              console.log('🔄 Processing returnUrl:', returnUrl);
              // If we have a returnUrl, redirect to it (without the token parameter)
              const originalUrl = new URL(returnUrl);
              originalUrl.searchParams.delete('token');
              originalUrl.searchParams.delete('returnUrl');
              const finalUrl = originalUrl.pathname + originalUrl.search;
              console.log('📍 Final URL to navigate to:', finalUrl);
              window.history.replaceState({}, document.title, finalUrl);
            } else {
              console.log('⚠️ No returnUrl found, using current pathname');
              // Clean up current URL parameters
              const cleanUrl = window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
            }
            
          } catch (error) {
            console.error('❌ SSO callback failed:', error);
            setIsAuthenticated(false);
            // Reset flag on error to allow retry
            setHasProcessedSSO(false);
          }
        } else if (token && hasProcessedSSO) {
          console.log('🔄 SSO callback already processed, skipping...');
          // Clean up URL parameters even if already processed
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
        
      } catch (error) {
        console.error('❌ Error checking SSO callback:', error);
      }
    };

    // Só executar se não estivermos carregando e se há parâmetros SSO
    const urlParams = new URLSearchParams(location.search);
    const hasSSOParams = urlParams.get('token');
    
    if (!authContextLoading && hasSSOParams) {
      checkSSOCallback();
    }
  }, [location, authContextLoading, processSSOTokens, hasProcessedSSO]);

  // Handle redirect to SSO when not authenticated
  useEffect(() => {
    if (isAuthenticated === false && !hasRedirected && !isLoading) {
      console.log('🔐 Not authenticated, redirecting to SSO...');
      setHasRedirected(true);
      ssoService.requireAuth();
    }
  }, [isAuthenticated, hasRedirected, isLoading]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If not authenticated, show redirecting message
  if (isAuthenticated === false) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
};

export default SSOGuard;
