import React, { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { toast } from 'react-toastify';
import { clearOIDCState, forceLoginRedirect } from '../utils/oidcUtils';

/**
 * Componente para tratar erros do OIDC e limpar estado corrompido
 */
const OIDCErrorHandler: React.FC = () => {
    const auth = useAuth();

    useEffect(() => {
        // Verificar se há estado corrompido na inicialização
        // DESABILITADO para evitar limpeza desnecessária durante troca de organização
        // if (hasCorruptedOIDCState()) {
        //     console.log('🚨 Estado OIDC corrompido detectado na inicialização');
        //     clearOIDCState();
        //     return;
        // }

        const handleOIDCError = (error: any) => {
            console.error('🚨 Erro OIDC detectado:', error);

            // Verificar se é erro de estado
            if (error?.message?.includes('No matching state found') ||
                error?.message?.includes('state') ||
                error?.name === 'InvalidStateError') {

                console.log('🧹 Limpando estado corrompido do OIDC...');
                clearOIDCState();

                // Mostrar mensagem ao usuário
                toast.error('Sessão expirada. Redirecionando para login...', {
                    autoClose: 3000,
                    onClose: () => {
                        forceLoginRedirect();
                    }
                });
            }

            // Outros erros OIDC
            else if (error?.message?.includes('token') ||
                error?.message?.includes('expired') ||
                error?.name === 'TokenExpiredError') {

                console.log('🔄 Token expirado, redirecionando para login...');
                toast.warning('Sessão expirada. Redirecionando...', {
                    autoClose: 2000,
                    onClose: () => {
                        forceLoginRedirect();
                    }
                });
            }
        };

        // Escutar erros do OIDC
        if (auth.error) {
            handleOIDCError(auth.error);
        }

        // Escutar mudanças no estado de autenticação
        if (!auth.isLoading && !auth.isAuthenticated && auth.error) {
            console.log('🔍 Estado de autenticação:', {
                isLoading: auth.isLoading,
                isAuthenticated: auth.isAuthenticated,
                hasError: !!auth.error,
                errorMessage: auth.error?.message
            });
        }

    }, [auth.error, auth.isLoading, auth.isAuthenticated, auth]);

    // Este componente não renderiza nada
    return null;
};

export default OIDCErrorHandler;
