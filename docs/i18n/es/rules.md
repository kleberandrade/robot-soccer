# Referencia VSSS seleccionada y alcance

El usuario eligió el reglamento enlazado por la [página oficial de LARC 2026](https://mecatronica.umng.edu.co/index.html/larc.html). El archivo [LARC-VSSS-2025-PR.pdf](https://mecatronica.umng.edu.co/index.html/rules/LARC-VSSS-2025-PR.pdf) tiene portada **VSSS Série A 2023**. Registramos esa discrepancia. No afirmamos una revisión 2026 ni homologación del simulador. Prevalecen el reglamento completo y sus enmiendas oficiales.

## Dimensiones y duración

La referencia usa campo de 1,50 × 1,30 m, porterías de 0,40 × 0,10 m, chaflanes de 70 mm y círculo central de radio 0,20 m. Las áreas combinan rectángulo y media elipse. El límite sin uniforme es 75 mm; con uniforme, 80 mm.

El cuerpo predeterminado del simulador mide 75 × 75 × 65 mm, con separación de ruedas de 65 mm y diámetro de 32 mm. La cámara empieza a 2 m. Hay dos partes de 300 s, descanso de 480 s y dos tiempos técnicos de hasta 180 s por equipo.

`CONFIG` selecciona `vsss-larc-reference`. `USER_CONFIG` conserva por separado el campo de entrenamiento de 1,50 × 1,20 m pedido inicialmente, descanso de 600 s, un tiempo de 120 s, respuesta instantánea de velocidad y arbitraje solo manual. Editar dimensiones crea configuración personalizada.

## Faltas y reinicios

El motor registra decisiones y detiene el juego para reiniciar. Hay decisiones por segundo defensor (penalti), segundo atacante, empuje, bloqueo del portero, posesión prolongada, retención ilegal, salida anticipada y bloqueo. Contar robots en el área no basta: la participación exige interpretación. Los criterios automáticos aproximan contactos y no sustituyen al oficial humano.

El reloj de juego se detiene en reinicios, descanso y tiempos muertos. Un reinicio espera el silbato. El sentido de ataque cambia con el período. Consulta [el artículo arbitral](/docs/referee-and-restarts).

## Límites explícitos

Las observaciones son perfectas y la cámara sintética. Contacto, retención y empuje usan aproximaciones. Las pruebas verifican lo implementado, no equivalencia con todos los juicios del campeonato. La carcasa es otra propuesta física; mide el robot completo con ruedas, cubos, ejes, tornillos y uniforme.
