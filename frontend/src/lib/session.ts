import SessionManager from '@/utils/sessionManager';
export async function getSessionUser() {
  return null;
}
export { default as SessionManager } from '@/utils/sessionManager';
export const isLoggedIn = () => SessionManager.isLoggedIn();
export const getToken = () => SessionManager.getToken();
export const getUser = () => SessionManager.getUser();
export const saveSession = (token: string, user: any, rememberMe: boolean = true) => SessionManager.saveSession(token, user, rememberMe);
export const clearSession = () => SessionManager.clearSession();
export const logout = () => SessionManager.logout();