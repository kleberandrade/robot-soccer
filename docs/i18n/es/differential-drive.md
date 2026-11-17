# Tracción diferencial: de las ruedas al movimiento

El robot usa dos ruedas motrices independientes. La separación entre sus planos centrales es `wheelBase`, no el lado de la carcasa. `left` y `right` son velocidades lineales en m/s.

## Movimiento y orientación

Con velocidades aplicadas `vl`, `vr` y separación `b`:

```text
v = (vr + vl) / 2
omega = (vr - vl) / b
```

Velocidades iguales producen avance recto. Velocidades opuestas de igual módulo producen giro sobre el centro. Una rueda detenida produce una curva. El mundo usa metros y la orientación interna usa radianes. El motor avanza en pasos fijos de 1/60 s, independientemente de los fotogramas del navegador.

## Un comando no implica velocidad instantánea

El preset VSSS limita la aceleración de ruedas. Un salto del comando no se convierte inmediatamente en un salto de movimiento. La fase visual se integra a partir del desplazamiento aplicado y el radio:

```text
delta_angulo = desplazamiento_de_rueda / radio
```

Por eso las marcas de las ruedas giran según el modelo, también marcha atrás. La escena no inventa una animación independiente.

## Experimento guiado

1. Pausa y registra la posición inicial.
2. Observa avance recto con velocidades iguales.
3. Compara una curva y un giro sobre el centro.
4. Cambia solo la separación: la misma diferencia de velocidades genera otra velocidad angular.
5. Cambia el radio y compara las vueltas para la misma distancia.

## Límites

El contacto es simplificado. No hay validación experimental de fricción, par, deslizamiento, suspensión o consumo de batería. La apariencia de masa no establece dinámica de un robot fabricado. El firmware físico convierte velocidad en PWM mediante una curva abierta sin calibrar; no implementa encoder ni PID. Consulta [hardware](/hardware) antes de trasladar conclusiones al robot real.
