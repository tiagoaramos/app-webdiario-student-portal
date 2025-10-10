import axios from 'axios';

export interface KeycloakOrganization {
    id: string;
    name: string;
    alias?: string;
    enabled?: boolean;
    description?: string;
    attributes?: Record<string, string[]>;
    domains?: Array<{
        name: string;
        verified: boolean;
    }>;
}

export interface KeycloakOrganizationListResponse {
    organizations: KeycloakOrganization[];
    count: number;
}

interface KeycloakTokenResponse {
    access_token: string;
    expires_in: number;
    refresh_expires_in: number;
    token_type: string;
    scope: string;
}

class KeycloakOrganizationService {
    private readonly keycloakUrl = process.env.REACT_APP_KEYCLOAK_URL;
    private readonly realm = process.env.REACT_APP_KEYCLOAK_REALM;
    private readonly clientId = process.env.REACT_APP_KEYCLOAK_CLIENT_ID;
    private readonly clientSecret = process.env.REACT_APP_KEYCLOAK_CLIENT_SECRET;

    // Cache do token de admin
    private adminToken: string | null = null;
    private tokenExpiresAt: number = 0;

    /**
     * Obtém token de admin usando Client Credentials Flow
     * Usa cache para evitar múltiplas requisições
     */
    private async getAdminToken(): Promise<string | null> {
        // Verificar se já temos um token válido em cache
        const now = Date.now();
        if (this.adminToken && this.tokenExpiresAt > now) {
            console.log('🔑 Usando token de admin em cache');
            return this.adminToken;
        }

        try {
            console.log('🔑 Obtendo novo token de admin via Client Credentials...');

            const tokenUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;

            const params = new URLSearchParams();
            params.append('grant_type', 'client_credentials');
            params.append('client_id', this.clientId || '');
            params.append('client_secret', this.clientSecret || '');

            const response = await axios.post<KeycloakTokenResponse>(tokenUrl, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            this.adminToken = response.data.access_token;
            // Expirar 30 segundos antes para garantir que não usaremos token expirado
            this.tokenExpiresAt = now + (response.data.expires_in - 30) * 1000;

            console.log('✅ Token de admin obtido com sucesso');
            return this.adminToken;
        } catch (error: any) {
            console.error('❌ Erro ao obter token de admin:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            return null;
        }
    }

    /**
     * Busca organização pelo alias usando a Keycloak Admin API
     * @param alias - Alias da organização (normalmente o nome/ID usado no token)
     */
    async getOrganizationByAlias(alias: string): Promise<KeycloakOrganization | null> {
        try {
            // Obter token de admin
            const token = await this.getAdminToken();
            if (!token) {
                console.error('❌ Não foi possível obter token de admin');
                return null;
            }

            const url = `${this.keycloakUrl}/admin/realms/${this.realm}/organizations`;

            console.log('🔍 Buscando organização no Keycloak:', {
                url,
                alias,
                query: `alias:${alias}`
            });

            const response = await axios.get<KeycloakOrganization[]>(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    q: `alias:${alias}`,
                    briefRepresentation: false, // Retornar representação completa
                    exact: true // Busca exata
                }
            });

            if (response.data && response.data.length > 0) {
                const organization = response.data[0];
                console.log('✅ Organização encontrada no Keycloak:', organization);
                return organization;
            }

            console.warn('⚠️ Nenhuma organização encontrada com alias:', alias);
            return null;
        } catch (error: any) {
            // Não logar erro se for 403/401 - usuário pode não ter permissão admin
            if (error.response?.status === 403) {
                console.warn('⚠️ Usuário não tem permissão para acessar Keycloak Admin API (403)');
                return null;
            }
            if (error.response?.status === 401) {
                console.warn('⚠️ Token inválido ou expirado para Keycloak Admin API (401)');
                return null;
            }

            console.error('❌ Erro ao buscar organização no Keycloak:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            return null;
        }
    }

    /**
     * Lista todas as organizações disponíveis
     * @param params - Parâmetros de paginação e filtro
     */
    async listOrganizations(
        params?: {
            search?: string;
            first?: number;
            max?: number;
            briefRepresentation?: boolean;
        }
    ): Promise<KeycloakOrganization[]> {
        try {
            // Obter token de admin
            const token = await this.getAdminToken();
            if (!token) {
                console.error('❌ Não foi possível obter token de admin');
                return [];
            }

            const url = `${this.keycloakUrl}/admin/realms/${this.realm}/organizations`;

            const response = await axios.get<KeycloakOrganization[]>(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    briefRepresentation: params?.briefRepresentation ?? false,
                    search: params?.search,
                    first: params?.first ?? 0,
                    max: params?.max ?? 10
                }
            });

            console.log(`✅ ${response.data.length} organizações encontradas no Keycloak`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 403 || error.response?.status === 401) {
                console.warn('⚠️ Usuário não tem permissão para listar organizações (403/401)');
                return [];
            }

            console.error('❌ Erro ao listar organizações no Keycloak:', error);
            return [];
        }
    }

    /**
     * Busca organização por ID
     * @param organizationId - ID da organização
     */
    async getOrganizationById(organizationId: string): Promise<KeycloakOrganization | null> {
        try {
            // Obter token de admin
            const token = await this.getAdminToken();
            if (!token) {
                console.error('❌ Não foi possível obter token de admin');
                return null;
            }

            const url = `${this.keycloakUrl}/admin/realms/${this.realm}/organizations/${organizationId}`;

            const response = await axios.get<KeycloakOrganization>(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Organização encontrada por ID:', response.data);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.warn('⚠️ Organização não encontrada:', organizationId);
                return null;
            }
            if (error.response?.status === 403 || error.response?.status === 401) {
                console.warn('⚠️ Sem permissão para acessar organização (403/401)');
                return null;
            }

            console.error('❌ Erro ao buscar organização por ID:', error);
            return null;
        }
    }
}

export default new KeycloakOrganizationService();

