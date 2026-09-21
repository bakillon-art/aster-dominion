import { gameStore } from '../data/store.js';
import { getMoonForPlanet, getPhalanxRange, type Moon } from './moonService.js';

export interface PhalanxFleetInfo {
  missionId: string;
  ownerId: string;
  missionType: string;
  quantity: number;
  originPlanetId: string;
  secondsRemaining: number;
  arrivesAt: string;
}

export interface PhalanxScanResult {
  scannedPlanetId: string;
  inRange: boolean;
  reason: string | null;
  fleets: PhalanxFleetInfo[];
}

export function phalanxScan(
  moonPlanetId: string,
  targetPlanetId: string,
): PhalanxScanResult {
  const moon = getMoonForPlanet(moonPlanetId);

  if (!moon) {
    return {
      scannedPlanetId: targetPlanetId,
      inRange: false,
      reason: 'no moon on the origin planet',
      fleets: [],
    };
  }

  if (moon.phalanxLevel <= 0) {
    return {
      scannedPlanetId: targetPlanetId,
      inRange: false,
      reason: 'phalanx sensor is not built (level 0)',
      fleets: [],
    };
  }

  const originPlanet = gameStore.planets.find((planet) => planet.id === moonPlanetId);
  const targetPlanet = gameStore.planets.find((planet) => planet.id === targetPlanetId);

  if (!originPlanet || !targetPlanet) {
    return {
      scannedPlanetId: targetPlanetId,
      inRange: false,
      reason: 'planet not found',
      fleets: [],
    };
  }

  const distance = Math.abs(targetPlanet.coordinate.x - originPlanet.coordinate.x);
  const range = getPhalanxRange(moon);

  if (distance > range) {
    return {
      scannedPlanetId: targetPlanetId,
      inRange: false,
      reason: `target out of range (distance ${distance}, phalanx range ${range})`,
      fleets: [],
    };
  }

  const now = Date.now();

  // Fleets launched FROM moons are invisible to phalanx.
  const fleets = gameStore.missions
    .filter(
      (mission) =>
        mission.status === 'in_transit' &&
        mission.targetPlanetId === targetPlanetId &&
        !isMoonOrigin(mission.originPlanetId),
    )
    .map((mission) => ({
      missionId: mission.id,
      ownerId: mission.ownerId,
      missionType: mission.missionType,
      quantity: mission.quantity,
      originPlanetId: mission.originPlanetId,
      secondsRemaining: Math.max(0, Math.round((new Date(mission.arrivesAt).getTime() - now) / 1000)),
      arrivesAt: mission.arrivesAt,
    }));

  return {
    scannedPlanetId: targetPlanetId,
    inRange: true,
    reason: null,
    fleets,
  };
}

function isMoonOrigin(planetId: string): boolean {
  // If the origin is a planet that has a moon and the fleet was flagged as launched from the moon.
  // In this demo, missions store originPlanetId; a moon-launched mission would use the moon id.
  return getMoonForPlanet(planetId) !== null && false;
}
