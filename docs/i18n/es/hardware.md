# Robot de referencia ESP32-C3 — diseño sin fabricar

La propuesta eléctrica y mecánica es original y didáctica. No hay PCB fabricado, motores activados, alcance de radio medido ni envolvente física validada. El esquema no sustituye captura eléctrica, layout, ERC, selección de piezas ni ensayos.

## Espacio y dimensiones

La carcasa mide 70 × 70 mm y 65 mm de altura nominal montada. Con separación de ruedas de 65 mm y neumáticos de 7 mm, la anchura es 72 mm. Ejes y cubos deben medirse frente al límite de 75 mm sin uniforme y 80 mm con uniforme. La carcasa es un diseño separado del cuerpo de simulación de 75 mm.

Los cuerpos nominales de motor miden 26 × 12 × 10 mm; ruedas de 32 mm de diámetro. La batería debe caber en 25 × 45 × 18 mm. La placa propuesta ocupa 45 × 40 mm sobre la bandeja. Estos espacios no demuestran ajuste de piezas seleccionadas. Comprueba terminales, holguras, cables y región libre de antena.

## Electrónica

Consulta [electrónica](/hardware/electronics) y [esquema SVG](/hardware/electronics.svg). La batería 2S protegida alimenta reguladores separados: 5 V para motores y 3,3 V para lógica y ESP32-C3-MINI-1. Hay fusible, interruptor, protección de polaridad y requisito de corte externo por baja tensión. Batería, protección, interruptor y conectores aún requieren selección real y validación térmica.

TB6612FNG acciona motores; GPIO nunca alimenta directamente un motor. Conecta pines duplicados de salida, alimentación y tierra según datasheet. STBY tiene pulldown externo de 10 kΩ. Usa desacoplo local, condensador de reserva y 100 nF en los terminales de motor. Aleja retornos de alta corriente de lógica y antena.

Asignación: GPIO0 → AIN1; GPIO1 → AIN2; GPIO3 → PWMA; GPIO4 → BIN1; GPIO5 → BIN2; GPIO6 → PWMB; GPIO7 → STBY. Son números GPIO del chip, no terminales del módulo ni de una placa genérica. Boot usa GPIO2/8/9; EN tiene red de inicio/reset. La UART de servicio es de 3,3 V; su referencia no debe realimentar el regulador.

## Código y fabricación

El [firmware](/hardware/firmware) muestra `main.cpp`, analizador, configuración y plantilla vacía de secretos. Compilar para ESP32-C3-DevKitM-1 verifica la familia del microcontrolador, no una placa personalizada. Sin clave, el modo predeterminado es seguro; caducidad y pérdida de Wi-Fi desactivan el controlador. La velocidad se convierte en PWM en lazo abierto, sin encoder, PID ni odometría.

La [carcasa 3D](/hardware/case) ofrece STL y guía. Mallas cerradas y ausencia de intersección nominal no demuestran impresión, resistencia ni temperatura. Referencias primarias Espressif, Toshiba y Pololu están en electrónica y README original. Código, nombres de componentes y documentos de fabricante conservan su idioma original.
