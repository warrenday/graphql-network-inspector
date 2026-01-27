'use client';

import { createClient, fetchExchange, subscriptionExchange, Client } from 'urql';
import { createClient as createWSClient } from 'graphql-ws';
import { sseExchange } from './sseExchange';
import { TransportType, getTransportFromCookie } from './useTransport';

let client: Client | null = null;
let currentTransport: TransportType | null = null;

export function getUrqlClient(transport?: TransportType): Client {
  const resolvedTransport = transport ?? getTransportFromCookie();

  // Return existing client if transport hasn't changed
  if (client && currentTransport === resolvedTransport) {
    return client;
  }

  currentTransport = resolvedTransport;

  if (resolvedTransport === 'sse') {
    client = createClient({
      url: '/api/graphql',
      exchanges: [fetchExchange, sseExchange],
    });
  } else {
    const wsClient = createWSClient({
      url: () => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}/graphql`;
      },
    });

    client = createClient({
      url: '/api/graphql',
      exchanges: [
        fetchExchange,
        subscriptionExchange({
          forwardSubscription: (request) => ({
            subscribe: (sink) => {
              const dispose = wsClient.subscribe(
                { query: request.query as string, variables: request.variables },
                {
                  next: sink.next.bind(sink),
                  error: sink.error.bind(sink),
                  complete: sink.complete.bind(sink),
                }
              );
              return {
                unsubscribe: dispose,
              };
            },
          }),
        }),
      ],
    });
  }

  return client;
}

export function resetClient(): void {
  client = null;
  currentTransport = null;
}
