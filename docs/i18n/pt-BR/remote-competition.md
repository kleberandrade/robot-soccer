# Conecte seu código a uma competição privada

Cada participante executa seu programa no próprio computador. O servidor guarda a partida oficial e sincroniza os dois lados. Nenhum código é enviado para execução no servidor.

## 1. Crie e distribua acessos

O anfitrião abre [Competir](/compete), escolhe criar sala e usa a chave do operador do servidor. Salve o ID e a conexão de anfitrião antes de sair: as chaves ficam apenas na memória do navegador. Há convites diferentes para azul e amarelo e uma chave separada de espectador. Compartilhe cada credencial apenas com seu destinatário.

## 2. Entre com seu time

Abra a opção de entrar, informe o convite e o nome do time. O navegador gera uma chave privada do participante e reivindica aquele lado. Um convite não pode ser usado por outro participante depois disso; repetir com a mesma chave permite recuperar uma resposta perdida.

Salve a conexão baixada em `.env.room-blue` ou `.env.room-yellow` no seu projeto local. Ela contém `BASE_URL`, `ROOM_ID` e `ROOM_KEY`. Se o download falhar, use as configurações copiáveis. Não envie esse arquivo para Git, chats públicos, issues ou capturas de tela.

## 3. Execute os exemplos em computadores separados

```sh
node --env-file=.env.room-blue --import tsx examples/remote-team.ts koativa
```

No outro computador:

```sh
node --env-file=.env.room-yellow --import tsx examples/remote-team.ts circuit
```

Qualquer lado pode escolher qualquer uma das políticas. O anfitrião usa **Apitar / continuar** quando ambos estiverem prontos. Para um exercício curto, acrescente `--turns 20`; sem interrupções, vinte turnos de cada cliente avançam 120 passos de física, ou dois segundos simulados. Ctrl+C encerra o cliente.

## 4. Entenda a sincronização

Os dois leem o mesmo `turn`. O primeiro envio fica pendente, sem movimento. O segundo completa o turno; o servidor aplica ambos por até seis passos de 1/60 s e interrompe antes se o árbitro parar. Só então cria o próximo estado e incrementa o turno. Comandos pendentes não ficam visíveis ao oponente. Uma revisão concorrente é conciliada por comparação atômica; turno antigo ou duplicado retorna 409.

A rede lenta reduz a velocidade da partida, sem conceder turnos extras ao cliente rápido. Se um time sair, o jogo espera; não repete o comando antigo indefinidamente. Não se trata de serviço de tempo real de relógio de parede.

## 5. Arbitragem e reconexão

Apenas o anfitrião pode apitar, pausar, reiniciar e aplicar faltas. Essas ações invalidam comandos pendentes. O painel aberto do anfitrião avança relógios de intervalo e pedidos de tempo; jogo ativo depende dos dois programas. A reconexão usa ID da sala e chave salva. Salas expiram em 24 horas. Chaves de sala nunca substituem as chaves HMAC dos robôs físicos.
