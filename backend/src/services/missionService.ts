import { gameStore } from '../data/store.js';
import { resolveBattle } from './combatService.js';
import type { Planet } from '../types.js';

export interface MissionArrivalResult {
  missionId: string;
  missionType: string;
  outcome: string;
  loot?: { metal: number; crystal: number; deuterium: number };
  battle?: ReturnType<typeof resolveBattle>;
}

export function processArrivedMissions(playerId: string): MissionArrivalResult[] {
  const now = Date.now();
  const results: MissionArrivalResult[] = [];

  const arrived = gameStore.missions.filter(
    (mission) =>
      mission.ownerId === playerId &&
      mission.status === 'in_transit' &&
      new Date(mission.arrivesAt).getTime() <= now,
  );

  for (const mission of arrived) {
    mission.status = 'arrived';

    const originPlanet = gameStore.planets.find((planet) => planet.id === mission.originPlanetId);
    const targetPlanet = gameStore.planets.find((planet) => planet.id === mission.targetPlanetId);

    if (!targetPlanet) {
      results.push({ missionId: mission.id, missionType: mission.missionType, outcome: 'target_lost' });
      continue;
    }

    if (mission.missionType === 'transport') {
      // Deliver a basic cargo of resources to the target.
      const loot = { metal: 500, crystal: 300, deuterium: 100 };
      const updatedTarget: Planet = {
        ...targetPlanet,
        resources: {
          metal: targetPlanet.resources.metal + loot.metal,
          crystal: targetPlanet.resources.crystal + loot.crystal,
          deuterium: targetPlanet.resources.deuterium + loot.deuterium,
          energy: targetPlanet.resources.energy,
        },
      };
      const index = gameStore.planets.findIndex((planet) => planet.id === targetPlanet.id);
      gameStore.planets[index] = updatedTarget;

      results.push({ missionId: mission.id, missionType: mission.missionType, outcome: 'delivered', loot });
      continue;
    }

    if (mission.missionType === 'attack') {
      const attackerFleet = {
        ships: [
          {
            type: 'interceptor',
            weaponType: 'laser' as const,
            count: mission.quantity,
            attack: 120,
            shield: 40,
            armor: 300,
          },
        ],
        defenses: [],
        techs: {
          laser: 1,
          plasma: 0,
          ion: 0,
          missile: 0,
          kinetic: 0,
          shield: 0,
          armor: 0,
          hull: 0,
          attack: 0,
          defense: 0,
        },
      };

      const defenderFleet = {
        ships: [],
        defenses: [
          {
            type: 'rocket_launcher',
            weaponType: 'missile' as const,
            count: 2,
            attack: 80,
            shield: 20,
            armor: 200,
          },
        ],
        techs: attackerFleet.techs,
      };

      const battle = resolveBattle(attackerFleet, defenderFleet);

      // If attacker wins, loot a portion of the target's resources.
      let loot;
      if (battle.battleSummary.winner === 'attacker') {
        loot = {
          metal: Math.floor(targetPlanet.resources.metal * 0.3),
          crystal: Math.floor(targetPlanet.resources.crystal * 0.3),
          deuterium: Math.floor(targetPlanet.resources.deuterium * 0.3),
        };

        const updatedTarget: Planet = {
          ...targetPlanet,
          resources: {
            metal: targetPlanet.resources.metal - loot.metal,
            crystal: targetPlanet.resources.crystal - loot.crystal,
            deuterium: targetPlanet.resources.deuterium - loot.deuterium,
            energy: targetPlanet.resources.energy,
          },
        };
        const index = gameStore.planets.findIndex((planet) => planet.id === targetPlanet.id);
        gameStore.planets[index] = updatedTarget;

        if (originPlanet) {
          const updatedOrigin: Planet = {
            ...originPlanet,
            resources: {
              metal: originPlanet.resources.metal + loot.metal,
              crystal: originPlanet.resources.crystal + loot.crystal,
              deuterium: originPlanet.resources.deuterium + loot.deuterium,
              energy: originPlanet.resources.energy,
            },
          };
          const originIndex = gameStore.planets.findIndex((planet) => planet.id === originPlanet.id);
          gameStore.planets[originIndex] = updatedOrigin;
        }
      }

      results.push({
        missionId: mission.id,
        missionType: mission.missionType,
        outcome: battle.battleSummary.winner === 'attacker' ? 'victory' : 'defeat',
        battle,
        loot,
      });
      continue;
    }

    results.push({ missionId: mission.id, missionType: mission.missionType, outcome: 'completed' });
  }

  return results;
}
