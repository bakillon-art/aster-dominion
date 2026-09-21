import { Router } from 'express';

import { gameStore } from '../data/store.js';
import { checkPrerequisites, registerTechLevelLookup } from '../services/prerequisiteService.js';
import {
  canAffordResearch,
  getResearchCost,
  getResearchDurationSeconds,
  researchTechnology,
  technologyCatalog,
  type TechnologyKey,
} from '../services/researchService.js';

export const researchRouter = Router();

// In-memory player technology levels (per player)
const playerTechnologies = new Map<string, Map<string, number>>();

function getPlayerTechLevel(playerId: string, techKey: string): number {
  return playerTechnologies.get(playerId)?.get(techKey) ?? 0;
}

function setPlayerTechLevel(playerId: string, techKey: string, level: number): void {
  if (!playerTechnologies.has(playerId)) {
    playerTechnologies.set(playerId, new Map());
  }
  playerTechnologies.get(playerId)!.set(techKey, level);
}

// Let the prerequisite service query tech levels.
registerTechLevelLookup(getPlayerTechLevel);

researchRouter.get('/:playerId', (req, res) => {
  const { playerId } = req.params;

  const techs = Object.values(technologyCatalog).map((tech) => {
    const level = getPlayerTechLevel(playerId, tech.key);
    const nextCost = getResearchCost(tech.key, level);
    const durationSeconds = getResearchDurationSeconds(tech.key, level);

    return {
      key: tech.key,
      name: tech.name,
      description: tech.description,
      category: tech.category,
      level,
      nextLevelCost: nextCost,
      durationSeconds,
    };
  });

  res.json({ playerId, technologies: techs });
});

researchRouter.post('/:playerId/research/:techKey', (req, res) => {
  const { playerId, techKey } = req.params;

  if (!(techKey in technologyCatalog)) {
    res.status(400).json({ error: `unknown technology: ${techKey}` });
    return;
  }

  const planet = gameStore.planets.find((candidate) => candidate.ownerId === playerId);

  if (!planet) {
    res.status(404).json({ error: 'planet not found for player' });
    return;
  }

  const currentLevel = getPlayerTechLevel(playerId, techKey);

  // Enforce the prerequisite tree.
  const prereq = checkPrerequisites(techKey, planet.id, playerId);
  if (!prereq.met) {
    res.status(400).json({ error: 'missing prerequisites', missing: prereq.missing });
    return;
  }

  if (!canAffordResearch(planet, techKey as TechnologyKey, currentLevel)) {
    res.status(400).json({ error: 'insufficient resources for research' });
    return;
  }

  try {
    const result = researchTechnology(planet, techKey as TechnologyKey, currentLevel);
    const index = gameStore.planets.findIndex((candidate) => candidate.id === planet.id);
    gameStore.planets[index] = result.updatedPlanet;
    setPlayerTechLevel(playerId, techKey, result.newLevel);

    res.json({
      technology: techKey,
      newLevel: result.newLevel,
      planet: result.updatedPlanet,
    });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'research failed' });
  }
});

researchRouter.get('/:playerId/cost/:techKey', (req, res) => {
  const { playerId, techKey } = req.params;

  if (!(techKey in technologyCatalog)) {
    res.status(400).json({ error: `unknown technology: ${techKey}` });
    return;
  }

  const level = getPlayerTechLevel(playerId, techKey);
  const cost = getResearchCost(techKey as TechnologyKey, level);

  res.json({ technology: techKey, currentLevel: level, nextLevelCost: cost });
});
