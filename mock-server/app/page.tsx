'use client';

import { useQuery, useMutation, useSubscription, gql } from 'urql';
import { useState } from 'react';
import { TransportToggle } from './components/TransportToggle';

const POKEMONS_QUERY = gql`
  query GetPokemons {
    pokemons {
      id
      name
      type
      level
    }
  }
`;

const CATCH_POKEMON_MUTATION = gql`
  mutation CatchPokemon($name: String!, $type: String!, $level: Int!) {
    catchPokemon(name: $name, type: $type, level: $level) {
      id
      name
      type
      level
    }
  }
`;

const LEVEL_UP_MUTATION = gql`
  mutation LevelUp($id: ID!) {
    levelUp(id: $id) {
      id
      name
      type
      level
    }
  }
`;

const RELEASE_POKEMON_MUTATION = gql`
  mutation ReleasePokemon($id: ID!) {
    releasePokemon(id: $id)
  }
`;

const RELEASE_ALL_POKEMON_MUTATION = gql`
  mutation ReleaseAllPokemon {
    releaseAllPokemon
  }
`;

const POKEMON_APPEARED_SUBSCRIPTION = gql`
  subscription PokemonAppeared {
    pokemonAppeared {
      id
      name
      type
      level
    }
  }
`;

interface Pokemon {
  id: string;
  name: string;
  type: string;
  level: number;
}

const wildPokemonData = [
  { name: 'Pikachu', type: 'Electric' },
  { name: 'Charmander', type: 'Fire' },
  { name: 'Bulbasaur', type: 'Grass' },
  { name: 'Squirtle', type: 'Water' },
  { name: 'Eevee', type: 'Normal' },
  { name: 'Jigglypuff', type: 'Fairy' },
  { name: 'Meowth', type: 'Normal' },
  { name: 'Psyduck', type: 'Water' },
];

const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '30px',
  },
  section: {
    marginBottom: '30px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '15px',
    borderBottom: '2px solid #eee',
    paddingBottom: '10px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '4px',
    marginRight: '10px',
    marginBottom: '10px',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
    color: 'white',
  },
  dangerButton: {
    backgroundColor: '#f44336',
    color: 'white',
  },
  pokemonCard: {
    display: 'inline-block',
    padding: '15px',
    margin: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    minWidth: '150px',
  },
  wildPokemon: {
    backgroundColor: '#fff3e0',
    border: '2px solid #ff9800',
  },
  pokemonName: {
    fontWeight: 'bold' as const,
    fontSize: '18px',
    marginBottom: '5px',
  },
  pokemonInfo: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '3px',
  },
  emptyState: {
    color: '#999',
    fontStyle: 'italic' as const,
  },
  wildPokemonList: {
    maxHeight: '200px',
    overflowY: 'auto' as const,
    display: 'flex',
    flexWrap: 'wrap' as const,
  },
  smallButton: {
    padding: '5px 10px',
    fontSize: '12px',
    marginTop: '8px',
    marginRight: '5px',
  },
};

export default function Home() {
  const [wildPokemons, setWildPokemons] = useState<Pokemon[]>([]);

  // Query for user's pokemons
  const [pokemonsResult, reexecuteQuery] = useQuery({ query: POKEMONS_QUERY });

  // Mutations
  const [, catchPokemon] = useMutation(CATCH_POKEMON_MUTATION);
  const [, levelUp] = useMutation(LEVEL_UP_MUTATION);
  const [, releasePokemon] = useMutation(RELEASE_POKEMON_MUTATION);
  const [, releaseAllPokemon] = useMutation(RELEASE_ALL_POKEMON_MUTATION);

  // Subscription for wild pokemon appearances
  useSubscription(
    { query: POKEMON_APPEARED_SUBSCRIPTION },
    (prev, data) => {
      if (data?.pokemonAppeared) {
        setWildPokemons((current) => [data.pokemonAppeared, ...current].slice(0, 10));
      }
      return data;
    }
  );

  const handleCatchRandom = async () => {
    const randomPokemon = wildPokemonData[Math.floor(Math.random() * wildPokemonData.length)];
    const level = Math.floor(Math.random() * 50) + 1;
    await catchPokemon({
      name: randomPokemon.name,
      type: randomPokemon.type,
      level,
    });
    reexecuteQuery({ requestPolicy: 'network-only' });
  };

  const handleCatchWild = async (pokemon: Pokemon) => {
    await catchPokemon({
      name: pokemon.name,
      type: pokemon.type,
      level: pokemon.level,
    });
    setWildPokemons((current) => current.filter((p) => p.id !== pokemon.id));
    reexecuteQuery({ requestPolicy: 'network-only' });
  };

  const handleLevelUp = async (id: string) => {
    await levelUp({ id });
    reexecuteQuery({ requestPolicy: 'network-only' });
  };

  const handleRelease = async (id: string) => {
    await releasePokemon({ id });
    reexecuteQuery({ requestPolicy: 'network-only' });
  };

  const handleReleaseAll = async () => {
    await releaseAllPokemon({});
    reexecuteQuery({ requestPolicy: 'network-only' });
  };

  const { data, fetching, error } = pokemonsResult;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Pokemon GraphQL Mock Server</h1>
        <p>Test your GraphQL Network Inspector here!</p>
        <TransportToggle />
      </header>

      {/* Wild Pokemon Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Wild Pokemon (Subscription)</h2>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Wild Pokemon appear every 3 seconds via GraphQL subscription
        </p>
        <div style={styles.wildPokemonList}>
          {wildPokemons.length === 0 ? (
            <p style={styles.emptyState}>Waiting for wild Pokemon to appear...</p>
          ) : (
            wildPokemons.map((pokemon) => (
              <div key={pokemon.id} style={{ ...styles.pokemonCard, ...styles.wildPokemon }}>
                <div style={styles.pokemonName}>{pokemon.name}</div>
                <div style={styles.pokemonInfo}>Type: {pokemon.type}</div>
                <div style={styles.pokemonInfo}>Level: {pokemon.level}</div>
                <button
                  style={{ ...styles.button, ...styles.primaryButton, ...styles.smallButton }}
                  onClick={() => handleCatchWild(pokemon)}
                >
                  Catch!
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Actions Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Actions (Mutations)</h2>
        <button
          style={{ ...styles.button, ...styles.primaryButton }}
          onClick={handleCatchRandom}
        >
          Catch Random Pokemon
        </button>
        <button
          style={{ ...styles.button, ...styles.dangerButton }}
          onClick={handleReleaseAll}
        >
          Release All Pokemon
        </button>
      </section>

      {/* My Pokemon Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>My Pokemon (Query)</h2>
        {fetching && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
        {data?.pokemons?.length === 0 && (
          <p style={styles.emptyState}>No Pokemon caught yet. Catch some!</p>
        )}
        <div>
          {data?.pokemons?.map((pokemon: Pokemon) => (
            <div key={pokemon.id} style={styles.pokemonCard}>
              <div style={styles.pokemonName}>{pokemon.name}</div>
              <div style={styles.pokemonInfo}>Type: {pokemon.type}</div>
              <div style={styles.pokemonInfo}>Level: {pokemon.level}</div>
              <div>
                <button
                  style={{ ...styles.button, ...styles.secondaryButton, ...styles.smallButton }}
                  onClick={() => handleLevelUp(pokemon.id)}
                >
                  Level Up
                </button>
                <button
                  style={{ ...styles.button, ...styles.dangerButton, ...styles.smallButton }}
                  onClick={() => handleRelease(pokemon.id)}
                >
                  Release
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>GraphQL Endpoint</h2>
        <p>
          GraphiQL is available at:{' '}
          <a href="/api/graphql" target="_blank" rel="noopener noreferrer">
            /api/graphql
          </a>
        </p>
      </section>
    </div>
  );
}
