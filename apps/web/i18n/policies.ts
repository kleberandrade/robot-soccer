export const policySlugs = ["privacy", "terms", "contributing"] as const;
export type PolicySlug = (typeof policySlugs)[number];
export const policies = {
  "pt-BR": {
    privacy: `# Política de privacidade

Atualizada em 17 de novembro de 2026. Esta página descreve a implementação atual do ROBOTSOCCER, projeto aberto mantido por Kléber de Oliveira Andrade. O código e os canais do responsável estão no [GitHub do projeto](https://github.com/kleberandrade/robot-soccer) e no [perfil do mantenedor](https://github.com/kleberandrade).

## O que o site utiliza

A navegação pública e a prévia local não exigem cadastro. Nas salas, são armazenados nome da competição, nomes escolhidos pelos times, estado da partida, turnos, horários e hashes das credenciais. Use apelidos e não inclua dados sensíveis nos nomes. A finalidade é identificar participantes, autorizar acessos e executar a competição. Os programas dos times rodam em seus próprios computadores; o servidor recebe comandos, não o código da estratégia.

## Idioma e chaves

O cookie funcional **rs-locale** guarda apenas pt-BR, en ou es por até um ano, para lembrar sua preferência. Você pode removê-lo no navegador; links com idioma explícito continuam funcionando. Não há código próprio de publicidade ou análise comportamental instalado nesta versão. Hospedagem pode processar registros técnicos como IP, horário, URL e erros para operação e segurança.

As chaves privadas das salas ficam na memória do navegador e podem ser baixadas por você em um arquivo de conexão. Não são colocadas na URL nem em armazenamento persistente do navegador. O banco guarda hashes das chaves. Recarregar a página exige a conexão salva. Nunca publique o arquivo ou suas chaves em issues ou capturas.

## Infraestrutura e retenção

A aplicação publicada usa Vercel e PostgreSQL hospedado na Neon. Esses fornecedores processam requisições e dados necessários ao serviço segundo suas próprias condições: [Vercel](https://vercel.com/legal/privacy-policy) e [Neon](https://neon.com/privacy-policy). Links para GitHub e sites de fabricantes levam a serviços independentes.

O acesso às salas expira após 24 horas. **Expiração de acesso não é exclusão automática:** a implementação atual não possui rotina de remoção de registros expirados. Partidas persistidas e seus replays também podem continuar no banco até remoção operacional. Prazos de logs e backups dependem da infraestrutura e não são certificados por esta página. Não use o serviço para informação que exija uma garantia de retenção ou eliminação específica.

## Solicitações e dúvidas

Para pedir informações, correção ou eliminação de dados ligados ao seu uso, procure o mantenedor pelos canais do perfil GitHub acima. Se precisar iniciar uma issue pública, solicite apenas um canal de contato privado; não publique dados pessoais, documentos, chaves ou credenciais. Pode ser necessária uma verificação mínima do vínculo com a sala, sem divulgar segredos publicamente. Direitos e limites aplicáveis dependem da legislação; consulte as [orientações da ANPD sobre direitos dos titulares](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares).

Esta descrição deve ser revista se o serviço passar a coletar novos dados, adicionar analytics, contas ou novos fornecedores.`,
    terms: `# Termos de uso

Atualizados em 17 de novembro de 2026. ROBOTSOCCER é um laboratório educacional aberto para estudar futebol de robôs, estratégias e hardware de referência. O projeto é mantido por Kléber de Oliveira Andrade, com origem na Fatec Americana.

## Uso do laboratório

Você pode estudar, executar exemplos e criar competições privadas dentro dos recursos disponíveis. Use somente salas e credenciais que recebeu legitimamente. Não tente acessar dados de outros participantes, contornar validações, sobrecarregar o serviço ou enviar comandos fora do contrato. Não inclua dados sensíveis em nomes ou exemplos.

O anfitrião controla convites e arbitragem e deve compartilhar cada acesso apenas com seu destinatário. Participantes executam seus programas localmente e são responsáveis pelo código que executam e pelos arquivos de conexão que guardam. Não existe serviço de execução de código enviado por competidores.

## Disponibilidade e resultados

O projeto é experimental. Rede, banco e manutenção podem interromper ou reduzir a velocidade das partidas. Não há promessa de tempo real, disponibilidade contínua, preservação indefinida de replays, premiação ou validade de resultados para um campeonato. O regulamento do organizador e suas emendas prevalecem; o simulador não está homologado.

## Hardware e fabricação

Esquema, BOM, firmware e case são referências didáticas. Compilação e verificações geométricas não demonstram segurança elétrica, resistência, temperatura, ajuste de peças ou conformidade de um robô físico. A construção e o acionamento precisam de revisão técnica e procedimentos de bancada adequados. O modo padrão de firmware e bridge não autoriza uso físico sem configuração e validação.

## Código e conteúdo

O código é disponibilizado pela [licença MIT do repositório](https://github.com/kleberandrade/robot-soccer/blob/master/LICENSE), incluindo seus avisos e limitações de garantia na extensão permitida pela legislação. Preserve os créditos e avisos exigidos. Regulamentos, marcas e documentos externos pertencem aos respectivos titulares e mantêm suas próprias condições. Esses termos não retiram direitos que não possam ser afastados pela legislação aplicável.

Leia a [política de privacidade](/privacy) para o tratamento de dados e o [guia de contribuição](/contributing) para colaborar. Mudanças relevantes devem ser registradas com nova data nesta página.`,
    contributing: `# Contribua com o ROBOTSOCCER

Ajude a tornar o laboratório mais claro, reproduzível e útil. Você pode contribuir com estratégias, testes, traduções, documentação, acessibilidade, desenhos ou resultados de protótipos físicos.

## 1. Escolha uma melhoria pequena

Consulte as [issues](https://github.com/kleberandrade/robot-soccer/issues) e abra uma proposta com problema, comportamento esperado e como reproduzir. Para erros, informe versão e ambiente, removendo chaves, arquivos de conexão e dados pessoais. Não publique vulnerabilidades ou segredos em detalhes; procure primeiro um canal privado do mantenedor.

## 2. Prepare o projeto

Faça um fork, crie uma branch e execute na raiz:

\`\`\`sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
\`\`\`

A prévia local não exige banco. Para alterações de persistência, use um PostgreSQL local dedicado e migrações, nunca credenciais de produção. O motor e as políticas ficam em packages/engine; interface em apps/web; hardware e firmware em diretórios próprios.

## 3. Teste o comportamento afetado

Inclua teste quando houver regra ou comportamento novo. Para protocolo embarcado, execute npm run test:firmware; mudanças no firmware também passam pela compilação PlatformIO. Para case e esquemas, verifique malhas e desenhos e regenere os downloads. Uma mudança no guia deve atualizar o ZIP durante o prebuild.

Nas traduções, mantenha pt-BR, en e es consistentes. Identificadores de API, campos JSON, comandos e nomes de arquivos não são traduzidos. Respeite a preferência por movimento reduzido e navegação por teclado.

## 4. Abra uma pull request

Descreva o problema, a mudança e as verificações realizadas; inclua imagens para alterações visuais. Diferencie testes em software de ensaios físicos. Preserve créditos históricos, fontes primárias e avisos de limitações. As contribuições seguem a licença MIT existente do projeto; não envie conteúdo de terceiros sem permissão compatível.

[Ver código no GitHub](https://github.com/kleberandrade/robot-soccer)`,
  },
  en: {
    privacy: `# Privacy policy

Updated November 17, 2026. This page describes the current implementation of ROBOTSOCCER, an open project maintained by Kléber de Oliveira Andrade. Source and contact channels are available in the [project repository](https://github.com/kleberandrade/robot-soccer) and [maintainer profile](https://github.com/kleberandrade).

## Information used

Public browsing and local previews require no registration. Rooms store competition names, chosen team names, match state, turns, timestamps and credential hashes. Use nicknames and avoid sensitive information in names. This information identifies participants, authorizes access and runs the competition. Team programs execute on participants' computers; the server receives commands, not strategy source code.

## Language and credentials

The functional **rs-locale** cookie stores only pt-BR, en or es for up to one year to remember your preference. You can remove it in your browser; explicit language links still work. This version has no application-installed advertising or behavioral analytics code. Hosting may process technical records such as IP address, time, URL and errors for operation and security.

Private room keys remain in browser memory and may be downloaded by you as a connection file. They are not added to URLs or persistent browser storage. The database stores hashes. Reloading requires your saved connection. Never publish connection files or keys in issues or screenshots.

## Infrastructure and retention

The published application uses Vercel and Neon-hosted PostgreSQL. These providers process requests and data necessary for the service under their own policies: [Vercel](https://vercel.com/legal/privacy-policy) and [Neon](https://neon.com/privacy-policy). Links to GitHub and component manufacturers lead to independent services.

Room access expires after 24 hours. **Access expiry is not automatic deletion:** the current implementation has no cleanup task for expired records. Persisted matches and replays can also remain until operational removal. Log and backup retention depends on the infrastructure and is not certified by this page. Do not use this service for information requiring a specific retention or deletion guarantee.

## Requests and questions

For information, correction or deletion requests about your usage, contact the maintainer through channels listed on the GitHub profile above. If starting a public issue, request only a private contact channel; do not publish personal information, identity documents, keys or credentials. A minimal verification of your relationship to a room may be needed without exposing secrets publicly. Applicable rights and limits depend on law; see the [ANPD guidance on data-subject rights](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares).

This description must be reviewed if the service adds new data collection, analytics, accounts or providers.`,
    terms: `# Terms of use

Updated November 17, 2026. ROBOTSOCCER is an open educational laboratory for robot football, strategies and reference hardware, maintained by Kléber de Oliveira Andrade and originating at Fatec Americana.

## Laboratory use

You may study, run examples and create private competitions within available resources. Use only rooms and credentials legitimately provided to you. Do not access other participants' information, bypass validation, overload the service or send commands outside its contract. Keep sensitive information out of names and examples.

The host manages invitations and refereeing and should share each credential only with its recipient. Participants run programs locally and are responsible for code they execute and connection files they keep. No competitor-submitted code is executed on the server.

## Availability and results

This is an experimental project. Network, database and maintenance can interrupt or slow matches. There is no promise of real-time service, continuous availability, indefinite replay retention, prizes or championship validity. The organizer's rules and amendments take precedence; the simulator is not homologated.

## Hardware and fabrication

Schematics, BOM, firmware and case are educational references. Compilation and geometry checks do not establish electrical safety, strength, thermal performance, fit or physical robot compliance. Construction and actuation require technical review and appropriate bench procedures. Default firmware and bridge modes do not authorize physical operation without configuration and validation.

## Source and content

Source is available under the repository's [MIT license](https://github.com/kleberandrade/robot-soccer/blob/master/LICENSE), including its notices and warranty limitations to the extent allowed by applicable law. Preserve required notices and credits. External rules, trademarks and documents belong to their respective holders and retain their own terms. These terms do not remove rights that applicable law does not allow to be waived.

Read the [privacy policy](/privacy) and [contribution guide](/contributing). Material changes should be recorded with a new date on this page.`,
    contributing: `# Contribute to ROBOTSOCCER

Help make the laboratory clearer, reproducible and useful. Contributions can improve strategies, tests, translations, documentation, accessibility, drawings or measured physical prototype results.

## 1. Choose a small improvement

Check [issues](https://github.com/kleberandrade/robot-soccer/issues) and propose the problem, expected behavior and reproduction steps. Report versions and environment without keys, connection files or personal data. Do not publicly disclose vulnerability details or secrets; seek a private maintainer channel first.

## 2. Prepare the project

Fork, create a branch and run from the root:

\`\`\`sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
\`\`\`

Local preview needs no database. Persistence changes need dedicated local PostgreSQL and migrations, never production credentials. Engine and policies live in packages/engine, UI in apps/web, with separate hardware and firmware directories.

## 3. Verify affected behavior

Include a meaningful test for a new rule or behavior. Run npm run test:firmware for embedded protocol changes; firmware also compiles with PlatformIO. For case and schematic changes, check meshes and drawings and regenerate downloads. Guide edits must flow into the ZIP at prebuild.

Keep pt-BR, en and es aligned. Do not translate API identifiers, JSON fields, commands or filenames. Respect reduced-motion preferences and keyboard navigation.

## 4. Open a pull request

Explain the problem, resulting change and validation; include images for visual work. Distinguish software checks from physical tests. Preserve historical credits, primary references and limitations. Contributions follow the existing MIT project license; do not submit third-party content without compatible permission.

[View source on GitHub](https://github.com/kleberandrade/robot-soccer)`,
  },
  es: {
    privacy: `# Política de privacidad

Actualizada el 17 de noviembre de 2026. Describe la implementación actual de ROBOTSOCCER, proyecto abierto mantenido por Kléber de Oliveira Andrade. Código y canales de contacto están en el [repositorio](https://github.com/kleberandrade/robot-soccer) y [perfil del mantenedor](https://github.com/kleberandrade).

## Información utilizada

Navegación pública y vista previa local no requieren registro. Las salas guardan nombre de competición, nombres de equipos, estado del partido, turnos, fechas y hashes de credenciales. Usa apodos sin datos sensibles. Sirven para identificar participantes, autorizar accesos y ejecutar la competición. Los programas corren en los ordenadores de participantes; el servidor recibe comandos, no código de estrategia.

## Idioma y claves

La cookie funcional **rs-locale** guarda solo pt-BR, en o es hasta un año para recordar preferencia. Puedes borrarla; los enlaces con idioma explícito siguen funcionando. Esta versión no instala código propio de publicidad ni análisis conductual. El alojamiento puede procesar IP, hora, URL y errores para operación y seguridad.

Las claves privadas permanecen en memoria del navegador y puedes descargarlas como archivo de conexión. No van en URL ni almacenamiento persistente del navegador. La base guarda hashes. Recargar requiere la conexión guardada. Nunca publiques claves o archivos en incidencias o capturas.

## Infraestructura y conservación

La aplicación usa Vercel y PostgreSQL alojado en Neon. Procesan solicitudes y datos necesarios según sus políticas: [Vercel](https://vercel.com/legal/privacy-policy) y [Neon](https://neon.com/privacy-policy). GitHub y fabricantes son servicios independientes.

El acceso a salas caduca a las 24 horas. **Caducidad de acceso no significa eliminación automática:** no existe tarea de limpieza de registros caducados en esta implementación. Partidos y repeticiones pueden permanecer hasta eliminación operativa. Conservación de logs y copias depende de la infraestructura y no queda certificada aquí. No uses el servicio para información que exija garantías específicas de conservación o eliminación.

## Solicitudes

Para información, corrección o eliminación de datos de tu uso, contacta al mantenedor por los canales del perfil GitHub indicado. Si abres una incidencia pública, pide solo contacto privado; no publiques datos personales, documentos, claves ni credenciales. Puede requerirse verificación mínima del vínculo con la sala sin revelar secretos. Derechos y límites dependen de la legislación; consulta la [orientación de ANPD](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares).

Revisa esta descripción si se añaden datos, analítica, cuentas o proveedores.`,
    terms: `# Términos de uso

Actualizados el 17 de noviembre de 2026. ROBOTSOCCER es un laboratorio educativo abierto de fútbol de robots, estrategias y hardware de referencia, mantenido por Kléber de Oliveira Andrade y originado en Fatec Americana.

## Uso

Puedes estudiar, ejecutar ejemplos y crear competiciones privadas dentro de los recursos disponibles. Usa solo salas y credenciales recibidas legítimamente. No accedas a datos ajenos, eludas validaciones, sobrecargues el servicio ni envíes comandos fuera del contrato. No incluyas datos sensibles en nombres o ejemplos.

El anfitrión gestiona invitaciones y arbitraje y debe compartir cada acceso solo con su destinatario. Los participantes ejecutan código localmente y son responsables de sus programas y archivos de conexión. No hay ejecución de código enviado por competidores en el servidor.

## Disponibilidad y resultados

El proyecto es experimental. Red, base de datos y mantenimiento pueden interrumpir o ralentizar partidos. No se promete tiempo real, disponibilidad continua, conservación indefinida, premios ni validez oficial. Prevalecen reglas y enmiendas del organizador; el simulador no está homologado.

## Hardware y fabricación

Esquema, BOM, firmware y carcasa son referencias didácticas. Compilar y verificar geometría no demuestra seguridad eléctrica, resistencia, temperatura, ajuste ni conformidad física. Construcción y activación requieren revisión técnica y procedimientos adecuados de banco. Los modos predeterminados no autorizan operación física sin configuración y validación.

## Código y contenido

El código usa la [licencia MIT](https://github.com/kleberandrade/robot-soccer/blob/master/LICENSE), con sus avisos y límites de garantía en la medida permitida por ley. Conserva créditos y avisos exigidos. Reglamentos, marcas y documentos externos pertenecen a sus titulares y conservan sus condiciones. Estos términos no eliminan derechos que la ley no permite renunciar.

Lee [privacidad](/privacy) y [contribución](/contributing). Los cambios relevantes deben registrarse con nueva fecha.`,
    contributing: `# Contribuye a ROBOTSOCCER

Ayuda a hacer el laboratorio más claro, reproducible y útil. Puedes aportar estrategias, pruebas, traducciones, documentación, accesibilidad, planos o resultados medidos de prototipos.

## 1. Elige una mejora pequeña

Consulta [incidencias](https://github.com/kleberandrade/robot-soccer/issues) y describe problema, comportamiento esperado y reproducción. Informa versión y entorno sin claves, conexiones ni datos personales. No publiques detalles de vulnerabilidades o secretos; busca primero un canal privado del mantenedor.

## 2. Prepara el proyecto

Haz un fork, crea una rama y ejecuta en la raíz:

\`\`\`sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
\`\`\`

La vista previa no requiere base de datos. Para persistencia usa PostgreSQL local dedicado y migraciones, nunca credenciales de producción. Motor y políticas están en packages/engine, interfaz en apps/web; hardware y firmware tienen directorios propios.

## 3. Verifica el comportamiento

Añade una prueba útil para reglas o comportamientos nuevos. Ejecuta npm run test:firmware para protocolo embebido; firmware también compila con PlatformIO. Para carcasa y esquema, verifica mallas y planos y regenera descargas. El prebuild debe incorporar cambios de guía al ZIP.

Mantén pt-BR, en y es consistentes. No traduzcas identificadores de API, campos JSON, comandos ni archivos. Respeta movimiento reducido y navegación por teclado.

## 4. Abre una pull request

Explica problema, cambio y verificaciones; incluye imágenes si cambias apariencia. Distingue pruebas de software de ensayos físicos. Conserva créditos históricos, fuentes primarias y límites. Las contribuciones siguen la licencia MIT existente; no envíes contenido de terceros sin permiso compatible.

[Ver código en GitHub](https://github.com/kleberandrade/robot-soccer)`,
  },
};
