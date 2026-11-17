# Tu primer partido y dos equipos de ejemplo

Puedes empezar sin robots físicos, cámara ni credenciales de base de datos. La vista previa local usa el mismo motor y las mismas estrategias que los partidos en el servidor.

## 1. Abre el laboratorio

Desde la raíz del monorepo:

```sh
npm ci
npm run dev
```

Abre [el laboratorio](/lab) y pulsa **Iniciar partido**. Los seis robots juegan de forma autónoma. Observa la escena 3D y la proyección de cámara al mismo tiempo. Arrastrar y ampliar cambia solo la visualización. Tras una falta, lee el reinicio y usa **Pitar / continuar**. Es normal que el reloj se detenga antes del silbato.

## 2. Conoce Koativa y Circuit

**Koativa**, en `packages/engine/src/teams/koativa.ts`, usa atacante, defensor de cobertura y portero. Su identificador es `balanced`. **Circuit**, en `packages/engine/src/teams/circuit.ts`, usa atacante y apoyo fuera de las áreas de portería. Su identificador es `press`. Ambos usan `navigation.ts` para convertir objetivos en velocidades de ruedas.

```sh
npm run simulate -- --blue koativa --yellow circuit --half 10
npm run simulate -- --blue circuit --yellow koativa --half 10
```

El ejecutor avanza lo más rápido posible y pita en los reinicios. Compara marcador, faltas, segundos y hash final. Los mismos argumentos en el mismo motor producen el mismo resultado. Intercambiar lados ayuda a detectar sesgos. Un empate es normal: son estrategias didácticas. No conectes este ejecutor acelerado a motores reales.

## 3. Entiende un turno

```ts
import { createMatch, observe, referee, step, parseCommands } from "@robot-soccer/engine";
import { koativa, circuit } from "@robot-soccer/engine/teams";
let match = referee(createMatch(), "start");
const blue = parseCommands("blue", koativa(observe(match, "blue")));
const yellow = parseCommands("yellow", circuit(observe(match, "yellow")));
match = step(match, [...blue, ...yellow]);
```

Cada observación es una copia independiente. Un equipo solo controla sus IDs, sin duplicados, números no finitos ni velocidades fuera de ±0,6 m/s. `left` y `right` son velocidades lineales en metros por segundo, no PWM ni ángulos.

## 4. Cambia una cosa cada vez

Modifica un objetivo o ganancia y compara los mismos indicadores. No cambies dimensiones, velocidad y política a la vez: sería difícil explicar el resultado. Para competir desde dos ordenadores, sigue [la guía remota](/docs/remote-competition).
