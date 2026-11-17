# Seguridad y límites operativos

Credenciales de base de datos y clave del operador pertenecen al servidor. Nunca las expongas mediante `NEXT_PUBLIC_`. Los archivos reales `.env` y `secrets.h` se ignoran; el sitio publica solo la plantilla vacía de credenciales del firmware mediante una lista explícita de archivos permitidos.

## Salas privadas

El ID de sala no es contraseña. Toda lectura y acción requiere credencial privada. El anfitrión arbitra, cada equipo controla solo sus robots y el espectador solo lee. Invitaciones y claves se guardan como hashes. Caducan a las 24 horas. El navegador no pone claves en URL ni almacenamiento persistente: guarda conexión antes de recargar.

El servidor valida tamaño, turno, revisión, IDs, cantidad, números finitos y límites de velocidad. Un cliente no elige arbitrariamente función o estado oficial. Una invitación usada por otra clave se rechaza. Esto no convierte el proyecto en un servicio auditado contra toda amenaza.

## Ejecución de código

Los programas de competidores corren en sus ordenadores. No hay carga ni ejecución de código ajeno en el servidor. Se intercambian observaciones y comandos según contrato. Usa HTTPS fuera de localhost y guarda los archivos de conexión en privado.

## Hardware

Claves de sala no autentican radio física. El puente usa HMAC por robot, plazos cortos y supervisión. Pérdida de Wi-Fi, caducidad o credenciales vacías desactivan el controlador. No sustituyen interruptor físico, protección eléctrica ni inspección de banco. No se activaron motores reales durante el desarrollo. El firmware no mide velocidad ni batería; el corte por baja tensión requiere circuito externo adecuado.

Esquema, carcasa y BOM son propuestas originales sin PCB fabricado ni montaje físico validado. Revisa electricidad y mecánica antes de energizar. Consulta [el registro de verificación](/docs/verification) para evidencias.
