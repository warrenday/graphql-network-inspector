import { NextRequest } from 'next/server';
import { parse, subscribe, GraphQLError } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import {
  generateWildPokemon,
  getAllPokemons,
  getPokemon,
  addPokemon,
  removePokemon,
  clearAllPokemons,
  levelUpPokemon,
  Pokemon,
} from '@/lib/store';

const typeDefs = /* GraphQL */ `
  type Pokemon {
    id: ID!
    name: String!
    type: String!
    level: Int!
  }

  type Query {
    pokemons: [Pokemon!]!
    pokemon(id: ID!): Pokemon
  }

  type Mutation {
    catchPokemon(name: String!, type: String!, level: Int!): Pokemon!
    releasePokemon(id: ID!): Boolean!
    releaseAllPokemon: Boolean!
    levelUp(id: ID!): Pokemon
  }

  type Subscription {
    pokemonAppeared: Pokemon!
  }
`;

interface Context {
  userId: string;
}

const resolvers = {
  Query: {
    pokemons: (_: unknown, __: unknown, context: Context): Pokemon[] => {
      return getAllPokemons(context.userId);
    },
    pokemon: (
      _: unknown,
      { id }: { id: string },
      context: Context
    ): Pokemon | undefined => {
      return getPokemon(context.userId, id);
    },
  },
  Mutation: {
    catchPokemon: (
      _: unknown,
      { name, type, level }: { name: string; type: string; level: number },
      context: Context
    ): Pokemon => {
      return addPokemon(context.userId, name, type, level);
    },
    releasePokemon: (
      _: unknown,
      { id }: { id: string },
      context: Context
    ): boolean => {
      return removePokemon(context.userId, id);
    },
    releaseAllPokemon: (_: unknown, __: unknown, context: Context): boolean => {
      return clearAllPokemons(context.userId);
    },
    levelUp: (
      _: unknown,
      { id }: { id: string },
      context: Context
    ): Pokemon | undefined => {
      return levelUpPokemon(context.userId, id);
    },
  },
  Subscription: {
    pokemonAppeared: {
      subscribe: async function* () {
        while (true) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          yield { pokemonAppeared: generateWildPokemon() };
        }
      },
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.split('=');
    if (name && rest.length > 0) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });
  return cookies;
}

async function executeSubscription(
  query: string,
  variables: Record<string, unknown> | undefined,
  userId: string
): Promise<Response> {
  let document;
  try {
    document = parse(query);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid GraphQL query', details: String(error) }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const context: Context = { userId };

  const result = await subscribe({
    schema,
    document,
    variableValues: variables,
    contextValue: context,
  });

  if ('errors' in result && result.errors) {
    return new Response(
      JSON.stringify({ errors: result.errors.map((e: GraphQLError) => e.message) }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (!('next' in result) || typeof result.next !== 'function') {
    return new Response(
      JSON.stringify({ error: 'Query is not a subscription' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const value of result as AsyncIterable<{ data?: unknown; errors?: GraphQLError[] }>) {
          const payload = { payload: value };
          const message = `data: ${JSON.stringify(payload)}\n\n`;
          controller.enqueue(encoder.encode(message));
        }
      } catch (error) {
        const errorPayload = { payload: { errors: [{ message: String(error) }] } };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorPayload)}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// GET handler for native EventSource (query/variables passed as URL params)
export async function GET(request: NextRequest) {
  const cookies = parseCookies(request.headers.get('cookie'));
  const userId = cookies['userId'] || 'default';

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const variablesParam = searchParams.get('variables');

  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing query parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let variables: Record<string, unknown> | undefined;
  if (variablesParam) {
    try {
      variables = JSON.parse(variablesParam);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid variables JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return executeSubscription(query, variables, userId);
}

// POST handler for fetch-based SSE
export async function POST(request: NextRequest) {
  const cookies = parseCookies(request.headers.get('cookie'));
  const userId = cookies['userId'] || 'default';

  let body: { query: string; variables?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return executeSubscription(body.query, body.variables, userId);
}
