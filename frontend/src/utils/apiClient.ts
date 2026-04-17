/**
 * Centralized API client configuration
 * This ensures all API calls use the correct URL from environment variables
 */

export const getApiUrl = (): string => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5007/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5007/api';
};

export const getSocketUrl = (): string => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://127.0.0.1:5007';
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://127.0.0.1:5007';
};

export const getMediaUrl = (path?: string): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('data:')) return path;
  const baseUrl = getSocketUrl();
  return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
};

export const getFetchOptions = (token?: string | null): RequestInit => {
  const options: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  return options;
};

// Health check to verify backend is running
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const socketUrl = getSocketUrl();
    const response = await fetch(`${socketUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
};

export const apiFetch = async (
  endpoint: string,
  options?: RequestInit & { token?: string }
): Promise<Response> => {
  const apiUrl = getApiUrl();
  let { token, ...fetchOptions } = options || {};
  if (!token && typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (storedToken) token = storedToken;
  }

  const url = `${apiUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  const mergedOptions = {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions?.headers,
    },
  };

  if (token) {
    (mergedOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, mergedOptions);
    return response;
  } catch (error) {
    console.error('Network Error in apiFetch:', error);
    console.error('Attempted URL:', url);
    console.error('Backend URL:', getSocketUrl());
    
    // Return a fake response that indicates a network failure
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server unreachable. Please check your connection or backend status.',
      isNetworkError: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
