'use client';

import { SessionProvider } from "next-auth/react";
import React, { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registrado correctamente scope:', reg.scope))
        .catch(err => console.error('Fallo en registro de Service Worker:', err));
    }
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
