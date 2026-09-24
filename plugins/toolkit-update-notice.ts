import type { Plugin } from "@opencode-ai/plugin"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

const PACKAGE = "@ismaeltorres00/opencode-toolkit"
const REGISTRY_URL = `https://registry.npmjs.org/${PACKAGE.replace("/", "%2F")}/latest`
const TRIGGERS = new Set(["session.created", "session.idle"])
const STARTUP_DELAY_MS = 4000

const parse = (version: string) => version.split("-")[0].split(".").map(Number)

function isNewer(candidate: string, installed: string) {
  const [a, b] = [parse(candidate), parse(installed)]
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i]
  }
  return false
}

async function readInstalledVersion(roots: (string | undefined)[]) {
  for (const root of roots) {
    if (!root || root === "/") continue
    try {
      const lock = JSON.parse(await readFile(join(root, ".opencode", "toolkit-lock.json"), "utf8"))
      if (typeof lock.toolkitVersion === "string") return lock.toolkitVersion as string
    } catch {
      // Probar el siguiente candidato.
    }
  }
  return null
}

export const ToolkitUpdateNotice: Plugin = async ({ client, directory, worktree }) => {
  const installed = await readInstalledVersion([directory, worktree])
  if (!installed) return {}

  // Se lanza al cargar el plugin y no bloquea el arranque de OpenCode.
  const latestPromise: Promise<string | null> = fetch(REGISTRY_URL, { signal: AbortSignal.timeout(3000) })
    .then((response) => (response.ok ? response.json() : null))
    .then((json: any) =>
      typeof json?.version === "string" && isNewer(json.version, installed) ? (json.version as string) : null,
    )
    .catch(() => null)

  const notify = async () => {
    const latest = await latestPromise
    if (!latest) return
    await client.tui
      .showToast({
        query: { directory },
        body: {
          title: "OpenCode Toolkit",
          message: `Nueva versión ${latest} (instalada ${installed}). Ejecuta: npx ${PACKAGE}@latest update --dry-run`,
          variant: "info",
        },
      })
      .catch(() => {
        // Un fallo de UI nunca debe afectar a OpenCode.
      })
  }

  // Intento al abrir: da tiempo a que la TUI se suscriba. Si se pierde, actúa el respaldo.
  setTimeout(() => void notify(), STARTUP_DELAY_MS)

  // Respaldo fiable: primer evento de sesión (la TUI ya está viva).
  let notified = false
  return {
    event: async ({ event }) => {
      if (notified || !TRIGGERS.has(event.type)) return
      notified = true
      await notify()
    },
  }
}