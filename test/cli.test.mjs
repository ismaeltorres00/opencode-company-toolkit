import assert from "node:assert/strict"
import { execFile as execFileCallback } from "node:child_process"
import { appendFile, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises"
import { promisify } from "node:util"
import { join } from "node:path"
import { tmpdir } from "node:os"
import test from "node:test"
import { fileURLToPath } from "node:url"

const execFile = promisify(execFileCallback)
const root = fileURLToPath(new URL("..", import.meta.url))
const cli = join(root, "cli", "bin.mjs")
const packageInfo = JSON.parse(await readFile(join(root, "package.json"), "utf8"))

async function run(project, ...args) {
  return execFile(process.execPath, [cli, ...args, "--project", project], { cwd: root })
}

test("installs, protects, and removes managed resources", async () => {
  const project = await mkdtemp(join(tmpdir(), "opencode-toolkit-"))
  try {
    await writeFile(join(project, "opencode.jsonc"), '{\n  // Project setting\n  "share": "manual"\n}\n')
    await run(
      project,
      "init",
      "--scope",
      "dotnet",
      "--command",
      "review,cdv-frontend-review",
      "--mcp",
      "jira",
      "--yes",
    )

    const config = JSON.parse(await readFile(join(project, "opencode.jsonc"), "utf8"))
    assert.equal(config.share, "manual")
    assert.deepEqual(config.skills.urls, [
      "https://ismaeltorres00.github.io/opencode-company-toolkit/catalogs/global/",
      "https://ismaeltorres00.github.io/opencode-company-toolkit/catalogs/dotnet/",
    ])
    assert.ok(config.mcp.jira)
    await readFile(join(project, ".opencode", "agents", "code-reviewer.md"))
    await readFile(join(project, ".opencode", "commands", "review.md"))
    await readFile(join(project, ".opencode", "agents", "cdv-frontend-reviewer.md"))
    await readFile(join(project, ".opencode", "commands", "cdv-frontend-review.md"))
    await readFile(join(project, ".opencode", "plugins", "toolkit-update-notice.ts"))

    const preview = await run(project, "update", "--dry-run")
    assert.match(preview.stdout, new RegExp(`Version que se aplicaria: ${packageInfo.version.replaceAll(".", "\\.")}`))
    assert.match(preview.stdout, /Sin cambios code-reviewer/)

    const agent = join(project, ".opencode", "agents", "code-reviewer.md")
    const categorizedAgent = join(project, ".opencode", "agents", "calidad-de-codigo", "code-reviewer.md")
    await mkdir(join(project, ".opencode", "agents", "calidad-de-codigo"), { recursive: true })
    await rename(agent, categorizedAgent)
    const lockPath = join(project, ".opencode", "toolkit-lock.json")
    const lock = JSON.parse(await readFile(lockPath, "utf8"))
    lock.files[".opencode/agents/calidad-de-codigo/code-reviewer.md"] = lock.files[".opencode/agents/code-reviewer.md"]
    delete lock.files[".opencode/agents/code-reviewer.md"]
    await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`)
    await run(project, "update")
    await readFile(agent)
    await assert.rejects(readFile(categorizedAgent))

    await appendFile(agent, "\nLocal change\n")
    await assert.rejects(run(project, "update"), /cambios locales/)

    await run(project, "remove", "--kind", "scope", "--name", "dotnet", "--force")
    const updatedConfig = JSON.parse(await readFile(join(project, "opencode.jsonc"), "utf8"))
    assert.deepEqual(updatedConfig.skills.urls, ["https://ismaeltorres00.github.io/opencode-company-toolkit/catalogs/global/"])
    await run(project, "remove", "--kind", "command", "--name", "review")
    await run(project, "check")
  } finally {
    await rm(project, { recursive: true, force: true })
  }
})
