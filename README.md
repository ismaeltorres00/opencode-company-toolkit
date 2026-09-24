# Company OpenCode Toolkit

Repositorio central para compartir y gobernar capacidades de OpenCode entre equipos y proyectos sin obligar a que todos consuman lo mismo.

El objetivo es separar claramente:

- capacidades globales que deben estar disponibles en todos los proyectos;
- capacidades específicas por tecnología o dominio;
- agentes y comandos reutilizables;
- configuración MCP y plugins;
- configuración propia de cada repositorio consumidor.

La idea principal es **centralizar el contenido pero mantener el consumo opt-in**.

---

## 1. Estructura del repositorio

```text
opencode-company-toolkit/
├── catalogs/                  # Skills publicables como catálogos HTTP
│   ├── global/                # Skills comunes a toda la organización
│   │   ├── index.json
│   │   ├── jira/
│   │   └── git-workflow/
│   ├── dotnet/                # Skills específicas de .NET
│   │   ├── index.json
│   │   ├── dotnet-review/
│   │   └── dotnet-testing/
│   ├── node/                  # Skills específicas de Node.js
│   └── frontend/              # Skills específicas de frontend
│
├── agents/                    # Definiciones reutilizables de agentes
│   ├── backend-developer.md
│   └── code-reviewer.md
│
├── commands/                  # Comandos reutilizables de OpenCode
│   ├── review.md
│   └── test.md
│
├── plugins/                   # Plugins propios o ejemplos de plugins
│   ├── README.md
│   └── example-audit.ts
│
├── mcp/                       # Ejemplos de configuración MCP
│   ├── README.md
│   └── jira.example.jsonc
│
├── configs/                   # Configuraciones de referencia
│   ├── base/
│   ├── profiles/
│   └── examples/
│
├── templates/                 # Plantilla para nuevos proyectos
│   └── project-opencode/
│       ├── AGENTS.md
│       └── opencode.jsonc
│
├── scripts/                   # Herramientas de validación y prueba
│   ├── serve-local.sh
│   └── validate-catalogs.py
│
├── docs/                      # Documentación adicional
│   ├── CONSUMPTION.md
│   ├── GOVERNANCE.md
│   ├── PUBLISHING.md
│   └── SCOPES.md
│
├── CHANGELOG.md
└── README.md
```

---

## 2. Modelo de scopes

No todos los proyectos deben recibir todas las capacidades.

El repositorio está pensado para organizar las skills por scope.

### Global

Capacidades que deberían poder utilizar prácticamente todos los proyectos.

```text
catalogs/global/
├── jira/
└── git-workflow/
```

Ejemplos:

- Jira
- Git
- convenciones corporativas
- documentación común

### Tecnología

Capacidades disponibles solamente para proyectos que utilicen esa tecnología.

```text
catalogs/dotnet/
catalogs/node/
catalogs/frontend/
```

Por ejemplo:

```text
Proyecto API .NET
    global
    dotnet

Proyecto frontend
    global
    frontend

Proyecto Node.js
    global
    node
```

Se pueden añadir más scopes cuando sea necesario:

```text
catalogs/
├── global/
├── dotnet/
├── node/
├── frontend/
├── python/
├── mobile/
├── sabre/
├── amadeus/
└── payments/
```

El nombre del scope representa una capacidad o contexto compartido, no necesariamente un lenguaje.

---

## 3. Skills

Las skills reutilizables viven en `catalogs/`.

Cada catálogo contiene un `index.json` y una carpeta por skill.

Ejemplo:

```text
catalogs/dotnet/
├── index.json
├── dotnet-review/
│   └── dotnet-review.md
└── dotnet-testing/
    └── dotnet-testing.md
```

Un catálogo puede publicarse por HTTP y ser consumido desde `opencode.json`.

### Ejemplo de catálogo

`catalogs/dotnet/index.json`:

```json
{
  "skills": [
    {
      "name": "dotnet-review",
      "version": "1",
      "files": ["dotnet-review.md"]
    },
    {
      "name": "dotnet-testing",
      "version": "1",
      "files": ["dotnet-testing.md"]
    }
  ]
}
```

Cuando una skill cambia de forma relevante, incrementar su `version` permite controlar la actualización del contenido publicado.

---

## 4. Consumo opt-in desde un proyecto

Cada proyecto decide qué catálogos quiere consumir.

### Proyecto .NET

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "skills": [
    "https://ai.empresa.com/skills/global/",
    "https://ai.empresa.com/skills/dotnet/"
  ]
}
```

Este proyecto tendría disponibles:

```text
jira
Git workflow
dotnet-review
dotnet-testing
```

pero no las skills de Node o frontend.

### Proyecto frontend

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "skills": [
    "https://ai.empresa.com/skills/global/",
    "https://ai.empresa.com/skills/frontend/"
  ]
}
```

### Proyecto .NET con Sabre

Si se crea un scope adicional:

```text
catalogs/sabre/
```

el proyecto podría declarar:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "skills": [
    "https://ai.empresa.com/skills/global/",
    "https://ai.empresa.com/skills/dotnet/",
    "https://ai.empresa.com/skills/sabre/"
  ]
}
```

Este es el mecanismo principal de opt-in.

---

## 5. Agentes

Las definiciones compartidas de agentes viven en:

```text
agents/
```

Ejemplos incluidos:

```text
backend-developer.md
code-reviewer.md
```

Los agentes no forman parte automáticamente de los catálogos HTTP de skills.

Deben distribuirse o incorporarse a la configuración OpenCode del proyecto o del entorno que deba utilizarlos.

La recomendación es mantener aquí la **fuente de verdad** de los agentes y decidir posteriormente cómo sincronizarlos con los proyectos que los necesiten.

Ejemplo conceptual:

```text
backend-developer
    ├── skills globales
    ├── skills .NET
    └── herramientas permitidas
```

Un agente debe representar un rol o una forma de trabajar; una skill debe representar una capacidad reutilizable.

---

## 6. Comandos

Los comandos compartidos se almacenan en:

```text
commands/
```

Ejemplos:

```text
review.md
test.md
```

Su objetivo es estandarizar operaciones frecuentes del equipo, por ejemplo:

```text
/review
/test
```

Igual que con los agentes, este directorio actúa como fuente central y los proyectos pueden consumir únicamente los comandos que necesiten.

---

## 7. MCP

`mcp/` contiene ejemplos y configuración reutilizable relacionada con MCP.

```text
mcp/
├── README.md
└── jira.example.jsonc
```

Importante:

**No almacenar secretos, tokens ni credenciales en este repositorio.**

Los secretos deben proporcionarse mediante el mecanismo de configuración seguro utilizado por la organización.

MCP permite conectar OpenCode con sistemas externos como:

- Jira
- Confluence
- documentación interna
- servicios propios
- herramientas de desarrollo

---

## 8. Plugins

Los plugins propios viven en:

```text
plugins/
```

Este directorio puede utilizarse durante el desarrollo del plugin o como referencia.

Si un plugin debe compartirse entre muchos proyectos, es preferible distribuirlo como un paquete interno versionado en lugar de copiar el código manualmente.

---

## 9. Configuraciones

`configs/` contiene ejemplos de composición.

```text
configs/
├── base/
│   └── opencode.jsonc
├── profiles/
│   ├── dotnet.jsonc
│   ├── frontend.jsonc
│   └── node.jsonc
└── examples/
    └── project-dotnet.jsonc
```

### `base`

Configuración común de referencia.

### `profiles`

Ejemplos de combinación por tecnología o tipo de proyecto.

### `examples`

Ejemplos completos que pueden utilizarse como punto de partida.

Estos ficheros son ejemplos de composición. Cada repositorio consumidor debe mantener su propio `opencode.json`/`opencode.jsonc` con las capacidades que realmente necesita.

---

## 10. AGENTS.md del proyecto

Las reglas específicas de un repositorio no deberían vivir en este toolkit.

Cada proyecto mantiene su propio:

```text
AGENTS.md
```

Ejemplo:

```md
# Project

API de reservas.

## Architecture

- Clean Architecture.
- Domain no depende de Infrastructure.
- Los controllers no contienen lógica de negocio.

## Commands

Build:
`dotnet build`

Tests:
`dotnet test`
```

El toolkit central define capacidades compartidas.

`AGENTS.md` define el contexto y reglas propias del proyecto.

---

## 11. Probar el repositorio localmente

Antes de publicar los catálogos en infraestructura corporativa se pueden probar con un servidor HTTP local.

Desde la raíz del repositorio:

```bash
./scripts/serve-local.sh 8080
```

Los catálogos quedarán disponibles en URLs similares a:

```text
http://localhost:8080/global/
http://localhost:8080/dotnet/
http://localhost:8080/node/
http://localhost:8080/frontend/
```

En un proyecto de prueba:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "skills": [
    "http://localhost:8080/global/",
    "http://localhost:8080/dotnet/"
  ]
}
```

Abrir OpenCode desde ese proyecto y comprobar que aparecen las skills de `global` y `dotnet`, pero no las de otros scopes.

---

## 12. Validación

Antes de publicar cambios:

```bash
python scripts/validate-catalogs.py
```

El validador permite detectar errores básicos en la estructura de los catálogos antes de que los proyectos consumidores los utilicen.

Este script puede ejecutarse también desde CI.

---

## 13. Publicación

La carpeta que se publica por HTTP es:

```text
catalogs/
```

Ejemplo de destino:

```text
https://ai.empresa.com/skills/
```

Resultado:

```text
https://ai.empresa.com/skills/global/
https://ai.empresa.com/skills/dotnet/
https://ai.empresa.com/skills/node/
https://ai.empresa.com/skills/frontend/
```

No es necesario exponer por HTTP todo el repositorio Git.

Solo los artefactos que deban ser consumidos como catálogo.

Consultar [`docs/PUBLISHING.md`](docs/PUBLISHING.md) para el proceso de publicación.

---

## 14. Flujo recomendado de cambios

```text
Developer
    │
    ▼
Pull Request
    │
    ├── validación de catálogos
    ├── revisión de contenido
    └── revisión de permisos / seguridad
    │
    ▼
Merge
    │
    ▼
Publicación
    │
    ▼
Catálogos HTTP
    │
    ▼
Proyectos consumidores
```

Las modificaciones importantes deberían actualizar también `CHANGELOG.md`.

---

## 15. Regla de diseño

Antes de añadir algo al repositorio, decidir qué tipo de elemento es:

| Necesidad | Ubicación |
|---|---|
| Capacidad reusable bajo demanda | `catalogs/<scope>/` |
| Rol especializado | `agents/` |
| Operación repetitiva | `commands/` |
| Integración externa | `mcp/` |
| Extensión de OpenCode | `plugins/` |
| Reglas propias de un proyecto | `AGENTS.md` del proyecto |
| Ejemplo de configuración | `configs/` |

Evitar crear una única skill gigantesca con todas las reglas de la empresa.

Es preferible componer capacidades pequeñas y específicas.

---

## 16. Ejemplo final

Supongamos tres proyectos:

```text
Booking.Api        -> .NET + Sabre
Admin.Frontend     -> Frontend
Notifications      -> Node.js
```

La composición podría ser:

```text
Booking.Api
├── global
├── dotnet
└── sabre

Admin.Frontend
├── global
└── frontend

Notifications
├── global
└── node
```

De esta forma Jira puede estar disponible para todos mediante `global`, mientras que cada proyecto recibe únicamente las capacidades técnicas o de dominio que necesita.

---

## Documentación adicional

- [`docs/CONSUMPTION.md`](docs/CONSUMPTION.md): consumo desde proyectos.
- [`docs/SCOPES.md`](docs/SCOPES.md): organización de scopes.
- [`docs/PUBLISHING.md`](docs/PUBLISHING.md): publicación de catálogos.
- [`docs/GOVERNANCE.md`](docs/GOVERNANCE.md): mantenimiento y gobierno del toolkit.
