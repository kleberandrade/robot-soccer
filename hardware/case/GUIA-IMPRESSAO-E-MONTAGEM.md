# Guia de impressão e montagem — case ROBOTSOCCER Rev A

Este pacote contém um **protótipo digital ainda não impresso nem montado**. As malhas foram verificadas por software; encaixe, resistência, temperatura e conformidade do robô completo precisam ser validados em bancada. Leia o guia antes de gastar material. Comece com uma montagem sem bateria conectada.

## 1. Conheça as peças

- **tray.stl — base (1 unidade):** carcaça de 70 × 70 mm, piso de 2 mm e paredes de 1,6 mm. Recebe os motores e sustenta a bandeja e a tampa.
- **electronics-deck.stl — bandeja eletrônica (1 unidade):** placa removível de 65,8 mm, com passagens para fios, recortes para as rodas e apoios de uma placa eletrônica proposta.
- **lid.stl — tampa (1 unidade):** placa de 2 mm, com posições rebaixadas para parafusos e superfície para os marcadores da câmera.
- **skid.stl — apoio passivo (opcional):** disco de 7 mm de diâmetro e 4 mm de altura. Imprima somente a quantidade e a posição definidas após avaliar o equilíbrio do seu conjunto; não há um sistema de fixação validado para ele.

O ZIP inclui também desenho cotado, parâmetros, relatório das malhas e fonte CAD. Os STL representam apenas as peças plásticas: motores, rodas, bateria, placa, parafusos, fios e marcadores não estão incluídos.

## 2. Meça os componentes antes de imprimir

Use paquímetro e compare com o desenho dimensions.svg. A proposta reserva motores com corpo nominal de 26 × 12 × 10 mm, bateria de **no máximo 25 × 45 × 18 mm** e uma placa de 45 × 40 mm, com furação proposta de 39 × 34 mm. Esses espaços não correspondem a uma bateria ou placa já escolhida e montada.

Confira terminais, fios dobrados, eixos, cubos das rodas, conectores e interruptor. A abertura do interruptor é provisória. A folga entre os motores, as presilhas e a retenção da bateria também precisam de teste. Se algo não couber, altere o projeto CAD; aumentar a escala do STL muda todas as dimensões e os furos ao mesmo tempo.

## 3. Prepare o fatiador

1. Extraia o ZIP e importe cada STL em **milímetros**, na escala de **100%**. Não use ajuste automático à mesa.
2. Confira a base com 70 × 70 mm e a tampa com 70 × 70 × 2 mm. Cada arquivo tem seu próprio piso em Z = 0; não empilhe as peças como se fossem um único arquivo de impressão.
3. Como orientação inicial a inspecionar: base com piso na mesa e abertura para cima; bandeja com face plana na mesa e apoios para cima; tampa com face plana inferior na mesa e rebaixos para cima; apoio com face plana na mesa.
4. Use o perfil do fabricante da impressora e do filamento. Um bico de 0,4 mm e camada de 0,20 mm são apenas uma **proposta inicial**, não uma receita validada. Nas paredes de 1,6 mm, confira no preview se os perímetros são contínuos e realmente preenchem a espessura.
5. Inspecione camada por camada: teto das janelas das rodas, abertura do interruptor, colares das colunas e apoios podem precisar de suporte. Prefira suportes localizados quando funcionarem; confira se será possível removê-los sem quebrar as peças. Verifique pontes, ilhas, adesão e tempo estimado antes de iniciar.

Escolha um plástico não condutivo e avalie temperatura e rigidez para o uso real. PLA pode servir para um primeiro teste dimensional em bancada; não assuma que suportará calor dos motores ou do ambiente. PETG também exige perfil e tolerâncias próprios. Não existe material, preenchimento ou orientação estrutural homologados para este case.

## 4. Faça um teste pequeno primeiro

Antes das quatro peças, prepare no CAD um corpo de prova com parede de 1,6 mm, piloto de 1,8 mm, passagem de 2,4 mm e o encaixe do parafuso que pretende usar. Esse corpo de prova não está incluído no pacote. Meça o resultado e ajuste compensação dimensional ou CAD conforme a impressora. A tampa plana pode ser o primeiro teste do tamanho externo, mas não valida a base inteira.

Os pilotos de 1,8 mm e as passagens de 2,4 mm são provisórios. Escolha diâmetro, tipo e comprimento dos parafusos depois do teste; não presuma que qualquer parafuso M2 servirá. Não há alojamentos de insertos térmicos projetados. Nunca aperte até trincar as colunas nem deixe pontas invadirem a bateria.

## 5. Limpe e confira as peças

Espere esfriar, remova suportes e rebarbas e examine trincas e delaminação. Teste a bandeja e a tampa **sem eletrônica e sem bateria**. As quatro passagens da bandeja devem atravessar as colunas e apoiar nos colares, sem forçar. Confira alinhamento dos furos, passagem de fios e acesso ao interruptor. Não use a bateria como gabarito para furar, lixar ou cortar.

## 6. Monte por etapas, sem alimentação

1. **Base e motores:** apoie os dois motores nas guias nominais, com eixos voltados às janelas. Projete e teste uma fixação adequada aos seus motores; as guias e rasgos não constituem uma retenção validada. Preserve o espaço para os terminais e o isolamento.
2. **Rodas:** coloque os cubos e rodas selecionados, gire à mão e verifique folga nas janelas e na bandeja. A proposta usa rodas de 32 mm de diâmetro, até 7 mm de largura e distância de 65 mm entre seus planos centrais. O vão total dos pneus é 72 mm; eixos e cubos podem ultrapassar essa medida.
3. **Bateria:** primeiro use um gabarito inerte com as dimensões reais do pack. Planeje retenção removível, sem compressão da célula e longe de arestas, pontas e partes quentes. A retenção não está resolvida pelo STL. Não conecte a bateria nesta etapa.
4. **Bandeja:** abaixe sobre as quatro colunas até os apoios. No projeto, sua face inferior fica a 30 mm do chão. Confirme as folgas das rodas e reserve passagem para cabos sem prendê-los entre peças.
5. **Eletrônica:** confira a furação real antes de fixar a placa nos apoios. Isole contatos e mantenha a região da antena conforme o fabricante do módulo, sem metal ou bateria obstruindo-a. A placa de 45 × 40 mm é uma reserva de espaço; o PCB ainda não foi desenvolvido.
6. **Tampa e marcadores:** teste os parafusos e seu comprimento, mantendo as cabeças niveladas. A face superior nominal fica a 65 mm do chão. Aplique a folha de marcadores sem cobrir os acessos; a área nominal dos marcadores é 65 mm. Use a orientação do time configurado no simulador.
7. **Apoio e equilíbrio:** avalie a estabilidade do robô com o peso dos componentes. Se usar apoios passivos, defina sua posição, altura e fixação sem tirar a carga necessária das rodas motrizes. A fixação e o atrito ainda precisam ser testados.

As alturas são da montagem sobre o chão: base começa em Z = 4 mm, bandeja em Z = 30 mm e tampa em Z = 63 mm. No fatiador, cada peça continua individualmente apoiada em Z = 0.

## 7. Inspeção antes de ligar

- Rodas giram livres, sem roçar no plástico ou nos fios; motores e componentes estão retidos.
- Não há parafusos pontiagudos, limalha, curto-circuito, cabo prensado ou pressão sobre a bateria.
- Interruptor e desligamento estão acessíveis; tampa pode ser retirada para manutenção.
- O robô completo, incluindo eixos, cubos e parafusos, foi medido contra o envelope da referência de competição selecionada. A carcaça sozinha não comprova conformidade.
- Alimentação, polaridade e conexões foram conferidas com o diagrama eletrônico. A montagem elétrica deve ser revisada antes de energizar.

Faça a primeira verificação elétrica com as rodas suspensas e meios de desligamento acessíveis, seguindo o guia eletrônico e o procedimento de bancada apropriado. O firmware padrão sem chave configurada mantém o acionamento desabilitado. Depois, valide aquecimento, vibração, retenção e movimento em velocidade reduzida; registre os ajustes necessários antes de competir.

## 8. Ajuste e compartilhe os resultados

Guarde material, impressora, perfil, orientação, medidas, massa e fotos dos encaixes. Para modificar a geometria, use dimensions.json e generate.py com requirements.txt (Python 3.9–3.12). Regere os STL e revise o desenho cotado ao mudar o layout. O relatório mesh-report.json registra verificações geométricas; não substitui testes de impressão ou montagem.

Referências do projeto: https://robot-soccer.vercel.app/hardware/case e https://robot-soccer.vercel.app/hardware/electronics
