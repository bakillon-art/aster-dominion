import cors from 'cors';
import express from 'express';

import { authRouter } from './routes/auth.js';
import { combatRouter } from './routes/combat.js';
import { demoRouter } from './routes/demo.js';
import { fleetRouter } from './routes/fleet.js';
import { healthRouter } from './routes/health.js';
import { playerRouter } from './routes/player.js';
import { researchRouter } from './routes/research.js';

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

  return app;
}
