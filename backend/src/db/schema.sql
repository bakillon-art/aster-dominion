CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  alliance_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  coordinate_x INTEGER NOT NULL DEFAULT 1,
  coordinate_y INTEGER NOT NULL DEFAULT 1,
  galaxy INTEGER NOT NULL DEFAULT 1,
  system INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 1,
  metal INTEGER NOT NULL DEFAULT 500,
  crystal INTEGER NOT NULL DEFAULT 300,
  deuterium INTEGER NOT NULL DEFAULT 100,
  energy INTEGER NOT NULL DEFAULT 200,
  metal_prod INTEGER NOT NULL DEFAULT 30,
  crystal_prod INTEGER NOT NULL DEFAULT 20,
  deuterium_prod INTEGER NOT NULL DEFAULT 10,
  energy_prod INTEGER NOT NULL DEFAULT 15,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planet_buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planet_id UUID NOT NULL REFERENCES planets(id) ON DELETE CASCADE,
  building_type TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (planet_id, building_type)
);

CREATE TABLE IF NOT EXISTS player_technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  tech_type TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (player_id, tech_type)
);

CREATE TABLE IF NOT EXISTS fleets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  origin_planet_id UUID NOT NULL REFERENCES planets(id) ON DELETE CASCADE,
  target_planet_id UUID,
  mission_type TEXT NOT NULL DEFAULT 'idle',
  status TEXT NOT NULL DEFAULT 'idle',
  arrival_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fleet_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id UUID NOT NULL REFERENCES fleets(id) ON DELETE CASCADE,
  ship_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (fleet_id, ship_type)
);

CREATE TABLE IF NOT EXISTS combat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  defender_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  attacker_fleet_id UUID REFERENCES fleets(id) ON DELETE SET NULL,
  defender_fleet_id UUID REFERENCES fleets(id) ON DELETE SET NULL,
  winner TEXT,
  attacker_power INTEGER NOT NULL DEFAULT 0,
  defender_power INTEGER NOT NULL DEFAULT 0,
  debris_metal INTEGER NOT NULL DEFAULT 0,
  debris_crystal INTEGER NOT NULL DEFAULT 0,
  debris_deuterium INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planets_owner_id ON planets(owner_id);
CREATE INDEX IF NOT EXISTS idx_planet_buildings_planet_id ON planet_buildings(planet_id);
CREATE INDEX IF NOT EXISTS idx_player_technologies_player_id ON player_technologies(player_id);
CREATE INDEX IF NOT EXISTS idx_fleets_owner_id ON fleets(owner_id);
CREATE INDEX IF NOT EXISTS idx_fleet_units_fleet_id ON fleet_units(fleet_id);
