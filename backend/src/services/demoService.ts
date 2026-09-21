import { randomUUID } from 'node:crypto';

import { gameStore } from '../data/store.js';
import { getActiveQueueItems, processCompletedBuildings } from './buildQueueService.js';
import { processArrivedMissions } from './missionService.js';
import { getUnreadCount } from './messageService.js';
import type { Planet, ResourceState } from '../types.js';

const buildingCosts: Record<string, ResourceState> = {
  mineral_extractor: { metal: 60, crystal: 15, deuterium: 0, energy: 0 },
  crystal_refinery: { metal: 48, crystal: 24, deuterium: 0, energy: 0 },
  deuterium_plant: { metal: 225, crystal: 75, deuterium: 0, energy: 0 },
  solar_plant: { metal: 75, crystal: 30, deuterium: 0, energy: 0 },
};

// Base hourly production per level-1 building; each level multiplies output.
const buildingProductionBase: Record<string, number> = {
  mineral_extractor: 22,
  crystal_refinery: 15,
  deuterium_plant: 8,
  solar_plant: 12,
};

const fleetCosts: Record<string, ResourceState> = {
  light_cargo: { metal: 2000, crystal: 800, deuterium: 200, energy: 0 },
  heavy_cargo: { metal: 4000, crystal: 1500, deuterium: 600, energy: 0 },
  interceptor: { metal: 1500, crystal: 800, deuterium: 100, energy: 0 },
};

export function buildBuilding(planet: Planet, type: string) {
  const existing = gameStore.buildings.find(
    (candidate) => candidate.planetId === planet.id && candidate.type === type,
  );
  const nextLevel = (existing?.level ?? 0) + 1;

  // Cost scales with level (x1.5 per level, allows long-term progression to high levels).
  const cost = buildingCosts[type];

  if (!cost) {
    throw new Error(`Unknown building type: ${type}`);
  }

  const levelFactor = Math.pow(1.5, existing?.level ?? 0);
  const scaledCost: ResourceState = {
    metal: Math.floor(cost.metal * levelFactor),
    crystal: Math.floor(cost.crystal * levelFactor),
    deuterium: Math.floor(cost.deuterium * levelFactor),
    energy: Math.floor(cost.energy * levelFactor),
  };

  if (
    planet.resources.metal < scaledCost.metal ||
    planet.resources.crystal < scaledCost.crystal ||
    planet.resources.deuterium < scaledCost.deuterium ||
    planet.resources.energy < scaledCost.energy
  ) {
    throw new Error(`Insufficient resources to build ${type}`);
  }

  const updatedPlanet: Planet = {
    ...planet,
    resources: {
      metal: planet.resources.metal - scaledCost.metal,
      crystal: planet.resources.crystal - scaledCost.crystal,
      deuterium: planet.resources.deuterium - scaledCost.deuterium,
      energy: planet.resources.energy - scaledCost.energy,
    },
  };

  if (existing) {
    existing.level = nextLevel;
  } else {
    gameStore.buildings.push({ planetId: planet.id, type, level: nextLevel });
  }

  // Each level multiplies production modestly (OGame-style): recovery takes days.
  const productionBoost: Record<string, keyof ResourceState> = {
    mineral_extractor: 'metal',
    crystal_refinery: 'crystal',
    deuterium_plant: 'deuterium',
    solar_plant: 'energy',
  };
  const boostedResource = productionBoost[type];
  if (boostedResource) {
    const base = buildingProductionBase[type] ?? 10;
    updatedPlanet.production = {
      ...updatedPlanet.production,
      [boostedResource]: Math.floor(updatedPlanet.production[boostedResource] + base * Math.pow(1.12, nextLevel - 1)),
    };
  }

  return {
    building: {
      type,
      level: nextLevel,
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

  const storedFleet = {
    id: randomUUID(),
    planetId: planet.id,
    ownerId: planet.ownerId,
    shipType,
    quantity,
    status: 'idle' as const,
    createdAt: new Date().toISOString(),
  };
  gameStore.fleets.push(storedFleet);

  return {
    fleet: {
      id: storedFleet.id,
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

  // Process any completed buildings and apply production boosts.
  const processedPlanet = processCompletedBuildings(snapshot.planet);
  if (processedPlanet !== snapshot.planet) {
    const index = gameStore.planets.findIndex((candidate) => candidate.id === snapshot.planet.id);
    if (index >= 0) {
      gameStore.planets[index] = processedPlanet;
    }
  }

  // Resolve any missions that have arrived.
  const arrivedResults = processArrivedMissions(playerId);

  const currentPlanet = gameStore.planets.find((candidate) => candidate.id === snapshot.planet.id) ?? snapshot.planet;

  const planetFleets = gameStore.fleets.filter((fleet) => fleet.ownerId === playerId);
  const totalShips = planetFleets.reduce((sum, fleet) => sum + fleet.quantity, 0);
  const shipTypeMap = new Map<string, number>();
  for (const fleet of planetFleets) {
    shipTypeMap.set(fleet.shipType, (shipTypeMap.get(fleet.shipType) ?? 0) + fleet.quantity);
  }

  const now = Date.now();
  const activeMissions = gameStore.missions
    .filter((mission) => mission.ownerId === playerId && mission.status === 'in_transit')
    .map((mission) => ({
      id: mission.id,
      missionType: mission.missionType,
      quantity: mission.quantity,
      targetPlanetId: mission.targetPlanetId,
      secondsRemaining: Math.max(0, Math.round((new Date(mission.arrivesAt).getTime() - now) / 1000)),
      arrivesAt: mission.arrivesAt,
    }));

  const buildQueue = getActiveQueueItems(currentPlanet.id).map((item) => ({
    id: item.id,
    type: item.type,
    key: item.key,
    level: item.level,
    secondsRemaining: Math.max(0, Math.round((new Date(item.completesAt).getTime() - now) / 1000)),
  }));

  const defenseSummary = gameStore.defenses
    .filter((defense) => defense.planetId === currentPlanet.id)
    .map((defense) => ({ type: defense.type, quantity: defense.quantity }));
  const totalDefenses = gameStore.defenses
    .filter((defense) => defense.planetId === currentPlanet.id)
    .reduce((sum, defense) => sum + defense.quantity, 0);

  return {
    player: snapshot.player,
    planet: currentPlanet,
    resources: currentPlanet.resources,
    production: currentPlanet.production,
    fleetSummary: {
      totalShips,
      shipTypes: Array.from(shipTypeMap.entries()).map(([type, quantity]) => ({ type, quantity })),
    },
    buildings: gameStore.buildings
      .filter((building) => building.planetId === currentPlanet.id)
      .map((building) => ({
        type: building.type,
        level: building.level,
      })),
    activeMissions,
    buildQueue,
    recentEvents: arrivedResults,
    defenses: {
      total: totalDefenses,
      items: defenseSummary,
    },
    unreadMessages: getUnreadCount(playerId),
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
