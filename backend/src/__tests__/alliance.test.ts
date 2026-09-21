import test from 'node:test';
import assert from 'node:assert/strict';

import { gameStore } from '../data/store.js';
import {
  createAlliance,
  disbandAlliance,
  getPlayerAlliance,
  joinAlliance,
  leaveAlliance,
  listAlliances,
} from '../services/allianceService.js';
import type { Player } from '../types.js';

function makePlayer(id: string, username: string): Player {
  return {
    id,
    username,
    email: `${id}@test.local`,
    passwordHash: 'hash',
    createdAt: new Date().toISOString(),
  };
}

test('createAlliance creates an alliance with the founder as member', () => {
  const founder = makePlayer('alliance-founder-1', 'founder1');
  gameStore.players.push(founder);

  const alliance = createAlliance(founder.id, 'ADOM', 'Aster Dominion');

  assert.equal(alliance.tag, 'ADOM');
  assert.equal(alliance.founderId, founder.id);
  assert.deepEqual(alliance.memberIds, [founder.id]);
});

test('createAlliance rejects duplicate tags', () => {
  const founder = makePlayer('alliance-founder-2', 'founder2');
  gameStore.players.push(founder);

  assert.throws(() => createAlliance(founder.id, 'ADOM', 'Duplicate Tag'));
});

test('joinAlliance adds a member', () => {
  const member = makePlayer('alliance-member-1', 'member1');
  gameStore.players.push(member);

  const alliance = listAlliances().find((candidate) => candidate.tag === 'ADOM');
  assert.ok(alliance);

  const updated = joinAlliance(alliance!.id, member.id);
  assert.ok(updated.memberIds.includes(member.id));
});

test('getPlayerAlliance returns the alliance for a member', () => {
  const alliance = getPlayerAlliance('alliance-member-1');
  assert.ok(alliance);
  assert.equal(alliance?.tag, 'ADOM');
});

test('leaveAlliance removes a member', () => {
  const alliance = listAlliances().find((candidate) => candidate.tag === 'ADOM');
  assert.ok(alliance);

  const updated = leaveAlliance(alliance!.id, 'alliance-member-1');
  assert.equal(updated.memberIds.includes('alliance-member-1'), false);
});

test('founder cannot leave their own alliance', () => {
  const alliance = listAlliances().find((candidate) => candidate.tag === 'ADOM');
  assert.ok(alliance);
  assert.throws(() => leaveAlliance(alliance!.id, alliance!.founderId));
});

test('disbandAlliance removes the alliance when called by founder', () => {
  const alliance = listAlliances().find((candidate) => candidate.tag === 'ADOM');
  assert.ok(alliance);

  disbandAlliance(alliance!.id, alliance!.founderId);
  assert.equal(getPlayerAlliance(alliance!.founderId), null);
});
