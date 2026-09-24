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

## Agente y comando

`agents/code-reviewer.md` es un agente de solo lectura y `commands/review.md` define `/review`. Copia ambos archivos juntos en el proyecto consumidor:

```text
.opencode/
  agents/code-reviewer.md
  commands/review.md
```

El comando usa el agente `code-reviewer`, por lo que los dos archivos son necesarios.

## MCP de Jira

`mcp/jira.example.jsonc` es un fragmento valido de configuracion. Integra el bloque `mcp.jira` en el `opencode.jsonc` del proyecto y sustituye la URL por la de vuestro servidor MCP:

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
