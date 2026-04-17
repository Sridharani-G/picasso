
import { getApiUrl, getFetchOptions } from './apiClient';

class SessionManager {
  private static readonly TOKEN_KEY = 'token';
  private static readonly USER_KEY = 'user';
  private static readonly STORAGE_KEY = 'auth-state';
  private static listeners: Array<(isLoggedIn: boolean) => void> = [];
  public static init(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === this.STORAGE_KEY) {
        const newState = event.newValue ? JSON.parse(event.newValue) : null;
        const oldState = event.oldValue ? JSON.parse(event.oldValue) : null;
        if (oldState && !newState) {
          this.clearSession();
          this.notifyListeners(false);
        }
      }
    });
    this.setupSessionValidation();
  }
  private static setupSessionValidation(): void {
  }
  private static async validateSession(): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) {
        return;
      }
      if (!this.isLoggedIn()) {
        this.logout();
        return;
      }

      const apiUrl = getApiUrl();
      console.log('[SessionManager] Validating session at:', apiUrl);

      const response = await fetch(`${apiUrl}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('[SessionManager] Session validation returned status:', response.status);
        this.logout();
      } else {
        console.log('[SessionManager] Session validated successfully');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log('[SessionManager] Session validation network error:', errorMsg);
    }
  }
  public static isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (e) {
      return false;
    }
  }
  public static getToken(): string | null {
    let token = localStorage.getItem(this.TOKEN_KEY);
    if (token) return token;
    return sessionStorage.getItem(this.TOKEN_KEY);
  }
  public static getUser(): any {
    let userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) {
      userStr = sessionStorage.getItem(this.USER_KEY);
    }
    if (!userStr) {
      return null;
    }

    const user = JSON.parse(userStr);
    return {
      ...user,
      avatar: user.avatar || user.profileImage || ''
    };
  }
  public static saveSession(token: string, user: any, rememberMe: boolean = true): void {
    const normalizedUser = {
      ...user,
      avatar: user.avatar || user.profileImage || ''
    };

    if (rememberMe) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(normalizedUser));
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(normalizedUser));
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      timestamp: Date.now(),
      userId: user.id
    }));

    this.notifyListeners(true);
  }
  public static clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.STORAGE_KEY);

    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);

    this.notifyListeners(false);
  }
  public static logout(): void {
    this.clearSession();
    localStorage.removeItem(this.STORAGE_KEY);
  }
  public static addListener(listener: (isLoggedIn: boolean) => void): void {
    this.listeners.push(listener);
  }
  public static removeListener(listener: (isLoggedIn: boolean) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  private static notifyListeners(isLoggedIn: boolean): void {
    this.listeners.forEach(listener => {
      try {
        listener(isLoggedIn);
      } catch (error) {
        console.log('[SessionManager] Error in auth state listener:', error);
      }
    });
  }
  public static async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const apiUrl = getApiUrl();
      console.log('[SessionManager] Refreshing token at:', apiUrl);

      const response = await fetch(`${apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(this.TOKEN_KEY, data.token);
        console.log('[SessionManager] Token refreshed successfully');
        return true;
      }
      console.log('[SessionManager] Token refresh returned status:', response.status);
      return false;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log('[SessionManager] Token refresh network error:', errorMsg);
      return false;
    }
  }
}

export default SessionManager;