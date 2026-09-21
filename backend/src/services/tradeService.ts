import { randomUUID } from 'node:crypto';

import { gameStore } from '../data/store.js';
import type { Planet, ResourceState } from '../types.js';

export interface TradeOffer {
  id: string;
  fromPlanetId: string;
  toPlanetId: string;
  offer: ResourceState;
  request: ResourceState;
  status: 'open' | 'accepted' | 'cancelled' | 'completed';
  createdAt: string;
}

const tradeOffers: TradeOffer[] = [];

export function createTradeOffer(
  fromPlanetId: string,
  toPlanetId: string,
  offer: ResourceState,
  request: ResourceState,
): TradeOffer {
  const fromPlanet = gameStore.planets.find((planet) => planet.id === fromPlanetId);
  const toPlanet = gameStore.planets.find((planet) => planet.id === toPlanetId);

  if (!fromPlanet || !toPlanet) {
    throw new Error('origin or target planet not found');
  }

  if (
    fromPlanet.resources.metal < offer.metal ||
    fromPlanet.resources.crystal < offer.crystal ||
    fromPlanet.resources.deuterium < offer.deuterium ||
    fromPlanet.resources.energy < offer.energy
  ) {
    throw new Error('insufficient resources to create trade offer');
  }

  const trade: TradeOffer = {
    id: randomUUID(),
    fromPlanetId,
    toPlanetId,
    offer,
    request,
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  tradeOffers.push(trade);
  return trade;
}

export function getOpenTrades(): TradeOffer[] {
  return tradeOffers.filter((trade) => trade.status === 'open');
}

export function getTradesForPlanet(planetId: string): TradeOffer[] {
  return tradeOffers.filter(
    (trade) => trade.fromPlanetId === planetId || trade.toPlanetId === planetId,
  );
}

export function acceptTrade(tradeId: string): TradeOffer {
  const trade = tradeOffers.find((candidate) => candidate.id === tradeId);

  if (!trade) {
    throw new Error('trade not found');
  }

  if (trade.status !== 'open') {
    throw new Error(`trade is ${trade.status}, cannot accept`);
  }

  const fromPlanet = gameStore.planets.find((planet) => planet.id === trade.fromPlanetId);
  const toPlanet = gameStore.planets.find((planet) => planet.id === trade.toPlanetId);

  if (!fromPlanet || !toPlanet) {
    throw new Error('planet not found for trade');
  }

  // Verify the offering planet still has the resources.
  if (
    fromPlanet.resources.metal < trade.offer.metal ||
    fromPlanet.resources.crystal < trade.offer.crystal ||
    fromPlanet.resources.deuterium < trade.offer.deuterium
  ) {
    throw new Error('offering planet no longer has the resources');
  }

  // Execute the exchange: offer goes to target, request goes to origin.
  const fromIndex = gameStore.planets.findIndex((planet) => planet.id === fromPlanet.id);
  const toIndex = gameStore.planets.findIndex((planet) => planet.id === toPlanet.id);

  gameStore.planets[fromIndex] = {
    ...fromPlanet,
    resources: {
      metal: fromPlanet.resources.metal - trade.offer.metal + trade.request.metal,
      crystal: fromPlanet.resources.crystal - trade.offer.crystal + trade.request.crystal,
      deuterium: fromPlanet.resources.deuterium - trade.offer.deuterium + trade.request.deuterium,
      energy: fromPlanet.resources.energy - trade.offer.energy + trade.request.energy,
    },
  };

  gameStore.planets[toIndex] = {
    ...toPlanet,
    resources: {
      metal: toPlanet.resources.metal + trade.offer.metal - trade.request.metal,
      crystal: toPlanet.resources.crystal + trade.offer.crystal - trade.request.crystal,
      deuterium: toPlanet.resources.deuterium + trade.offer.deuterium - trade.request.deuterium,
      energy: toPlanet.resources.energy + trade.offer.energy - trade.request.energy,
    },
  };

  trade.status = 'completed';
  return trade;
}

export function cancelTrade(tradeId: string): TradeOffer {
  const trade = tradeOffers.find((candidate) => candidate.id === tradeId);

  if (!trade) {
    throw new Error('trade not found');
  }

  if (trade.status !== 'open') {
    throw new Error(`trade is ${trade.status}, cannot cancel`);
  }

  trade.status = 'cancelled';
  return trade;
}
