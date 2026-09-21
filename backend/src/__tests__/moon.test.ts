import test from 'node:test';
import assert from 'node:assert/strict';

import { gameStore } from '../data/store.js';
import {
  formMoon,
  getMoonForPlanet,
  getMoonFormationStatus,
  getPhalanxRange,
  upgradePhalanx,
} from '../services/moonService.js';
import { phalanxScan } from '../services/phalanxService.js';
import { registerTechLevelLookup } from '../services/prerequisiteService.js';
import type { Planet } from '../types.js';

function makePlanet(id: string, ownerId: string, x = 1, y = 1): Planet {
  return {
    id,
    name: `Planet ${id}`,
    ownerId,
    coordinate: { x, y },
    resources: { metal: 50000, crystal: 50000, deuterium: 30000, energy: 1000 },
    production: { metal: 30, crystal: 20, deuterium: 10, energy: 15 },
    lastUpdatedAt: new Date().toISOString(),
  };
}

test('moon formation requires the orbital stabilizer', () => {
  const planet = makePlanet('moon-planet-1', 'player-moon-1');

  const status = getMoonFormationStatus(planet, 'player-moon-1');
  assert.equal(status.canForm, false);
  assert.equal(status.hasStabilizer, false);

  assert.throws(() => formMoon(planet, 'player-moon-1'));
});

test('moon forms when the stabilizer is built', () => {
  const planet = makePlanet('moon-planet-2', 'player-moon-2');
  gameStore.planets.push(planet);
  gameStore.buildings.push({ planetId: planet.id, type: 'orbital_stabilizer', level: 1 });

  const moon = formMoon(planet, 'player-moon-2', 'Luna Alfa');

  assert.equal(moon.name, 'Luna Alfa');
  assert.equal(moon.phalanxLevel, 0);
  assert.ok(getMoonForPlanet(planet.id));

  // Cannot form a second moon.
  assert.throws(() => formMoon(planet, 'player-moon-2'));
});

test('phalanx upgrade increases level and range', () => {
  const planet = makePlanet('moon-planet-2', 'player-moon-2');
  const moonBefore = getMoonForPlanet(planet.id);
  assert.ok(moonBefore);

  const upgraded = upgradePhalanx(planet, { metal: 2000, crystal: 4000, deuterium: 1000, energy: 0 });
  assert.equal(upgraded.phalanxLevel, 1);
  assert.equal(getPhalanxRange(upgraded), 1);
});

test('phalanx scan requires phalanx level', () => {
  const target = makePlanet('moon-target-1', 'player-moon-2', 1, 2);
  gameStore.planets.push(target);

  const result = phalanxScan('moon-planet-2', target.id);
  assert.equal(result.inRange, true);
  assert.equal(result.reason, null);
});

test('phalanx scan on planet without moon fails', () => {
  const result = phalanxScan('moon-planet-noexist', 'some-target');
  assert.equal(result.inRange, false);
  assert.ok(result.reason?.includes('no moon'));
});

test('orbital stabilizer prerequisites are strict', () => {
  registerTechLevelLookup(() => 0);
  const planet = makePlanet('moon-planet-3', 'player-moon-3');

  const status = getMoonFormationStatus(planet, 'player-moon-3');
  assert.equal(status.canForm, false);
  assert.ok(status.missingPrerequisites.some((req) => req.key === 'hyperspace'));
});
