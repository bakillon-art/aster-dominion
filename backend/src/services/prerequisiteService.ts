import { gameStore } from '../data/store.js';

export interface Prerequisite {
  type: 'technology' | 'building';
  key: string;
  level: number;
}

export interface PrerequisiteCheck {
  met: boolean;
  missing: Prerequisite[];
}

// Prerequisite tree inspired by OGame's tech tree.
export const prerequisites: Record<string, Prerequisite[]> = {
  // Buildings
  mineral_extractor: [],
  crystal_refinery: [],
  solar_plant: [],
  deuterium_plant: [{ type: 'building', key: 'solar_plant', level: 2 }],
  research_lab: [],
  shipyard: [{ type: 'building', key: 'research_lab', level: 1 }],
  metal_storage: [{ type: 'building', key: 'mineral_extractor', level: 5 }],
  crystal_storage: [{ type: 'building', key: 'crystal_refinery', level: 5 }],
  deuterium_tank: [{ type: 'building', key: 'deuterium_plant', level: 5 }],
  orbital_stabilizer: [
    { type: 'technology', key: 'hyperspace', level: 8 },
    { type: 'building', key: 'deuterium_plant', level: 10 },
    { type: 'building', key: 'research_lab', level: 6 },
  ],

  // Ships
  light_cargo: [{ type: 'building', key: 'shipyard', level: 2 }],
  heavy_cargo: [
    { type: 'building', key: 'shipyard', level: 4 },
    { type: 'technology', key: 'combustion_drive', level: 4 },
  ],
  interceptor: [
    { type: 'building', key: 'shipyard', level: 3 },
    { type: 'technology', key: 'combustion_drive', level: 2 },
    { type: 'technology', key: 'laser', level: 2 },
  ],
  probe: [
    { type: 'building', key: 'shipyard', level: 1 },
    { type: 'technology', key: 'espionage', level: 1 },
  ],

  // Defenses
  rocket_launcher: [{ type: 'building', key: 'shipyard', level: 1 }],
  light_laser: [
    { type: 'technology', key: 'laser', level: 3 },
    { type: 'building', key: 'shipyard', level: 2 },
  ],
  heavy_laser: [
    { type: 'technology', key: 'laser', level: 6 },
    { type: 'technology', key: 'energy', level: 3 },
    { type: 'building', key: 'shipyard', level: 4 },
  ],
  ion_cannon: [
    { type: 'technology', key: 'ion', level: 4 },
    { type: 'building', key: 'shipyard', level: 4 },
  ],
  gauss_cannon: [
    { type: 'technology', key: 'weapon', level: 6 },
    { type: 'technology', key: 'energy', level: 6 },
    { type: 'building', key: 'shipyard', level: 6 },
  ],
  plasma_turret: [
    { type: 'technology', key: 'plasma', level: 7 },
    { type: 'technology', key: 'energy', level: 8 },
    { type: 'building', key: 'shipyard', level: 8 },
  ],
  small_shield_dome: [
    { type: 'technology', key: 'shield', level: 2 },
    { type: 'building', key: 'shipyard', level: 2 },
  ],
  large_shield_dome: [
    { type: 'technology', key: 'shield', level: 6 },
    { type: 'building', key: 'shipyard', level: 6 },
  ],

  // Technologies
  energy: [{ type: 'building', key: 'research_lab', level: 1 }],
  laser: [{ type: 'building', key: 'research_lab', level: 1 }],
  ion: [
    { type: 'building', key: 'research_lab', level: 4 },
    { type: 'technology', key: 'laser', level: 5 },
    { type: 'technology', key: 'energy', level: 4 },
  ],
  plasma: [
    { type: 'building', key: 'research_lab', level: 4 },
    { type: 'technology', key: 'ion', level: 5 },
    { type: 'technology', key: 'laser', level: 10 },
    { type: 'technology', key: 'energy', level: 8 },
  ],
  hyperspace: [
    { type: 'building', key: 'research_lab', level: 7 },
    { type: 'technology', key: 'shield', level: 5 },
    { type: 'technology', key: 'energy', level: 5 },
  ],
  combustion_drive: [{ type: 'building', key: 'research_lab', level: 1 }],
  impulse_drive: [
    { type: 'building', key: 'research_lab', level: 2 },
    { type: 'technology', key: 'combustion_drive', level: 3 },
  ],
  hyperspace_drive: [
    { type: 'building', key: 'research_lab', level: 7 },
    { type: 'technology', key: 'hyperspace', level: 3 },
  ],
  espionage: [{ type: 'building', key: 'research_lab', level: 3 }],
  computer: [{ type: 'building', key: 'research_lab', level: 1 }],
  armor: [{ type: 'building', key: 'research_lab', level: 2 }],
  shield: [{ type: 'building', key: 'research_lab', level: 6 }],
  weapon: [{ type: 'building', key: 'research_lab', level: 4 }],
};

// Player technology levels live in the research router; expose a lookup hook.
// For simplicity, we keep a module-level registry set by the research router.
let techLevelLookup: (playerId: string, techKey: string) => number = () => 0;

export function registerTechLevelLookup(
  lookup: (playerId: string, techKey: string) => number,
): void {
  techLevelLookup = lookup;
}

export function checkPrerequisites(
  entityKey: string,
  planetId: string,
  playerId: string,
): PrerequisiteCheck {
  const reqs = prerequisites[entityKey] ?? [];
  const missing: Prerequisite[] = [];

  for (const req of reqs) {
    if (req.type === 'technology') {
      const level = techLevelLookup(playerId, req.key);
      if (level < req.level) {
        missing.push(req);
      }
    } else {
      const building = gameStore.buildings.find(
        (candidate) => candidate.planetId === planetId && candidate.type === req.key,
      );
      const level = building?.level ?? 0;
      if (level < req.level) {
        missing.push(req);
      }
    }
  }

  return { met: missing.length === 0, missing };
}
