'use client';

import { useState, useCallback, useEffect } from 'react';

export type TransportType = 'websocket' | 'sse';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function setCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getTransportFromCookie(): TransportType {
  const value = getCookie('transport');
  if (value === 'sse') return 'sse';
  return 'websocket';
}

export function useTransport() {
  const [transport, setTransportState] = useState<TransportType>('websocket');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTransportState(getTransportFromCookie());
    setIsLoaded(true);
  }, []);

  const setTransport = useCallback((newTransport: TransportType) => {
    setCookie('transport', newTransport);
    // Reload the page to reinitialize the urql client with the new transport
    window.location.reload();
  }, []);

  return { transport, setTransport, isLoaded };
}
