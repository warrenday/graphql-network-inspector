export interface Pokemon {
  id: string;
  name: string;
  type: string;
  level: number;
}

// In-memory store keyed by user session
const userStores = new Map<string, Map<string, Pokemon>>();

// Counter for generating unique IDs
let idCounter = 1;

export function getUserStore(userId: string): Map<string, Pokemon> {
  if (!userStores.has(userId)) {
    userStores.set(userId, new Map());
  }
  return userStores.get(userId)!;
}

export function getAllPokemons(userId: string): Pokemon[] {
  const store = getUserStore(userId);
  return Array.from(store.values());
}

export function getPokemon(userId: string, id: string): Pokemon | undefined {
  const store = getUserStore(userId);
  return store.get(id);
}

export function addPokemon(userId: string, name: string, type: string, level: number): Pokemon {
  const store = getUserStore(userId);
  const id = String(idCounter++);
  const pokemon: Pokemon = { id, name, type, level };
  store.set(id, pokemon);
  return pokemon;
}

export function removePokemon(userId: string, id: string): boolean {
  const store = getUserStore(userId);
  return store.delete(id);
}

export function clearAllPokemons(userId: string): boolean {
  const store = getUserStore(userId);
  store.clear();
  return true;
}

export function levelUpPokemon(userId: string, id: string): Pokemon | undefined {
  const store = getUserStore(userId);
  const pokemon = store.get(id);
  if (pokemon) {
    pokemon.level += 1;
    store.set(id, pokemon);
  }
  return pokemon;
}

// Wild Pokemon generator data
const wildPokemonNames = [
  'Pikachu', 'Charmander', 'Bulbasaur', 'Squirtle', 'Eevee',
  'Jigglypuff', 'Meowth', 'Psyduck', 'Geodude', 'Magikarp',
  'Rattata', 'Pidgey', 'Zubat', 'Gastly', 'Machop'
];

const pokemonTypes = [
  'Electric', 'Fire', 'Grass', 'Water', 'Normal',
  'Fairy', 'Normal', 'Water', 'Rock', 'Water',
  'Normal', 'Flying', 'Poison', 'Ghost', 'Fighting'
];

export function generateWildPokemon(): Pokemon {
  const index = Math.floor(Math.random() * wildPokemonNames.length);
  return {
    id: `wild-${Date.now()}`,
    name: wildPokemonNames[index],
    type: pokemonTypes[index],
    level: Math.floor(Math.random() * 50) + 1
  };
}
