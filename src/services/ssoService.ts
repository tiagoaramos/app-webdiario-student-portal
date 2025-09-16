// @ts-nocheck
import { toast } from 'react-toastify';

class SSOService {
  private readonly SECURITY_API_URL = 'http://localhost:8081/api/security';
  private readonly SECURITY_APP_URL = 'http://localhost:3003';
  
  /**
   * Redirect to SSO login page
   */
  redirectToSSO(appName: string = 'student-portal'): void {
    try {
      const currentUrl = window.location.href;
      const returnUrl = encodeURIComponent(currentUrl);
      
      console.log('🔄 SSO Redirect Details:');
      console.log('📍 Current URL:', currentUrl);
      console.log('📍 Encoded returnUrl:', returnUrl);
      console.log('📍 App Name:', appName);
      
      // Call SSO redirect endpoint to get the login URL
      const ssoUrl = `${this.SECURITY_API_URL}/auth/sso/redirect?returnUrl=${returnUrl}&appName=${appName}`;
      
      console.log('🔄 Redirecting to SSO:', ssoUrl);
      
      // Redirect to SSO login page
      const finalRedirectUrl = `${this.SECURITY_APP_URL}/login?returnUrl=${returnUrl}&appName=${appName}`;
      console.log('📍 Final redirect URL:', finalRedirectUrl);
      
      window.location.href = finalRedirectUrl;
      
    } catch (error) {
      console.error('❌ Error redirecting to SSO:', error);
      toast.error('Erro ao redirecionar para login');
    }
  }

  /**
   * Handle SSO callback after authentication
   */
  async handleSSOCallback(token: string, returnUrl?: string): Promise<any> {
    try {
      console.log('🔄 Handling SSO callback with token:', token ? 'present' : 'missing');
      
      const response = await fetch(`${this.SECURITY_API_URL}/auth/sso/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          returnUrl: returnUrl || window.location.href
        })
      });

      if (!response.ok) {
        throw new Error('SSO callback failed');
      }

      const data = await response.json();
      console.log('✅ SSO callback successful');
      
      return data;
      
    } catch (error) {
      console.error('❌ Error handling SSO callback:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated via SSO
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  /**
   * Clear SSO session
   */
  clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentTenantId');
    console.log('🧹 SSO session cleared');
  }

  /**
   * Initialize SSO authentication check
   */
  async initializeAuth(): Promise<boolean> {
    try {
      // Check if we have a token in localStorage
      const token = localStorage.getItem('accessToken');
      console.log('🔍 SSO initializeAuth - Token found:', token ? '✅' : '❌');
      
      if (token) {
        console.log('🔍 SSO initializeAuth - Verifying token with API...');
        // Verify token is still valid by calling user/me endpoint
        const response = await fetch(`${this.SECURITY_API_URL}/user/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('🔍 SSO initializeAuth - API response status:', response.status);
        
        if (response.ok) {
          console.log('✅ User already authenticated via SSO');
          return true;
        } else {
          console.log('⚠️ Token expired or invalid, clearing session');
          console.log('⚠️ Response status:', response.status, 'Status text:', response.statusText);
          this.clearSession();
        }
      } else {
        console.log('❌ No token found in localStorage');
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Error initializing SSO auth:', error);
      this.clearSession();
      return false;
    }
  }

  /**
   * Handle authentication required - redirect to SSO
   */
  requireAuth(): void {
    console.log('🔐 Authentication required, redirecting to SSO');
    this.redirectToSSO();
  }
}

const ssoService = new SSOService();
export default ssoService;
