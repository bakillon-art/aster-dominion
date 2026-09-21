export type ResourceKey = 'metal' | 'crystal' | 'deuterium' | 'energy';

export interface ResourceState {
  metal: number;
  crystal: number;
  deuterium: number;
  energy: number;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface Planet {
  id: string;
  name: string;
  ownerId: string;
  coordinate: Coordinate;
  resources: ResourceState;
  production: ResourceState;
  lastUpdatedAt: string;
}

export interface Player {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface OfflineProductionResult {
  totalHours: number;
  gained: ResourceState;
  updatedPlanet: Planet;
}
