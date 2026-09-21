import test from 'node:test';
import assert from 'node:assert/strict';

import { gameStore } from '../data/store.js';
import { processArrivedMissions } from '../services/missionService.js';
import type { Planet } from '../types.js';

function makePlanet(id: string, ownerId: string): Planet {
  return {
    id,
    name: `Planet ${id}`,
    ownerId,
    coordinate: { x: 1, y: 1 },
    resources: { metal: 5000, crystal: 3000, deuterium: 1500, energy: 300 },
    production: { metal: 30, crystal: 20, deuterium: 10, energy: 15 },
    lastUpdatedAt: new Date().toISOString(),
  };
}

test('processArrivedMissions delivers transport loot to target planet', () => {
  const origin = makePlanet('origin-transport', 'player-mission');
  const target = makePlanet('target-transport', 'player-mission');
  gameStore.planets.push(origin, target);

  gameStore.missions.push({
    id: 'mission-transport-test',
    ownerId: 'player-mission',
    originPlanetId: origin.id,
    targetPlanetId: target.id,
    missionType: 'transport',
    quantity: 2,
    status: 'in_transit',
    launchedAt: new Date(Date.now() - 10000).toISOString(),
    arrivesAt: new Date(Date.now() - 1000).toISOString(),
  });

  const results = processArrivedMissions('player-mission');
  const transport = results.find((result) => result.missionId === 'mission-transport-test');

  assert.ok(transport);
  assert.equal(transport.outcome, 'delivered');
  assert.ok(transport.loot);
  assert.equal(transport.loot?.metal, 500);

  const updatedTarget = gameStore.planets.find((planet) => planet.id === target.id);
  assert.equal(updatedTarget?.resources.metal, 5500);
});

test('processArrivedMissions resolves attack missions with battle', () => {
  const origin = makePlanet('origin-attack', 'player-attacker');
  const target = makePlanet('target-attack', 'player-defender');
  gameStore.planets.push(origin, target);

  gameStore.missions.push({
    id: 'mission-attack-test',
    ownerId: 'player-attacker',
    originPlanetId: origin.id,
    targetPlanetId: target.id,
    missionType: 'attack',
    quantity: 5,
    status: 'in_transit',
    launchedAt: new Date(Date.now() - 10000).toISOString(),
    arrivesAt: new Date(Date.now() - 1000).toISOString(),
  });

  const results = processArrivedMissions('player-attacker');
  const attack = results.find((result) => result.missionId === 'mission-attack-test');

  assert.ok(attack);
  assert.ok(attack.battle);
  assert.ok(attack.battle?.battleSummary.winner === 'attacker' || attack.battle?.battleSummary.winner === 'defender');
});

test('processArrivedMissions ignores missions still in transit', () => {
  const origin = makePlanet('origin-future', 'player-waiting');
  const target = makePlanet('target-future', 'player-waiting');
  gameStore.planets.push(origin, target);

  gameStore.missions.push({
    id: 'mission-future',
    ownerId: 'player-waiting',
    originPlanetId: origin.id,
    targetPlanetId: target.id,
    missionType: 'transport',
    quantity: 1,
    status: 'in_transit',
    launchedAt: new Date().toISOString(),
    arrivesAt: new Date(Date.now() + 60000).toISOString(),
  });

  const results = processArrivedMissions('player-waiting');
  assert.equal(results.some((result) => result.missionId === 'mission-future'), false);
});
