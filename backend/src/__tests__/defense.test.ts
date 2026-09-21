import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDefense, defenseCatalog } from '../services/defenseService.js';
import type { Planet } from '../types.js';

const makePlanet = (overrides: Partial<Planet> = {}): Planet => ({
  id: 'planet-test',
  name: 'Test Prime',
  ownerId: 'player-test',
  coordinate: { x: 1, y: 1 },
  resources: { metal: 100000, crystal: 100000, deuterium: 50000, energy: 500 },
  production: { metal: 30, crystal: 20, deuterium: 10, energy: 15 },
  lastUpdatedAt: new Date().toISOString(),
  ...overrides,
});

test('defense catalog has all 8 defense types', () => {
  assert.equal(Object.keys(defenseCatalog).length, 8);
  assert.ok('rocket_launcher' in defenseCatalog);
  assert.ok('plasma_turret' in defenseCatalog);
  assert.ok('large_shield_dome' in defenseCatalog);
});

test('buildDefense deducts resources correctly', () => {
  const planet = makePlanet();
  const result = buildDefense(planet, 'rocket_launcher', 5);

  assert.equal(result.defense.quantity, 5);
  assert.equal(result.planet.resources.metal, 100000 - 2000 * 5);
});

test('buildDefense throws on insufficient resources', () => {
  const planet = makePlanet({ resources: { metal: 100, crystal: 0, deuterium: 0, energy: 0 } });
  assert.throws(() => buildDefense(planet, 'gauss_cannon', 1));
});

test('buildDefense rejects zero or negative quantity', () => {
  const planet = makePlanet();
  assert.throws(() => buildDefense(planet, 'light_laser', 0));
  assert.throws(() => buildDefense(planet, 'light_laser', -3));
});

test('shield domes have zero attack but high shield', () => {
  assert.equal(defenseCatalog.small_shield_dome.attack, 0);
  assert.ok(defenseCatalog.small_shield_dome.shield > 0);
  assert.ok(defenseCatalog.large_shield_dome.shield > defenseCatalog.small_shield_dome.shield);
});
