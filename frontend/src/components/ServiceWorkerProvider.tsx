'use client';

import { useEffect } from 'react';

export default function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
              console.log('ServiceWorker registered: ', registration);
            })
            .catch((registrationError) => {
              console.log('ServiceWorker registration failed: ', registrationError);
            });
        });
      } else {
        (async () => {
          try {
            if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
              const regs = await navigator.serviceWorker.getRegistrations();
              for (const r of regs) {
                await r.unregister();
                console.log('Unregistered service worker in dev:', r);
              }
            }
          } catch (e) {
            console.warn('Failed to unregister service workers in dev', e);
          }
        })();
      }
    }
  }, []);

  return <>{children}</>;
}
