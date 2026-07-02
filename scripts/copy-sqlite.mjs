// Copies the self-contained sqlite-wasm build into public/ so the worker can
// load it at runtime, bypassing the bundler entirely (Turbopack cannot bundle
// this package's internals). Runs via predev/prebuild.
import { copyFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const src = join(root, "node_modules", "@sqlite.org", "sqlite-wasm", "dist")
const dest = join(root, "public", "sqlite")

mkdirSync(dest, { recursive: true })
copyFileSync(join(src, "index.mjs"), join(dest, "sqlite3.mjs"))
copyFileSync(join(src, "sqlite3.wasm"), join(dest, "sqlite3.wasm"))

console.log("sqlite-wasm assets copied to public/sqlite/")
