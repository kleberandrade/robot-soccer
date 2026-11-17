# Faltas, penalidades e o apito do árbitro

Uma partida não é somente física contínua. O árbitro pode interromper o jogo, posicionar um reinício e esperar pelo apito. Durante essa espera, as estratégias não devem mover os robôs como se a bola já estivesse em jogo.

## Automático e oficial

O árbitro automático usa critérios de contato e regiões aproximadas do simulador. O painel permite decisões explícitas do oficial humano, incluindo segundo defensor envolvido, segundo atacante, empurrão ilegal, bloqueio do goleiro, posse prolongada, retenção, saída antecipada e bola livre por impasse. Apenas estar dentro de uma área não reproduz toda a avaliação humana de envolvimento.

## Reproduza um pênalti

1. Inicie ou pause uma partida de teste.
2. Abra a mesa de arbitragem e selecione segundo defensor envolvido (pênalti).
3. Escolha o time infrator e o robô quando solicitado.
4. Aplique a decisão. Leia o evento e a posição de reinício.
5. Confira que o relógio de jogo está parado antes do apito.
6. Use **Apitar / continuar** e acompanhe os primeiros passos.

Repita trocando o infrator. O reinício depende do lado de ataque e do período; não presuma que azul sempre ataca na mesma direção. As decisões alteram o estado oficial, nunca oferecem controle manual das rodas.

## Relógios e histórico

O jogo tem dois tempos, intervalo e pedidos de tempo. Tempo de espera de um reinício não é tempo jogado. Consulte o histórico para entender causa, infrator e reinício. Um reset cria um novo começo; não é uma forma de corrigir uma estratégia sem registrar mudanças.

## Competição privada

Somente o anfitrião pode apitar, pausar, reiniciar ou aplicar decisões. Uma interrupção invalida comandos pendentes; após o apito os clientes precisam ler o turno atual. Se um cliente desconectar, a simulação espera. O organizador e suas emendas oficiais prevalecem sobre os limiares aproximados deste projeto. Leia [as regras e o escopo](/rules).
