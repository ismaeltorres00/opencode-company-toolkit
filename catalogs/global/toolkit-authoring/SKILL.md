---
name: toolkit-authoring
description: "Trigger: crear skill, crear agente, crear comando, crear MCP, crear scope, toolkit OpenCode. Use ONLY in the central toolkit repository to author and register reusable OpenCode resources."
license: Apache-2.0
metadata:
  author: ismaeltorres00
  version: "1.0"
---

# Toolkit Authoring

## Activation Contract

Use only when the active repository is the central OpenCode toolkit. Create reusable resources there, never inside a consumer project. If the user is in a consumer project, explain that they must request the resource from the toolkit maintainers.

## Hard Rules

- Inspect existing resources and conventions before creating anything.
- Use lowercase kebab-case identifiers and avoid duplicate names.
- Never add tokens, secrets, personal URLs or environment-specific credentials.
- Keep resources focused and composable. Do not create an all-purpose corporate skill.
- Update every registry and packaging rule needed for the resource to be distributed.

## Decision Gates

| Request | Create | Register |
|---|---|---|
| Reusable guidance | `catalogs/<scope>/<name>/SKILL.md` | `<scope>/index.json` |
| Agent role | `agents/<name>.md` | `toolkit.manifest.json` if it has metadata or dependencies |
| Repeated operation | `commands/<name>.md` | Declare required agents in `toolkit.manifest.json` |
| External integration | `mcp/<name>.example.jsonc` | `toolkit.manifest.json`; use a placeholder URL and OAuth or environment references |
| New context | `catalogs/<scope>/index.json` | `toolkit.manifest.json` description when needed |

## Execution Steps

1. Confirm the resource type, intended users, scope and trigger. Ask one focused question only if one is essential.
2. Inspect equivalent resources and reuse their file format.
3. Create the smallest valid resource. A skill MUST use `SKILL.md` with matching frontmatter `name` and a concrete one-line `description`.
4. For a new skill, add `{ name, version: "1", files: ["SKILL.md"] }` to the scope index. For a new scope, create its index first.
5. For agents and commands, keep filenames and frontmatter names aligned. A command that references a custom agent MUST declare that dependency in `toolkit.manifest.json`.
6. For MCP, define the server directly under `mcp.<name>`, never under `mcp.servers`. Do not include real credentials.
7. Ensure `package.json` publishes any new runtime directory or explicitly listed file.
8. Run `node scripts/validate-catalogs.mjs`, `npm test`, and `npm pack --dry-run`.

## Output Contract

Report the resource created, scope, registrations changed, selected validation results, and the exact next release action. State any endpoint, credential or ownership decision the maintainer must provide.
