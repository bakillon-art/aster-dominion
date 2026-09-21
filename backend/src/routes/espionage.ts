import { Router } from 'express';

import { gameStore } from '../data/store.js';
import { spyOnPlanet } from '../services/espionageService.js';

export const espionageRouter = Router();

espionageRouter.post('/', (req, res) => {
  const { playerId, targetPlanetId, probeCount, espionageLevel, defenderEspionageLevel } = req.body as {
    playerId?: string;
    targetPlanetId?: string;
    probeCount?: number;
    espionageLevel?: number;
    defenderEspionageLevel?: number;
  };

  if (!playerId || !targetPlanetId || typeof probeCount !== 'number') {
    res.status(400).json({ error: 'playerId, targetPlanetId and probeCount are required' });
    return;
  }

  const player = gameStore.players.find((candidate) => candidate.id === playerId);
  if (!player) {
    res.status(404).json({ error: 'player not found' });
    return;
  }

  try {
    const report = spyOnPlanet(
      playerId,
      targetPlanetId,
      probeCount,
      espionageLevel ?? 0,
      defenderEspionageLevel ?? 0,
    );
    res.status(201).json({ report });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'espionage failed' });
  }
});
