import type { OfflineProductionResult, Planet, ResourceState } from '../types.js';

const resourceKeys: Array<keyof ResourceState> = ['metal', 'crystal', 'deuterium', 'energy'];

// Fractional production that has not yet materialized into whole units.
const productionRemainders = new Map<string, ResourceState>();

export function calculateOfflineProduction(
  planet: Planet,
  now: Date = new Date(),
): OfflineProductionResult {
  const lastUpdated = new Date(planet.lastUpdatedAt).getTime();
  const currentTime = now.getTime();
  const elapsedMs = Math.max(0, currentTime - lastUpdated);
  const totalHours = elapsedMs / 3_600_000;

  // Start from any stored fractional remainders so short ticks still add up.
  const remainder = productionRemainders.get(planet.id) ?? {
    metal: 0,
    crystal: 0,
    deuterium: 0,
    energy: 0,
  };

  const gained: ResourceState = {
    metal: 0,
    crystal: 0,
    deuterium: 0,
    energy: 0,
  };

  const nextRemainder: ResourceState = { ...remainder };

  for (const key of resourceKeys) {
    const productionValue = planet.production[key];
    const fractional = totalHours * productionValue + remainder[key];
    const whole = Math.floor(fractional);
    gained[key] = whole;
    nextRemainder[key] = fractional - whole;
  }

  productionRemainders.set(planet.id, nextRemainder);

  const updatedResources: ResourceState = {
    metal: planet.resources.metal + gained.metal,
    crystal: planet.resources.crystal + gained.crystal,
    deuterium: planet.resources.deuterium + gained.deuterium,
    energy: planet.resources.energy + gained.energy,
  };

  const updatedPlanet: Planet = {
    ...planet,
    resources: updatedResources,
    lastUpdatedAt: now.toISOString(),
  };

  return {
    totalHours,
    gained,
    updatedPlanet,
  };
}
