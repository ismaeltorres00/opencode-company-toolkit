import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import { createServer } from "node:http"
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const port = Number(process.argv[2] ?? 8080)
const root = resolve(dirname(dirname(fileURLToPath(import.meta.url))), "catalogs")
const contentTypes = { ".json": "application/json", ".md": "text/markdown" }

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname)
  const path = resolve(root, `.${pathname}`)
  const relativePath = relative(root, path)
  if (relativePath.startsWith("..") || isAbsolute(relativePath)) {
    response.writeHead(403).end()
    return
  }

  try {
    const file = (await stat(path)).isDirectory() ? join(path, "index.json") : path
    if (!(await stat(file)).isFile()) throw new Error("Not a file")
    response.writeHead(200, { "Content-Type": contentTypes[extname(file)] ?? "application/octet-stream" })
    createReadStream(file).pipe(response)
  } catch {
    response.writeHead(404).end()
  }
}).listen(port, () => console.log(`Serving ${root} at http://localhost:${port}`))
