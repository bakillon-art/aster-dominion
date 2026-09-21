import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateTravelDuration, createFleetMission } from '../services/fleetService.js';
import type { Planet } from '../types.js';

const origin: Planet = {
  id: 'planet-origin',
  name: 'Aster Prime',
  ownerId: 'player-demo',
  coordinate: { x: 1, y: 2 },
  resources: {
    metal: 6000,
    crystal: 3000,
    deuterium: 1000,
    energy: 500,
  },
  production: {
    metal: 30,
    crystal: 20,
    deuterium: 10,
    energy: 15,
  },
  lastUpdatedAt: new Date().toISOString(),
};

const target: Planet = {
  id: 'planet-target',
  name: 'Helios Reach',
  ownerId: 'enemy-demo',
  coordinate: { x: 4, y: 2 },
  resources: {
    metal: 800,
    crystal: 700,
    deuterium: 400,
    energy: 200,
  },
  production: {
    metal: 20,
    crystal: 15,
    deuterium: 8,
    energy: 10,
  },
  lastUpdatedAt: new Date().toISOString(),
};

test('calculateTravelDuration uses the slowest ship and engine tech in the mission', () => {
  const duration = calculateTravelDuration(origin.coordinate, target.coordinate, [
    { shipType: 'heavy_cargo', quantity: 2, engine: 'combustion' },
    { shipType: 'interceptor', quantity: 1, engine: 'hyperspace' },
  ]);

  assert.equal(duration, 150);
});

test('createFleetMission creates an in-flight mission and deducts resources', () => {
  const result = createFleetMission(
    origin,
    target,
    [
      { shipType: 'heavy_cargo', quantity: 2, engine: 'combustion' },
      { shipType: 'interceptor', quantity: 1, engine: 'hyperspace' },
    ],
    'transport',
  );

  assert.equal(result.mission.status, 'in_transit');
  assert.equal(result.mission.quantity, 3);
  assert.equal(result.mission.missionType, 'transport');
  assert.equal(result.mission.etaSeconds, 150);
  assert.equal(result.updatedPlanet.resources.metal, 0);
  assert.equal(result.updatedPlanet.resources.crystal, 600);
  assert.equal(result.updatedPlanet.resources.deuterium, 400);
});
