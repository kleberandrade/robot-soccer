# Como funciona o servidor de simulação

O motor de passos fixos vive em `packages/engine`, separado da interface e do banco. O servidor recebe ações validadas, avança um lote limitado e persiste o estado oficial. O navegador renderiza esse estado em 3D e na câmera sintética.

## Estado e revisão

Um checkpoint contém a partida e sua revisão. Atualizações usam a revisão esperada para evitar que dois pedidos sobrescrevam silenciosamente o estado. Em conflito, o cliente lê o estado mais recente e decide novamente. O banco PostgreSQL fornece persistência; uma prévia local usa o mesmo motor sem persistir.

## Por que lotes limitados?

Funções HTTP têm duração limitada. Cada pedido faz trabalho delimitado; não deixa um laço infinito de simulação ocupando uma função. Replays são divididos em trechos. O tempo da simulação avança em passos de 1/60 s, não pela taxa de quadros do navegador.

## Fronteiras

Interface, motor, protocolo, banco e bridge são partes distintas do Turborepo. O navegador nunca deve receber a credencial de banco ou a chave global do operador como configuração pública. Programas de competidores rodam localmente e enviam comandos, não arquivos executáveis. O ADR original `docs/adr/0001-server-batches.md` registra a decisão técnica; as [salas privadas](/docs/private-room-design) acrescentam turnos com dois participantes.
