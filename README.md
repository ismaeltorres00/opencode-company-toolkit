# Company OpenCode Toolkit

Repositorio central de capacidades compartidas para OpenCode. Publica skills por HTTP y mantiene ejemplos reutilizables de agentes, comandos y MCP.

Cada proyecto decide que capacidades consume. No se instala el toolkit completo de forma global.

## Estructura

```text
catalogs/                 Skills publicables por HTTP
  global/                 Capacidades comunes
    index.json
    jira/SKILL.md
  dotnet/                 Ejemplo de scope tecnologico
    dotnet-review/SKILL.md
  node/                   Ejemplo de scope tecnologico
    node-review/SKILL.md
  frontend/               Ejemplo de scope tecnologico
    frontend-review/SKILL.md
agents/                   Agentes para copiar al proyecto consumidor
  code-reviewer.md
commands/                 Comandos para copiar al proyecto consumidor
  review.md
mcp/                      Fragmentos de configuracion MCP
  jira.example.jsonc
cli/bin.mjs               CLI para instalar y sincronizar recursos locales
toolkit.manifest.json     Registro de scopes y recursos disponibles
scripts/validate-catalogs.mjs
scripts/serve-catalogs.mjs
```

## Skills remotas

Un catalogo es un directorio HTTP con un `index.json`. Cada skill debe estar en `catalogs/<scope>/<skill>/SKILL.md` y su nombre debe coincidir con el declarado en el indice.

El catalogo `global` incluye la skill `jira`. Los catalogos `dotnet`, `node` y `frontend` incluyen una skill de revision de ejemplo para probar la composicion por tecnologia.

```text
catalogs/global/
  index.json
  jira/SKILL.md
```

Publica el contenido de `catalogs/` en un host estatico. Si se publica en `https://ai.example.com/skills/`, un proyecto configura la skill asi:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "skills": {
    "urls": ["https://ai.example.com/skills/global/"]
  }
}
```

Para probarlo localmente desde la raiz del repositorio:

```bash
node scripts/serve-catalogs.mjs 8080
```

Y en un proyecto de prueba:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "skills": {
    "urls": ["http://localhost:8080/global/"]
  }
}
```

## Scopes

`global` contiene capacidades comunes y debe mantenerse pequeño. Se pueden publicar mas catalogos sin cambiar el modelo:

```text
catalogs/
  global/
  dotnet/
  frontend/
  payments/
  booking-api/
```

Un proyecto compone solo los scopes que necesita:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "skills": {
    "urls": [
      "https://ai.example.com/skills/global/",
      "https://ai.example.com/skills/dotnet/",
      "https://ai.example.com/skills/booking-api/"
    ]
  }
}
```

Los scopes pueden representar una tecnologia, un dominio o un proyecto. El proyecto consumidor mantiene sus reglas propias en `AGENTS.md`.

## CLI del toolkit

El CLI automatiza el consumo por proyecto. Las skills se registran como URLs remotas y los agentes/comandos se copian a `.opencode/`, donde OpenCode los descubre.

El paquete se publica como `@ismaeltorres00/opencode-toolkit`. El comando `npx` no funcionara hasta publicar la primera version en npm.

Para probar el CLI sin publicarlo, ejecútalo desde un clon local del toolkit:

```bash
node "C:\ruta\a\opencode-company-toolkit\cli\bin.mjs" init
```

Tras publicarlo en el registro interno, un proyecto nuevo ejecuta:

```bash
npx @ismaeltorres00/opencode-toolkit init
```

El asistente muestra el logo corporativo y selectores de teclado. Usa flechas para moverte, espacio para marcar y Enter para confirmar. `global` siempre esta incluido; marca `dotnet`, `node`, `frontend` u otros scopes publicados segun el proyecto. El usuario puede marcar agentes, comandos y MCP sin escribir nombres ni URLs.

La URL de catalogos por defecto es `https://ismaeltorres00.github.io/opencode-company-toolkit/catalogs`. Solo es necesario usar `--catalog-base-url` si se publica el catalogo en otro host.

Durante el desarrollo del toolkit se puede ejecutar directamente:

```bash
node <ruta-al-toolkit>/cli/bin.mjs init
```

Tambien admite instalacion no interactiva:

```bash
node <ruta-al-toolkit>/cli/bin.mjs init \
  --scope global,dotnet \
  --command review \
  --mcp jira \
  --yes
```

El comando `review` requiere `code-reviewer`; el CLI incorpora ese agente automaticamente.

El selector de notificaciones activa por defecto `update-notice`. Este plugin comprueba npm al iniciar `opencode` y muestra un aviso cuando existe una version mas reciente del toolkit. Puede desmarcarse durante la instalacion o despues con `configure`.

Los archivos gestionados quedan registrados en el proyecto:

```text
.opencode/
  toolkit.json             Selecciones del proyecto
  toolkit-lock.json        Version y hashes de recursos gestionados
  agents/code-reviewer.md
  commands/review.md
```

Gestion posterior:

```bash
npx @ismaeltorres00/opencode-toolkit configure  # Cambiar selecciones de forma interactiva
npx @ismaeltorres00/opencode-toolkit@latest update --dry-run  # Previsualizar la actualizacion
npx @ismaeltorres00/opencode-toolkit@latest update            # Aplicar la actualizacion
npx @ismaeltorres00/opencode-toolkit status     # Ver selecciones y modificaciones locales
npx @ismaeltorres00/opencode-toolkit check      # Fallar si hay recursos ausentes o modificados
npx @ismaeltorres00/opencode-toolkit remove --kind scope --name dotnet
npx @ismaeltorres00/opencode-toolkit remove --kind command --name review
npx @ismaeltorres00/opencode-toolkit remove --kind plugin --name update-notice
```

Los recursos no se actualizan solos. Cuando alguien cambie un agente en el toolkit, debe publicar una nueva version npm. Cada proyecto decide cuando revisar y aplicar esa version con `update`.

`status` compara la version instalada en el proyecto con la version del CLI que se esta ejecutando. `update --dry-run` muestra que recursos se instalarian, actualizarian o eliminarian sin escribir archivos. `update` hace un preflight de todos los recursos antes de modificar nada: si uno tiene cambios locales, cancela la operacion completa. No sobrescribe ni elimina un agente o comando modificado localmente sin `--force`.

Tras revisar el diff local, se puede aceptar una actualizacion forzada de forma explicita:

```bash
npx @ismaeltorres00/opencode-toolkit@latest update --force
```

Al quitar un scope, elimina su URL gestionada de `opencode.jsonc`; al quitar un MCP, elimina solamente su bloque gestionado.

`update-notice` consulta una vez el registro npm en segundo plano, con un timeout de 1.5 segundos. No bloquea OpenCode, no envia contenido del proyecto y no muestra nada si npm no responde o no hay una version mas reciente.

Al actualizar `opencode.jsonc`, conserva las claves de configuracion existentes, pero normaliza el archivo como JSON y elimina sus comentarios. Mantener las reglas de proyecto en `AGENTS.md` evita mezclar instrucciones con esta configuracion gestionada.

## MCP de Jira

`mcp/jira.example.jsonc` es el recurso que instala el CLI al seleccionar Jira. Sustituye la URL de ejemplo por la del servidor MCP corporativo antes de distribuir el toolkit:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "jira": {
      "type": "remote",
      "url": "https://mcp.example.com/jira",
      "oauth": {}
    }
  }
}
```

`oauth: {}` permite el registro OAuth dinamico cuando el servidor lo soporta. No se deben guardar tokens, secretos ni credenciales en este repositorio.

## Validacion

Ejecuta antes de publicar:

```bash
node scripts/validate-catalogs.mjs
```

El validador comprueba el contrato de catalogos remotos de OpenCode: `index.json`, nombres unicos, `SKILL.md` y el frontmatter basico. El workflow de GitHub ejecuta esta misma comprobacion en cada pull request y en `main`.

Tras cambiar `opencode.json(c)`, agentes, comandos o skills, reinicia OpenCode: carga la configuracion al arrancar.

## Publicacion

Consulta [`docs/PUBLISHING.md`](docs/PUBLISHING.md) para publicar el paquete npm, distribuir los catalogos HTTP y resolver requisitos de 2FA.

## Guia De Usuario

Consulta [`docs/USER-GUIDE.md`](docs/USER-GUIDE.md) para instalar, configurar, actualizar y eliminar recursos desde un proyecto consumidor.

## Crear Recursos

En el repositorio central, pide a OpenCode algo como: `Crea una skill de testing para React en el scope frontend` o `Crea un agente para revisar seguridad`. La skill global `toolkit-authoring` guiara la creacion, registros, dependencias, validacion y empaquetado. No debe usarse desde repositorios consumidores.
