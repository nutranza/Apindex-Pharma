import { randomUUID } from "node:crypto"
import { readFile, rename, rm, stat, writeFile } from "node:fs/promises"

export async function exists(file: string): Promise<boolean> {
  try { await stat(file); return true } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return false
    throw error
  }
}

export async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(file, "utf8"))
}

export async function atomicWrite(file: string, bytes: Buffer | string): Promise<void> {
  const temporary = `${file}.${randomUUID()}.tmp`
  try {
    await writeFile(temporary, bytes, { flag: "wx" })
    await rename(temporary, file)
  } finally {
    await rm(temporary, { force: true })
  }
}

export async function writeJson(file: string, value: unknown): Promise<void> {
  await atomicWrite(file, JSON.stringify(value, null, 2) + "\n")
}
