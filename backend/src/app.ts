import cors from 'cors';
import express from 'express';

import { allianceRouter } from './routes/alliance.js';
import { authRouter } from './routes/auth.js';
import { combatRouter } from './routes/combat.js';
import { defenseRouter } from './routes/defense.js';
import { demoRouter } from './routes/demo.js';
import { espionageRouter } from './routes/espionage.js';
import { fleetRouter } from './routes/fleet.js';
import { galaxyRouter } from './routes/galaxy.js';
import { healthRouter } from './routes/health.js';
import { messageRouter } from './routes/messages.js';
import { moonRouter } from './routes/moon.js';
import { playerRouter } from './routes/player.js';
import { researchRouter } from './routes/research.js';
import { tradeRouter } from './routes/trade.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.json({ name: 'Aster Dominion Backend', status: 'running' });
  });

  app.use('/health', healthRouter);
  app.use('/auth', authRouter);
  app.use('/players', playerRouter);
  app.use('/demo', demoRouter);
  app.use('/fleets', fleetRouter);
  app.use('/combat', combatRouter);
  app.use('/research', researchRouter);
  app.use('/defenses', defenseRouter);
  app.use('/galaxy', galaxyRouter);
  app.use('/trade', tradeRouter);
  app.use('/alliances', allianceRouter);
  app.use('/messages', messageRouter);
  app.use('/espionage', espionageRouter);
  app.use('/moons', moonRouter);

  return app;
}
