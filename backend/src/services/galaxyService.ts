import { randomUUID } from 'node:crypto';

import { gameStore } from '../data/store.js';
import type { Planet } from '../types.js';

export interface GalaxyCoordinate {
  galaxy: number;
  system: number;
  position: number;
}

export interface GalaxySlot {
  coordinate: GalaxyCoordinate;
  planet: {
    id: string;
    name: string;
    ownerId: string | null;
    ownerName: string | null;
  } | null;
  isEmpty: boolean;
}

export interface GalaxySystem {
  galaxy: number;
  system: number;
  slots: GalaxySlot[];
}

const GALAXY_COUNT = 1;
const SYSTEMS_PER_GALAXY = 20;
const POSITIONS_PER_SYSTEM = 6;

const generatedPlanets = new Map<string, Planet>();

function coordinateKey(galaxy: number, system: number, position: number): string {
  return `${galaxy}:${system}:${position}`;
}

export function getGalaxyOverview(): GalaxySystem[] {
  const systems: GalaxySystem[] = [];

  for (let galaxy = 1; galaxy <= GALAXY_COUNT; galaxy++) {
    for (let system = 1; system <= SYSTEMS_PER_GALAXY; system++) {
      const slots: GalaxySlot[] = [];

      for (let position = 1; position <= POSITIONS_PER_SYSTEM; position++) {
        const key = coordinateKey(galaxy, system, position);
        const existing = generatedPlanets.get(key);

        // Also include player-owned planets mapped by their x/y coordinate.
        const playerPlanet = gameStore.planets.find(
          (planet) => planet.coordinate.x === system && planet.coordinate.y === position,
        );

        const planet = playerPlanet ?? existing ?? null;

        slots.push({
          coordinate: { galaxy, system, position },
          planet: planet
            ? {
                id: planet.id,
                name: planet.name,
                ownerId: planet.ownerId,
                ownerName:
                  gameStore.players.find((player) => player.id === planet.ownerId)?.username ?? null,
              }
            : null,
          isEmpty: !planet,
        });
      }

      systems.push({ galaxy, system, slots });
    }
  }

  return systems;
}

export function getSystem(galaxy: number, system: number): GalaxySystem | null {
  if (galaxy < 1 || galaxy > GALAXY_COUNT || system < 1 || system > SYSTEMS_PER_GALAXY) {
    return null;
  }

  return getGalaxyOverview().find((entry) => entry.galaxy === galaxy && entry.system === system) ?? null;
}

export function colonizePosition(
  galaxy: number,
  system: number,
  position: number,
  playerId: string,
  planetName?: string,
): Planet {
  const key = coordinateKey(galaxy, system, position);

  if (generatedPlanets.has(key)) {
    throw new Error(`Position ${key} is already occupied`);
  }

  const existingPlayerPlanet = gameStore.planets.find(
    (planet) => planet.coordinate.x === system && planet.coordinate.y === position,
  );
  if (existingPlayerPlanet) {
    throw new Error(`Position ${key} is already occupied by ${existingPlayerPlanet.name}`);
  }

  const planet: Planet = {
    id: randomUUID(),
    name: planetName ?? `Colonia ${galaxy}-${system}-${position}`,
    ownerId: playerId,
    coordinate: { x: system, y: position },
    resources: { metal: 500, crystal: 300, deuterium: 100, energy: 200 },
    production: { metal: 30, crystal: 20, deuterium: 10, energy: 15 },
    lastUpdatedAt: new Date().toISOString(),
  };

  generatedPlanets.set(key, planet);
  gameStore.planets.push(planet);

  return planet;
}
