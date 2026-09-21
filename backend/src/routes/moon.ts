import { Router } from 'express';

import { gameStore } from '../data/store.js';
import { formMoon, getMoonForPlanet, getMoonFormationStatus, listMoonsForPlayer, upgradePhalanx } from '../services/moonService.js';
import { phalanxScan } from '../services/phalanxService.js';

export const moonRouter = Router();

moonRouter.get('/player/:playerId', (req, res) => {
  res.json({ moons: listMoonsForPlayer(req.params.playerId) });
});

moonRouter.get('/planet/:planetId', (req, res) => {
  const moon = getMoonForPlanet(req.params.planetId);

  if (!moon) {
    res.status(404).json({ error: 'no moon on this planet' });
    return;
  }

  res.json({ moon });
});

moonRouter.get('/status/:playerId', (req, res) => {
  const planet = gameStore.planets.find((candidate) => candidate.ownerId === req.params.playerId);

  if (!planet) {
    res.status(404).json({ error: 'planet not found' });
    return;
  }

  res.json(getMoonFormationStatus(planet, req.params.playerId));
});

moonRouter.post('/form', (req, res) => {
  const { playerId, moonName } = req.body as { playerId?: string; moonName?: string };

  if (!playerId) {
    res.status(400).json({ error: 'playerId is required' });
    return;
  }

  const planet = gameStore.planets.find((candidate) => candidate.ownerId === playerId);

  if (!planet) {
    res.status(404).json({ error: 'planet not found' });
    return;
  }

  try {
    const moon = formMoon(planet, playerId, moonName);
    res.status(201).json({ moon });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'moon formation failed' });
  }
});

moonRouter.post('/phalanx/upgrade', (req, res) => {
  const { playerId } = req.body as { playerId?: string };

  if (!playerId) {
    res.status(400).json({ error: 'playerId is required' });
    return;
  }

  const planet = gameStore.planets.find((candidate) => candidate.ownerId === playerId);

  if (!planet) {
    res.status(404).json({ error: 'planet not found' });
    return;
  }

  try {
    const moon = upgradePhalanx(planet, { metal: 2000, crystal: 4000, deuterium: 1000, energy: 0 });
    res.json({ moon });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'phalanx upgrade failed' });
  }
});

moonRouter.post('/phalanx/scan', (req, res) => {
  const { moonPlanetId, targetPlanetId } = req.body as {
    moonPlanetId?: string;
    targetPlanetId?: string;
  };

  if (!moonPlanetId || !targetPlanetId) {
    res.status(400).json({ error: 'moonPlanetId and targetPlanetId are required' });
    return;
  }

  res.json(phalanxScan(moonPlanetId, targetPlanetId));
});
