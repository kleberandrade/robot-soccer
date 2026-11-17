# API, coordenadas e rádio

O servidor mantém o estado oficial. O navegador e os times recebem observações; não podem substituir o estado inteiro por uma cópia arbitrária. A simulação usa metros, segundos e velocidades lineares das rodas em m/s. A orientação interna está em radianos. Identificadores de protocolo nunca são traduzidos.

## Comandos de um time

```json
[{"id":"blue-0","left":0.2,"right":0.2}]
```

Cada time pode comandar até três robôs próprios, uma vez por ID. Valores devem ser finitos e ficar entre -0.6 e 0.6 m/s. Observações são cópias independentes. Validação rejeita outro time, IDs duplicados e valores inválidos.

## Partidas e salas

As rotas `/api/matches` oferecem partidas persistidas e replay conforme o contrato do repositório. As salas privadas usam `/api/rooms`: criar exige a chave do operador; reivindicar um time usa convite próprio e uma chave gerada pelo participante. Leitura e comandos exigem credencial privada. Não há listagem pública de salas.

```http
Authorization: Bearer YOUR_TEAM_KEY
Content-Type: application/json
```

O cliente lê o estado atual e envia `turn` com os comandos em `/api/rooms/{id}/commands`. Cada turno exige os dois times e aplica até seis passos de 60 Hz. Um conflito de revisão ou turno retorna 409: leia novamente antes de calcular comandos. Veja o contrato completo e executável em `examples/remote-team.ts` e [o guia remoto](/docs/remote-competition).

## Rádio físico é outro protocolo

O bridge supervisionado usa chave HMAC por robô, sequência, identidade, limites de velocidade e prazo de no máximo 250 ms. A chave da sala não autentica motores físicos. O bridge padrão opera sem acionamento real. O executor acelerado de simulação não mantém os prazos de rádio e não deve controlar hardware.

A confirmação do firmware informa o comando aplicado, não velocidade medida: não há encoder, PID ou odometria implementados. Leia os arquivos `firmware/include/protocol.h` e `docs/PROTOCOL.md` para o formato binário exato; nomes de campos, bytes e código permanecem originais.
