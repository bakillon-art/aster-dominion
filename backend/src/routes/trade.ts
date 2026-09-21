import { Router } from 'express';

import {
  acceptTrade,
  cancelTrade,
  createTradeOffer,
  getOpenTrades,
  getTradesForPlanet,
} from '../services/tradeService.js';

export const tradeRouter = Router();

tradeRouter.get('/', (_req, res) => {
  res.json({ trades: getOpenTrades() });
});

tradeRouter.get('/planet/:planetId', (req, res) => {
  const { planetId } = req.params;
  res.json({ trades: getTradesForPlanet(planetId) });
});

tradeRouter.post('/', (req, res) => {
  const { fromPlanetId, toPlanetId, offer, request } = req.body as {
    fromPlanetId?: string;
    toPlanetId?: string;
    offer?: { metal?: number; crystal?: number; deuterium?: number; energy?: number };
    request?: { metal?: number; crystal?: number; deuterium?: number; energy?: number };
  };

  if (!fromPlanetId || !toPlanetId || !offer || !request) {
    res.status(400).json({ error: 'fromPlanetId, toPlanetId, offer and request are required' });
    return;
  }

  try {
    const trade = createTradeOffer(
      fromPlanetId,
      toPlanetId,
      {
        metal: offer.metal ?? 0,
        crystal: offer.crystal ?? 0,
        deuterium: offer.deuterium ?? 0,
        energy: offer.energy ?? 0,
      },
      {
        metal: request.metal ?? 0,
        crystal: request.crystal ?? 0,
        deuterium: request.deuterium ?? 0,
        energy: request.energy ?? 0,
      },
    );

    res.status(201).json({ trade });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'trade creation failed' });
  }
});

tradeRouter.post('/:tradeId/accept', (req, res) => {
  const { tradeId } = req.params;

  try {
    const trade = acceptTrade(tradeId);
    res.json({ trade });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'trade accept failed' });
  }
});

tradeRouter.post('/:tradeId/cancel', (req, res) => {
  const { tradeId } = req.params;

  try {
    const trade = cancelTrade(tradeId);
    res.json({ trade });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'trade cancel failed' });
  }
});
