# Segurança e limites de operação

Credenciais de banco e chave do operador pertencem ao servidor. Nunca use `NEXT_PUBLIC_` para expô-las. Arquivos reais `.env` e `secrets.h` são ignorados; o site publica apenas o modelo vazio de credenciais do firmware, por uma lista explícita de arquivos permitidos.

## Salas privadas

O ID da sala não é uma senha. Toda leitura e ação exige uma credencial privada. Anfitrião arbitra, time comanda apenas seus robôs, espectador apenas lê. Convites e chaves são guardados como hashes no banco. Salas expiram em 24 horas. O navegador não coloca as chaves na URL nem no armazenamento persistente: salve a conexão antes de recarregar.

O servidor valida tamanho do pedido, turno, revisão, IDs, número de comandos, valores finitos e limites de velocidade. Um cliente não escolhe arbitrariamente seu papel ou o estado oficial. A reivindicação de um convite já usado por outra chave é rejeitada. Esses mecanismos não transformam o projeto em serviço auditado contra qualquer ameaça.

## Execução de código

Os programas de competidores rodam em seus próprios computadores. Não há upload nem execução de código de terceiros no servidor. O servidor aceita observações e comandos pelo contrato. Use HTTPS fora de localhost e mantenha os arquivos de conexão privados.

## Hardware

As chaves de sala não autenticam rádio físico. O bridge usa credenciais HMAC independentes por robô, prazos curtos e supervisão. Falha de Wi-Fi, expiração ou credenciais vazias desabilitam o driver. Isso não substitui interruptor físico, proteção elétrica e inspeção de bancada. Não houve acionamento de motores reais durante o desenvolvimento. O firmware não mede velocidade ou bateria; corte de baixa tensão exige circuito externo apropriado.

Diagramas, case e BOM são propostas originais sem PCB fabricado ou montagem física validada. Faça revisão elétrica e mecânica antes de energizar. Para o histórico de evidências, consulte [o registro de verificação](/docs/verification).
