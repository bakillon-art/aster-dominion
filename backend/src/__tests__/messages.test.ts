import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createMessage,
  deleteMessage,
  getMessagesForPlayer,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from '../services/messageService.js';

test('createMessage stores an unread message', () => {
  const message = createMessage('player-msg-1', 'info', 'Test', 'Body');

  assert.equal(message.read, false);
  assert.equal(message.type, 'info');
  assert.equal(getUnreadCount('player-msg-1') >= 1, true);
});

test('getMessagesForPlayer returns newest first', () => {
  createMessage('player-msg-2', 'info', 'First', 'A');
  createMessage('player-msg-2', 'battle', 'Second', 'B');

  const list = getMessagesForPlayer('player-msg-2');
  assert.ok(list.length >= 2);
  assert.equal(list[0].title, 'Second');
});

test('getMessagesForPlayer with unreadOnly filters read messages', () => {
  const player = 'player-msg-3';
  const msg = createMessage(player, 'info', 'ToRead', 'X');
  markAsRead(msg.id, player);
  createMessage(player, 'info', 'Unread', 'Y');

  const unread = getMessagesForPlayer(player, true);
  assert.equal(unread.every((message) => !message.read), true);
});

test('markAllAsRead clears the unread count', () => {
  const player = 'player-msg-4';
  createMessage(player, 'info', 'A', 'a');
  createMessage(player, 'info', 'B', 'b');

  const count = markAllAsRead(player);
  assert.ok(count >= 2);
  assert.equal(getUnreadCount(player), 0);
});

test('deleteMessage removes the message', () => {
  const player = 'player-msg-5';
  const msg = createMessage(player, 'info', 'ToDelete', 'X');

  deleteMessage(msg.id, player);
  assert.equal(getMessagesForPlayer(player).some((message) => message.id === msg.id), false);
});

test('markAsRead throws for unknown message', () => {
  assert.throws(() => markAsRead('nonexistent', 'player-msg-6'));
});
