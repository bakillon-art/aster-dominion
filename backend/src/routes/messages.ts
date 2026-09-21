import { Router } from 'express';

import {
  createMessage,
  deleteMessage,
  getMessagesForPlayer,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from '../services/messageService.js';

export const messageRouter = Router();

messageRouter.get('/:playerId', (req, res) => {
  const { playerId } = req.params;
  const unreadOnly = req.query.unread === 'true';

  res.json({
    messages: getMessagesForPlayer(playerId, unreadOnly),
    unreadCount: getUnreadCount(playerId),
  });
});

messageRouter.post('/:playerId', (req, res) => {
  const { playerId } = req.params;
  const { type, title, body, metadata } = req.body as {
    type?: string;
    title?: string;
    body?: string;
    metadata?: Record<string, unknown>;
  };

  if (!title || !body) {
    res.status(400).json({ error: 'title and body are required' });
    return;
  }

  const message = createMessage(playerId, (type as never) ?? 'info', title, body, metadata);
  res.status(201).json({ message });
});

messageRouter.post('/:playerId/read-all', (req, res) => {
  const { playerId } = req.params;
  const count = markAllAsRead(playerId);
  res.json({ markedRead: count });
});

messageRouter.post('/:playerId/read/:messageId', (req, res) => {
  try {
    const message = markAsRead(req.params.messageId, req.params.playerId);
    res.json({ message });
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'not found' });
  }
});

messageRouter.delete('/:playerId/:messageId', (req, res) => {
  try {
    deleteMessage(req.params.messageId, req.params.playerId);
    res.json({ message: 'deleted' });
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'not found' });
  }
});
