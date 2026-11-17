# Conecta tu código a una competición privada

Cada participante ejecuta su programa en su ordenador. El servidor guarda el partido oficial y sincroniza ambos lados. No se envía código para ejecutarlo en el servidor.

## 1. Crea y distribuye accesos

El anfitrión abre [Competir](/compete), crea sala con la clave del operador y guarda ID y conexión antes de salir: las claves viven solo en la memoria del navegador. Azul y amarillo tienen invitaciones distintas; el espectador tiene otra clave. Comparte cada credencial solo con su destinatario.

## 2. Entra con tu equipo

Introduce invitación y nombre. El navegador genera una clave privada del participante y reclama ese lado. Otra persona no puede reutilizar la invitación; repetir con la misma clave permite recuperar una respuesta perdida.

Guarda la conexión descargada como `.env.room-blue` o `.env.room-yellow` en tu proyecto local. Contiene `BASE_URL`, `ROOM_ID` y `ROOM_KEY`. Si falla la descarga, copia la configuración mostrada. No envíes el archivo a Git, chats públicos, incidencias ni capturas.

## 3. Ejecuta ejemplos en ordenadores distintos

```sh
node --env-file=.env.room-blue --import tsx examples/remote-team.ts koativa
```

En el otro ordenador:

```sh
node --env-file=.env.room-yellow --import tsx examples/remote-team.ts circuit
```

Cualquier lado puede elegir cualquiera de las políticas. El anfitrión usa **Pitar / continuar** cuando ambos estén listos. Añade `--turns 20` para un ejercicio corto: sin interrupciones, veinte turnos por cliente avanzan 120 pasos, dos segundos simulados. Ctrl+C detiene el cliente.

## 4. Sincronización

Ambos leen el mismo `turn`. El primer envío queda pendiente, sin movimiento. El segundo completa el turno y el servidor aplica ambos hasta seis pasos de 1/60 s, deteniéndose antes si pita el árbitro. Luego guarda un estado y avanza el turno. El oponente no ve comandos pendientes. La comparación atómica de revisión concilia concurrencia; turno antiguo o duplicado devuelve 409.

La red lenta ralentiza el juego sin dar turnos extra al cliente rápido. Si uno sale, el partido espera; no repite indefinidamente comandos anteriores. No es un servicio de tiempo real de reloj de pared.

## 5. Arbitraje y reconexión

Solo el anfitrión pita, pausa, reinicia y sanciona. Esas acciones invalidan comandos pendientes. Su panel abierto avanza descanso y tiempos muertos; el juego activo depende de los dos programas. Reconecta con ID y clave guardada. Las salas caducan en 24 horas. Las claves de sala nunca sustituyen HMAC de robots físicos.
