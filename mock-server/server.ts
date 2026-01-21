import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import crypto from 'crypto';
import {
  generateWildPokemon,
  getAllPokemons,
  getPokemon,
  addPokemon,
  removePokemon,
  clearAllPokemons,
  levelUpPokemon,
  Pokemon,
} from './lib/store';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const COOKIE_NAME = 'userId';

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
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

function generateUserId(): string {
  return crypto.randomUUID();
}

function getUserIdFromRequest(req: IncomingMessage): string | null {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[COOKIE_NAME] || null;
}

function setUserIdCookie(res: ServerResponse, userId: string): void {
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${userId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`);
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

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

app.prepare().then(() => {
  const server = createServer((req, res) => {
    // Ensure user has a userId cookie
    let userId = getUserIdFromRequest(req);
    if (!userId) {
      userId = generateUserId();
      setUserIdCookie(res, userId);
    }

    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({
    server,
    path: '/graphql',
  });

  useServer(
    {
      schema,
      context: (ctx) => {
        const req = ctx.extra.request;
        let userId = getUserIdFromRequest(req);
        // If no cookie, generate a temporary ID for this connection
        if (!userId) {
          userId = generateUserId();
        }
        return { userId };
      },
    },
    wss
  );

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server running at ws://${hostname}:${port}/graphql`);
  });
});
