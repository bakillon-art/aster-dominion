import { Router } from 'express';

import type { FleetCombatState } from '../services/combatService.js';
import { resolveBattle, recycleDebris } from '../services/combatService.js';

export const combatRouter = Router();

combatRouter.post('/resolve', (req, res) => {
  const { attacker, defender } = req.body as {
    attacker?: FleetCombatState;
    defender?: FleetCombatState;
  };

  if (!attacker || !defender) {
    res.status(400).json({ error: 'attacker and defender fleets are required' });
    return;
  }

  const result = resolveBattle(attacker, defender);

  res.json(result);
});

combatRouter.post('/recycle', (req, res) => {
  const { debris } = req.body as {
    debris?: {
      metal?: number;
      crystal?: number;
      deuterium?: number;
    };
  };

  if (!debris) {
    res.status(400).json({ error: 'debris payload is required' });
    return;
  }

  const result = recycleDebris({
    metal: debris.metal ?? 0,
    crystal: debris.crystal ?? 0,
    deuterium: debris.deuterium ?? 0,
  });

  res.json({ recycled: result });
});
