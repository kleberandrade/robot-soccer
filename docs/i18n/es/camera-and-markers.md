# Cámara, marcadores y escala

El laboratorio muestra dos modos complementarios: escena 3D para inspección y proyección de una cámara virtual superior. Ambos reciben el mismo estado del partido; no son simulaciones separadas.

## Posición de cámara

La cámara empieza a 2 m sobre el centro del campo. Altura, inclinación y campo de visión vertical cambian el área capturada. Aumentar altura suele ampliar cobertura; inclinar introduce perspectiva y puede recortar un lado. Comprueba el indicador de cobertura. El encuadre 3D y la cámara virtual tienen controles distintos.

## Marcadores superiores

Los robots llevan marcadores de colores de identificación. La proyección considera su altura: no los dibuja como si estuvieran en el suelo. Robots más altos presentan desplazamientos de perspectiva distintos. La escena 3D permite comprobar tamaño, orientación y oclusiones geométricas.

## Experimento guiado

1. Usa el preset de referencia con cámara vertical.
2. Compara posiciones en el campo y en la proyección.
3. Reduce altura hasta que aparezca el aviso de recorte.
4. Cambia solo inclinación y observa la distorsión.
5. Activa el soporte de cámara para relacionar sensor y escena.

## Escala y límites

Las coordenadas del mundo usan metros. Compara campo, robots, ruedas y marcadores en la misma unidad. La imagen 2D es una proyección sintética de estados conocidos: no es captura de cámara física ni ejecuta detección por visión artificial. Iluminación, exposición, ruido, distorsión de lente, calibración y latencia reales requieren validación independiente. Las estrategias reciben observaciones simuladas perfectas; no las confundas con un sistema real de visión.
