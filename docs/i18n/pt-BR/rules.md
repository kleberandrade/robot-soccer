# Referência VSSS selecionada e escopo

A referência foi escolhida pelo usuário: o regulamento vinculado pela [página oficial da LARC 2026](https://mecatronica.umng.edu.co/index.html/larc.html). O arquivo [LARC-VSSS-2025-PR.pdf](https://mecatronica.umng.edu.co/index.html/rules/LARC-VSSS-2025-PR.pdf) tem capa **VSSS Série A 2023**. Essa divergência permanece registrada. Não afirmamos existir uma revisão 2026 nem homologação do simulador. O regulamento completo e emendas oficiais prevalecem.

## Dimensões e duração

A referência padrão usa campo de 1,50 × 1,30 m, gols de 0,40 × 0,10 m, chanfros de canto de 70 mm e círculo central com raio de 0,20 m. As áreas de gol combinam retângulo e meia elipse. O limite sem uniforme é 75 mm; o envelope com uniforme é 80 mm.

O corpo padrão do simulador tem 75 × 75 × 65 mm, bitola de 65 mm e rodas de 32 mm de diâmetro. A câmera começa a 2 m. São dois tempos de 300 s, intervalo de 480 s e dois pedidos técnicos de até 180 s por time.

`CONFIG` seleciona `vsss-larc-reference`. `USER_CONFIG` preserva separadamente o campo de treino de 1,50 × 1,20 m solicitado inicialmente, intervalo de 600 s, um pedido de 120 s, resposta instantânea de velocidade e arbitragem apenas manual. Alterações na interface tornam a configuração personalizada.

## Faltas e reinícios

O motor registra decisões e interrompe o jogo para reiniciar. Há decisões oficiais para pênalti por segundo defensor envolvido, segundo atacante envolvido, empurrão, bloqueio do goleiro, posse prolongada do goleiro, retenção ilegal, saída antecipada e impasse. Não basta contar robôs na área: envolvimento exige interpretação. Os critérios automáticos são aproximações de contato, não substituem o oficial humano.

O relógio de jogo para nos reinícios, intervalo e pedidos de tempo. Um reinício aguarda o apito. O lado de ataque muda com o período. Consulte [o artigo de arbitragem](/docs/referee-and-restarts) para um exemplo reproduzível.

## Limites explícitos

Observações são perfeitas e a câmera é sintética. Contato, retenção e empurrão usam aproximações. Os testes verificam o comportamento implementado, não certificam equivalência com todos os julgamentos do campeonato. O case é uma proposta física separada; meça o robô completo com rodas, cubos, eixos, parafusos e uniforme.
