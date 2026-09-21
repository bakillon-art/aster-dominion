import test from 'node:test';
import assert from 'node:assert/strict';

import { gameStore } from '../data/store.js';
import { acceptTrade, cancelTrade, createTradeOffer, getOpenTrades } from '../services/tradeService.js';
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

test('createTradeOffer creates an open trade', () => {
  const from = makePlanet('trade-from-1', 'player-a');
  const to = makePlanet('trade-to-1', 'player-b');
  gameStore.planets.push(from, to);

  const trade = createTradeOffer(
    from.id,
    to.id,
    { metal: 500, crystal: 0, deuterium: 0, energy: 0 },
    { metal: 0, crystal: 300, deuterium: 0, energy: 0 },
  );

  assert.equal(trade.status, 'open');
  assert.equal(trade.fromPlanetId, from.id);
});

test('acceptTrade exchanges resources between planets', () => {
  const from = makePlanet('trade-from-2', 'player-c');
  const to = makePlanet('trade-to-2', 'player-d');
  gameStore.planets.push(from, to);

  const trade = createTradeOffer(
    from.id,
    to.id,
    { metal: 400, crystal: 0, deuterium: 0, energy: 0 },
    { metal: 0, crystal: 200, deuterium: 0, energy: 0 },
  );

  const accepted = acceptTrade(trade.id);
  assert.equal(accepted.status, 'completed');

  const updatedFrom = gameStore.planets.find((planet) => planet.id === from.id);
  const updatedTo = gameStore.planets.find((planet) => planet.id === to.id);

  assert.equal(updatedFrom?.resources.metal, 5000 - 400);
  assert.equal(updatedFrom?.resources.crystal, 3000 + 200);
  assert.equal(updatedTo?.resources.metal, 5000 + 400);
  assert.equal(updatedTo?.resources.crystal, 3000 - 200);
});

test('cancelTrade marks the trade as cancelled', () => {
  const from = makePlanet('trade-from-3', 'player-e');
  const to = makePlanet('trade-to-3', 'player-f');
  gameStore.planets.push(from, to);

  const trade = createTradeOffer(
    from.id,
    to.id,
    { metal: 100, crystal: 0, deuterium: 0, energy: 0 },
    { metal: 0, crystal: 50, deuterium: 0, energy: 0 },
  );

  const cancelled = cancelTrade(trade.id);
  assert.equal(cancelled.status, 'cancelled');
  assert.throws(() => acceptTrade(trade.id));
});

test('createTradeOffer rejects insufficient resources', () => {
  const from = makePlanet('trade-from-4', 'player-g');
  const to = makePlanet('trade-to-4', 'player-h');
  gameStore.planets.push(from, to);

  assert.throws(() =>
    createTradeOffer(
      from.id,
      to.id,
      { metal: 999999, crystal: 0, deuterium: 0, energy: 0 },
      { metal: 0, crystal: 0, deuterium: 0, energy: 0 },
    ),
  );
});

test('getOpenTrades only returns open trades', () => {
  const from = makePlanet('trade-from-5', 'player-i');
  const to = makePlanet('trade-to-5', 'player-j');
  gameStore.planets.push(from, to);

  const open = createTradeOffer(
    from.id,
    to.id,
    { metal: 100, crystal: 0, deuterium: 0, energy: 0 },
    { metal: 0, crystal: 50, deuterium: 0, energy: 0 },
  );

  const closed = createTradeOffer(
    from.id,
    to.id,
    { metal: 100, crystal: 0, deuterium: 0, energy: 0 },
    { metal: 0, crystal: 50, deuterium: 0, energy: 0 },
  );
  cancelTrade(closed.id);

  const openTrades = getOpenTrades();
  assert.ok(openTrades.some((trade) => trade.id === open.id));
  assert.equal(openTrades.some((trade) => trade.id === closed.id), false);
});
