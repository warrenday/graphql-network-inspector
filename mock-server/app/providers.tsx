'use client';

import { Provider } from 'urql';
import { getUrqlClient } from '@/lib/urql';
import { ReactNode, useMemo } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const client = useMemo(() => getUrqlClient(), []);

  return <Provider value={client}>{children}</Provider>;
}
