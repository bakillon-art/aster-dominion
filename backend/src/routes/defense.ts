import { Router } from 'express';

import { gameStore } from '../data/store.js';
import { buildDefense, defenseCatalog, type DefenseType } from '../services/defenseService.js';

export const defenseRouter = Router();

// In-memory defense storage per planet
const planetDefenses = new Map<string, Map<string, number>>();

function getDefenseCount(planetId: string, type: string): number {
  return planetDefenses.get(planetId)?.get(type) ?? 0;
}

function addDefenses(planetId: string, type: string, quantity: number): void {
  if (!planetDefenses.has(planetId)) {
    planetDefenses.set(planetId, new Map());
  }
  const current = planetDefenses.get(planetId)!.get(type) ?? 0;
  planetDefenses.get(planetId)!.set(type, current + quantity);
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
  const defenses = planetDefenses.get(planetId);

  const result = Object.values(defenseCatalog).map((def) => ({
    type: def.key,
    name: def.name,
    quantity: defenses?.get(def.key) ?? 0,
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
