import { gameStore } from '../data/store.js';
import type { Planet, ResourceState } from '../types.js';

const buildingCosts: Record<string, ResourceState> = {
  mineral_extractor: { metal: 200, crystal: 130, deuterium: 0, energy: 0 },
  crystal_refinery: { metal: 180, crystal: 150, deuterium: 0, energy: 0 },
  deuterium_plant: { metal: 250, crystal: 160, deuterium: 20, energy: 0 },
  solar_plant: { metal: 120, crystal: 80, deuterium: 0, energy: 0 },
};

const fleetCosts: Record<string, ResourceState> = {
  light_cargo: { metal: 2000, crystal: 800, deuterium: 200, energy: 0 },
  heavy_cargo: { metal: 4000, crystal: 1500, deuterium: 600, energy: 0 },
  interceptor: { metal: 1500, crystal: 800, deuterium: 100, energy: 0 },
};

export function buildBuilding(planet: Planet, type: string) {
  const cost = buildingCosts[type];

  if (!cost) {
    throw new Error(`Unknown building type: ${type}`);
  }

  if (
    planet.resources.metal < cost.metal ||
    planet.resources.crystal < cost.crystal ||
    planet.resources.deuterium < cost.deuterium ||
    planet.resources.energy < cost.energy
  ) {
    throw new Error(`Insufficient resources to build ${type}`);
  }

  const updatedPlanet: Planet = {
    ...planet,
    resources: {
      metal: planet.resources.metal - cost.metal,
      crystal: planet.resources.crystal - cost.crystal,
      deuterium: planet.resources.deuterium - cost.deuterium,
      energy: planet.resources.energy - cost.energy,
    },
  };

  return {
    building: {
      type,
      level: 1,
    },
    planet: updatedPlanet,
  };
}

export function createFleet(planet: Planet, shipType: string, quantity: number) {
  const cost = fleetCosts[shipType];

  if (!cost) {
    throw new Error(`Unknown ship type: ${shipType}`);
  }

  if (quantity <= 0) {
    throw new Error('Fleet quantity must be greater than zero');
  }

  const totalCost: ResourceState = {
    metal: cost.metal * quantity,
    crystal: cost.crystal * quantity,
    deuterium: cost.deuterium * quantity,
    energy: cost.energy * quantity,
  };

  if (
    planet.resources.metal < totalCost.metal ||
    planet.resources.crystal < totalCost.crystal ||
    planet.resources.deuterium < totalCost.deuterium ||
    planet.resources.energy < totalCost.energy
  ) {
    throw new Error(`Insufficient resources to create fleet ${shipType}`);
  }

  const updatedPlanet: Planet = {
    ...planet,
    resources: {
      metal: planet.resources.metal - totalCost.metal,
      crystal: planet.resources.crystal - totalCost.crystal,
      deuterium: planet.resources.deuterium - totalCost.deuterium,
      energy: planet.resources.energy - totalCost.energy,
    },
  };

  return {
    fleet: {
      shipType,
      quantity,
      status: 'idle',
    },
    planet: updatedPlanet,
  };
}

export function getDemoSnapshot(playerId: string) {
  let player = gameStore.players.find((candidate) => candidate.id === playerId);
  let planet = gameStore.planets.find((candidate) => candidate.ownerId === playerId);

  if (!player) {
    player = {
      id: playerId,
      username: 'demo-player',
      email: `${playerId}@demo.local`,
      passwordHash: 'demo-password',
      createdAt: new Date().toISOString(),
    };
    gameStore.players.push(player);
  }

  if (!planet) {
    planet = {
      id: `planet-${playerId}`,
      name: 'Aster Prime',
      ownerId: playerId,
      coordinate: { x: 1, y: 1 },
      resources: {
        metal: 5000,
        crystal: 3000,
        deuterium: 1500,
        energy: 300,
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
  }

  return {
    player: {
      id: player.id,
      username: player.username,
      email: player.email,
      createdAt: player.createdAt,
    },
    planet,
    resources: planet.resources,
    production: planet.production,
    summary: {
      totalResources: Object.values(planet.resources).reduce((sum, value) => sum + value, 0),
      totalProduction: Object.values(planet.production).reduce((sum, value) => sum + value, 0),
    },
  };
}

export function getPlayerDashboardState(playerId: string) {
  const snapshot = getDemoSnapshot(playerId);

  return {
    player: snapshot.player,
    planet: snapshot.planet,
    resources: snapshot.resources,
    production: snapshot.production,
    fleetSummary: {
      totalShips: 0,
      shipTypes: [],
    },
    economy: {
      totalResources: snapshot.summary.totalResources,
      totalProduction: snapshot.summary.totalProduction,
    },
    status: {
      phase: 'first-demo',
      online: true,
      timestamp: new Date().toISOString(),
    },
  };
}
