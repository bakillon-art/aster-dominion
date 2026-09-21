import { Router } from 'express';

import { colonizePosition, getGalaxyOverview, getSystem } from '../services/galaxyService.js';

export const galaxyRouter = Router();

galaxyRouter.get('/', (_req, res) => {
  res.json({ systems: getGalaxyOverview() });
});

galaxyRouter.get('/:galaxy/:system', (req, res) => {
  const galaxy = Number(req.params.galaxy);
  const system = Number(req.params.system);

  const result = getSystem(galaxy, system);

  if (!result) {
    res.status(404).json({ error: `system ${galaxy}:${system} not found` });
    return;
  }

  res.json(result);
});

galaxyRouter.post('/colonize', (req, res) => {
  const { galaxy, system, position, playerId, planetName } = req.body as {
    galaxy?: number;
    system?: number;
    position?: number;
    playerId?: string;
    planetName?: string;
  };

  if (!galaxy || !system || !position || !playerId) {
    res.status(400).json({ error: 'galaxy, system, position and playerId are required' });
    return;
  }

  try {
    const planet = colonizePosition(galaxy, system, position, playerId, planetName);
    res.status(201).json({ planet });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'colonization failed' });
  }
});
