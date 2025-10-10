import React, { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { toast } from 'react-toastify';

/**
 * Componente para monitorar a expiração do token e mostrar notificações
 */
const TokenExpiryMonitor: React.FC = () => {
    const auth = useAuth();
    const [lastNotification, setLastNotification] = useState<number>(0);

    useEffect(() => {
        if (!auth.isAuthenticated || !auth.user) return;

        const user = auth.user as any;
        const expiresAt = user.expires_at;

        if (!expiresAt) {
            console.log('⚠️ TokenExpiryMonitor - Sem informação de expiração');
            return;
        }

        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;

        console.log('🔍 TokenExpiryMonitor - Informações do token:', {
            expiresAt: new Date(expiresAt * 1000).toLocaleString(),
            timeUntilExpiry: Math.floor(timeUntilExpiry / 60),
            minutesUntilExpiry: Math.floor(timeUntilExpiry / 60)
        });

        // Se o token expira em menos de 5 minutos, mostrar notificação
        if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
            const now = Date.now();
            // Evitar spam de notificações (máximo 1 por minuto)
            if (now - lastNotification > 60000) {
                const minutesLeft = Math.floor(timeUntilExpiry / 60);
                const secondsLeft = timeUntilExpiry % 60;

                toast.warning(
                    `Sua sessão expira em ${minutesLeft > 0 ? `${minutesLeft}m ` : ''}${secondsLeft}s. Renovando automaticamente...`,
                    {
                        autoClose: 5000,
                        position: 'top-right'
                    }
                );

                setLastNotification(now);
                console.log('⚠️ TokenExpiryMonitor - Token expirando em breve');
            }
        }

        // Se o token já expirou, mostrar erro
        if (timeUntilExpiry <= 0) {
            toast.error('Sua sessão expirou. Redirecionando para login...', {
                autoClose: 3000,
                position: 'top-right'
            });
            console.log('❌ TokenExpiryMonitor - Token expirado');
        }

    }, [auth.user, auth.isAuthenticated, lastNotification]);

    // Monitorar eventos de renovação do token
    useEffect(() => {
        const handleTokenRenewed = () => {
            console.log('✅ TokenExpiryMonitor - Token renovado com sucesso');
            toast.success('Sessão renovada automaticamente', {
                autoClose: 2000,
                position: 'top-right'
            });
        };

        const handleTokenRenewalError = () => {
            console.error('❌ TokenExpiryMonitor - Erro na renovação do token');
            toast.error('Erro ao renovar sessão. Redirecionando para login...', {
                autoClose: 3000,
                position: 'top-right'
            });
        };

        // Escutar eventos do OIDC (se disponíveis)
        if (auth.events) {
            auth.events.addUserLoaded(handleTokenRenewed);
            auth.events.addUserUnloaded(handleTokenRenewalError);
        }

        return () => {
            if (auth.events) {
                auth.events.removeUserLoaded(handleTokenRenewed);
                auth.events.removeUserUnloaded(handleTokenRenewalError);
            }
        };
    }, [auth.events]);

    return null; // Este componente não renderiza nada
};

export default TokenExpiryMonitor;
