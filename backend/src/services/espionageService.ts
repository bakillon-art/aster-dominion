import { randomUUID } from 'node:crypto';

import { gameStore } from '../data/store.js';
import { createMessage } from './messageService.js';
import type { Planet } from '../types.js';

export interface EspionageReport {
  id: string;
  playerId: string;
  targetPlanetId: string;
  probesSent: number;
  probesLost: number;
  espionageLevel: number;
  resources: { metal: number; crystal: number; deuterium: number; energy: number } | null;
  fleet: { totalShips: number } | null;
  defenses: { total: number } | null;
  buildings: Array<{ type: string; level: number }> | null;
  technologies: Array<{ key: string; level: number }> | null;
  createdAt: string;
}

// What each espionage level reveals
// 0: nothing (fail) | 1: resources | 2: +fleet count | 3: +defenses | 4: +buildings | 5+: +technologies
const revealThresholds = {
  resources: 1,
  fleet: 2,
  defenses: 3,
  buildings: 4,
  technologies: 5,
};

export function spyOnPlanet(
  playerId: string,
  targetPlanetId: string,
  probeCount: number,
  espionageLevel: number,
  defenderEspionageLevel = 0,
): EspionageReport {
  const targetPlanet = gameStore.planets.find((planet) => planet.id === targetPlanetId);

  if (!targetPlanet) {
    throw new Error('target planet not found');
  }

  if (probeCount <= 0) {
    throw new Error('at least one probe is required');
  }

  // Risk model: base 5% per probe, but the defender's espionage level counters it.
  // Each level the defender has OVER the spy adds +8% loss chance per probe.
  // Each level the spy has OVER the defender reduces it by 3% (min 1%).
  const levelDiff = defenderEspionageLevel - espionageLevel;
  const lossChancePerProbe = Math.min(
    0.95,
    Math.max(0.01, 0.05 + Math.max(0, levelDiff) * 0.08 - Math.max(0, -levelDiff) * 0.03),
  );

  let probesLost = 0;
  for (let i = 0; i < probeCount; i++) {
    if (Math.random() < lossChancePerProbe) {
      probesLost++;
    }
  }

  // Effective detail: espionage level + bonus from surviving probes (capped).
  const survivingProbes = probeCount - probesLost;
  const probeBonus = Math.min(3, Math.floor(survivingProbes / 2));
  const effectiveLevel = espionageLevel + probeBonus;

  const report: EspionageReport = {
    id: randomUUID(),
    playerId,
    targetPlanetId,
    probesSent: probeCount,
    probesLost,
    espionageLevel,
    resources: null,
    fleet: null,
    defenses: null,
    buildings: null,
    technologies: null,
    createdAt: new Date().toISOString(),
  };

  if (effectiveLevel >= revealThresholds.resources) {
    report.resources = { ...targetPlanet.resources };
  }

  if (effectiveLevel >= revealThresholds.fleet) {
    const totalShips = gameStore.fleets
      .filter((fleet) => fleet.planetId === targetPlanetId)
      .reduce((sum, fleet) => sum + fleet.quantity, 0);
    report.fleet = { totalShips };
  }

  if (effectiveLevel >= revealThresholds.defenses) {
    const total = gameStore.defenses
      .filter((defense) => defense.planetId === targetPlanetId)
      .reduce((sum, defense) => sum + defense.quantity, 0);
    report.defenses = { total };
  }

  if (effectiveLevel >= revealThresholds.buildings) {
    report.buildings = gameStore.buildings
      .filter((building) => building.planetId === targetPlanetId)
      .map((building) => ({ type: building.type, level: building.level }));
  }

  if (effectiveLevel >= revealThresholds.technologies) {
    // Technologies are global per player in this demo; report a summary.
    report.technologies = [{ key: 'espionage', level: espionageLevel }];
  }

  const revealedParts = [
    report.resources ? 'recursos' : null,
    report.fleet ? 'flota' : null,
    report.defenses ? 'defensas' : null,
    report.buildings ? 'edificios' : null,
    report.technologies ? 'tecnologías' : null,
  ].filter(Boolean);

  createMessage(
    playerId,
    'info',
    'Informe de espionaje',
    `Espionaje sobre ${targetPlanet.name}: ${survivingProbes}/${probeCount} sondas volvieron (${probesLost} perdidas). Revelado: ${revealedParts.length ? revealedParts.join(', ') : 'nada'}.`,
    { reportId: report.id, targetPlanetId },
  );

  return report;
}
