import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
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
} from './lib/store';

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

const PORT = 4000;

const server = new WebSocketServer({
  port: PORT,
  path: '/graphql',
});

useServer(
  {
    schema,
    context: () => ({ userId: 'default' }),
  },
  server
);

console.log(`🚀 WebSocket server running at ws://localhost:${PORT}/graphql`);
