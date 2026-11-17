# Tração diferencial: das rodas ao movimento

O robô usa duas rodas motrizes independentes. A distância entre seus planos centrais é a bitola `wheelBase`, não o lado da carcaça. As velocidades `left` e `right` são lineares, em m/s.

## Movimento e orientação

Para velocidades aplicadas `vl`, `vr` e bitola `b`:

```text
v = (vr + vl) / 2
omega = (vr - vl) / b
```

Duas velocidades iguais produzem deslocamento reto. Velocidades opostas de mesmo módulo produzem giro no lugar. Uma roda parada produz uma curva. O mundo usa metros; a orientação interna usa radianos. O motor avança em passos fixos de 1/60 s, independentemente da taxa de quadros do navegador.

## Comando não significa velocidade instantânea

O preset VSSS limita a aceleração das rodas. Um salto no comando não vira imediatamente um salto no movimento. A fase visual é integrada a partir do deslocamento aplicado e do raio da roda:

```text
delta_angulo = deslocamento_da_roda / raio
```

Por isso, os raios e marcas das rodas giram de acordo com o modelo, inclusive em marcha à ré. A prévia 3D não contém uma animação independente que inventa movimento.

## Experimento didático

1. Pause e registre a posição inicial.
2. Observe um deslocamento reto com velocidades iguais.
3. Compare uma curva e um giro no lugar.
4. Mude apenas a bitola e repita: a mesma diferença de velocidades passa a gerar outra velocidade angular.
5. Mude o raio e compare as voltas visuais para a mesma distância.

## O que ainda é aproximação

O contato é simplificado. Não há validação experimental de atrito, torque, escorregamento, suspensão ou consumo da bateria. A massa visual não estabelece dinâmica de um robô fabricado. O firmware físico converte velocidade em PWM por uma curva aberta não calibrada; não implementa encoder ou PID. Confira [hardware](/hardware) antes de transferir conclusões ao robô real.
