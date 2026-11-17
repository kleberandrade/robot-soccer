# Robô de referência ESP32-C3 — projeto não fabricado

Este projeto elétrico e mecânico é original e didático. Não há PCB fabricado, motores acionados, alcance de rádio medido ou envelope físico validado. O esquema não substitui captura elétrica, layout, ERC, seleção de peças e ensaios.

## Espaço e dimensões

O case tem 70 × 70 mm e altura nominal montada de 65 mm. Com bitola de 65 mm e pneus de 7 mm, o vão externo é 72 mm. Eixos e cubos ainda precisam de medição contra o envelope de 75 mm sem uniforme e 80 mm com uniforme. O modelo do case é separado do corpo padrão de simulação, de 75 mm.

Os motores têm corpos nominais de 26 × 12 × 10 mm; rodas têm 32 mm de diâmetro. A bateria deve caber em até 25 × 45 × 18 mm. A placa proposta ocupa 45 × 40 mm, acima da bandeja. Esses envelopes não comprovam encaixe de peças já selecionadas. Confira terminais, folgas, fios e a região livre da antena.

## Eletrônica

Use a [página de eletrônica](/hardware/electronics) e o [esquema SVG](/hardware/electronics.svg). A bateria protegida 2S alimenta reguladores separados: 5 V para VM dos motores e 3,3 V para lógica e ESP32-C3-MINI-1. Há fusível, interruptor, proteção de polaridade e requisito de corte externo de baixa tensão. Bateria, proteção, interruptor e alguns conectores ainda dependem de seleção real e validação térmica.

O TB6612FNG aciona os motores; GPIO nunca alimenta motor diretamente. Pinos duplicados de saída, alimentação e terra devem ser conectados conforme o datasheet. STBY tem pulldown externo de 10 kΩ. Use desacoplamento local, capacitor de reserva da alimentação dos motores e 100 nF nos terminais dos motores. Retornos de alta corrente devem ficar longe da lógica e da antena.

Atribuições: GPIO0 → AIN1; GPIO1 → AIN2; GPIO3 → PWMA; GPIO4 → BIN1; GPIO5 → BIN2; GPIO6 → PWMB; GPIO7 → STBY. São números GPIO do chip, não terminais do módulo ou números de uma placa genérica. Boot usa GPIO2/8/9 e EN possui rede de inicialização/reset. A UART de serviço é de 3,3 V; sua referência não deve realimentar o regulador.

## Código e fabricação

O [firmware](/hardware/firmware) mostra `main.cpp`, analisador de comandos, configuração de compilação e modelo vazio de segredos. Compilar para ESP32-C3-DevKitM-1 verifica a família do microcontrolador, não uma placa personalizada. Sem chave, o padrão é seguro; expiração e perda de Wi-Fi desabilitam o driver. Velocidade vira PWM por mapa aberto, sem encoder, PID ou odometria.

O [case 3D](/hardware/case) permite baixar STL e guia. Malhas fechadas e ausência de interseção nominal não comprovam impressão, resistência ou aquecimento. As referências primárias Espressif, Toshiba e Pololu ficam na página eletrônica e no README original. Código, nomes de componentes e documentos dos fabricantes permanecem na língua original.
