import { readFile, readdir } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(dirname(fileURLToPath(import.meta.url))), "catalogs")
const errors = []

for (const scope of await readdir(root, { withFileTypes: true })) {
  if (!scope.isDirectory()) continue

  const index = join(root, scope.name, "index.json")
  let catalog
  try {
    catalog = JSON.parse(await readFile(index, "utf8"))
  } catch (error) {
    if (error.code === "ENOENT") continue
    errors.push(`${index}: invalid JSON: ${error.message}`)
    continue
  }

  if (!Array.isArray(catalog.skills)) {
    errors.push(`${index}: skills must be an array`)
    continue
  }

  const names = new Set()
  for (const skill of catalog.skills) {
    const { name, version, files } = skill ?? {}
    if (
      typeof name !== "string" ||
      !name ||
      name !== name.toLowerCase() ||
      typeof version !== "string" ||
      !version ||
      !Array.isArray(files) ||
      files.length !== 1 ||
      files[0] !== "SKILL.md"
    ) {
      errors.push(`${index}: invalid entry ${JSON.stringify(skill)}`)
      continue
    }
    if (names.has(name)) errors.push(`${index}: duplicated skill name ${name}`)
    names.add(name)

    const path = join(root, scope.name, name, "SKILL.md")
    let content
    try {
      content = (await readFile(path, "utf8")).replaceAll("\r\n", "\n")
    } catch {
      errors.push(`${index}: missing ${name}/SKILL.md`)
      continue
    }

    const frontmatterEnd = content.indexOf("\n---\n", 4)
    if (!content.startsWith("---\n") || frontmatterEnd === -1) {
      errors.push(`${path}: missing frontmatter`)
      continue
    }
    const frontmatter = content.slice(4, frontmatterEnd)
    if (!frontmatter.includes(`name: ${name}\n`)) {
      errors.push(`${path}: frontmatter name must be ${name}`)
    }
    if (!frontmatter.includes("description:")) {
      errors.push(`${path}: missing frontmatter description`)
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"))
  process.exit(1)
}

console.log("Catalog validation OK")
