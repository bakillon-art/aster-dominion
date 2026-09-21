import { createServer, type Server as HttpServer } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';

import { publishGameEvent } from '../config/redis.js';

export interface RealtimeMessage {
  type: string;
  payload?: unknown;
  playerId?: string;
  timestamp: string;
}

export class RealtimeHub {
  private readonly server: WebSocketServer;
  private readonly clients = new Map<string, Set<WebSocket>>();

  constructor(httpServer: HttpServer) {
    this.server = new WebSocketServer({ server: httpServer });
    this.setup();
  }

  private setup() {
    this.server.on('connection', (socket) => {
      socket.send(
        JSON.stringify({
          type: 'welcome',
          timestamp: new Date().toISOString(),
        }),
      );

      socket.on('message', (raw) => {
        try {
          const message = JSON.parse(raw.toString()) as { type?: string; playerId?: string };
          if (message.playerId) {
            this.registerSocket(message.playerId, socket);
          }

          if (message.type) {
            this.broadcast({
              type: message.type,
              playerId: message.playerId,
              timestamp: new Date().toISOString(),
              payload: { received: true },
            });
          }
        } catch {
          socket.send(
            JSON.stringify({
              type: 'error',
              timestamp: new Date().toISOString(),
              payload: { message: 'Invalid realtime payload.' },
            }),
          );
        }
      });
    });
  }

  private registerSocket(playerId: string, socket: WebSocket) {
    const existing = this.clients.get(playerId) ?? new Set<WebSocket>();
    existing.add(socket);
    this.clients.set(playerId, existing);
  }

  public broadcast(message: RealtimeMessage) {
    const serialized = JSON.stringify(message);

    for (const socket of this.server.clients) {
      if (socket.readyState === 1) {
        socket.send(serialized);
      }
    }

    void publishGameEvent('aster-dominion-events', message);
  }

  public sendToPlayer(playerId: string, message: RealtimeMessage) {
    const sockets = this.clients.get(playerId) ?? new Set<WebSocket>();
    const serialized = JSON.stringify(message);

    for (const socket of sockets) {
      if (socket.readyState === 1) {
        socket.send(serialized);
      }
    }

    void publishGameEvent(`aster-dominion-player-${playerId}`, message);
  }

  public emit(type: string, payload: unknown, playerId?: string) {
    const message: RealtimeMessage = {
      type,
      payload,
      playerId,
      timestamp: new Date().toISOString(),
    };

    if (playerId) {
      this.sendToPlayer(playerId, message);
      return;
    }

    this.broadcast(message);
  }
}
