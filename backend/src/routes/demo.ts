import { Router } from 'express';

import { buildBuilding, createFleet, getDemoSnapshot, getPlayerDashboardState } from '../services/demoService.js';
import { calculateOfflineProduction } from '../services/gameService.js';
import { enqueueBuilding } from '../services/buildQueueService.js';
import { checkPrerequisites } from '../services/prerequisiteService.js';
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

demoRouter.post('/sync-production/:playerId', (req, res) => {
  const { playerId } = req.params;
  const planet = gameStore.planets.find((candidate) => candidate.ownerId === playerId);

  if (!planet) {
    res.status(404).json({ error: 'planet not found for player' });
    return;
  }

  const result = calculateOfflineProduction(planet, new Date());
  const planetIndex = gameStore.planets.findIndex((candidate) => candidate.id === planet.id);
  gameStore.planets[planetIndex] = result.updatedPlanet;

  res.json({
    gained: result.gained,
    totalHours: result.totalHours,
    planet: result.updatedPlanet,
  });
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
    // Enforce the prerequisite tree (OGame-style).
    const prereq = checkPrerequisites(buildingType, planet.id, playerId);
    if (!prereq.met) {
      res.status(400).json({
        error: 'missing prerequisites',
        missing: prereq.missing,
      });
      return;
    }

    // Pay the cost immediately, then enqueue the completion with a timer.
    const result = buildBuilding(planet, buildingType);
    const index = gameStore.planets.findIndex((candidate) => candidate.id === planet.id);
    gameStore.planets[index] = result.planet;

    // Revert the immediate level registration; the queue applies it on completion.
    const existing = gameStore.buildings.find(
      (candidate) => candidate.planetId === planet.id && candidate.type === buildingType,
    );
    const queuedLevel = result.building.level;
    if (existing && existing.level === queuedLevel) {
      existing.level = queuedLevel - 1;
      if (existing.level <= 0) {
        const removeIndex = gameStore.buildings.findIndex(
          (candidate) => candidate.planetId === planet.id && candidate.type === buildingType,
        );
        if (removeIndex >= 0) {
          gameStore.buildings.splice(removeIndex, 1);
        }
      }
    }

    const queueItem = enqueueBuilding(planet, buildingType, queuedLevel);

    res.json({
      building: result.building,
      planet: result.planet,
      queue: {
        id: queueItem.id,
        completesAt: queueItem.completesAt,
        durationSeconds: queueItem.durationSeconds,
      },
    });
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
