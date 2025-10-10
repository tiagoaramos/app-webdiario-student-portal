import React from 'react';
import { useAuth } from 'react-oidc-context';
import { useTokenReady } from '../hooks/useTokenReady';

interface TokenLoadingGuardProps {
    children: React.ReactNode;
}

/**
 * Componente que aguarda o token estar disponível antes de renderizar os filhos
 */
const TokenLoadingGuard: React.FC<TokenLoadingGuardProps> = ({ children }) => {
    const auth = useAuth();
    const { isTokenReady, isLoading } = useTokenReady();

    // Se ainda está carregando a autenticação
    if (auth.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando autenticação...</p>
                </div>
            </div>
        );
    }

    // Se há erro na autenticação
    if (auth.error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro de Autenticação</h2>
                    <p className="text-gray-600 mb-4">{auth.error.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    // Se não está autenticado
    if (!auth.isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Redirecionando para login...</p>
                </div>
            </div>
        );
    }

    // Se ainda está carregando o token
    if (isLoading || !isTokenReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Preparando token de autenticação...</p>
                    <p className="text-sm text-gray-500 mt-2">Aguarde um momento</p>
                </div>
            </div>
        );
    }

    // Token está pronto, renderizar os filhos
    return <>{children}</>;
};

export default TokenLoadingGuard;
