import { randomUUID } from 'node:crypto';

import { gameStore } from '../data/store.js';
import { checkPrerequisites } from './prerequisiteService.js';
import type { Planet, ResourceState } from '../types.js';

export interface Moon {
  id: string;
  planetId: string;
  ownerId: string;
  name: string;
  phalanxLevel: number;
  createdAt: string;
}

export interface MoonFormationStatus {
  canForm: boolean;
  hasStabilizer: boolean;
  missingPrerequisites: Array<{ type: string; key: string; level: number }>;
  alreadyHasMoon: boolean;
}

// One moon per planet.
const moons = new Map<string, Moon>();

export function getMoonForPlanet(planetId: string): Moon | null {
  return moons.get(planetId) ?? null;
}

export function listMoonsForPlayer(playerId: string): Moon[] {
  return Array.from(moons.values()).filter((moon) => moon.ownerId === playerId);
}

export function getMoonFormationStatus(planet: Planet, playerId: string): MoonFormationStatus {
  const stabilizer = gameStore.buildings.find(
    (building) => building.planetId === planet.id && building.type === 'orbital_stabilizer',
  );

  const prereqCheck = checkPrerequisites('orbital_stabilizer', planet.id, playerId);

  return {
    canForm: Boolean(stabilizer && stabilizer.level >= 1) && !moons.has(planet.id),
    hasStabilizer: Boolean(stabilizer && stabilizer.level >= 1),
    missingPrerequisites: prereqCheck.missing,
    alreadyHasMoon: moons.has(planet.id),
  };
}

export function formMoon(planet: Planet, playerId: string, moonName?: string): Moon {
  if (moons.has(planet.id)) {
    throw new Error('this planet already has a moon');
  }

  const status = getMoonFormationStatus(planet, playerId);
  if (!status.hasStabilizer) {
    throw new Error('orbital stabilizer is required to form a moon');
  }

  const moon: Moon = {
    id: randomUUID(),
    planetId: planet.id,
    ownerId: planet.ownerId,
    name: moonName ?? `Luna de ${planet.name}`,
    phalanxLevel: 0,
    createdAt: new Date().toISOString(),
  };

  moons.set(planet.id, moon);
  return moon;
}

export function upgradePhalanx(planet: Planet, cost: ResourceState): Moon {
  const moon = moons.get(planet.id);

  if (!moon) {
    throw new Error('no moon on this planet');
  }

  if (
    planet.resources.metal < cost.metal ||
    planet.resources.crystal < cost.crystal ||
    planet.resources.deuterium < cost.deuterium
  ) {
    throw new Error('insufficient resources to upgrade phalanx');
  }

  const index = gameStore.planets.findIndex((candidate) => candidate.id === planet.id);
  gameStore.planets[index] = {
    ...planet,
    resources: {
      metal: planet.resources.metal - cost.metal,
      crystal: planet.resources.crystal - cost.crystal,
      deuterium: planet.resources.deuterium - cost.deuterium,
      energy: planet.resources.energy,
    },
  };

  moon.phalanxLevel += 1;
  return moon;
}

// Phalanx scan range in systems: level 1 = same system, each level beyond adds 2.
export function getPhalanxRange(moon: Moon): number {
  return moon.phalanxLevel > 0 ? 1 + (moon.phalanxLevel - 1) * 2 : 0;
}
