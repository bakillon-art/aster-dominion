import type { Planet, ResourceState } from '../types.js';

export type TechnologyKey =
  | 'energy'
  | 'laser'
  | 'ion'
  | 'plasma'
  | 'hyperspace'
  | 'combustion_drive'
  | 'impulse_drive'
  | 'hyperspace_drive'
  | 'espionage'
  | 'computer'
  | 'armor'
  | 'shield'
  | 'weapon';

export interface TechnologyDefinition {
  key: TechnologyKey;
  name: string;
  description: string;
  baseCost: ResourceState;
  costMultiplier: number;
  category: 'basic' | 'drive' | 'combat' | 'advanced';
}

export interface PlayerTechnology {
  key: TechnologyKey;
  level: number;
}

export const technologyCatalog: Record<TechnologyKey, TechnologyDefinition> = {
  energy: {
    key: 'energy',
    name: 'Tecnología de energía',
    description: 'Mejora la eficiencia de producción energética.',
    baseCost: { metal: 0, crystal: 800, deuterium: 400, energy: 0 },
    costMultiplier: 2,
    category: 'basic',
  },
  laser: {
    key: 'laser',
    name: 'Tecnología láser',
    description: 'Armas láser más potentes para naves y defensas.',
    baseCost: { metal: 200, crystal: 100, deuterium: 0, energy: 0 },
    costMultiplier: 2,
    category: 'combat',
  },
  ion: {
    key: 'ion',
    name: 'Tecnología iónica',
    description: 'Cañones de iones con daño de escudo aumentado.',
    baseCost: { metal: 1000, crystal: 300, deuterium: 100, energy: 0 },
    costMultiplier: 2,
    category: 'combat',
  },
  plasma: {
    key: 'plasma',
    name: 'Tecnología de plasma',
    description: 'Armas de plasma de alto daño.',
    baseCost: { metal: 2000, crystal: 4000, deuterium: 1000, energy: 0 },
    costMultiplier: 2,
    category: 'combat',
  },
  hyperspace: {
    key: 'hyperspace',
    name: 'Tecnología de hiperespacio',
    description: 'Desbloquea viajes hiperespaciales avanzados.',
    baseCost: { metal: 0, crystal: 4000, deuterium: 2000, energy: 0 },
    costMultiplier: 2,
    category: 'advanced',
  },
  combustion_drive: {
    key: 'combustion_drive',
    name: 'Motor de combustión',
    description: 'Motor básico para naves pequeñas.',
    baseCost: { metal: 400, crystal: 0, deuterium: 600, energy: 0 },
    costMultiplier: 2,
    category: 'drive',
  },
  impulse_drive: {
    key: 'impulse_drive',
    name: 'Motor de impulso',
    description: 'Motor rápido para naves medianas.',
    baseCost: { metal: 2000, crystal: 4000, deuterium: 600, energy: 0 },
    costMultiplier: 2,
    category: 'drive',
  },
  hyperspace_drive: {
    key: 'hyperspace_drive',
    name: 'Motor hiperespacial',
    description: 'Motor para viajes instantáneos largos.',
    baseCost: { metal: 10000, crystal: 20000, deuterium: 6000, energy: 0 },
    costMultiplier: 2,
    category: 'drive',
  },
  espionage: {
    key: 'espionage',
    name: 'Tecnología de espionaje',
    description: 'Mejora los informes de sondas de espionaje.',
    baseCost: { metal: 200, crystal: 1000, deuterium: 200, energy: 0 },
    costMultiplier: 2,
    category: 'basic',
  },
  computer: {
    key: 'computer',
    name: 'Tecnología de computación',
    description: 'Más flotas simultáneas en vuelo.',
    baseCost: { metal: 0, crystal: 400, deuterium: 600, energy: 0 },
    costMultiplier: 2,
    category: 'basic',
  },
  armor: {
    key: 'armor',
    name: 'Tecnología de blindaje',
    description: 'Blindaje mejorado para naves y defensas.',
    baseCost: { metal: 2000, crystal: 0, deuterium: 0, energy: 0 },
    costMultiplier: 2,
    category: 'combat',
  },
  shield: {
    key: 'shield',
    name: 'Tecnología de escudos',
    description: 'Escudos defensivos más resistentes.',
    baseCost: { metal: 200, crystal: 600, deuterium: 0, energy: 0 },
    costMultiplier: 2,
    category: 'combat',
  },
  weapon: {
    key: 'weapon',
    name: 'Tecnología militar',
    description: 'Aumenta el ataque base de todas las unidades.',
    baseCost: { metal: 800, crystal: 200, deuterium: 0, energy: 0 },
    costMultiplier: 2,
    category: 'combat',
  },
};

export function getResearchCost(techKey: TechnologyKey, currentLevel: number): ResourceState {
  const tech = technologyCatalog[techKey];
  const multiplier = Math.pow(tech.costMultiplier, currentLevel);

  return {
    metal: Math.floor(tech.baseCost.metal * multiplier),
    crystal: Math.floor(tech.baseCost.crystal * multiplier),
    deuterium: Math.floor(tech.baseCost.deuterium * multiplier),
    energy: Math.floor(tech.baseCost.energy * multiplier),
  };
}

export function canAffordResearch(planet: Planet, techKey: TechnologyKey, currentLevel: number): boolean {
  const cost = getResearchCost(techKey, currentLevel);

  return (
    planet.resources.metal >= cost.metal &&
    planet.resources.crystal >= cost.crystal &&
    planet.resources.deuterium >= cost.deuterium &&
    planet.resources.energy >= cost.energy
  );
}

export function researchTechnology(
  planet: Planet,
  techKey: TechnologyKey,
  currentLevel: number,
): { updatedPlanet: Planet; newLevel: number } {
  const cost = getResearchCost(techKey, currentLevel);

  if (!canAffordResearch(planet, techKey, currentLevel)) {
    throw new Error(`Insufficient resources to research ${techKey}`);
  }

  const updatedPlanet: Planet = {
    ...planet,
    resources: {
      metal: planet.resources.metal - cost.metal,
      crystal: planet.resources.crystal - cost.crystal,
      deuterium: planet.resources.deuterium - cost.deuterium,
      energy: planet.resources.energy - cost.energy,
    },
  };

  return {
    updatedPlanet,
    newLevel: currentLevel + 1,
  };
}
