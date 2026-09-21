import { Router } from 'express';

import { gameStore } from '../data/store.js';
import { calculateOfflineProduction } from '../services/gameService.js';

export const playerRouter = Router();

playerRouter.get('/:id/overview', (req, res) => {
  const { id } = req.params;
  const player = gameStore.players.find((candidate) => candidate.id === id);

  if (!player) {
    res.status(404).json({ error: 'player not found' });
    return;
  }

  const planets = gameStore.planets.filter((planet) => planet.ownerId === id);

  res.json({
    player: {
      id: player.id,
      username: player.username,
      email: player.email,
      createdAt: player.createdAt,
    },
    planets,
  });
});

playerRouter.post('/:id/sync-production', (req, res) => {
  const { id } = req.params;
  const planet = gameStore.planets.find((candidate) => candidate.ownerId === id);

  if (!planet) {
    res.status(404).json({ error: 'planet not found for player' });
    return;
  }

  const result = calculateOfflineProduction(planet, new Date());
  const planetIndex = gameStore.planets.findIndex((candidate) => candidate.id === planet.id);
  gameStore.planets[planetIndex] = result.updatedPlanet;

  res.json({
    message: 'planet production synced',
    totalHours: result.totalHours,
    gained: result.gained,
    planet: result.updatedPlanet,
  });
});
