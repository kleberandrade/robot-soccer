# Como as salas privadas sincronizam os times

A sala possui um estado oficial, uma revisão e um número de turno monotônico. Ela é separada das partidas públicas: saber seu UUID não concede leitura. Não há endpoint público para enumerar salas.

## Credenciais por função

A criação usa a credencial do operador. Depois existem acessos separados de anfitrião, espectador e cada time. Convites privados reivindicam apenas um lado. O banco guarda hashes, não os segredos recuperáveis. A interface mantém as credenciais na memória e permite salvar uma conexão privada; elas não vão para a URL nem para armazenamento persistente do navegador. A expiração é de 24 horas.

## Um turno compartilhado

O primeiro time envia comandos do turno atual e espera. O outro completa o turno. O servidor aplica os comandos juntos por até seis passos, respeitando interrupções do árbitro. Comparação atômica da revisão e tentativas limitadas conciliam pedidos concorrentes. Pedidos repetidos ou antigos não geram movimento adicional.

## Falhas e decisões

Pausar, reiniciar ou decidir uma falta incrementa o turno e esvazia pendências. Um comando anterior ao apito não pode vazar para depois dele. Se um cliente cair, a sala congela aguardando o lado ausente. A reconexão com chave salva recupera a função correspondente. O frontend descarta respostas antigas para não regredir a interface.

## Compromissos

A estratégia evita serviço contínuo e execução de código alheio na Vercel, mas latência de rede e banco afeta a velocidade. Não há garantia de tempo real, abandono automático, emparelhamento público ou concessão automática de vitória. O árbitro humano continua responsável por reinícios. Consulte `docs/adr/0002-private-remote-rooms.md` para o registro original.
