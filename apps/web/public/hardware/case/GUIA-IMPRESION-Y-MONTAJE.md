# Guía de impresión y montaje — carcasa ROBOTSOCCER Rev A

Es un **prototipo digital aún sin imprimir ni montar**. Las comprobaciones de software validan mallas, no ajuste físico, resistencia, temperatura ni cumplimiento del campeonato. Lee antes de gastar material. Empieza sin alimentación conectada.

## 1. Identifica las piezas

- `tray.stl`: una base inferior de 70 × 70 mm, piso de 2 mm, paredes de 1,6 mm, guías de motores, ventanas de ruedas y columnas.
- `electronics-deck.stl`: una bandeja extraíble de 65,8 mm con pasos de cables, recortes para ruedas y apoyos provisionales para PCB.
- `lid.stl`: una tapa de 2 mm con rebajes de tornillos y superficie plana para marcadores.
- `skid.stl`: apoyo pasivo opcional de 7 mm de diámetro y 4 mm de altura. Cantidad, posición, fijación y fricción dependen del equilibrio real; no hay fijación validada.

El ZIP incluye plano acotado, parámetros, informe de mallas y fuente CAD editable. Motores, ruedas, batería, placa, tornillos, cableado y marcadores no están incluidos en los STL.

## 2. Mide antes de imprimir

Usa calibre y compara con `dimensions.svg`. Cuerpos nominales de motor: 26 × 12 × 10 mm; batería máxima: **25 × 45 × 18 mm**; placa propuesta: 45 × 40 mm con taladros provisionales de 39 × 34 mm. Son reservas de espacio, no componentes elegidos y montados.

Comprueba terminales, curvas de cables, ejes, cubos, conectores e interruptor. La abertura del interruptor es provisional. Separación de motores, correas y retención de batería necesitan pruebas. Modifica el CAD si algo no cabe; escalar un STL cambia a la vez todas las dimensiones y agujeros.

## 3. Prepara el laminador

1. Extrae el ZIP e importa cada STL en **milímetros y escala 100%**. Desactiva el ajuste automático a la cama.
2. Comprueba base 70 × 70 mm y tapa 70 × 70 × 2 mm. Cada STL tiene su origen propio en Z = 0; no imprimas el conjunto apilado.
3. Orientaciones iniciales a inspeccionar: base con piso abajo y abertura arriba; bandeja con cara plana abajo y apoyos arriba; tapa con cara inferior plana abajo y rebajes arriba; apoyo con cara plana abajo.
4. Usa el perfil del fabricante de impresora y filamento. Boquilla de 0,4 mm y capa de 0,20 mm son solo una **propuesta inicial sin validar**. Comprueba en la vista previa que los perímetros llenen las paredes de 1,6 mm de forma continua.
5. Revisa cada capa. Techos de ventanas de ruedas, abertura del interruptor, collares y apoyos pueden requerir soportes. Localízalos cuando sea apropiado y verifica que puedan retirarse sin romper piezas. Revisa puentes, islas, adhesión y tiempo estimado.

Elige plástico no conductor y evalúa calor y rigidez reales. PLA puede servir para una prueba dimensional de banco; no supongas que soporta calor de motores o ambiente. PETG también necesita perfil y tolerancias propios. No hay material, relleno ni orientación estructural homologados para la carcasa.

## 4. Prueba detalles pequeños primero

Prepara en CAD una probeta con pared de 1,6 mm, piloto de 1,8 mm, paso de 2,4 mm y rebaje del tornillo elegido. Esta probeta **no está incluida**. Mide la impresión y ajusta compensación o CAD. Imprimir primero la tapa plana permite comprobar escala exterior, no toda la base.

Los diámetros son provisionales. Elige tipo, diámetro y longitud de tornillo tras probar; no supongas que cualquier M2 sirve. No hay alojamientos de insertos térmicos diseñados. Evita agrietar columnas y que puntas entren en la batería.

## 5. Limpia y monta en seco

Deja enfriar, retira soportes y rebabas y busca grietas o delaminación. Prueba bandeja y tapa **sin electrónica ni batería**. La bandeja debe pasar sobre cuatro columnas y apoyar en los collares sin forzar. Comprueba taladros, pasos de cables y acceso al interruptor. Nunca uses la batería como plantilla de taladrado, lijado o corte.

## 6. Monta sin alimentación

1. **Base y motores:** coloca motores en las guías nominales con ejes hacia las ventanas. Diseña y prueba retención para tus motores; guías y ranuras por sí solas no constituyen fijación validada. Conserva espacio para terminales y aislamiento.
2. **Ruedas:** monta cubos y ruedas elegidos y gira a mano; comprueba holgura con base y bandeja. Diámetro nominal 32 mm, anchura hasta 7 mm, separación entre planos centrales 65 mm. Los neumáticos abarcan 72 mm, pero ejes y cubos pueden sobresalir.
3. **Batería:** usa primero un modelo inerte del pack real. Diseña retención extraíble sin comprimir células ni acercarlas a bordes, puntas o calor. El STL no resuelve la retención. No conectes alimentación.
4. **Bandeja:** baja sobre columnas hasta los collares. Su cara inferior queda nominalmente a 30 mm del suelo. Comprueba ruedas y guía cables sin atraparlos.
5. **Electrónica:** compara taladros reales antes de fijar la placa. Aísla contactos y respeta la zona libre de antena del fabricante sin metal ni batería obstruyéndola. La placa de 45 × 40 mm es una reserva; no hay PCB personalizado terminado.
6. **Tapa y marcadores:** prueba longitud de tornillos y deja cabezas a ras. La cara superior nominal queda a 65 mm del suelo. Aplica los marcadores de 65 mm sin bloquear mantenimiento y respeta la orientación del equipo elegido.
7. **Apoyo y equilibrio:** comprueba estabilidad con masa real. Si usas apoyos pasivos, determina posición, altura y fijación sin quitar carga de tracción a las ruedas motrices. Fijación y fricción requieren pruebas.

Posiciones respecto al suelo: base Z = 4 mm, bandeja Z = 30 mm, tapa Z = 63 mm. En el laminador cada pieza sigue apoyada individualmente en Z = 0.

## 7. Inspecciona antes de encender

Ruedas libres, componentes sujetos, sin tornillos afilados, residuos, cortos, cables atrapados ni presión en batería. Interruptor accesible y tapa extraíble. Mide el robot completo con ejes, cubos y tornillos frente al reglamento seleccionado; la carcasa sola no acredita cumplimiento.

Revisa polaridad, alimentación y conexiones con el esquema. Las primeras pruebas eléctricas necesitan ruedas suspendidas, apagado accesible y procedimiento de banco supervisado apropiado. El firmware predeterminado sin clave deshabilita motores. Después comprueba calor, vibración, retención y movimiento lento; registra ajustes antes de competir.

## 8. Registra y revisa

Guarda impresora, material, perfil, orientación, medidas, masa y fotos. Edita `dimensions.json` y regenera con `generate.py` y `requirements.txt` fijado usando Python 3.9–3.12. Revisa el plano al cambiar distribución. `mesh-report.json` solo registra geometría; no sustituye pruebas de impresión ni montaje.

Proyecto: https://robot-soccer.vercel.app/es/hardware/case
Electrónica: https://robot-soccer.vercel.app/es/hardware/electronics
