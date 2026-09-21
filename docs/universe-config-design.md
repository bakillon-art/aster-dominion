# Diseño: Universos Configurables

## Objetivo
Soportar múltiples universos de juego con diferentes rates y características, configurables desde el servidor. Ejemplos: universo "flotero" (flotas rápidas, saqueo alto), universo "minero" (minas potentes, construcción rápida).

## Estado actual
Todos los números del juego ya están centralizados en catálogos del backend:

- Costes de edificios: `backend/src/services/demoService.ts` (`buildingCosts`)
- Velocidades de naves y motores: `backend/src/services/fleetService.ts` (`shipSpeeds`, `engineMultipliers`)
- Counters de combate y % de escombros/saqueo: `backend/src/services/combatService.ts`
- Costes de investigación: `backend/src/services/researchService.ts` (`technologyCatalog`)
- Costes de defensas: `backend/src/services/defenseService.ts` (`defenseCatalog`)
- Tiempos de construcción: `backend/src/services/buildQueueService.ts`

## Diseño propuesto (futuro)

### UniverseConfig
```json
{
  "id": "universe-fleet-1",
  "name": "Universo Flotero",
  "speedFactor": 2.0,
  "fleetSpeedFactor": 3.0,
  "economyFactor": 1.0,
  "researchFactor": 1.5,
  "buildFactor": 2.0,
  "lootPercentage": 0.5,
  "debrisPercentage": 0.6
}
```

### Reglas
- Cada universo tiene un `UniverseConfig` con multiplicadores.
- El backend aplica los multiplicadores sobre los catálogos base al calcular costes, tiempos y resultados.
- Las rutas llevan el universo en la URL (`/universe/:universeId/demo/...`) o en el payload.
- Los jugadores pertenecen a un universo; sus planetas, flotas y misiones viven dentro de ese universo.

### Cuándo implementarlo
No ahora. Ahora hay un único universo implícito y todo funciona. Implementar la capa multi-universo antes de tiempo añade complejidad a cada endpoint sin beneficio hasta que haya jugadores reales. Se añade como refactor acotado cuando el juego esté más completo (persistencia real, más sistemas), porque los números ya están centralizados y el cambio será mecánico.
