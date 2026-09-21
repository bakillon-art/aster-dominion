import { randomUUID } from 'node:crypto';

import type { Planet, Player } from '../types.js';

export interface StoredFleet {
  id: string;
  planetId: string;
  ownerId: string;
  shipType: string;
  quantity: number;
  status: 'idle' | 'traveling' | 'returning';
  createdAt: string;
}

export interface StoredBuilding {
  planetId: string;
  type: string;
  level: number;
}

export interface StoredMission {
  id: string;
  ownerId: string;
  originPlanetId: string;
  targetPlanetId: string;
  missionType: string;
  quantity: number;
  status: 'in_transit' | 'arrived' | 'returning';
  launchedAt: string;
  arrivesAt: string;
}

export interface StoredDefense {
  planetId: string;
  type: string;
  quantity: number;
}

export const gameStore = {
  players: [] as Player[],
  planets: [] as Planet[],
  fleets: [] as StoredFleet[],
  buildings: [] as StoredBuilding[],
  missions: [] as StoredMission[],
  defenses: [] as StoredDefense[],
};

const defaultPlayerId = randomUUID();
const defaultPlanetId = randomUUID();

const now = new Date().toISOString();

gameStore.players.push({
  id: defaultPlayerId,
  username: 'admin',
  email: 'admin@asterdominion.local',
  passwordHash: '2c2e89e4f5f11bc9f28b1b2d0f8902bcf7d17b2796519d7a2b7fdff8d6f6cf1c',
  createdAt: now,
});

gameStore.planets.push({
  id: defaultPlanetId,
  name: 'Aster Prime',
  ownerId: defaultPlayerId,
  coordinate: { x: 1, y: 1 },
  resources: {
    metal: 500,
    crystal: 300,
    deuterium: 100,
    energy: 200,
  },
  production: {
    metal: 30,
    crystal: 20,
    deuterium: 10,
    energy: 15,
  },
  lastUpdatedAt: now,
});

export const createInitialPlanetForPlayer = (playerId: string): Planet => {
  const planetId = randomUUID();
  const planet: Planet = {
    id: planetId,
    name: 'Aster Prime',
    ownerId: playerId,
    coordinate: {
      x: 1 + (gameStore.planets.length % 10),
      y: 1 + Math.floor(gameStore.planets.length / 10),
    },
    resources: {
      metal: 500,
      crystal: 300,
      deuterium: 100,
      energy: 200,
    },
    production: {
      metal: 30,
      crystal: 20,
      deuterium: 10,
      energy: 15,
    },
    lastUpdatedAt: new Date().toISOString(),
  };

  gameStore.planets.push(planet);
  return planet;
};
