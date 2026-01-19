import { createYoga } from 'graphql-yoga';
import { schema } from '@/lib/schema';
import { NextRequest } from 'next/server';

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response },
  context: ({ request }) => {
    const userId = request.headers.get('x-user-id') || 'default';
    return { userId };
  }
});

export async function GET(request: NextRequest) {
  return yoga.fetch(request);
}

export async function POST(request: NextRequest) {
  return yoga.fetch(request);
}

export async function OPTIONS(request: NextRequest) {
  return yoga.fetch(request);
}
