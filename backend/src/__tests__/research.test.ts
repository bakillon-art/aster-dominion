import test from 'node:test';
import assert from 'node:assert/strict';

import {
  canAffordResearch,
  getResearchCost,
  researchTechnology,
  technologyCatalog,
} from '../services/researchService.js';
import type { Planet } from '../types.js';

const makePlanet = (overrides: Partial<Planet> = {}): Planet => ({
  id: 'planet-test',
  name: 'Test Prime',
  ownerId: 'player-test',
  coordinate: { x: 1, y: 1 },
  resources: { metal: 10000, crystal: 10000, deuterium: 10000, energy: 500 },
  production: { metal: 30, crystal: 20, deuterium: 10, energy: 15 },
  lastUpdatedAt: new Date().toISOString(),
  ...overrides,
});

test('technology catalog contains all expected technologies', () => {
  const keys = Object.keys(technologyCatalog);
  assert.ok(keys.includes('laser'));
  assert.ok(keys.includes('plasma'));
  assert.ok(keys.includes('combustion_drive'));
  assert.ok(keys.includes('espionage'));
  assert.ok(keys.includes('armor'));
  assert.ok(keys.includes('shield'));
  assert.equal(keys.length, 13);
});

test('getResearchCost scales with level', () => {
  const level0 = getResearchCost('laser', 0);
  const level1 = getResearchCost('laser', 1);
  const level2 = getResearchCost('laser', 2);

  assert.equal(level0.metal, 200);
  assert.equal(level1.metal, 400);
  assert.equal(level2.metal, 800);
});

test('canAffordResearch returns true when resources are sufficient', () => {
  const planet = makePlanet();
  assert.equal(canAffordResearch(planet, 'laser', 0), true);
  assert.equal(canAffordResearch(planet, 'hyperspace_drive', 0), false);
});

test('researchTechnology deducts cost and increments level', () => {
  const planet = makePlanet();
  const result = researchTechnology(planet, 'energy', 0);

  assert.equal(result.newLevel, 1);
  assert.equal(result.updatedPlanet.resources.crystal, 10000 - 800);
  assert.equal(result.updatedPlanet.resources.deuterium, 10000 - 400);
});

test('researchTechnology throws on insufficient resources', () => {
  const planet = makePlanet({ resources: { metal: 0, crystal: 0, deuterium: 0, energy: 0 } });
  assert.throws(() => researchTechnology(planet, 'laser', 0));
});
