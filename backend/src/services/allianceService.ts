import { randomUUID } from 'node:crypto';

import { gameStore } from '../data/store.js';

export interface Alliance {
  id: string;
  tag: string;
  name: string;
  founderId: string;
  memberIds: string[];
  createdAt: string;
}

const alliances = new Map<string, Alliance>();

export function createAlliance(founderId: string, tag: string, name: string): Alliance {
  const player = gameStore.players.find((candidate) => candidate.id === founderId);

  if (!player) {
    throw new Error('founder player not found');
  }

  if (Array.from(alliances.values()).some((alliance) => alliance.tag === tag.toUpperCase())) {
    throw new Error(`alliance tag ${tag} is already taken`);
  }

  const alliance: Alliance = {
    id: randomUUID(),
    tag: tag.toUpperCase(),
    name,
    founderId,
    memberIds: [founderId],
    createdAt: new Date().toISOString(),
  };

  alliances.set(alliance.id, alliance);
  return alliance;
}

export function getAlliance(allianceId: string): Alliance | undefined {
  return alliances.get(allianceId);
}

export function listAlliances(): Alliance[] {
  return Array.from(alliances.values());
}

export function joinAlliance(allianceId: string, playerId: string): Alliance {
  const alliance = alliances.get(allianceId);

  if (!alliance) {
    throw new Error('alliance not found');
  }

  const player = gameStore.players.find((candidate) => candidate.id === playerId);
  if (!player) {
    throw new Error('player not found');
  }

  if (!alliance.memberIds.includes(playerId)) {
    alliance.memberIds.push(playerId);
  }

  return alliance;
}

export function leaveAlliance(allianceId: string, playerId: string): Alliance {
  const alliance = alliances.get(allianceId);

  if (!alliance) {
    throw new Error('alliance not found');
  }

  if (alliance.founderId === playerId) {
    throw new Error('founder cannot leave their own alliance; disband it instead');
  }

  alliance.memberIds = alliance.memberIds.filter((memberId) => memberId !== playerId);
  return alliance;
}

export function disbandAlliance(allianceId: string, playerId: string): void {
  const alliance = alliances.get(allianceId);

  if (!alliance) {
    throw new Error('alliance not found');
  }

  if (alliance.founderId !== playerId) {
    throw new Error('only the founder can disband the alliance');
  }

  alliances.delete(allianceId);
}

export function getPlayerAlliance(playerId: string): Alliance | null {
  for (const alliance of alliances.values()) {
    if (alliance.memberIds.includes(playerId)) {
      return alliance;
    }
  }
  return null;
}
