# Câmera, marcadores e escala

O laboratório mostra dois modos complementares: a cena 3D para inspeção e a projeção de uma câmera virtual superior. Ambos recebem o mesmo estado da partida; não são simulações separadas.

## Posicionamento da câmera

A câmera começa a 2 m acima do meio-campo. Altura, inclinação e campo de visão vertical alteram a área capturada. Aumentar a altura normalmente amplia a cobertura; inclinar introduz perspectiva e pode cortar um lado. Use o indicador de cobertura do campo para conferir os ajustes. O enquadramento da visão 3D e a câmera virtual têm controles distintos.

## Marcadores no topo

Os robôs possuem marcadores superiores coloridos de identificação. A projeção considera a altura do topo: não desenha os marcadores como se estivessem no piso. Robôs mais altos apresentam deslocamentos de perspectiva diferentes. A cena 3D permite verificar tamanho, orientação e oclusões geométricas.

## Experimento guiado

1. Use o preset de referência e mantenha a câmera vertical.
2. Compare as posições dos robôs no campo e na projeção.
3. Reduza a altura até o aviso de campo cortado aparecer.
4. Altere apenas a inclinação e observe a distorção.
5. Ative a estrutura da câmera para relacionar sensor e cena.

## Escala e limites

As coordenadas do mundo estão em metros. Dimensões do campo, robôs, rodas e marcadores devem ser comparadas na mesma unidade. A imagem 2D é uma projeção sintética de estados conhecidos: não é captura de uma câmera física e não executa detecção por visão computacional. Iluminação, exposição, ruído, distorção de lente, calibração e latência reais exigem validação separada. As estratégias recebem observações perfeitas simuladas; não as trate como resultado de um sistema real de visão.
