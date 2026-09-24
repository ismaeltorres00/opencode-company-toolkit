#!/usr/bin/env node
import { createHash } from "node:crypto"
import { access, copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { checkbox } from "@inquirer/prompts"
import chalk from "chalk"

const sourceRoot = resolve(dirname(dirname(fileURLToPath(import.meta.url))))
const manifest = JSON.parse(await readFile(join(sourceRoot, "toolkit.manifest.json"), "utf8"))
const packageInfo = JSON.parse(await readFile(join(sourceRoot, "package.json"), "utf8"))
const registry = await discoverRegistry()
const args = process.argv.slice(2)
const command = args.find((value) => !value.startsWith("--")) ?? "help"
const flags = new Map()
for (let index = 0; index < args.length; index += 1) {
  if (!args[index].startsWith("--")) continue
  const [key, inlineValue] = args[index].slice(2).split("=", 2)
  flags.set(key, inlineValue ?? (args[index + 1]?.startsWith("--") ? true : args[index + 1] ?? true))
}

const projectRoot = resolve(String(flags.get("project") ?? process.cwd()))
const opencodeDirectory = join(projectRoot, ".opencode")
const statePath = join(opencodeDirectory, "toolkit.json")
const lockPath = join(opencodeDirectory, "toolkit-lock.json")
const configPath = join(projectRoot, "opencode.jsonc")

function usage() {
  console.log(`Usage: opencode-toolkit <command> [options]

Commands:
  init                 Configure a new project interactively
  configure            Change selected scopes and resources interactively
  update               Synchronize selected resources with this toolkit version
  status               Show installed resources and local modifications
  check                Fail when managed resources are missing or modified
  remove               Remove a selected resource safely

Options:
  --project <path>     Project to configure (default: current directory)
  --catalog-base-url <url> Override the catalog URL configured by the toolkit
  --scope <names>      Comma-separated scopes for non-interactive use
  --agent <names>      Comma-separated agents for non-interactive use
  --command <names>    Comma-separated commands for non-interactive use
  --mcp <names>        Comma-separated MCP servers for non-interactive use
  --plugin <names>     Comma-separated project plugins for non-interactive use
  --dry-run            Preview an update without changing the project
  --force              Overwrite or remove locally modified managed files
  --yes                Accept default selections in interactive commands`)
}

function values(name) {
  const value = flags.get(name)
  return typeof value === "string" ? value.split(",").filter(Boolean) : undefined
}

function hash(content) {
  return createHash("sha256").update(content).digest("hex")
}

function lockKey(path) {
  return relative(projectRoot, path).replaceAll("\\", "/")
}

function fromLockKey(path) {
  return resolve(projectRoot, path)
}

function jsonc(text) {
  return JSON.parse(
    text
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:])\/\/.*$/gm, "$1")
      .replace(/,\s*([}\]])/g, "$1"),
  )
}

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function readJson(path, fallback) {
  return (await exists(path)) ? JSON.parse(await readFile(path, "utf8")) : fallback
}

function assertKnown(kind, selected) {
  const available = registry[kind]
  const invalid = selected.filter((name) => !available[name])
  if (invalid.length) throw new Error(`${kind} desconocidos: ${invalid.join(", ")}`)
}

async function discoverRegistry() {
  const scopes = {}
  const catalogs = join(sourceRoot, "catalogs")
  for (const entry of await readdir(catalogs, { withFileTypes: true })) {
    if (!entry.isDirectory() || !(await exists(join(catalogs, entry.name, "index.json")))) continue
    scopes[entry.name] = {
      description: manifest.scopes[entry.name]?.description ?? `Capacidades del scope ${entry.name}`,
    }
  }

  const agents = { ...manifest.agents }
  for (const entry of await readdir(join(sourceRoot, "agents"), { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".md")) {
      const name = entry.name.slice(0, -3)
      agents[name] ??= { source: `agents/${entry.name}`, description: `Agente ${name}` }
    }
  }

  const commands = { ...manifest.commands }
  for (const entry of await readdir(join(sourceRoot, "commands"), { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".md")) {
      const name = entry.name.slice(0, -3)
      commands[name] ??= { source: `commands/${entry.name}`, description: `Comando /${name}` }
    }
  }

  const mcps = { ...manifest.mcps }
  for (const entry of await readdir(join(sourceRoot, "mcp"), { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".example.jsonc")) {
      const name = entry.name.replace(".example.jsonc", "")
      mcps[name] ??= { source: `mcp/${entry.name}`, key: name, description: `Servidor MCP ${name}` }
    }
  }

  return { scopes, agents, commands, mcps, plugins: { ...manifest.plugins } }
}

function showLogo() {
  console.log(`
${chalk.blue("   ██████╗  █████╗  ██████╗    ████████╗██████╗  █████╗ ██╗   ██╗███████╗██╗")}
${chalk.blue("  ██╔════╝ ██╔══██╗██╔════╝    ╚══██╔══╝██╔══██╗██╔══██╗██║   ██║██╔════╝██║")}
${chalk.blue("  ██║  ███╗███████║██║             ██║   ██████╔╝███████║██║   ██║█████╗  ██║")}
${chalk.blue("  ██║   ██║██╔══██║██║             ██║   ██╔══██╗██╔══██║╚██╗ ██╔╝██╔══╝  ██║")}
${chalk.blue("  ╚██████╔╝██║  ██║╚██████╗        ██║   ██║  ██║██║  ██║ ╚████╔╝ ███████╗███████╗")}
${chalk.blue("   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝        ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚══════╝")}

${chalk.gray("                         OpenCode Toolkit")}
`)
}

async function selectResources(message, kind, selected, assumeDefaults) {
  if (assumeDefaults) return selected
  const choices = Object.entries(registry[kind]).map(([name, item]) => ({
    name: `${name} ${chalk.dim(`- ${item.description ?? kind}`)}`,
    value: name,
    checked: selected.includes(name),
    disabled: kind === "scopes" && name === "global" ? "Siempre incluido" : false,
  }))
  return checkbox({ message, choices, loop: false })
}

function urlFor(scope, state) {
  return `${state.catalogBaseUrl.replace(/\/$/, "")}/${scope}/`
}

function sourcePath(relativePath) {
  const path = resolve(sourceRoot, relativePath)
  if (relative(sourceRoot, path).startsWith("..")) throw new Error("Ruta de recurso invalida")
  return path
}

async function loadState() {
  const state = await readJson(statePath, undefined)
  if (!state) throw new Error("El proyecto no esta gestionado. Ejecuta `init` primero.")
  state.plugins ??= []
  state.managedPlugins ??= []
  return state
}

async function writeState(state, lock) {
  await mkdir(opencodeDirectory, { recursive: true })
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`)
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`)
}

async function mergeConfig(state, selectedMcps) {
  const config = (await exists(configPath)) ? jsonc(await readFile(configPath, "utf8")) : {}
  config.$schema ??= "https://opencode.ai/config.json"
  config.skills ??= {}
  config.skills.urls ??= []
  const managedUrls = new Set(state.scopes.map((scope) => urlFor(scope, state)))
  config.skills.urls = [...new Set([...config.skills.urls.filter((url) => !state.managedSkillUrls?.includes(url)), ...managedUrls])]
  config.mcp ??= {}

  for (const [name, definition] of Object.entries(registry.mcps)) {
    if (state.managedMcps?.includes(name) && !selectedMcps.includes(name)) delete config.mcp[definition.key]
  }
  for (const name of selectedMcps) {
    const definition = registry.mcps[name]
    const source = jsonc(await readFile(sourcePath(definition.source), "utf8"))
    config.mcp[definition.key] = source.mcp[definition.key]
  }
  if (!Object.keys(config.mcp).length) delete config.mcp
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`)
}

function resolveDependencies(state) {
  for (const name of state.commands) {
    const requiredAgents = registry.commands[name].requires?.agents ?? []
    for (const agent of requiredAgents) if (!state.agents.includes(agent)) state.agents.push(agent)
  }
}

function resourcesFor(state) {
  return [
    ...state.agents.map((name) => ["agents", name, registry.agents[name], destinationFor("agents", name)]),
    ...state.commands.map((name) => ["commands", name, registry.commands[name], destinationFor("commands", name)]),
    ...state.plugins.map((name) => ["plugins", name, registry.plugins[name], destinationFor("plugins", name)]),
  ]
}

function destinationFor(kind, name) {
  if (kind === "plugins") return join(opencodeDirectory, registry.plugins[name].destination)
  return join(opencodeDirectory, kind, `${name}.md`)
}

async function buildPlan(state, force) {
  assertKnown("scopes", state.scopes)
  assertKnown("agents", state.agents)
  assertKnown("commands", state.commands)
  assertKnown("mcps", state.mcps)
  assertKnown("plugins", state.plugins)
  resolveDependencies(state)

  const previousLock = await readJson(lockPath, { files: {} })
  const previouslyManaged = {
    agents: state.managedAgents ?? [],
    commands: state.managedCommands ?? [],
    plugins: state.managedPlugins ?? [],
  }
  const removals = []
  const conflicts = []
  for (const [kind, names] of Object.entries(previouslyManaged)) {
    for (const name of names.filter((item) => !state[kind].includes(item))) {
      const destination = destinationFor(kind, name)
      const key = lockKey(destination)
      if (await exists(destination) && previousLock.files[key] !== hash(await readFile(destination)) && !force) {
        conflicts.push(`${destination} tiene cambios locales y se iba a borrar.`)
      }
      removals.push([kind, name, destination])
    }
  }

  const resources = resourcesFor(state)
  for (const [, , definition, destination] of resources) {
    const source = sourcePath(definition.source)
    const existing = await exists(destination) ? await readFile(destination) : undefined
    const key = lockKey(destination)
    const previousHash = previousLock.files[key]
    if (existing && previousHash && hash(existing) !== previousHash && !force) {
      conflicts.push(`${destination} tiene cambios locales y se iba a sobrescribir.`)
    }
  }
  if (conflicts.length) throw new Error(`${conflicts.join("\n")} Usa --force para continuar.`)
  return { previousLock, removals, resources }
}

async function synchronize(state, { force = false } = {}) {
  const { previousLock, removals, resources } = await buildPlan(state, force)
  const lock = { toolkitVersion: packageInfo.version, files: {} }
  for (const [kind, name, destination] of removals) {
    await rm(destination, { force: true })
    console.log(`Eliminado ${kind.slice(0, -1)} ${name}`)
  }

  for (const [, name, definition, destination] of resources) {
    const source = sourcePath(definition.source)
    const sourceContent = await readFile(source)
    await mkdir(dirname(destination), { recursive: true })
    await copyFile(source, destination)
    lock.files[lockKey(destination)] = hash(sourceContent)
    console.log(`Sincronizado ${name}`)
  }

  await mergeConfig(state, state.mcps)
  state.managedSkillUrls = state.scopes.map((scope) => urlFor(scope, state))
  state.managedMcps = [...state.mcps]
  state.managedAgents = [...state.agents]
  state.managedCommands = [...state.commands]
  state.managedPlugins = [...state.plugins]
  await writeState(state, lock)
}

async function previewUpdate(state) {
  const { previousLock, removals, resources } = await buildPlan(state, false)
  console.log(`Version instalada: ${previousLock.toolkitVersion ?? "sin lock"}`)
  console.log(`Version que se aplicaria: ${packageInfo.version}`)
  for (const [kind, name] of removals) console.log(`Se eliminaria ${kind.slice(0, -1)} ${name}`)
  for (const [, name, definition, destination] of resources) {
    const sourceHash = hash(await readFile(sourcePath(definition.source)))
    const currentHash = (await exists(destination)) ? hash(await readFile(destination)) : undefined
    if (!currentHash) console.log(`Se instalaria ${name}`)
    else if (currentHash !== sourceHash) console.log(`Se actualizaria ${name}`)
    else console.log(`Sin cambios ${name}`)
  }
  console.log("Se sincronizaria opencode.jsonc sin modificar otros ajustes.")
}

async function configure(existing) {
  const assumeDefaults = flags.has("yes")
  const catalogBaseUrl = String(flags.get("catalog-base-url") ?? existing?.catalogBaseUrl ?? manifest.catalogBaseUrl)
  if (!catalogBaseUrl) throw new Error("Indica --catalog-base-url para configurar las skills.")

  if (!assumeDefaults) showLogo()
  let scopes = values("scope") ?? existing?.scopes ?? ["global"]
  assertKnown("scopes", scopes)
  if (!values("scope")) scopes = await selectResources("Selecciona los scopes para este proyecto", "scopes", scopes, assumeDefaults)
  if (scopes.length && !scopes.includes("global")) scopes = ["global", ...scopes]

  let agents = values("agent") ?? existing?.agents ?? []
  if (!values("agent")) agents = await selectResources("Selecciona los agentes", "agents", agents, assumeDefaults)
  let commands = values("command") ?? existing?.commands ?? []
  if (!values("command")) commands = await selectResources("Selecciona los comandos", "commands", commands, assumeDefaults)
  let mcps = values("mcp") ?? existing?.mcps ?? []
  if (!values("mcp")) mcps = await selectResources("Selecciona los servidores MCP", "mcps", mcps, assumeDefaults)
  let plugins = values("plugin") ?? existing?.plugins ?? ["update-notice"]
  if (!values("plugin")) plugins = await selectResources("Selecciona las notificaciones", "plugins", plugins, assumeDefaults)

  return {
    version: 1,
    catalogBaseUrl,
    scopes,
    agents,
    commands,
    mcps,
    plugins,
    managedSkillUrls: existing?.managedSkillUrls ?? [],
    managedMcps: existing?.managedMcps ?? [],
    managedAgents: existing?.managedAgents ?? [],
    managedCommands: existing?.managedCommands ?? [],
    managedPlugins: existing?.managedPlugins ?? [],
  }
}

async function removeResource() {
  const state = await loadState()
  const kind = String(flags.get("kind") ?? "")
  const name = String(flags.get("name") ?? "")
  if (!kind || !name || !["scope", "agent", "command", "mcp", "plugin"].includes(kind)) {
    throw new Error("Usa `remove --kind scope|agent|command|mcp|plugin --name <nombre>`")
  }
  const collection = `${kind}s`
  if (!state[collection].includes(name)) throw new Error(`${name} no esta seleccionado como ${kind}.`)

  if (kind === "scope" || kind === "mcp") {
    state[collection] = state[collection].filter((item) => item !== name)
    await synchronize(state, { force: flags.has("force") })
    return
  }

  if (kind === "agent" && state.commands.some((commandName) => registry.commands[commandName].requires?.agents?.includes(name))) {
    throw new Error(`El agente ${name} es requerido por un comando seleccionado. Elimina primero ese comando.`)
  }
  const destination = destinationFor(collection, name)
  const lock = await readJson(lockPath, { files: {} })
  const key = lockKey(destination)
  if (await exists(destination) && lock.files[key] !== hash(await readFile(destination)) && !flags.has("force")) {
    throw new Error(`${destination} tiene cambios locales. Usa --force para borrarlo.`)
  }
  await rm(destination, { force: true })
  state[collection] = state[collection].filter((item) => item !== name)
  delete lock.files[key]
  state[`managed${kind[0].toUpperCase()}${kind.slice(1)}s`] = state[`managed${kind[0].toUpperCase()}${kind.slice(1)}s`].filter((item) => item !== name)
  await writeState(state, lock)
  console.log(`Eliminado ${kind} ${name}`)
}

async function reportStatus(failOnDrift = false) {
  const state = await loadState()
  const lock = await readJson(lockPath, { files: {} })
  const drift = []
  for (const [path, expectedHash] of Object.entries(lock.files)) {
    const destination = fromLockKey(path)
    if (!(await exists(destination))) drift.push(`${path} falta`)
    else if (hash(await readFile(destination)) !== expectedHash) drift.push(`${path} fue modificado localmente`)
  }
  if (!(await exists(configPath))) {
    drift.push("opencode.jsonc falta")
  } else {
    const config = jsonc(await readFile(configPath, "utf8"))
    for (const scope of state.scopes) {
      if (!config.skills?.urls?.includes(urlFor(scope, state))) drift.push(`falta la URL del scope ${scope}`)
    }
    for (const name of state.mcps) {
      if (!config.mcp?.[registry.mcps[name].key]) drift.push(`falta la configuracion MCP ${name}`)
    }
  }
  console.log(`Version instalada: ${lock.toolkitVersion ?? "sin lock"}`)
  console.log(`Version disponible: ${packageInfo.version}`)
  if (lock.toolkitVersion !== packageInfo.version) console.log("Hay una actualizacion disponible. Ejecuta `update --dry-run` para revisarla.")
  console.log(`Scopes: ${state.scopes.join(", ") || "ninguno"}`)
  console.log(`Agentes: ${state.agents.join(", ") || "ninguno"}`)
  console.log(`Comandos: ${state.commands.join(", ") || "ninguno"}`)
  console.log(`MCP: ${state.mcps.join(", ") || "ninguno"}`)
  console.log(`Plugins: ${state.plugins.join(", ") || "ninguno"}`)
  if (drift.length) console.log(`Cambios locales:\n${drift.map((item) => `- ${item}`).join("\n")}`)
  else console.log("Estado sincronizado.")
  if (failOnDrift && drift.length) process.exitCode = 1
}

try {
  if (command === "help" || flags.has("help")) usage()
  else if (command === "init") await synchronize(await configure(undefined), { force: flags.has("force") })
  else if (command === "configure") await synchronize(await configure(await loadState()), { force: flags.has("force") })
  else if (command === "update") {
    const state = await loadState()
    if (flags.has("dry-run")) await previewUpdate(state)
    else await synchronize(state, { force: flags.has("force") })
  }
  else if (command === "status") await reportStatus(false)
  else if (command === "check") await reportStatus(true)
  else if (command === "remove") await removeResource()
  else throw new Error(`Comando desconocido: ${command}`)
} catch (error) {
  console.error(`Error: ${error.message}`)
  process.exitCode = 1
}
