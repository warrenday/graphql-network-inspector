'use client';

import { createClient, fetchExchange, subscriptionExchange, Client } from 'urql';
import { createClient as createWSClient } from 'graphql-ws';

let client: Client | null = null;

export function getUrqlClient(): Client {
  if (client) return client;

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

  return client;
}
