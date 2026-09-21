import type { Coordinate, Planet } from '../types.js';

export type FleetShipType = 'light_cargo' | 'heavy_cargo' | 'interceptor';
export type EngineType = 'combustion' | 'impulse' | 'hyperspace';
export type MissionType = 'transport' | 'attack' | 'recon' | 'colonize';

export interface FleetUnit {
  shipType: FleetShipType;
  quantity: number;
  engine: EngineType;
}

const shipSpeeds: Record<FleetShipType, number> = {
  light_cargo: 300,
  heavy_cargo: 200,
  interceptor: 500,
};

const engineMultipliers: Record<EngineType, number> = {
  combustion: 1,
  impulse: 1.5,
  hyperspace: 2.4,
};

export function calculateTravelDuration(
  origin: Coordinate,
  target: Coordinate,
  fleet: FleetUnit[],
): number {
  if (!fleet.length) {
    throw new Error('Fleet cannot be empty');
  }

  const distance = Math.max(
    1,
    Math.abs(target.x - origin.x) + Math.abs(target.y - origin.y),
  );

  const slowestSpeed = Math.min(
    ...fleet.map((unit) => {
      const baseSpeed = shipSpeeds[unit.shipType];
      const engineFactor = engineMultipliers[unit.engine];
      return baseSpeed * engineFactor;
    }),
  );

  return Math.round((distance * 10_000) / slowestSpeed);
}

export function createFleetMission(
  origin: Planet,
  target: Planet,
  fleet: FleetUnit[],
  missionType: MissionType,
) {
  const duration = calculateTravelDuration(origin.coordinate, target.coordinate, fleet);
  const totalQuantity = fleet.reduce((sum, unit) => sum + unit.quantity, 0);
  const cost = {
    metal: fleet.reduce((sum, unit) => sum + unit.quantity * 2000, 0),
    crystal: fleet.reduce((sum, unit) => sum + unit.quantity * 800, 0),
    deuterium: fleet.reduce((sum, unit) => sum + unit.quantity * 200, 0),
    energy: 0,
  };

  if (
    origin.resources.metal < cost.metal ||
    origin.resources.crystal < cost.crystal ||
    origin.resources.deuterium < cost.deuterium
  ) {
    throw new Error('Insufficient resources to launch fleet mission');
  }

  const updatedPlanet: Planet = {
    ...origin,
    resources: {
      metal: origin.resources.metal - cost.metal,
      crystal: origin.resources.crystal - cost.crystal,
      deuterium: origin.resources.deuterium - cost.deuterium,
      energy: origin.resources.energy - cost.energy,
    },
  };

  return {
    mission: {
      id: `mission-${Date.now()}`,
      originPlanetId: origin.id,
      targetPlanetId: target.id,
      fleet,
      quantity: totalQuantity,
      missionType,
      status: 'in_transit',
      etaSeconds: duration,
      launchedAt: new Date().toISOString(),
      arrivesAt: new Date(Date.now() + duration * 1000).toISOString(),
    },
    updatedPlanet,
  };
}
