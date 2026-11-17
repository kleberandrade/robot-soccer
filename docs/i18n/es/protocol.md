# API, coordenadas y radio

El servidor mantiene el estado oficial. Navegador y equipos reciben observaciones y no pueden reemplazar el estado con una copia arbitraria. La simulación usa metros, segundos y velocidad lineal de ruedas en m/s. La orientación interna usa radianes. Los identificadores de protocolo nunca se traducen.

## Comandos de equipo

```json
[{"id":"blue-0","left":0.2,"right":0.2}]
```

Cada equipo controla hasta tres robots propios, una vez por ID. Valores finitos entre -0.6 y 0.6 m/s. Las observaciones son copias independientes. La validación rechaza otro equipo, IDs duplicados y valores inválidos.

## Partidos y salas

`/api/matches` ofrece partidos persistidos y repetición según el contrato del repositorio. Las salas usan `/api/rooms`: crear requiere la clave del operador; reclamar equipo usa su invitación y una clave generada por el participante. Lectura y comandos requieren credencial privada. No hay listado público de salas.

```http
Authorization: Bearer YOUR_TEAM_KEY
Content-Type: application/json
```

El cliente lee el estado y envía `turn` con comandos a `/api/rooms/{id}/commands`. Cada turno requiere ambos equipos y aplica hasta seis pasos de 60 Hz. Un conflicto de revisión o turno devuelve 409: vuelve a leer antes de calcular comandos. Consulta el contrato ejecutable en `examples/remote-team.ts` y [la guía remota](/docs/remote-competition).

## La radio física es otro protocolo

El puente supervisado usa HMAC por robot, secuencia, identidad, límites y plazo máximo de 250 ms. La clave de sala no autentica motores físicos. El puente predeterminado no activa hardware. El ejecutor acelerado no mantiene plazos de radio y no debe controlar hardware.

La confirmación del firmware informa del comando aplicado, no de velocidad medida: no hay encoder, PID ni odometría. Consulta `firmware/include/protocol.h` y `docs/PROTOCOL.md` para el formato binario exacto; campos, bytes y código permanecen originales.
