import test from 'node:test';
import assert from 'node:assert/strict';

import {
  enqueueBuilding,
  getActiveQueueItems,
  getQueueForPlanet,
  processCompletedBuildings,
} from '../services/buildQueueService.js';
import type { Planet } from '../types.js';

const makePlanet = (overrides: Partial<Planet> = {}): Planet => ({
  id: `planet-queue-${Math.random().toString(36).slice(2, 8)}`,
  name: 'Queue Prime',
  ownerId: 'player-queue',
  coordinate: { x: 1, y: 1 },
  resources: { metal: 10000, crystal: 10000, deuterium: 5000, energy: 500 },
  production: { metal: 30, crystal: 20, deuterium: 10, energy: 15 },
  lastUpdatedAt: new Date().toISOString(),
  ...overrides,
});

test('enqueueBuilding adds an item to the planet queue', () => {
  const planet = makePlanet();
  const item = enqueueBuilding(planet, 'mineral_extractor', 1);

  assert.equal(item.planetId, planet.id);
  assert.equal(item.key, 'mineral_extractor');
  assert.equal(item.level, 1);
  assert.ok(item.durationSeconds > 0);

  const queue = getQueueForPlanet(planet.id);
  assert.equal(queue.length, 1);
});

test('getActiveQueueItems returns only items not yet completed', () => {
  const planet = makePlanet();
  enqueueBuilding(planet, 'solar_plant', 1);

  const active = getActiveQueueItems(planet.id);
  assert.equal(active.length, 1);
});

test('processCompletedBuildings boosts production when a building completes', () => {
  const planet = makePlanet();
  const item = enqueueBuilding(planet, 'mineral_extractor', 1);

  // Force the item to be already completed.
  const queue = getQueueForPlanet(planet.id);
  const stored = queue.find((entry) => entry.id === item.id);
  if (stored) {
    stored.completesAt = new Date(Date.now() - 1000).toISOString();
  }

  const updated = processCompletedBuildings(planet);
  assert.ok(updated.production.metal > planet.production.metal);
});
