import assert from "node:assert/strict"
import { execFile as execFileCallback } from "node:child_process"
import { appendFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { promisify } from "node:util"
import { join } from "node:path"
import { tmpdir } from "node:os"
import test from "node:test"
import { fileURLToPath } from "node:url"

const execFile = promisify(execFileCallback)
const root = fileURLToPath(new URL("..", import.meta.url))
const cli = join(root, "cli", "bin.mjs")

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
      "--catalog-base-url",
      "https://ai.example.com/skills",
      "--scope",
      "dotnet",
      "--command",
      "review",
      "--mcp",
      "jira",
      "--yes",
    )

    const config = JSON.parse(await readFile(join(project, "opencode.jsonc"), "utf8"))
    assert.equal(config.share, "manual")
    assert.deepEqual(config.skills.urls, [
      "https://ai.example.com/skills/global/",
      "https://ai.example.com/skills/dotnet/",
    ])
    assert.ok(config.mcp.jira)
    await readFile(join(project, ".opencode", "agents", "code-reviewer.md"))
    await readFile(join(project, ".opencode", "commands", "review.md"))

    await appendFile(join(project, ".opencode", "agents", "code-reviewer.md"), "\nLocal change\n")
    await assert.rejects(run(project, "update"), /cambios locales/)

    await run(project, "remove", "--kind", "scope", "--name", "dotnet", "--force")
    const updatedConfig = JSON.parse(await readFile(join(project, "opencode.jsonc"), "utf8"))
    assert.deepEqual(updatedConfig.skills.urls, ["https://ai.example.com/skills/global/"])
    await run(project, "remove", "--kind", "command", "--name", "review")
    await run(project, "check")
  } finally {
    await rm(project, { recursive: true, force: true })
  }
})
