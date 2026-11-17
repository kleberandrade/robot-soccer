# Cómo sincronizan las salas privadas a los equipos

La sala tiene estado oficial, revisión y turno monotónico. Está separada de partidos públicos: saber su UUID no concede lectura. No existe endpoint público para enumerar salas.

## Credenciales por función

La creación usa la credencial del operador. Después hay accesos separados de anfitrión, espectador y cada equipo. Las invitaciones reclaman un solo lado. La base guarda hashes, no secretos recuperables. La interfaz mantiene claves en memoria y permite guardar conexión privada; no van a URL ni almacenamiento persistente del navegador. Caducan a las 24 horas.

## Turno compartido

El primer equipo envía comandos del turno y espera. El otro completa el turno. El servidor aplica ambos hasta seis pasos respetando al árbitro. Comparación atómica de revisión e intentos limitados concilian peticiones concurrentes. Peticiones repetidas o antiguas no generan movimiento adicional.

## Fallos y decisiones

Pausar, reiniciar o sancionar incrementa turno y vacía pendientes. Un comando previo al silbato no puede filtrarse después. Si un cliente cae, la sala se congela esperando al ausente. La reconexión con clave guardada recupera su función. El frontend descarta respuestas antiguas para no hacer retroceder la interfaz.

## Compromisos

Se evita servicio continuo y ejecución de código ajeno en Vercel, pero red y base de datos afectan velocidad. No se garantiza tiempo real, abandono automático, emparejamiento público ni victoria automática. El árbitro humano sigue gestionando reinicios. `docs/adr/0002-private-remote-rooms.md` contiene el registro original.
