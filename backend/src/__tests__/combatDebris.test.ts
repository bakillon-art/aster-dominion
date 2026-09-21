import test from 'node:test';
import assert from 'node:assert/strict';

import type { FleetCombatState } from '../services/combatService.js';
import { resolveBattle, recycleDebris } from '../services/combatService.js';

const attackerFleet: FleetCombatState = {
  ships: [
    { type: 'interceptor', weaponType: 'laser', count: 8, attack: 60, shield: 30, armor: 20 },
    { type: 'cruiser', weaponType: 'plasma', count: 4, attack: 120, shield: 65, armor: 45 },
  ],
  defenses: [
    { type: 'laser_turret', weaponType: 'laser', count: 6, attack: 45, shield: 25, armor: 18 },
  ],
  techs: {
    laser: 6,
    plasma: 4,
    ion: 3,
    missile: 2,
    kinetic: 2,
    shield: 5,
    armor: 4,
    hull: 3,
    attack: 7,
    defense: 6,
  },
};

const defenderFleet: FleetCombatState = {
  ships: [
    { type: 'interceptor', weaponType: 'laser', count: 7, attack: 50, shield: 28, armor: 18 },
    { type: 'destroyer', weaponType: 'plasma', count: 2, attack: 110, shield: 60, armor: 40 },
  ],
  defenses: [
    { type: 'plasma_turret', weaponType: 'plasma', count: 4, attack: 80, shield: 40, armor: 22 },
  ],
  techs: {
    laser: 4,
    plasma: 6,
    ion: 2,
    missile: 1,
    kinetic: 1,
    shield: 4,
    armor: 5,
    hull: 3,
    attack: 5,
    defense: 5,
  },
};

test('resolveBattle calculates winner using ships, defenses, weapon matchups and military techs', () => {
  const result = resolveBattle(attackerFleet, defenderFleet);

  assert.equal(result.debris.metal > 0, true);
  assert.equal(result.debris.crystal > 0, true);
  assert.equal(result.debris.deuterium > 0, true);
  assert.equal(result.battleSummary.winner, 'attacker');
  assert.equal(result.battleSummary.loser, 'defender');
  assert.equal(result.battleSummary.attackerPower > result.battleSummary.defenderPower, true);
});

test('resolveBattle rewards effective counters against enemy weapon classes', () => {
  const laserVsMissile = resolveBattle(
    {
      ships: [{ type: 'interceptor', weaponType: 'laser', count: 6, attack: 90, shield: 25, armor: 18 }],
      defenses: [],
      techs: { laser: 6, plasma: 0, ion: 0, missile: 0, kinetic: 0, shield: 0, armor: 0, hull: 0, attack: 0, defense: 0 },
    },
    {
      ships: [{ type: 'missile_boat', weaponType: 'missile', count: 4, attack: 110, shield: 40, armor: 22 }],
      defenses: [],
      techs: { laser: 0, plasma: 0, ion: 0, missile: 0, kinetic: 0, shield: 0, armor: 0, hull: 0, attack: 0, defense: 0 },
    },
  );

  const plasmaVsLaser = resolveBattle(
    {
      ships: [{ type: 'destroyer', weaponType: 'plasma', count: 6, attack: 90, shield: 25, armor: 18 }],
      defenses: [],
      techs: { laser: 0, plasma: 6, ion: 0, missile: 0, kinetic: 0, shield: 0, armor: 0, hull: 0, attack: 0, defense: 0 },
    },
    {
      ships: [{ type: 'interceptor', weaponType: 'laser', count: 4, attack: 100, shield: 30, armor: 20 }],
      defenses: [],
      techs: { laser: 0, plasma: 0, ion: 0, missile: 0, kinetic: 0, shield: 0, armor: 0, hull: 0, attack: 0, defense: 0 },
    },
  );

  assert.equal(laserVsMissile.battleSummary.winner, 'attacker');
  assert.equal(plasmaVsLaser.battleSummary.winner, 'attacker');
});

test('recycleDebris converts debris according to material type', () => {
  const recovered = recycleDebris({
    metal: 100,
    crystal: 80,
    deuterium: 60,
  });

  assert.equal(recovered.metal, 80);
  assert.equal(recovered.crystal, 64);
  assert.equal(recovered.deuterium, 48);
});
