# Registro de implementação e verificação

As entregas passam por verificação de tipos, testes do motor e serviços, compilação Next.js, teste nativo do protocolo e compilação ESP32. A integração contínua também verifica e regenera as malhas e desenhos do case.

## Evidências de v0.3

Foram executados 89 testes Vitest com PostgreSQL, além de verificações HTTP, autenticação das salas e concorrência. Dois processos separados Koativa/Circuit completaram 20 turnos aceitos por cliente, avançando 120 passos de jogo. A publicação foi inspecionada no navegador.

O ZIP é decodificado no teste HTTP, que exige apenas os arquivos permitidos e compara os quatro STL com seus downloads individuais. O guia também é comparado ao arquivo separado. A interface e o conteúdo agora possuem versões pt-BR, en e es; protocolo e código mantêm identificadores originais.

## O que não foi validado fisicamente

Não houve impressão, montagem real, fabricação de PCB, acionamento de motor, teste térmico, alcance de rádio ou certificação de campeonato. Malhas fechadas e folgas nominais são verificações geométricas, não ensaios físicos.

O [histórico técnico completo, com commits e execuções de CI](https://github.com/kleberandrade/robot-soccer/blob/master/docs/WORK_LOG.md) é preservado na língua original para manter a rastreabilidade. Consulte também as execuções atuais no repositório; resultados históricos não garantem uma alteração futura.
