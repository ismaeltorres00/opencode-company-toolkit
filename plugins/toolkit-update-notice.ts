import { readFile } from "node:fs/promises"
import { join } from "node:path"

const packageName = "@ismaeltorres00/opencode-toolkit"
const registryUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`

function isNewer(candidate: string, installed: string) {
  const candidateParts = candidate.split(".").map(Number)
  const installedParts = installed.split(".").map(Number)
  for (let index = 0; index < 3; index += 1) {
    if (candidateParts[index] !== installedParts[index]) return candidateParts[index] > installedParts[index]
  }
  return false
}

export const ToolkitUpdateNotice = async ({ client, worktree }: any) => {
  let installed: string
  try {
    const lock = JSON.parse(await readFile(join(worktree, ".opencode", "toolkit-lock.json"), "utf8"))
    installed = lock.toolkitVersion
  } catch {
    return {}
  }

  void (async () => {
    try {
      const response = await fetch(registryUrl, { signal: AbortSignal.timeout(1500) })
      const latest = (await response.json()).version
      if (typeof latest !== "string" || !isNewer(latest, installed)) return
      await client.tui.showToast({
        body: {
          message: `OpenCode Toolkit ${latest} disponible. Ejecuta: npx ${packageName}@latest update --dry-run`,
          variant: "info",
        },
      })
    } catch {
      // Network and registry errors must never affect OpenCode startup.
    }
  })()

  return {}
}
