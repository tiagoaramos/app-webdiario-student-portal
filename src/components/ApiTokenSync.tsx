import React, { useEffect, useRef } from 'react';
import { useAuth } from 'react-oidc-context';
import { setApiToken } from '../services/api';
import { clearKeycloakURLParams } from '../utils/oidcUtils';

/**
 * Componente para sincronizar o token OIDC com a API
 * Aguarda o token estar disponível antes de permitir chamadas de API
 */
const ApiTokenSync: React.FC = () => {
    const auth = useAuth();
    const lastTokenRef = useRef<string | null>(null);

    useEffect(() => {
        // Se ainda está carregando, aguardar
        if (auth.isLoading) {
            return;
        }

        // Se há erro, limpar token
        if (auth.error) {
            console.log('❌ ApiTokenSync - Erro na autenticação, limpando token');
            setApiToken(null);
            lastTokenRef.current = null;
            return;
        }

        // Se não está autenticado, limpar token
        if (!auth.isAuthenticated) {
            if (lastTokenRef.current) {
                console.log('❌ ApiTokenSync - Não autenticado, limpando token');
                setApiToken(null);
                lastTokenRef.current = null;
            }
            return;
        }

        // Se está autenticado mas não tem user, aguardar
        if (!auth.user) {
            return;
        }

        // Verificar se tem access_token
        const token = (auth.user as any)?.access_token;

        // Só sincronizar se o token mudou
        if (token && token !== lastTokenRef.current) {
            console.log('✅ Token OIDC sincronizado com API');
            setApiToken(token);
            lastTokenRef.current = token;

            // Limpar URL para remover parâmetros do Keycloak (apenas uma vez)
            clearKeycloakURLParams();
        }
    }, [auth.isAuthenticated, auth.isLoading, auth.error, auth.user?.access_token]);

    // Este componente não renderiza nada
    return null;
};

export default ApiTokenSync;
