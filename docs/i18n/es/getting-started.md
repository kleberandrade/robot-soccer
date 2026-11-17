# Instalación y visión general

El proyecto es un monorepo npm con Turborepo y requiere Node.js 22 o superior. Next.js vive en `apps/web`; el motor y las estrategias, en `packages/engine`; protocolo y base de datos son paquetes compartidos. Hardware y firmware tienen directorios propios.

```sh
npm ci
npm run dev
```

Abre [el laboratorio](/lab). La vista previa funciona sin base de datos. Usa Koativa y Circuit para experimentar. La [biblioteca](/docs) explica ruedas, cámara y arbitraje.

## Persistencia y configuración

Los partidos en el servidor requieren PostgreSQL, `DATABASE_URL` y `MATCH_ADMIN_TOKEN` privados. Configúralos fuera del código y aplica migraciones con `npm run db:migrate`. Nunca compartas archivos `.env` reales. Los participantes reciben invitaciones, no la clave del operador.

```sh
npm run typecheck
npm test
npm run test:firmware
npm run build
```

La integración continua verifica software, compilación embebida y geometría. Vercel publica `apps/web`; la preparación sincroniza descargas de hardware antes de compilar. No cambies credenciales de producción para ejecutar una vista previa local.

Continúa con [el primer partido](/docs/first-match), [el protocolo](/docs/protocol) y [las salas privadas](/docs/remote-competition). En [hardware](/hardware), esquema, carcasa y firmware se separan por función. Se conservan archivos heredados e historial original; el origen Fatec Americana no se ha renombrado.
