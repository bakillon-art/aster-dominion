import test from 'node:test';
import assert from 'node:assert/strict';

import { gameStore } from '../data/store.js';
import { spyOnPlanet } from '../services/espionageService.js';
import type { Planet } from '../types.js';

function makePlanet(id: string, ownerId: string): Planet {
  return {
    id,
    name: `Planet ${id}`,
    ownerId,
    coordinate: { x: 2, y: 2 },
    resources: { metal: 7000, crystal: 4000, deuterium: 2000, energy: 400 },
    production: { metal: 30, crystal: 20, deuterium: 10, energy: 15 },
    lastUpdatedAt: new Date().toISOString(),
  };
}

test('espionage with level 0 reveals nothing but reports probes', () => {
  const target = makePlanet('spy-target-1', 'player-target');
  gameStore.planets.push(target);

  const report = spyOnPlanet('player-spy-1', target.id, 1, 0);

  assert.equal(report.probesSent, 1);
  assert.equal(report.resources, null);
  assert.equal(report.fleet, null);
  assert.equal(report.defenses, null);
});

test('espionage level 1 reveals resources', () => {
  const target = makePlanet('spy-target-2', 'player-target');
  gameStore.planets.push(target);

  const report = spyOnPlanet('player-spy-2', target.id, 1, 1);

  assert.ok(report.resources);
  assert.equal(report.resources?.metal, 7000);
  assert.equal(report.fleet, null);
});

test('higher espionage level reveals more detail', () => {
  const target = makePlanet('spy-target-3', 'player-target');
  gameStore.planets.push(target);
  gameStore.fleets.push({
    id: 'fleet-spy',
    planetId: target.id,
    ownerId: 'player-target',
    shipType: 'interceptor',
    quantity: 5,
    status: 'idle',
    createdAt: new Date().toISOString(),
  });
  gameStore.defenses.push({ planetId: target.id, type: 'rocket_launcher', quantity: 3 });
  gameStore.buildings.push({ planetId: target.id, type: 'mineral_extractor', level: 2 });

  const report = spyOnPlanet('player-spy-3', target.id, 4, 4);

  assert.ok(report.resources);
  assert.ok(report.fleet);
  assert.equal(report.fleet?.totalShips, 5);
  assert.ok(report.defenses);
  assert.equal(report.defenses?.total, 3);
  assert.ok(report.buildings);
  assert.equal(report.buildings?.length, 1);
});

test('espionage throws for unknown target', () => {
  assert.throws(() => spyOnPlanet('player-spy-4', 'nonexistent-planet', 1, 5));
});

test('espionage requires at least one probe', () => {
  const target = makePlanet('spy-target-5', 'player-target');
  gameStore.planets.push(target);

  assert.throws(() => spyOnPlanet('player-spy-5', target.id, 0, 1));
});

test('defender with higher espionage level destroys far more probes', () => {
  const target = makePlanet('spy-target-6', 'player-target');
  gameStore.planets.push(target);

  // Spy level 0 vs defender level 8: loss chance per probe = 5% + 8*8% = 69%.
  // With 100 probes, we should reliably lose more than 40.
  const report = spyOnPlanet('player-spy-6', target.id, 100, 0, 8);
  assert.ok(report.probesLost > 40, `expected many losses, got ${report.probesLost}`);

  // Spy level 8 vs defender level 0: loss chance = 5% - 8*3% clamped to 1%.
  const report2 = spyOnPlanet('player-spy-7', target.id, 100, 8, 0);
  assert.ok(report2.probesLost < 20, `expected few losses, got ${report2.probesLost}`);
});
