# Contrato de la primera demo

Este documento define el payload que debe consumir el cliente Unreal desde el backend.

## Endpoint principal

GET /demo/dashboard/:playerId

## Ejemplo de respuesta

```json
{
  "player": {
    "id": "player-demo",
    "username": "demo-player",
    "email": "player-demo@demo.local",
    "createdAt": "2026-09-21T12:00:00.000Z"
  },
  "planet": {
    "id": "planet-player-demo",
    "name": "Aster Prime",
    "ownerId": "player-demo",
    "coordinate": {
      "x": 1,
      "y": 1
    },
    "resources": {
      "metal": 5000,
      "crystal": 3000,
      "deuterium": 1500,
      "energy": 300
    },
    "production": {
      "metal": 30,
      "crystal": 20,
      "deuterium": 10,
      "energy": 15
    },
    "lastUpdatedAt": "2026-09-21T12:00:00.000Z"
  },
  "resources": {
    "metal": 5000,
    "crystal": 3000,
    "deuterium": 1500,
    "energy": 300
  },
  "production": {
    "metal": 30,
    "crystal": 20,
    "deuterium": 10,
    "energy": 15
  },
  "fleetSummary": {
    "totalShips": 0,
    "shipTypes": []
  },
  "economy": {
    "totalResources": 9800,
    "totalProduction": 75
  },
  "status": {
    "phase": "first-demo",
    "online": true,
    "timestamp": "2026-09-21T12:00:00.000Z"
  }
}
```

## Reglas para el cliente

- El HUD debe leer `resources` y `production` para dibujar los números del planeta.
- El panel de flotas debe basarse en `fleetSummary`.
- El estado de la sesión debe leerse en `status`.
- La entidad principal del universo es `planet`.

## Endpoint alternativo

GET /demo/snapshot/:playerId

Devuelve una versión más compacta con `player`, `planet`, `resources`, `production` y `summary`.
