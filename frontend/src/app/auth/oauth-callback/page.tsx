'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SessionManager from '@/utils/sessionManager';
import { getApiUrl } from '@/utils/apiClient';

export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const provider = params.get('provider');
    const next = params.get('next') || '/profile';

    if (!token) {
      router.replace('/auth/login');
      return;
    }

    (async () => {
      try {
        localStorage.setItem('token', token);
        const apiUrl = getApiUrl();
        const resp = await fetch(`${apiUrl}/auth/validate`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!resp.ok) {
          localStorage.removeItem('token');
          router.replace('/auth/login');
          return;
        }
        const data = await resp.json();
        if (data && data.user) {
          SessionManager.saveSession(token, data.user, true);
          router.replace(next);
        } else {
          localStorage.removeItem('token');
          router.replace('/auth/login');
        }
      } catch (err) {
        console.error('OAuth callback error', err);
        localStorage.removeItem('token');
        router.replace('/auth/login');
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1f3a]">
      <div className="text-white">Signing you in…</div>
    </div>
  );
}
