import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateOfflineProduction } from '../services/gameService.js';

const planet = {
  id: 'planet-1',
  name: 'Aster Prime',
  ownerId: 'player-1',
  coordinate: { x: 1, y: 1 },
  resources: {
    metal: 500,
    crystal: 300,
    deuterium: 100,
    energy: 200,
  },
  production: {
    metal: 30,
    crystal: 20,
    deuterium: 10,
    energy: 15,
  },
  lastUpdatedAt: '2026-09-21T00:00:00.000Z',
};

test('calculateOfflineProduction adds production for elapsed hours', () => {
  const now = new Date('2026-09-21T02:00:00.000Z');
  const result = calculateOfflineProduction(planet, now);

  assert.equal(result.gained.metal, 60);
  assert.equal(result.gained.crystal, 40);
  assert.equal(result.gained.deuterium, 20);
  assert.equal(result.gained.energy, 30);
  assert.equal(result.updatedPlanet.resources.metal, 560);
  assert.equal(result.updatedPlanet.resources.crystal, 340);
  assert.equal(result.updatedPlanet.resources.deuterium, 120);
  assert.equal(result.updatedPlanet.resources.energy, 230);
  assert.equal(result.totalHours, 2);
});
