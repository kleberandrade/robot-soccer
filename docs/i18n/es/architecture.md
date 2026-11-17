# Cómo funciona el servidor de simulación

El motor de pasos fijos está en `packages/engine`, separado de interfaz y base de datos. El servidor valida acciones, avanza un lote limitado y persiste el estado oficial. El navegador muestra ese estado en 3D y en la cámara sintética.

## Estado y revisión

Un checkpoint contiene partido y revisión. Las actualizaciones usan la revisión esperada para evitar sobrescrituras silenciosas. Ante conflicto, el cliente lee el estado reciente y decide de nuevo. PostgreSQL proporciona persistencia; la vista previa local usa el mismo motor sin persistir.

## Lotes limitados

Las funciones HTTP tienen duración limitada. Cada petición hace trabajo acotado, sin bucle infinito ocupando una función. La repetición se divide en segmentos. El tiempo simulado avanza en pasos de 1/60 s, no según los fotogramas del navegador.

## Fronteras

Interfaz, motor, protocolo, base de datos y puente son partes distintas del Turborepo. El navegador nunca debe recibir credenciales de base de datos ni la clave global del operador como configuración pública. Los competidores ejecutan programas localmente y envían comandos, no ejecutables. `docs/adr/0001-server-batches.md` registra la decisión técnica; [las salas privadas](/docs/private-room-design) añaden turnos compartidos.
