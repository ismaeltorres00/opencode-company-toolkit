# Guia De Usuario

Esta guia explica como instalar y gestionar el toolkit de OpenCode desde un proyecto consumidor.

## Inicio Rapido

En la raiz del proyecto:

```powershell
npx @ismaeltorres00/opencode-toolkit@latest init
```

El instalador muestra el logo de GAC Travel y cuatro selectores. Usa:

- Flechas arriba y abajo para moverte.
- Espacio para marcar o desmarcar.
- Enter para confirmar cada selector.

No hay que escribir nombres de scopes, agentes, comandos ni MCP. Tampoco hay que indicar la URL de catalogos en la instalacion normal.

## Que Seleccionar

### Scopes

`global` siempre esta incluido. Marca los scopes tecnicos, de dominio o de proyecto que correspondan:

- `dotnet` para proyectos .NET.
- `node` para proyectos Node.js.
- `frontend` para aplicaciones frontend.
- Cualquier scope nuevo publicado en `catalogs/`, por ejemplo `react` o `payments`.

Los scopes determinan las skills remotas disponibles en OpenCode. Un proyecto .NET con `global` y `dotnet` obtiene actualmente `jira` y `dotnet-review`.

### Agentes

Los agentes se copian a `.opencode/agents/`. Selecciona solo los que el proyecto necesite.

### Comandos

Los comandos se copian a `.opencode/commands/`. El comando `review` depende del agente `code-reviewer`; al marcarlo, el instalador incluye automaticamente su agente.

### MCP

Los MCP se añaden al bloque `mcp` de `opencode.jsonc`. El ejemplo `jira` usa una URL de ejemplo; debe sustituirse por el endpoint corporativo real antes de utilizar la integracion.

### Notificaciones

`update-notice` esta marcado por defecto. Instala un plugin local en `.opencode/plugins/` que, al iniciar `opencode`, consulta npm en segundo plano y muestra un toast si existe una version posterior del toolkit.

La comprobacion tiene un timeout de 1.5 segundos, no bloquea el inicio y no envia contenido ni rutas del proyecto. Si no quieres conexiones a npm al iniciar OpenCode, desmarcalo en el selector.

## Archivos Creados

La instalacion crea o actualiza:

```text
opencode.jsonc
.opencode/
  toolkit.json
  toolkit-lock.json
  agents/
  commands/
```

`toolkit.json` guarda las selecciones del proyecto. `toolkit-lock.json` guarda la version y hashes de los archivos gestionados para detectar modificaciones locales.

El instalador conserva las claves existentes de `opencode.jsonc`, pero normaliza el archivo a JSON y elimina comentarios. Las reglas especificas del proyecto deben vivir en `AGENTS.md`.

## Comprobar El Estado

Ejecuta:

```powershell
npx @ismaeltorres00/opencode-toolkit@latest status
```

Muestra:

- La version gestionada actualmente por el proyecto.
- La version del toolkit que se esta ejecutando.
- Los scopes, agentes, comandos y MCP seleccionados.
- Archivos ausentes o modificados localmente.

Para usarlo en CI o fallar cuando haya diferencias:

```powershell
npx @ismaeltorres00/opencode-toolkit@latest check
```

## Anadir O Quitar Recursos

La forma recomendada es volver a abrir los selectores:

```powershell
npx @ismaeltorres00/opencode-toolkit@latest configure
```

Marca o desmarca scopes, agentes, comandos y MCP. El CLI aplica las dependencias automaticamente.

Para eliminar un recurso concreto sin abrir el asistente:

```powershell
npx @ismaeltorres00/opencode-toolkit@latest remove --kind scope --name dotnet
npx @ismaeltorres00/opencode-toolkit@latest remove --kind mcp --name jira
npx @ismaeltorres00/opencode-toolkit@latest remove --kind command --name review
npx @ismaeltorres00/opencode-toolkit@latest remove --kind agent --name code-reviewer
npx @ismaeltorres00/opencode-toolkit@latest remove --kind plugin --name update-notice
```

Si un comando depende de un agente, elimina primero el comando. Por ejemplo, primero `review` y despues `code-reviewer`.

## Actualizar De Forma Segura

Los recursos no se actualizan solos. El flujo es:

1. Un mantenedor cambia un recurso en el toolkit.
2. El mantenedor publica una nueva version npm.
3. Cada proyecto decide cuando revisa y aplica esa version.

Primero previsualiza el resultado:

```powershell
npx @ismaeltorres00/opencode-toolkit@latest update --dry-run
```

Muestra que agentes o comandos se instalarian, actualizarian o eliminarian, sin modificar archivos.

Para aplicar una actualizacion revisada:

```powershell
npx @ismaeltorres00/opencode-toolkit@latest update
```

Antes de escribir, el CLI revisa todos los archivos gestionados. Si encuentra un cambio local, cancela la operacion completa: no actualiza unos recursos y deja otros a medias.

## Resolver Cambios Locales

Si un desarrollador modifica, por ejemplo, `.opencode/agents/code-reviewer.md`, el lock detecta que ya no coincide con la version que instalo el toolkit.

Opciones:

1. Mantener el cambio local y no ejecutar `update`.
2. Comparar manualmente el cambio local con la nueva version del toolkit.
3. Aceptar explicitamente la version del toolkit:

```powershell
npx @ismaeltorres00/opencode-toolkit@latest update --force
```

`--force` sobrescribe o borra recursos gestionados que tengan cambios locales. Usalo solo despues de revisar el cambio que se perdera.

## Aviso Al Iniciar OpenCode

Si se selecciono `update-notice`, ejecutar simplemente:

```powershell
opencode
```

Cuando npm tenga una version mas reciente que la registrada en `.opencode/toolkit-lock.json`, OpenCode mostrara un toast con el comando recomendado:

```powershell
npx @ismaeltorres00/opencode-toolkit@latest update --dry-run
```

El aviso no instala ni actualiza nada automaticamente. Para desactivarlo, ejecuta `configure` y desmarca `update-notice`, o elimina el plugin con el comando `remove`.

## Comprobar Las Skills En OpenCode

Las skills se cargan desde:

```text
https://ismaeltorres00.github.io/opencode-company-toolkit/catalogs
```

Tras instalar o cambiar la configuracion, reinicia OpenCode. Para comprobar la configuracion resuelta:

```powershell
opencode debug config --pure
opencode debug skill --pure
```

Si una skill no aparece, comprueba que el scope esta seleccionado, que la URL del catalogo esta disponible y que OpenCode se ha reiniciado.

## Usar El Comando De Revision

Si se instalo `review`, abre OpenCode en el proyecto y ejecuta:

```text
/review
```

Usa el agente `code-reviewer` en modo de solo lectura para revisar el diff actual.

## URL De Catalogos Alternativa

La instalacion normal usa la URL corporativa por defecto. Solo un administrador debe cambiarla, por ejemplo en una instalacion local o en otro entorno:

```powershell
npx @ismaeltorres00/opencode-toolkit@latest init --catalog-base-url https://ai.empresa.com/skills
```

## Solicitar Un Recurso Nuevo

Los proyectos consumidores no deben crear recursos corporativos directamente. Para solicitar una skill, agente, comando, MCP o scope nuevo, abre OpenCode en el repositorio central del toolkit y pide el recurso en lenguaje natural. Ejemplos:

```text
Crea una skill de testing para React en el scope frontend.
Crea un agente para revisar seguridad en APIs.
Crea un MCP para Confluence usando OAuth y una URL de ejemplo.
```

La skill `toolkit-authoring` se activa para crear el recurso con sus registros, dependencias, validacion y configuracion de empaquetado. El recurso llega a los proyectos solo despues de revisar, publicar una nueva version npm y desplegar el catalogo de skills cuando corresponda.

## Problemas Frecuentes

| Situacion | Accion |
|---|---|
| `npx` no encuentra el paquete | Ejecutar `npx @ismaeltorres00/opencode-toolkit@latest init` y comprobar que la version fue publicada. |
| Una skill no aparece | Ejecutar `opencode debug skill --pure`, comprobar la URL y reiniciar OpenCode. |
| `update` se bloquea | Ejecutar `status`, revisar el archivo local y usar `--force` solo si se acepta perder el cambio. |
| No se puede borrar un agente | Eliminar antes los comandos que dependan de el. |
| Jira no conecta | Sustituir la URL MCP de ejemplo por el endpoint corporativo y completar su autenticacion OAuth. |
