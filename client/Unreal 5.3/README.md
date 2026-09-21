# Unreal Client — Aster Dominion

Este directorio es la base real del cliente 3D para el juego.

## Objetivo del primer cliente

Crear la primera pantalla jugable del juego en Unreal Engine 5, con:

- planeta principal en 3D
- HUD de recursos
- panel de producción
- resumen de flotas
- conexión a la API del backend

## Arquitectura de cliente

- `Source/AsterDominion` — código base del proyecto
- `Content/Maps` — mapas del primer planeta y sistema solar
- `Content/UI` — HUD, paneles y widgets
- `Content/Blueprints` — lógica visual sin C++ donde haga falta

## Flujo de datos

1. El cliente llama a `/demo/dashboard/:playerId`
2. Se parsea el JSON en estructuras Unreal
3. Se actualiza el HUD, el planeta y el estado del imperio
4. El backend sigue siendo la fuente de verdad

## Estructura recomendada

- Core: GameMode, GameInstance, PlayerState
- Systems: PlanetState, EconomySystem, FleetSystem, ApiClient
- UI: HUD, ResourceWidget, FleetWidget, PlanetOverlay

## Orden de implementación

1. GameInstance + ApiClient
2. PlanetState + Resource model
3. HUD base
4. vista de planeta 3D
5. flotas y sistema de combate
6. sincronización real con backend

## Contrato del backend a consumir

La llamada principal es:

- GET /demo/dashboard/:playerId

Y el payload esperado es:

```json
{
  "player": { "id": "player-demo", "username": "demo-player" },
  "planet": { "name": "Aster Prime", "resources": { "metal": 5000, "crystal": 3000, "deuterium": 1500, "energy": 300 } },
  "resources": { "metal": 5000, "crystal": 3000, "deuterium": 1500, "energy": 300 },
  "production": { "metal": 30, "crystal": 20, "deuterium": 10, "energy": 15 },
  "fleetSummary": { "totalShips": 0, "shipTypes": [] },
  "economy": { "totalResources": 9800, "totalProduction": 75 },
  "status": { "phase": "first-demo", "online": true }
}
```

## Siguiente bloque real

No más web. El siguiente paso real es construir el cliente Unreal con:

- `GameInstance` para llamadas HTTP
- `PlayerState` para el HUD
- `PlanetState` para el mundo
- `HUD` para mostrar recursos y flotas

## Cómo probar la beta visual (paso a paso)

1. Instala Unreal Engine 5.3 desde el Epic Games Launcher (pestaña Unreal Engine → Biblioteca).
2. Arranca el backend en una terminal:
   - `cd c:/Users/Isaac/Desktop/aster-dominion/backend`
   - `npx tsx src/server.ts`
3. Abre `AsterDominion.uproject` con Unreal 5.3.
4. Si pide recompilar el módulo, acepta (necesita Visual Studio 2022 con "Game development with C++").
5. Pulsa Play en el editor.
6. Deberías ver: planeta 3D con cámara orbital + HUD con recursos (metal, cristal, deuterio, energía), producción, naves y fase.

Los datos de la HUD salen de `GET http://localhost:3001/demo/dashboard/player-demo`. Si no hay backend, la HUD quedará vacía pero la escena debe verse igualmente.
