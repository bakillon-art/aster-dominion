export interface DebrisState {
  metal: number;
  crystal: number;
  deuterium: number;
}

export type WeaponType = 'laser' | 'plasma' | 'ion' | 'missile' | 'kinetic';

export interface CombatTechs {
  laser: number;
  plasma: number;
  ion: number;
  missile: number;
  kinetic: number;
  shield: number;
  armor: number;
  hull: number;
  attack: number;
  defense: number;
}

export interface CombatUnit {
  type: string;
  weaponType: WeaponType;
  count: number;
  attack: number;
  shield: number;
  armor: number;
}

export interface FleetCombatState {
  ships: CombatUnit[];
  defenses: CombatUnit[];
  techs: CombatTechs;
}

const weaponCounters: Record<string, Record<string, number>> = {
  laser: { missile: 1.5, plasma: 0.8, ion: 1.1, kinetic: 1.05 },
  plasma: { laser: 1.4, missile: 1.2, ion: 0.9, kinetic: 1.15 },
  ion: { plasma: 1.25, laser: 1.1, missile: 1.15, kinetic: 0.9 },
  missile: { laser: 0.7, plasma: 1.15, ion: 1.1, kinetic: 1.05 },
  kinetic: { laser: 1.05, plasma: 0.85, ion: 1.1, missile: 1 },
};

const computeForce = (units: CombatUnit[], techs: CombatTechs) => {
  return units.reduce((total, unit) => {
    const weaponTech = techs[unit.weaponType as keyof CombatTechs] ?? 0;
    const attackBoost = 1 + techs.attack * 0.08 + weaponTech * 0.05;
    const shieldBoost = 1 + techs.shield * 0.06 + techs.defense * 0.05;
    const armorBoost = 1 + techs.armor * 0.07 + techs.hull * 0.05;

    const unitAttack = unit.attack * attackBoost;
    const unitShield = unit.shield * shieldBoost;
    const unitArmor = unit.armor * armorBoost;

    return total + unit.count * (unitAttack + unitShield + unitArmor);
  }, 0);
};

const computeCounterAdjustedForce = (units: CombatUnit[], enemyUnits: CombatUnit[], techs: CombatTechs) => {
  return units.reduce((total, unit) => {
    const counterFactor = enemyUnits.reduce((factor, enemyUnit) => {
      const matchup = weaponCounters[unit.weaponType]?.[enemyUnit.weaponType] ?? 1;
      return factor * matchup;
    }, 1);

    const weaponTech = techs[unit.weaponType as keyof CombatTechs] ?? 0;
    const attackBoost = 1 + techs.attack * 0.08 + weaponTech * 0.05;
    const shieldBoost = 1 + techs.shield * 0.06 + techs.defense * 0.05;
    const armorBoost = 1 + techs.armor * 0.07 + techs.hull * 0.05;

    const unitAttack = unit.attack * attackBoost * counterFactor;
    const unitShield = unit.shield * shieldBoost;
    const unitArmor = unit.armor * armorBoost;

    return total + unit.count * (unitAttack + unitShield + unitArmor);
  }, 0);
};

export function resolveBattle(attacker: FleetCombatState, defender: FleetCombatState) {
  const attackerUnits = [...attacker.ships, ...attacker.defenses];
  const defenderUnits = [...defender.ships, ...defender.defenses];

  const attackerPower = computeCounterAdjustedForce(attackerUnits, defenderUnits, attacker.techs);
  const defenderPower = computeCounterAdjustedForce(defenderUnits, attackerUnits, defender.techs);

  const winner = attackerPower >= defenderPower ? 'attacker' : 'defender';
  const loser = winner === 'attacker' ? 'defender' : 'attacker';

  const destroyedUnitSet = winner === 'attacker' ? defender : attacker;
  const debris: DebrisState = {
    metal: Math.round(
      destroyedUnitSet.ships.reduce((sum, unit) => sum + unit.count * unit.armor, 0) * 0.4,
    ),
    crystal: Math.round(
      destroyedUnitSet.defenses.reduce((sum, unit) => sum + unit.count * unit.attack, 0) * 0.35,
    ),
    deuterium: Math.round(
      destroyedUnitSet.ships.reduce((sum, unit) => sum + unit.count * unit.shield, 0) * 0.25,
    ),
  };

  return {
    battleSummary: {
      winner,
      loser,
      attackerPower: Math.round(attackerPower),
      defenderPower: Math.round(defenderPower),
    },
    debris,
  };
}

export function recycleDebris(debris: DebrisState) {
  return {
    metal: Math.round(debris.metal * 0.8),
    crystal: Math.round(debris.crystal * 0.8),
    deuterium: Math.round(debris.deuterium * 0.8),
  };
}
