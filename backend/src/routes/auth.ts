import { createHash } from 'node:crypto';
import { Router } from 'express';

import { createPlayerAccount, findPlayerByEmail, getPlanetByOwner } from '../db/repository.js';

export const authRouter = Router();

const hashPassword = (password: string) => createHash('sha256').update(password).digest('hex');

authRouter.post('/register', async (req, res) => {
  const { username, email, password } = req.body as {
    username?: string;
    email?: string;
    password?: string;
  };

  if (!username || !email || !password) {
    res.status(400).json({ error: 'username, email and password are required' });
    return;
  }

  const normalizedEmail = email.toLowerCase();
  const existingPlayer = await findPlayerByEmail(normalizedEmail);

  if (existingPlayer) {
    res.status(409).json({ error: 'email already registered' });
    return;
  }

  const passwordHash = hashPassword(password);
  const { player, planet } = await createPlayerAccount(username, normalizedEmail, passwordHash);

  res.status(201).json({
    message: 'player registered successfully',
    player: {
      id: player.id,
      username: player.username,
      email: player.email,
    },
    planet,
    token: player.id,
  });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const player = await findPlayerByEmail(email);

  if (!player || player.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: 'invalid credentials' });
    return;
  }

  const planet = await getPlanetByOwner(player.id);

  res.json({
    message: 'login successful',
    player: {
      id: player.id,
      username: player.username,
      email: player.email,
    },
    planet,
    token: player.id,
  });
});
