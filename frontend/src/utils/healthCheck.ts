/**
 * Backend connectivity checker
 * Helps diagnose WebSocket and REST API connection issues
 */

import { getApiUrl, getSocketUrl } from './apiClient';

export interface HealthCheckResult {
  isHealthy: boolean;
  apiUrl: string;
  socketUrl: string;
  restApiOk: boolean;
  message: string;
}

export const checkBackendHealth = async (): Promise<HealthCheckResult> => {
  const apiUrl = getApiUrl();
  const socketUrl = getSocketUrl();

  let restApiOk = false;

  try {
    console.log('[Health Check] Checking REST API at:', apiUrl);
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    restApiOk = response.ok;
    console.log('[Health Check] REST API status:', response.status);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log('[Health Check] REST API unreachable:', errorMsg);
  }

  const message = restApiOk 
    ? `✅ Backend is healthy. REST API responding at ${apiUrl}`
    : `❌ Backend is not responding. Check that:\n1. Backend server is running\n2. Port 5000 is accessible\n3. Firewall is not blocking connections\n\nAttempting to connect to: ${apiUrl}`;

  return {
    isHealthy: restApiOk,
    apiUrl,
    socketUrl,
    restApiOk,
    message
  };
};

export const logConnectionInfo = () => {
  const apiUrl = getApiUrl();
  const socketUrl = getSocketUrl();

  console.group('[Connection Config]');
  console.log('API URL:', apiUrl);
  console.log('Socket URL:', socketUrl);
  console.log('Frontend URL:', typeof window !== 'undefined' ? window.location.origin : 'N/A');
  console.groupEnd();
};
