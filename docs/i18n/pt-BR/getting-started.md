# Instalação e visão geral

O projeto é um monorepo npm com Turborepo. Requer Node.js 22 ou superior. A aplicação Next.js está em `apps/web`; o motor determinístico e as estratégias ficam em `packages/engine`; protocolo e banco são pacotes compartilhados. O hardware e o firmware têm diretórios próprios.

```sh
npm ci
npm run dev
```

Abra [o laboratório](/lab). A prévia funciona sem banco. Use Koativa e Circuit para experimentar. A [biblioteca](/docs) explica rodas, câmera e arbitragem.

## Persistência e configuração

Partidas no servidor precisam de PostgreSQL, `DATABASE_URL` e `MATCH_ADMIN_TOKEN` privados. Configure-os fora do código e aplique as migrações com `npm run db:migrate`. Nunca compartilhe arquivos reais `.env`. Para usar a interface como participante, você recebe o convite do anfitrião, não a chave do operador.

```sh
npm run typecheck
npm test
npm run test:firmware
npm run build
```

A integração contínua verifica software, compilação embarcada e geometria. A publicação na Vercel usa `apps/web` e o comando de preparação sincroniza os downloads do hardware antes de compilar. Não altere credenciais de produção para executar uma prévia local.

## Onde continuar

Leia [a primeira partida](/docs/first-match), [o protocolo](/docs/protocol) e [as salas privadas](/docs/remote-competition). Em [hardware](/hardware), o esquema, o case e o firmware estão separados por função. Os arquivos legados e o histórico original são preservados no repositório; a origem Fatec Americana não foi renomeada.
