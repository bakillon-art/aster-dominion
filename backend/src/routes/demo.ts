import { Router } from 'express';

import { buildBuilding, createFleet, getDemoSnapshot, getPlayerDashboardState } from '../services/demoService.js';
import { gameStore } from '../data/store.js';

export const demoRouter = Router();

demoRouter.get('/snapshot/:playerId', (req, res) => {
  const { playerId } = req.params;

  try {
    const snapshot = getDemoSnapshot(playerId);
    res.json(snapshot);
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'demo snapshot not found' });
  }
});

demoRouter.get('/dashboard/:playerId', (req, res) => {
  const { playerId } = req.params;

  try {
    res.json(getPlayerDashboardState(playerId));
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'dashboard unavailable' });
  }
});

demoRouter.post('/build', (req, res) => {
  const { playerId, buildingType } = req.body as { playerId?: string; buildingType?: string };

  if (!playerId || !buildingType) {
    res.status(400).json({ error: 'playerId and buildingType are required' });
    return;
  }

  const planet = gameStore.planets.find((candidate) => candidate.ownerId === playerId);

  if (!planet) {
    res.status(404).json({ error: 'planet not found' });
    return;
  }

  try {
    const result = buildBuilding(planet, buildingType);
    const index = gameStore.planets.findIndex((candidate) => candidate.id === planet.id);
    gameStore.planets[index] = result.planet;

    res.json({ building: result.building, planet: result.planet });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'build failed' });
  }
});

demoRouter.post('/fleet', (req, res) => {
  const { playerId, shipType, quantity } = req.body as {
    playerId?: string;
    shipType?: string;
    quantity?: number;
  };

  if (!playerId || !shipType || typeof quantity !== 'number') {
    res.status(400).json({ error: 'playerId, shipType and quantity are required' });
    return;
  }

  const planet = gameStore.planets.find((candidate) => candidate.ownerId === playerId);

  if (!planet) {
    res.status(404).json({ error: 'planet not found' });
    return;
  }

  try {
    const result = createFleet(planet, shipType, quantity);
    const index = gameStore.planets.findIndex((candidate) => candidate.id === planet.id);
    gameStore.planets[index] = result.planet;

    res.json({ fleet: result.fleet, planet: result.planet });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'fleet creation failed' });
  }
});
