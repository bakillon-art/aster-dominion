# Cliente Unreal

Este directorio define la base técnica para el cliente visual del MMO en Unreal Engine 5.

## Objetivo del primer sprint

Crear una demo funcional con:

- pantalla principal del planeta
- HUD de recursos
- producción actual
- panel de flotas no operativas
- estado del sistema y del servidor
- integración con la API del backend

## Arquitectura del cliente

- Capa de datos: modelos serializados desde la API REST
- Capa de presentación: widgets y pantallas del HUD
- Capa de gameplay: cámara, navegación, sistemas planetarios
- Capa de sincronización: polling o WebSocket para estado en tiempo real

## Estructura sugerida del proyecto Unreal

- Source/AsterDominion - código principal del juego
- Source/AsterDominion/Core - lógica base
- Source/AsterDominion/Systems - economía, tecnología, flotas, combate
- Source/AsterDominion/UI - HUD y pantallas
- Content/Maps - mapas y escenarios
- Content/UI - materiales e interfaces

## Contrato de datos para la primera demo

La API del backend ya expone los payloads principales:

- GET /demo/dashboard/:playerId
- GET /demo/snapshot/:playerId
- POST /demo/build
- POST /demo/fleet

Estos datos deben ser la fuente de verdad para el HUD del jugador y la vista del mundo.

## Fases de desarrollo

### Fase 1: demo funcional

- carga de jugador y planeta
- recursos visibles en pantalla
- resumen de producción
- estado del servidor y del sistema
- flujo básico de construcción y flotas

### Fase 2: gameplay básico

- navegación por sistema solar
- construcción de edificios
- creación de flotas
- misión simple de movimiento

### Fase 3: MMO real

- sincronización con backend autoritativo
- eventos en tiempo real
- combate, viajes y producción persistentes
- universo compartido multi-jugador

## Estado actual

El backend ya está funcional para la primera demo. El cliente Unreal debe consumir esta API y representarla visualmente sin inventar lógica de juego en la capa cliente.