import { Router } from 'express';

import {
  createAlliance,
  disbandAlliance,
  getAlliance,
  getPlayerAlliance,
  joinAlliance,
  leaveAlliance,
  listAlliances,
} from '../services/allianceService.js';

export const allianceRouter = Router();

allianceRouter.get('/', (_req, res) => {
  res.json({ alliances: listAlliances() });
});

allianceRouter.get('/:allianceId', (req, res) => {
  const alliance = getAlliance(req.params.allianceId);

  if (!alliance) {
    res.status(404).json({ error: 'alliance not found' });
    return;
  }

  res.json({ alliance });
});

allianceRouter.get('/player/:playerId', (req, res) => {
  const alliance = getPlayerAlliance(req.params.playerId);

  if (!alliance) {
    res.status(404).json({ error: 'player has no alliance' });
    return;
  }

  res.json({ alliance });
});

allianceRouter.post('/', (req, res) => {
  const { founderId, tag, name } = req.body as {
    founderId?: string;
    tag?: string;
    name?: string;
  };

  if (!founderId || !tag || !name) {
    res.status(400).json({ error: 'founderId, tag and name are required' });
    return;
  }

  try {
    const alliance = createAlliance(founderId, tag, name);
    res.status(201).json({ alliance });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'alliance creation failed' });
  }
});

allianceRouter.post('/:allianceId/join', (req, res) => {
  const { playerId } = req.body as { playerId?: string };

  if (!playerId) {
    res.status(400).json({ error: 'playerId is required' });
    return;
  }

  try {
    const alliance = joinAlliance(req.params.allianceId, playerId);
    res.json({ alliance });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'join failed' });
  }
});

allianceRouter.post('/:allianceId/leave', (req, res) => {
  const { playerId } = req.body as { playerId?: string };

  if (!playerId) {
    res.status(400).json({ error: 'playerId is required' });
    return;
  }

  try {
    const alliance = leaveAlliance(req.params.allianceId, playerId);
    res.json({ alliance });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'leave failed' });
  }
});

allianceRouter.post('/:allianceId/disband', (req, res) => {
  const { playerId } = req.body as { playerId?: string };

  if (!playerId) {
    res.status(400).json({ error: 'playerId is required' });
    return;
  }

  try {
    disbandAlliance(req.params.allianceId, playerId);
    res.json({ message: 'alliance disbanded' });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'disband failed' });
  }
});
