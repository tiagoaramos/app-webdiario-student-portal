import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import keycloakOrganizationService, { KeycloakOrganization } from '../services/keycloakOrganizationService';

export interface Organization {
    id: string;
    name: string;
    displayName?: string;
    attributes?: Record<string, string[]>;
    // Dados adicionais do Keycloak
    keycloakData?: KeycloakOrganization;
}

export interface OrganizationContextType {
    currentOrganization: Organization | null;
    availableOrganizations: Organization[];
    isLoading: boolean;
    isLoadingKeycloakData: boolean;
    switchOrganization: (organization: Organization) => Promise<void>;
    refreshOrganizations: () => void;
    refreshKeycloakData: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useAuth();
    const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
    const [availableOrganizations, setAvailableOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingKeycloakData, setIsLoadingKeycloakData] = useState(false);
    const isInitializedRef = useRef(false);

    // Extrair organization atual do token
    const getCurrentOrganizationFromToken = useCallback((): Organization | null => {
        if (!auth.user) return null;

        const user = auth.user as any;

        // 1. Tentar em user.profile (onde o OIDC coloca os claims)
        if (user.profile?.organization && Array.isArray(user.profile.organization) && user.profile.organization.length > 0) {
            const orgName = user.profile.organization[0];
            return {
                id: orgName,
                name: orgName,
                displayName: orgName
            };
        }

        // 2. Tentar diretamente em user (caso seja exposto)
        if (user.organization && Array.isArray(user.organization) && user.organization.length > 0) {
            const orgName = user.organization[0];
            return {
                id: orgName,
                name: orgName,
                displayName: orgName
            };
        }

        // 3. Tentar decodificar o access_token diretamente
        if (auth.user.access_token) {
            try {
                const base64Url = auth.user.access_token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const decoded = JSON.parse(jsonPayload);

                if (decoded.organization && Array.isArray(decoded.organization) && decoded.organization.length > 0) {
                    const orgName = decoded.organization[0];
                    return {
                        id: orgName,
                        name: orgName,
                        displayName: orgName
                    };
                }
            } catch (error) {
                console.error('Erro ao decodificar token:', error);
            }
        }

        // 4. Verificar formatos alternativos
        const orgId = user.organization_id || user.org_id || user.profile?.organization_id;
        const orgName = user.organization_name || user.org_name || user.profile?.organization_name;

        if (orgId && orgName) {
            return {
                id: orgId,
                name: orgName,
                displayName: user.organization_display_name || user.org_display_name || orgName
            };
        }

        return null;
    }, [auth.user]);

    // Carregar organizations disponíveis diretamente do token
    const loadOrganizations = useCallback((): Organization[] => {
        if (!auth.user) {
            return [];
        }

        const user = auth.user as any;
        let organizations: string[] = [];

        // 1. Tentar em user.profile
        if (user.profile?.organization && Array.isArray(user.profile.organization)) {
            organizations = user.profile.organization;
        }
        // 2. Tentar diretamente em user
        else if (user.organization && Array.isArray(user.organization)) {
            organizations = user.organization;
        }
        // 3. Tentar decodificar o access_token
        else if (auth.user.access_token) {
            try {
                const base64Url = auth.user.access_token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const decoded = JSON.parse(jsonPayload);

                if (decoded.organization && Array.isArray(decoded.organization)) {
                    organizations = decoded.organization;
                }
            } catch (error) {
                console.error('Erro ao decodificar token:', error);
            }
        }

        if (organizations.length > 0) {
            return organizations.map((orgName: string) => ({
                id: orgName,
                name: orgName,
                displayName: orgName
            }));
        }

        // Fallback: retornar organization atual se disponível
        const currentOrg = getCurrentOrganizationFromToken();
        if (currentOrg) {
            return [currentOrg];
        }

        return [];
    }, [auth.user, getCurrentOrganizationFromToken]);

    // Buscar dados completos da organization no Keycloak
    const fetchKeycloakOrganizationData = useCallback(async (organizationAlias: string): Promise<KeycloakOrganization | null> => {
        try {
            setIsLoadingKeycloakData(true);
            console.log('🔍 Buscando dados da organização no Keycloak:', organizationAlias);

            const keycloakData = await keycloakOrganizationService.getOrganizationByAlias(organizationAlias);

            if (keycloakData) {
                console.log('✅ Dados da organização obtidos do Keycloak:', keycloakData);
            } else {
                console.warn('⚠️ Organização não encontrada no Keycloak');
            }

            return keycloakData;
        } catch (error) {
            console.error('❌ Erro ao buscar dados do Keycloak:', error);
            return null;
        } finally {
            setIsLoadingKeycloakData(false);
        }
    }, []);

    // Atualizar dados do Keycloak para a organização atual
    const refreshKeycloakData = useCallback(async (): Promise<void> => {
        if (!currentOrganization) {
            console.warn('⚠️ Nenhuma organização selecionada para atualizar dados do Keycloak');
            return;
        }

        const keycloakData = await fetchKeycloakOrganizationData(currentOrganization.name);

        if (keycloakData) {
            setCurrentOrganization(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    keycloakData
                };
            });
        }
    }, [currentOrganization, fetchKeycloakOrganizationData]);

    // Trocar de organization
    const switchOrganization = useCallback(async (organization: Organization): Promise<void> => {
        if (!auth.user) return;

        try {
            setIsLoading(true);

            console.log('🔄 Trocando para organization:', organization.name);

            // Buscar dados completos do Keycloak
            const keycloakData = await fetchKeycloakOrganizationData(organization.name);

            // Criar objeto completo da organization
            const fullOrganization: Organization = {
                ...organization,
                keycloakData: keycloakData || undefined
            };

            // Salvar organization atual no localStorage
            localStorage.setItem('@WebDiario:currentTenant', JSON.stringify(fullOrganization));

            // Atualizar estado imediatamente
            setCurrentOrganization(fullOrganization);

            console.log('✅ Organization trocada com sucesso:', fullOrganization.name);

        } catch (error) {
            console.error('Erro ao trocar de organization:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [auth.user, fetchKeycloakOrganizationData]);

    // Atualizar organizations manualmente
    const refreshOrganizations = useCallback((): void => {
        console.log('🔄 Refresh manual de organizations...');
        setIsLoading(true);

        try {
            const orgs = loadOrganizations();
            console.log('📋 Organizations carregadas:', orgs);
            setAvailableOrganizations(orgs);
        } catch (error) {
            console.error('Erro ao atualizar organizations:', error);
        } finally {
            setIsLoading(false);
        }
    }, [loadOrganizations]);

    // Inicializar organizations - APENAS UMA VEZ
    useEffect(() => {
        if (auth.isAuthenticated && auth.user && !isInitializedRef.current) {
            isInitializedRef.current = true;
            setIsLoading(true);

            try {
                const orgs = loadOrganizations();
                console.log('✅ Organizations carregadas do token:', orgs.length);
                setAvailableOrganizations(orgs);

                // Se não há organization atual, tentar restaurar do localStorage primeiro
                setCurrentOrganization(prevOrg => {
                    if (prevOrg) {
                        return prevOrg; // Manter se já existe
                    }

                    const savedOrg = localStorage.getItem('@WebDiario:currentTenant');
                    if (savedOrg) {
                        try {
                            const parsedOrg = JSON.parse(savedOrg);
                            const foundOrg = orgs.find(org => String(org.id) === String(parsedOrg.id));
                            if (foundOrg) {
                                console.log('✅ Organization selecionada:', foundOrg.name);
                                return foundOrg;
                            } else {
                                localStorage.removeItem('@WebDiario:currentTenant');
                            }
                        } catch (error) {
                            console.error('Erro ao restaurar organization:', error);
                            localStorage.removeItem('@WebDiario:currentTenant');
                        }
                    }

                    // Se há exatamente uma organization, selecionar automaticamente
                    if (orgs.length === 1) {
                        console.log('✅ Organization selecionada automaticamente:', orgs[0].name);
                        localStorage.setItem('@WebDiario:currentTenant', JSON.stringify(orgs[0]));
                        return orgs[0];
                    }

                    return null;
                });
            } catch (error) {
                console.error('Erro ao carregar organizations:', error);
            } finally {
                setIsLoading(false);
            }
        } else if (!auth.isAuthenticated && isInitializedRef.current) {
            // Limpar dados se não autenticado
            setCurrentOrganization(null);
            setAvailableOrganizations([]);
            isInitializedRef.current = false;
            localStorage.removeItem('@WebDiario:currentTenant');
        }
    }, [auth.isAuthenticated, auth.user?.access_token, loadOrganizations]);

    // Buscar dados do Keycloak quando a organização mudar
    useEffect(() => {
        const loadKeycloakData = async () => {
            // Só buscar se tiver organização e ainda não tiver dados do Keycloak
            if (currentOrganization && !currentOrganization.keycloakData) {
                console.log('🔍 Carregando dados do Keycloak para organização:', currentOrganization.name);

                const keycloakData = await fetchKeycloakOrganizationData(currentOrganization.name);

                if (keycloakData) {
                    setCurrentOrganization(prev => {
                        if (!prev || prev.keycloakData) return prev; // Não atualizar se já tiver dados
                        return {
                            ...prev,
                            keycloakData
                        };
                    });
                }
            }
        };

        loadKeycloakData();
    }, [currentOrganization?.name, fetchKeycloakOrganizationData]);

    const value: OrganizationContextType = {
        currentOrganization,
        availableOrganizations,
        isLoading,
        isLoadingKeycloakData,
        switchOrganization,
        refreshOrganizations,
        refreshKeycloakData
    };

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
};

export const useOrganization = (): OrganizationContextType => {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error('useOrganization deve ser usado dentro de um OrganizationProvider');
    }
    return context;
};

