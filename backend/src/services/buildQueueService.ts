import { gameStore } from '../data/store.js';
import type { Planet } from '../types.js';

export type QueueItemType = 'building' | 'research' | 'defense' | 'ship';

export interface QueueItem {
  id: string;
  planetId: string;
  type: QueueItemType;
  key: string;
  level: number;
  startedAt: string;
  completesAt: string;
  durationSeconds: number;
}

// In-memory build queue per planet
const buildQueues = new Map<string, QueueItem[]>();

const buildingBaseDuration: Record<string, number> = {
  mineral_extractor: 60,
  crystal_refinery: 72,
  deuterium_plant: 90,
  solar_plant: 48,
};

export function getQueueForPlanet(planetId: string): QueueItem[] {
  return (buildQueues.get(planetId) ?? []).slice();
}

export function getActiveQueueItems(planetId: string): QueueItem[] {
  const now = Date.now();
  const queue = buildQueues.get(planetId) ?? [];

  return queue.filter((item) => new Date(item.completesAt).getTime() > now);
}

export function getCompletedQueueItems(planetId: string): QueueItem[] {
  const now = Date.now();
  const queue = buildQueues.get(planetId) ?? [];

  return queue.filter((item) => new Date(item.completesAt).getTime() <= now);
}

export function clearCompletedItems(planetId: string): void {
  const queue = buildQueues.get(planetId) ?? [];
  buildQueues.set(
    planetId,
    queue.filter((item) => new Date(item.completesAt).getTime() > Date.now()),
  );
}

export function enqueueBuilding(planet: Planet, buildingType: string, level: number): QueueItem {
  const baseDuration = buildingBaseDuration[buildingType] ?? 60;
  const durationSeconds = Math.round(baseDuration * Math.pow(1.4, level - 1));

  const item: QueueItem = {
    id: `queue-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    planetId: planet.id,
    type: 'building',
    key: buildingType,
    level,
    startedAt: new Date().toISOString(),
    completesAt: new Date(Date.now() + durationSeconds * 1000).toISOString(),
    durationSeconds,
  };

  if (!buildQueues.has(planet.id)) {
    buildQueues.set(planet.id, []);
  }
  buildQueues.get(planet.id)!.push(item);

  return item;
}

export function processCompletedBuildings(planet: Planet): Planet {
  const completed = getCompletedQueueItems(planet.id);

  if (!completed.length) {
    return planet;
  }

  let updated = planet;

  for (const item of completed) {
    if (item.type === 'building') {
      const productionBoost: Record<string, keyof typeof updated.production> = {
        mineral_extractor: 'metal',
        crystal_refinery: 'crystal',
        deuterium_plant: 'deuterium',
        solar_plant: 'energy',
      };
      const boosted = productionBoost[item.key];
      if (boosted) {
        updated = {
          ...updated,
          production: {
            ...updated.production,
            [boosted]: Math.floor(updated.production[boosted] * 1.1) + 2,
          },
        };
      }

      const existing = gameStore.buildings.find(
        (candidate) => candidate.planetId === planet.id && candidate.type === item.key,
      );
      if (existing) {
        existing.level = Math.max(existing.level, item.level);
      } else {
        gameStore.buildings.push({ planetId: planet.id, type: item.key, level: item.level });
      }
    }
  }

  clearCompletedItems(planet.id);
  return updated;
}
