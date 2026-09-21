import test from 'node:test';
import assert from 'node:assert/strict';

import { colonizePosition, getGalaxyOverview, getSystem } from '../services/galaxyService.js';

test('galaxy overview contains 20 systems with 6 slots each', () => {
  const overview = getGalaxyOverview();
  assert.equal(overview.length, 20);
  assert.equal(overview[0].slots.length, 6);
  assert.equal(overview[0].galaxy, 1);
  assert.equal(overview[0].system, 1);
});

test('getSystem returns a valid system', () => {
  const system = getSystem(1, 5);
  assert.ok(system);
  assert.equal(system?.system, 5);
  assert.equal(system?.slots.length, 6);
});

test('getSystem returns null for invalid system', () => {
  assert.equal(getSystem(1, 99), null);
  assert.equal(getSystem(0, 1), null);
});

test('colonizePosition creates a planet at an empty slot', () => {
  const planet = colonizePosition(1, 15, 3, 'player-colonizer', 'Nueva Colonia');

  assert.equal(planet.ownerId, 'player-colonizer');
  assert.equal(planet.name, 'Nueva Colonia');
  assert.equal(planet.coordinate.x, 15);
  assert.equal(planet.coordinate.y, 3);

  const system = getSystem(1, 15);
  const slot = system?.slots.find((entry) => entry.coordinate.position === 3);
  assert.equal(slot?.isEmpty, false);
  assert.equal(slot?.planet?.name, 'Nueva Colonia');
});

test('colonizePosition rejects an occupied slot', () => {
  assert.throws(() => colonizePosition(1, 15, 3, 'player-other'));
});
