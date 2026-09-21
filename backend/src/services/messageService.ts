import { randomUUID } from 'node:crypto';

export type MessageType = 'info' | 'battle' | 'mission' | 'trade' | 'research' | 'construction' | 'alert';

export interface Message {
  id: string;
  playerId: string;
  type: MessageType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  sequence: number;
  metadata?: Record<string, unknown>;
}

const messages: Message[] = [];
let sequenceCounter = 0;

export function createMessage(
  playerId: string,
  type: MessageType,
  title: string,
  body: string,
  metadata?: Record<string, unknown>,
): Message {
  const message: Message = {
    id: randomUUID(),
    playerId,
    type,
    title,
    body,
    read: false,
    createdAt: new Date().toISOString(),
    sequence: sequenceCounter++,
    metadata,
  };

  messages.push(message);
  return message;
}

export function getMessagesForPlayer(playerId: string, unreadOnly = false): Message[] {
  return messages
    .filter((message) => message.playerId === playerId)
    .filter((message) => !unreadOnly || !message.read)
    .sort((a, b) => b.sequence - a.sequence);
}

export function getUnreadCount(playerId: string): number {
  return messages.filter((message) => message.playerId === playerId && !message.read).length;
}

export function markAsRead(messageId: string, playerId: string): Message {
  const message = messages.find(
    (candidate) => candidate.id === messageId && candidate.playerId === playerId,
  );

  if (!message) {
    throw new Error('message not found');
  }

  message.read = true;
  return message;
}

export function markAllAsRead(playerId: string): number {
  let count = 0;
  for (const message of messages) {
    if (message.playerId === playerId && !message.read) {
      message.read = true;
      count++;
    }
  }
  return count;
}

export function deleteMessage(messageId: string, playerId: string): void {
  const index = messages.findIndex(
    (candidate) => candidate.id === messageId && candidate.playerId === playerId,
  );

  if (index < 0) {
    throw new Error('message not found');
  }

  messages.splice(index, 1);
}
