# Visión: Vista interior de la nave durante misiones

## Idea
Cuando una flota está de camino a una misión (ataque, transporte, espionaje), el jugador puede "meterse" en la nave insignia y ver el viaje desde dentro:

- Vista del puente o interior de la nave con la tripulación trabajando.
- Ventana al espacio mostrando el viaje en tiempo real.
- HUD de la misión: destino, ETA, tipo de misión.
- Posibilidad de volver a la vista del imperio en cualquier momento.

## Diferencia con OGame
En OGame las flotas son solo un temporizador abstracto. Aquí el viaje es una experiencia visual: ver el interior de la nave, el espacio pasando, y sentir la espera del ataque.

## Encaje técnico (futuro)
- Las misiones ya persisten con `arrivesAt` y `secondsRemaining` en el backend.
- El cliente Unreal puede, al seleccionar una misión activa, cambiar a un mapa/escena "interior de nave" con una cámara distinta.
- La ETA se sigue mostrando desde el backend; al llegar, el resultado se muestra (informe de batalla ya existe como mensaje).

## Estado
Visión registrada. No implementada todavía — requiere assets de interior de nave y una escena dedicada. Prioridad: después de la base visual espacial.
