import test from 'node:test';
import assert from 'node:assert/strict';

import { gameStore } from '../data/store.js';
import {
  checkPrerequisites,
  prerequisites,
  registerTechLevelLookup,
} from '../services/prerequisiteService.js';

test('basic buildings have no prerequisites', () => {
  const planetId = 'prereq-planet-1';
  const check = checkPrerequisites('mineral_extractor', planetId, 'player-p1');
  assert.equal(check.met, true);
  assert.equal(check.missing.length, 0);
});

test('deuterium plant requires solar plant level 2', () => {
  const planetId = 'prereq-planet-2';

  const before = checkPrerequisites('deuterium_plant', planetId, 'player-p2');
  assert.equal(before.met, false);
  assert.ok(before.missing.some((req) => req.key === 'solar_plant'));

  gameStore.buildings.push({ planetId, type: 'solar_plant', level: 2 });
  const after = checkPrerequisites('deuterium_plant', planetId, 'player-p2');
  assert.equal(after.met, true);
});

test('technology prerequisites use the registered lookup', () => {
  const planetId = 'prereq-planet-3';
  const playerId = 'player-p3';

  registerTechLevelLookup((pid, key) => (pid === playerId && key === 'laser' ? 6 : 0));

  // heavy_laser needs laser 6 + energy 3 + shipyard 4
  const check = checkPrerequisites('heavy_laser', planetId, playerId);
  assert.equal(check.met, false);
  assert.ok(check.missing.some((req) => req.key === 'energy'));
  assert.ok(check.missing.some((req) => req.key === 'shipyard'));
});

test('orbital stabilizer has strict requirements', () => {
  const reqs = prerequisites['orbital_stabilizer'];
  assert.ok(reqs.some((req) => req.key === 'hyperspace' && req.level === 8));
  assert.ok(reqs.some((req) => req.key === 'deuterium_plant' && req.level === 10));
});
