import { randomUUID } from 'node:crypto';

import { databaseReady, pool } from '../config/database.js';
import { createInitialPlanetForPlayer, gameStore } from '../data/store.js';
import type { Planet, Player } from '../types.js';

const normalizePlayer = (row: any): Player => ({
  id: row.id,
  username: row.username,
  email: row.email,
  passwordHash: row.password_hash ?? row.passwordHash,
  createdAt: row.created_at ?? row.createdAt,
});

const normalizePlanet = (row: any): Planet => ({
  id: row.id,
  name: row.name,
  ownerId: row.owner_id ?? row.ownerId,
  coordinate: {
    x: Number(row.coordinate_x ?? row.coordinate?.x ?? 1),
    y: Number(row.coordinate_y ?? row.coordinate?.y ?? 1),
  },
  resources: {
    metal: Number(row.metal ?? 0),
    crystal: Number(row.crystal ?? 0),
    deuterium: Number(row.deuterium ?? 0),
    energy: Number(row.energy ?? 0),
  },
  production: {
    metal: Number(row.metal_prod ?? row.production?.metal ?? 0),
    crystal: Number(row.crystal_prod ?? row.production?.crystal ?? 0),
    deuterium: Number(row.deuterium_prod ?? row.production?.deuterium ?? 0),
    energy: Number(row.energy_prod ?? row.production?.energy ?? 0),
  },
  lastUpdatedAt: row.last_updated_at ?? row.lastUpdatedAt ?? new Date().toISOString(),
});

export async function findPlayerByEmail(email: string): Promise<Player | null> {
  if (!databaseReady) {
    return gameStore.players.find((player) => player.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  const result = await pool.query(
    `SELECT id, username, email, password_hash, created_at
     FROM players
     WHERE lower(email) = lower($1)
     LIMIT 1;`,
    [email],
  );

  return result.rowCount ? normalizePlayer(result.rows[0]) : null;
}

export async function findPlayerById(id: string): Promise<Player | null> {
  if (!databaseReady) {
    return gameStore.players.find((player) => player.id === id) ?? null;
  }

  const result = await pool.query(
    `SELECT id, username, email, password_hash, created_at
     FROM players
     WHERE id = $1
     LIMIT 1;`,
    [id],
  );

  return result.rowCount ? normalizePlayer(result.rows[0]) : null;
}

export async function createPlayerAccount(username: string, email: string, passwordHash: string) {
  if (!databaseReady) {
    const player: Player = {
      id: randomUUID(),
      username,
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    gameStore.players.push(player);
    const planet = createInitialPlanetForPlayer(player.id);

    return { player, planet };
  }

  const result = await pool.query(
    `INSERT INTO players (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, password_hash, created_at;`,
    [username, email.toLowerCase(), passwordHash],
  );

  const player = normalizePlayer(result.rows[0]);
  const planet = await createPlanetForPlayer(player.id);

  return { player, planet };
}

export async function createPlanetForPlayer(playerId: string): Promise<Planet> {
  if (!databaseReady) {
    return createInitialPlanetForPlayer(playerId);
  }

  const result = await pool.query(
    `INSERT INTO planets (owner_id, name, coordinate_x, coordinate_y, metal, crystal, deuterium, energy, metal_prod, crystal_prod, deuterium_prod, energy_prod, last_updated_at)
     VALUES ($1, 'Aster Prime', 1, 1, 500, 300, 100, 200, 30, 20, 10, 15, NOW())
     RETURNING *;`,
    [playerId],
  );

  return normalizePlanet(result.rows[0]);
}

export async function getPlanetsByOwner(ownerId: string): Promise<Planet[]> {
  if (!databaseReady) {
    return gameStore.planets.filter((planet) => planet.ownerId === ownerId);
  }

  const result = await pool.query(
    `SELECT * FROM planets WHERE owner_id = $1 ORDER BY created_at ASC;`,
    [ownerId],
  );

  return result.rows.map(normalizePlanet);
}

export async function getPlanetByOwner(ownerId: string): Promise<Planet | null> {
  if (!databaseReady) {
    return gameStore.planets.find((planet) => planet.ownerId === ownerId) ?? null;
  }

  const result = await pool.query(
    `SELECT * FROM planets WHERE owner_id = $1 ORDER BY created_at ASC LIMIT 1;`,
    [ownerId],
  );

  return result.rowCount ? normalizePlanet(result.rows[0]) : null;
}

export async function updatePlanetState(planet: Planet): Promise<Planet> {
  if (!databaseReady) {
    const index = gameStore.planets.findIndex((candidate) => candidate.id === planet.id);
    if (index >= 0) {
      gameStore.planets[index] = planet;
    }
    return planet;
  }

  const result = await pool.query(
    `UPDATE planets
     SET metal = $1,
         crystal = $2,
         deuterium = $3,
         energy = $4,
         metal_prod = $5,
         crystal_prod = $6,
         deuterium_prod = $7,
         energy_prod = $8,
         last_updated_at = NOW()
     WHERE id = $9
     RETURNING *;`,
    [
      planet.resources.metal,
      planet.resources.crystal,
      planet.resources.deuterium,
      planet.resources.energy,
      planet.production.metal,
      planet.production.crystal,
      planet.production.deuterium,
      planet.production.energy,
      planet.id,
    ],
  );

  return normalizePlanet(result.rows[0] ?? planet);
}
