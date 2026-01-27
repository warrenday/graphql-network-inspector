'use client';

import { Exchange, Operation, OperationResult } from 'urql';
import { pipe, filter, merge, mergeMap, make, share, takeUntil } from 'wonka';

interface SSEPayload {
  payload: {
    data?: unknown;
    errors?: Array<{ message: string }>;
  };
}

function isSubscriptionOperation(operation: Operation): boolean {
  return operation.kind === 'subscription';
}

function createSSESource(operation: Operation) {
  return make<OperationResult>(({ next, complete }) => {
    const { query, variables } = operation;

    // Build URL with query params for EventSource (GET-based)
    const queryString = typeof query === 'string' ? query : query.loc?.source.body;
    const params = new URLSearchParams();
    params.set('query', queryString || '');
    if (variables) {
      params.set('variables', JSON.stringify(variables));
    }

    const url = `/api/graphql/sse?${params.toString()}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const parsed: SSEPayload = JSON.parse(event.data);
        next({
          operation,
          data: parsed.payload.data,
          error: parsed.payload.errors
            ? ({
                name: 'GraphQLError',
                message: parsed.payload.errors[0]?.message || 'Unknown error',
                graphQLErrors: parsed.payload.errors,
                networkError: undefined,
              } as OperationResult['error'])
            : undefined,
          extensions: undefined,
          stale: false,
          hasNext: true,
        });
      } catch {
        // Skip invalid JSON
      }
    };

    eventSource.onerror = () => {
      next({
        operation,
        data: undefined,
        error: {
          name: 'SSEError',
          message: 'EventSource connection error',
          graphQLErrors: [],
          networkError: new Error('EventSource connection failed'),
        } as OperationResult['error'],
        extensions: undefined,
        stale: false,
        hasNext: false,
      });
      eventSource.close();
      complete();
    };

    return () => {
      eventSource.close();
    };
  });
}

export const sseExchange: Exchange = ({ forward }) => {
  return (ops$) => {
    const sharedOps$ = share(ops$);

    const teardown$ = pipe(
      sharedOps$,
      filter((op: Operation) => op.kind === 'teardown')
    );

    const subscriptionResults$ = pipe(
      sharedOps$,
      filter(isSubscriptionOperation),
      mergeMap((operation: Operation) => {
        return pipe(
          createSSESource(operation),
          takeUntil(
            pipe(
              teardown$,
              filter((op: Operation) => op.key === operation.key)
            )
          )
        );
      })
    );

    const forward$ = pipe(
      sharedOps$,
      filter((op: Operation) => !isSubscriptionOperation(op) && op.kind !== 'teardown'),
      forward
    );

    return merge([subscriptionResults$, forward$]);
  };
};
