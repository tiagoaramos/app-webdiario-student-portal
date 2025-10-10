/**
 * Utilitários para gerenciar o estado OIDC
 */

/**
 * Limpa todo o estado OIDC corrompido
 */
export const clearOIDCState = (): void => {
    console.log('🧹 Limpando estado OIDC corrompido...');

    // Limpar localStorage
    localStorage.removeItem('oidc_access_token');
    localStorage.removeItem('@WebDiario:currentOrganization');

    // Limpar sessionStorage (onde o OIDC armazena estado)
    sessionStorage.removeItem('oidc.user');
    sessionStorage.removeItem('oidc.state');
    sessionStorage.removeItem('oidc.nonce');
    sessionStorage.removeItem('oidc.code_verifier');
    sessionStorage.removeItem('oidc.access_token');
    sessionStorage.removeItem('oidc.id_token');
    sessionStorage.removeItem('oidc.refresh_token');

    // Limpar cookies relacionados ao OIDC
    document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        if (name.includes('oidc') || name.includes('keycloak')) {
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
    });

    console.log('✅ Estado OIDC limpo com sucesso');
};

/**
 * Verifica se há estado OIDC corrompido
 */
export const hasCorruptedOIDCState = (): boolean => {
    const hasUser = !!sessionStorage.getItem('oidc.user');
    const hasState = !!sessionStorage.getItem('oidc.state');
    const hasToken = !!localStorage.getItem('oidc_access_token');

    // NÃO considerar como corrompido se há token mas não há usuário
    // Isso pode acontecer durante a troca de organização
    // if (hasToken && !hasUser) {
    //     return true;
    // }

    // Se há estado mas não há usuário, pode estar corrompido
    if (hasState && !hasUser) {
        return true;
    }

    return false;
};

/**
 * Força limpeza e redirecionamento para login
 */
export const forceLoginRedirect = (): void => {
    clearOIDCState();
    window.location.href = '/';
};

/**
 * Limpa parâmetros do Keycloak da URL após autenticação bem-sucedida
 */
export const clearKeycloakURLParams = (): boolean => {
    const currentUrl = new URL(window.location.href);
    const hasKeycloakParams = currentUrl.searchParams.has('code') ||
        currentUrl.searchParams.has('state') ||
        currentUrl.searchParams.has('session_state') ||
        currentUrl.searchParams.has('iss') ||
        currentUrl.searchParams.has('error') ||
        currentUrl.searchParams.has('error_description');

    if (hasKeycloakParams) {
        console.log('🧹 Limpando parâmetros do Keycloak da URL');
        console.log('🔍 Parâmetros encontrados:', {
            code: currentUrl.searchParams.get('code') ? '✅' : '❌',
            state: currentUrl.searchParams.get('state') ? '✅' : '❌',
            session_state: currentUrl.searchParams.get('session_state') ? '✅' : '❌',
            iss: currentUrl.searchParams.get('iss') ? '✅' : '❌',
            error: currentUrl.searchParams.get('error') ? '✅' : '❌',
            error_description: currentUrl.searchParams.get('error_description') ? '✅' : '❌'
        });

        const cleanUrl = `${currentUrl.origin}${currentUrl.pathname}`;
        window.history.replaceState({}, document.title, cleanUrl);
        console.log('✅ URL limpa:', cleanUrl);
        return true;
    }

    return false;
};
