import { createServer } from 'node:http';

import { createApp } from './app.js';
import { initializeDatabase } from './config/database.js';
import { connectRedis } from './config/redis.js';
import { RealtimeHub } from './services/realtime.js';

const port = Number(process.env.PORT ?? 3001);
const app = createApp();
const server = createServer(app);
const realtime = new RealtimeHub(server);

async function startServer() {
  const ready = await initializeDatabase();
  const redisReady = await connectRedis();

  if (ready) {
    console.log('Database is ready for persistence.');
  } else {
    console.log('Database unavailable; demo mode remains active in memory.');
  }

  if (redisReady) {
    console.log('Realtime bus is ready for live game events.');
  } else {
    console.log('Redis unavailable; realtime events will stay local to the process.');
  }

  server.listen(port, () => {
    console.log(`Aster Dominion backend listening on port ${port}`);
    realtime.emit('server:ready', {
      status: 'online',
      database: ready,
      redis: redisReady,
      port,
    });
  });
}

void startServer();
