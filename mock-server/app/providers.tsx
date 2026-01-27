'use client';

import { Provider } from 'urql';
import { getUrqlClient } from '@/lib/urql';
import { ReactNode, useMemo } from 'react';
import { getTransportFromCookie } from '@/lib/useTransport';

export function Providers({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    const transport = getTransportFromCookie();
    return getUrqlClient(transport);
  }, []);

  return <Provider value={client}>{children}</Provider>;
}
