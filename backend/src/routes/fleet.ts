import { Router } from 'express';

import { gameStore } from '../data/store.js';
import { createFleetMission } from '../services/fleetService.js';

export const fleetRouter = Router();

fleetRouter.post('/launch', (req, res) => {
  const { playerId, targetPlanetId, fleet, shipType, quantity, engine, missionType } = req.body as {
    playerId?: string;
    targetPlanetId?: string;
    fleet?: Array<{ shipType?: 'light_cargo' | 'heavy_cargo' | 'interceptor'; quantity?: number; engine?: 'combustion' | 'impulse' | 'hyperspace' }>;
    shipType?: 'light_cargo' | 'heavy_cargo' | 'interceptor';
    quantity?: number;
    engine?: 'combustion' | 'impulse' | 'hyperspace';
    missionType?: 'transport' | 'attack' | 'recon' | 'colonize';
  };

  const fleetUnits = Array.isArray(fleet) && fleet.length > 0
    ? fleet
    : [{ shipType, quantity, engine }];

  if (!playerId || !targetPlanetId || !missionType || !fleetUnits.length) {
    res.status(400).json({ error: 'playerId, targetPlanetId, missionType and fleet are required' });
    return;
  }

  const normalizedFleet = fleetUnits.map((unit) => ({
    shipType: unit.shipType ?? 'light_cargo',
    quantity: Number(unit.quantity ?? 1),
    engine: unit.engine ?? 'combustion',
  }));

  if (normalizedFleet.some((unit) => !unit.shipType || unit.quantity <= 0)) {
    res.status(400).json({ error: 'each fleet unit must include a valid shipType and quantity greater than zero' });
    return;
  }

  const originPlanet = gameStore.planets.find((planet) => planet.ownerId === playerId);
  const targetPlanet = gameStore.planets.find((planet) => planet.id === targetPlanetId);

  if (!originPlanet || !targetPlanet) {
    res.status(404).json({ error: 'origin or target planet not found' });
    return;
  }

  try {
    const result = createFleetMission(originPlanet, targetPlanet, normalizedFleet, missionType);
    const index = gameStore.planets.findIndex((planet) => planet.id === originPlanet.id);
    gameStore.planets[index] = result.updatedPlanet;

    gameStore.missions.push({
      id: result.mission.id,
      ownerId: playerId,
      originPlanetId: originPlanet.id,
      targetPlanetId: targetPlanet.id,
      missionType,
      quantity: result.mission.quantity,
      status: 'in_transit',
      launchedAt: result.mission.launchedAt,
      arrivesAt: result.mission.arrivesAt,
    });

    res.json({ mission: result.mission, planet: result.updatedPlanet });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'fleet launch failed' });
  }
});
