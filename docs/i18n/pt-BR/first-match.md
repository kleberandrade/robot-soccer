# Sua primeira partida e dois times de exemplo

Você pode começar sem robôs físicos, câmera ou credenciais de banco. A prévia local usa o mesmo motor de simulação e as mesmas estratégias das partidas no servidor.

## 1. Abra o laboratório

Na raiz do monorepo:

```sh
npm ci
npm run dev
```

Abra [o laboratório](/lab) e clique em **Iniciar partida**. As seis máquinas jogam sozinhas. Veja a cena 3D e a projeção da câmera ao mesmo tempo. Arrastar e ampliar a cena muda apenas a visualização. Após uma falta, leia o reinício e use **Apitar / continuar**. O relógio parado antes do apito é esperado.

## 2. Conheça Koativa e Circuit

**Koativa**, em `packages/engine/src/teams/koativa.ts`, usa atacante, defensor de cobertura e goleiro. Seu identificador é `balanced`. **Circuit**, em `packages/engine/src/teams/circuit.ts`, usa atacante e apoio fora das áreas de gol. Seu identificador é `press`. Os dois usam `navigation.ts` para converter alvos em velocidades das rodas.

```sh
npm run simulate -- --blue koativa --yellow circuit --half 10
npm run simulate -- --blue circuit --yellow koativa --half 10
```

O executor avança o mais rápido possível e apita nos reinícios. Compare placar, faltas, segundos e hash final. Os mesmos argumentos no mesmo motor produzem o mesmo resultado. Trocar os lados ajuda a perceber vieses. Empatar é normal: são estratégias didáticas. Não conecte esse executor acelerado a motores reais.

## 3. Entenda um turno

```ts
import { createMatch, observe, referee, step, parseCommands } from "@robot-soccer/engine";
import { koativa, circuit } from "@robot-soccer/engine/teams";
let match = referee(createMatch(), "start");
const blue = parseCommands("blue", koativa(observe(match, "blue")));
const yellow = parseCommands("yellow", circuit(observe(match, "yellow")));
match = step(match, [...blue, ...yellow]);
```

Cada observação é uma cópia independente. O time só comanda seus próprios IDs, sem repetições, números não finitos ou velocidades fora de ±0,6 m/s. `left` e `right` são velocidades lineares em metros por segundo, não PWM nem ângulos.

## 4. Experimente uma mudança por vez

Altere um alvo ou ganho na estratégia, execute novamente e compare os mesmos indicadores. Não mude dimensões, velocidade e política ao mesmo tempo: ficaria difícil explicar a diferença. Para competir com código rodando em duas máquinas, siga [o guia remoto](/docs/remote-competition).
