import type { Planet, ResourceState } from '../types.js';

export type DefenseType =
  | 'rocket_launcher'
  | 'light_laser'
  | 'heavy_laser'
  | 'ion_cannon'
  | 'gauss_cannon'
  | 'plasma_turret'
  | 'small_shield_dome'
  | 'large_shield_dome';

export interface DefenseDefinition {
  key: DefenseType;
  name: string;
  cost: ResourceState;
  attack: number;
  shield: number;
  armor: number;
}

export const defenseCatalog: Record<DefenseType, DefenseDefinition> = {
  rocket_launcher: {
    key: 'rocket_launcher',
    name: 'Lanzamisiles',
    cost: { metal: 2000, crystal: 0, deuterium: 0, energy: 0 },
    attack: 80,
    shield: 20,
    armor: 200,
  },
  light_laser: {
    key: 'light_laser',
    name: 'Láser ligero',
    cost: { metal: 1500, crystal: 500, deuterium: 0, energy: 0 },
    attack: 100,
    shield: 25,
    armor: 200,
  },
  heavy_laser: {
    key: 'heavy_laser',
    name: 'Láser pesado',
    cost: { metal: 6000, crystal: 2000, deuterium: 0, energy: 0 },
    attack: 250,
    shield: 100,
    armor: 800,
  },
  ion_cannon: {
    key: 'ion_cannon',
    name: 'Cañón de iones',
    cost: { metal: 2000, crystal: 6000, deuterium: 0, energy: 0 },
    attack: 150,
    shield: 500,
    armor: 800,
  },
  gauss_cannon: {
    key: 'gauss_cannon',
    name: 'Cañón Gauss',
    cost: { metal: 20000, crystal: 15000, deuterium: 2000, energy: 0 },
    attack: 1100,
    shield: 200,
    armor: 3500,
  },
  plasma_turret: {
    key: 'plasma_turret',
    name: 'Torreta de plasma',
    cost: { metal: 50000, crystal: 50000, deuterium: 30000, energy: 0 },
    attack: 3000,
    shield: 300,
    armor: 10000,
  },
  small_shield_dome: {
    key: 'small_shield_dome',
    name: 'Cúpula de escudo pequeña',
    cost: { metal: 10000, crystal: 10000, deuterium: 0, energy: 0 },
    attack: 0,
    shield: 2000,
    armor: 2000,
  },
  large_shield_dome: {
    key: 'large_shield_dome',
    name: 'Cúpula de escudo grande',
    cost: { metal: 50000, crystal: 50000, deuterium: 0, energy: 0 },
    attack: 0,
    shield: 10000,
    armor: 10000,
  },
};

export function buildDefense(planet: Planet, type: DefenseType, quantity: number) {
  const def = defenseCatalog[type];

  if (!def) {
    throw new Error(`Unknown defense type: ${type}`);
  }

  if (quantity <= 0) {
    throw new Error('Quantity must be greater than zero');
  }

  const totalCost: ResourceState = {
    metal: def.cost.metal * quantity,
    crystal: def.cost.crystal * quantity,
    deuterium: def.cost.deuterium * quantity,
    energy: def.cost.energy * quantity,
  };

  if (
    planet.resources.metal < totalCost.metal ||
    planet.resources.crystal < totalCost.crystal ||
    planet.resources.deuterium < totalCost.deuterium ||
    planet.resources.energy < totalCost.energy
  ) {
    throw new Error(`Insufficient resources to build ${quantity}x ${def.name}`);
  }

  const updatedPlanet: Planet = {
    ...planet,
    resources: {
      metal: planet.resources.metal - totalCost.metal,
      crystal: planet.resources.crystal - totalCost.crystal,
      deuterium: planet.resources.deuterium - totalCost.deuterium,
      energy: planet.resources.energy - totalCost.energy,
    },
  };

  return {
    defense: { type, quantity, name: def.name },
    planet: updatedPlanet,
  };
}
