import test from 'node:test';
import assert from 'node:assert/strict';

import { buildBuilding, createFleet, getDemoSnapshot, getPlayerDashboardState } from '../services/demoService.js';
import type { Planet } from '../types.js';

const planet: Planet = {
  id: 'planet-demo',
  name: 'Aster Prime',
  ownerId: 'player-demo',
  coordinate: { x: 2, y: 3 },
  resources: {
    metal: 6000,
    crystal: 3000,
    deuterium: 1000,
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

test('buildBuilding consumes resources and increments level', () => {
  const result = buildBuilding(planet, 'mineral_extractor');

  assert.equal(result.building.level, 1);
  assert.equal(result.planet.resources.metal, 5940);
  assert.equal(result.planet.resources.crystal, 2985);
  assert.equal(result.planet.resources.energy, 300);
});

test('createFleet creates a small ship squadron with a proper cost', () => {
  const result = createFleet(planet, 'light_cargo', 2);

  assert.equal(result.fleet.quantity, 2);
  assert.equal(result.fleet.shipType, 'light_cargo');
  assert.equal(result.planet.resources.metal, 2000);
  assert.equal(result.planet.resources.crystal, 1400);
  assert.equal(result.planet.resources.deuterium, 600);
  assert.equal(result.planet.resources.energy, 300);
});

test('getDemoSnapshot returns a complete player and planet summary for the first demo', () => {
  const snapshot = getDemoSnapshot('player-demo');

  assert.equal(snapshot.player.id, 'player-demo');
  assert.equal(snapshot.planet.ownerId, 'player-demo');
  assert.equal(snapshot.resources.metal > 0, true);
  assert.equal(snapshot.production.metal > 0, true);
});

test('getPlayerDashboardState returns a structured payload for the client HUD', () => {
  const dashboard = getPlayerDashboardState('player-demo');

  assert.equal(dashboard.player.id, 'player-demo');
  assert.equal(dashboard.planet.ownerId, 'player-demo');
  assert.equal(dashboard.fleetSummary.totalShips >= 0, true);
  assert.equal(dashboard.status.phase, 'first-demo');
  assert.equal(dashboard.status.online, true);
});
