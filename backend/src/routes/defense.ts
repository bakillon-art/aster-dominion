import { Router } from 'express';

import { gameStore } from '../data/store.js';
import { buildDefense, defenseCatalog, type DefenseType } from '../services/defenseService.js';
import { checkPrerequisites } from '../services/prerequisiteService.js';

export const defenseRouter = Router();

function getDefenseCount(planetId: string, type: string): number {
  return gameStore.defenses.find((d) => d.planetId === planetId && d.type === type)?.quantity ?? 0;
}

function addDefenses(planetId: string, type: string, quantity: number): void {
  const existing = gameStore.defenses.find((d) => d.planetId === planetId && d.type === type);
  if (existing) {
    existing.quantity += quantity;
  } else {
    gameStore.defenses.push({ planetId, type, quantity });
  }
}

defenseRouter.get('/', (_req, res) => {
  res.json({
    defenses: Object.values(defenseCatalog).map((def) => ({
      key: def.key,
      name: def.name,
      cost: def.cost,
      attack: def.attack,
      shield: def.shield,
      armor: def.armor,
    })),
  });
});

defenseRouter.get('/planet/:planetId', (req, res) => {
  const { planetId } = req.params;

  const result = Object.values(defenseCatalog).map((def) => ({
    type: def.key,
    name: def.name,
    quantity: gameStore.defenses.find((d) => d.planetId === planetId && d.type === def.key)?.quantity ?? 0,
  }));

  res.json({ planetId, defenses: result });
});

defenseRouter.post('/build', (req, res) => {
  const { playerId, defenseType, quantity } = req.body as {
    playerId?: string;
    defenseType?: DefenseType;
    quantity?: number;
  };

  if (!playerId || !defenseType || typeof quantity !== 'number') {
    res.status(400).json({ error: 'playerId, defenseType and quantity are required' });
    return;
  }

  if (!(defenseType in defenseCatalog)) {
    res.status(400).json({ error: `unknown defense type: ${defenseType}` });
    return;
  }

  const planet = gameStore.planets.find((candidate) => candidate.ownerId === playerId);

  if (!planet) {
    res.status(404).json({ error: 'planet not found' });
    return;
  }

  try {
    // Enforce the prerequisite tree.
    const prereq = checkPrerequisites(defenseType, planet.id, playerId);
    if (!prereq.met) {
      res.status(400).json({ error: 'missing prerequisites', missing: prereq.missing });
      return;
    }

    const result = buildDefense(planet, defenseType, quantity);
    const index = gameStore.planets.findIndex((candidate) => candidate.id === planet.id);
    gameStore.planets[index] = result.planet;

    addDefenses(planet.id, defenseType, quantity);

    res.json({
      defense: result.defense,
      planet: result.planet,
      totalDefense: getDefenseCount(planet.id, defenseType),
    });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'defense build failed' });
  }
});
