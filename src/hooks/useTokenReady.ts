import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';

/**
 * Hook para verificar se o token está disponível
 * Não sincroniza o token (isso é feito pelo ApiTokenSync)
 */
export const useTokenReady = () => {
    const auth = useAuth();
    const [isTokenReady, setIsTokenReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Se ainda está carregando
        if (auth.isLoading) {
            setIsLoading(true);
            setIsTokenReady(false);
            return;
        }

        // Se há erro ou não está autenticado
        if (auth.error || !auth.isAuthenticated) {
            setIsTokenReady(false);
            setIsLoading(false);
            return;
        }

        // Se está autenticado mas não tem user, aguardar
        if (!auth.user) {
            setIsTokenReady(false);
            setIsLoading(true);
            return;
        }

        // Verificar se tem access_token
        const token = (auth.user as any)?.access_token;

        if (token) {
            setIsTokenReady(true);
            setIsLoading(false);
        } else {
            setIsTokenReady(false);
            setIsLoading(true);
        }
    }, [auth.isAuthenticated, auth.isLoading, auth.error, auth.user?.access_token]);

    return { isTokenReady, isLoading };
};
