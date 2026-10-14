import { readFile } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"
import { z } from "zod"
import { hashSchema, sha256, stableJson, type Instructions } from "../../src/lib/rebrand/contracts"
import { inspectImage } from "../../src/lib/rebrand/media"
import { atomicWrite, exists, readJson, writeJson } from "./files"

const contextSchema = z.object({ left: z.number().int(), top: z.number().int(), side: z.number().int().positive() }).strict()
const taskSchema = z.object({
  key: hashSchema, sourceHash: hashSchema, instructionsHash: hashSchema, inputHash: hashSchema,
  context: contextSchema, indices: z.array(z.number().int().nonnegative()), prompt: z.string(),
}).strict()
const resultSchema = z.object({
  inputKey: hashSchema, outputHash: hashSchema,
  file: z.enum(["imagegen-output.png", "imagegen-output.jpg", "imagegen-output.webp"]),
  tool: z.literal("image_gen"),
}).strict()
const attemptsSchema = z.array(z.object({
  inputKey: hashSchema, outputHash: hashSchema, elapsedMs: z.number().finite().nonnegative(),
  recordedAt: z.string().datetime(),
}).strict()).max(2)

export const IMAGEGEN_VERSION = "imagegen-context-v1"

// The script prepares files only. Codex opens the clean input and calls its built-in
// ImageGen tool; there is deliberately no provider API or API key in this module.
export async function prepareImagegen(original: Buffer, instructions: Instructions, directory: string): Promise<string | null> {
  const plan = instructions.editPlan
  const pending = plan?.names.flatMap((region, index) => region.reuseImageHash ? [] : [{ region, index }]) ?? []
  if (!plan || pending.length === 0) return null
  const dimensions = await sharp(original).metadata()
  if (dimensions.width !== plan.sourceWidth || dimensions.height !== plan.sourceHeight) throw new Error("Edit plan belongs to a different source image size.")
  const left = Math.min(...pending.map(({ region }) => region.left))
  const top = Math.min(...pending.map(({ region }) => region.top))
  const right = Math.max(...pending.map(({ region }) => region.left + region.width))
  const bottom = Math.max(...pending.map(({ region }) => region.top + region.height))
  const side = Math.max(right - left, bottom - top) + 24
  if (side * side > 40_000_000) throw new Error("ImageGen context exceeds the pixel budget.")
  const context = { left: Math.floor((left + right - side) / 2), top: Math.floor((top + bottom - side) / 2), side }
  const sourceLeft = Math.max(0, context.left)
  const sourceTop = Math.max(0, context.top)
  const intersection = { left: sourceLeft, top: sourceTop,
    width: Math.min(plan.sourceWidth, context.left + side) - sourceLeft,
    height: Math.min(plan.sourceHeight, context.top + side) - sourceTop }
  const crop = await sharp(original).extract(intersection).png().toBuffer()
  const input = await sharp({ create: { width: side, height: side, channels: 4, background: "#ffffff" } })
    .composite([{ input: crop, left: sourceLeft - context.left, top: sourceTop - context.top }]).png().toBuffer()
  const replacements = pending.map(({ region }) =>
    `Replace "${region.from}" with "${region.to}" at x=${region.left - context.left}, y=${region.top - context.top}, width=${region.width}, height=${region.height}.`).join("\n")
  const prompt = `Use case: text-localization. Image 1 is the clean square edit target, ${side} by ${side} pixels.\n${replacements}\nChange only these trade-name letters. Render the replacement text verbatim, in the same lettering style, colour, size, position and perspective. Keep the square composition, product geometry, label layout, lighting and all other text unchanged. Do not move the labels, redraw packaging, insert a logo, add a domain, add annotations or invent medicine information. Output one edited square image. Coordinates refer to the input image; preserve their relative positions if exporting at a larger size.`
  const instructionsHash = sha256(stableJson(instructions))
  const inputHash = sha256(input)
  const key = sha256(stableJson({ version: IMAGEGEN_VERSION, sourceHash: sha256(original), instructionsHash, inputHash, context, prompt }))
  const task = { key, sourceHash: sha256(original), instructionsHash, inputHash, context, indices: pending.map(value => value.index), prompt }
  await atomicWrite(path.join(directory, "imagegen-input.png"), input)
  await atomicWrite(path.join(directory, "imagegen-prompt.txt"), prompt)
  await writeJson(path.join(directory, "imagegen.json"), task)
  return key
}

export async function importImagegenOutput(directory: string, file: string, inputKey: string, elapsedMs: number): Promise<void> {
  const task = taskSchema.parse(await readJson(path.join(directory, "imagegen.json")))
  if (task.key !== inputKey) throw new Error("ImageGen output belongs to different inputs. Prepare and inspect again.")
  const input = await readFile(path.join(directory, "imagegen-input.png"))
  if (sha256(input) !== task.inputHash) throw new Error("ImageGen input changed.")
  const bytes = await readFile(file)
  const format = await inspectImage(bytes, 7 * 1024 * 1024)
  const dimensions = await sharp(bytes).metadata()
  if (dimensions.width !== dimensions.height) throw new Error("ImageGen moved or cropped the square frame. Correct the image before import.")
  const historyFile = path.join(directory, "imagegen-attempts.json")
  const history = await exists(historyFile) ? attemptsSchema.parse(await readJson(historyFile)) : []
  const outputHash = sha256(bytes)
  // Repeating the import of the same completed tool result is not another generation.
  if (!history.some(value => value.inputKey === inputKey && value.outputHash === outputHash)) {
    history.push({ inputKey, outputHash, elapsedMs, recordedAt: new Date().toISOString() })
    attemptsSchema.parse(history)
  }
  const destination = `imagegen-output.${format.extension}`
  resultSchema.parse({ inputKey, outputHash, file: destination, tool: "image_gen" })
  await atomicWrite(path.join(directory, destination), bytes)
  await writeJson(path.join(directory, "imagegen-result.json"), { inputKey, outputHash, file: destination, tool: "image_gen" })
  await writeJson(historyFile, history)
}

export async function imagegenPatches(original: Buffer, instructions: Instructions, directory: string): Promise<Map<number, Buffer>> {
  const plan = instructions.editPlan
  const patches = new Map<number, Buffer>()
  if (!plan) return patches
  for (const [index, region] of Array.from(plan.names.entries())) {
    if (!region.reuseImageHash) continue
    const bytes = await readFile(path.join(directory, `name-region-${index}.png`))
    await inspectImage(bytes)
    const dimensions = await sharp(bytes).metadata()
    if (sha256(bytes) !== region.reuseImageHash || dimensions.width !== region.width || dimensions.height !== region.height) throw new Error("Retained name patch changed. Inspect it again.")
    patches.set(index, bytes)
  }
  if (patches.size === plan.names.length) return patches
  const task = taskSchema.parse(await readJson(path.join(directory, "imagegen.json")))
  if (task.sourceHash !== sha256(original) || task.instructionsHash !== sha256(stableJson(instructions))) throw new Error("ImageGen task changed. Prepare a new input.")
  if (sha256(await readFile(path.join(directory, "imagegen-input.png"))) !== task.inputHash) throw new Error("ImageGen input changed.")
  const result = resultSchema.parse(await readJson(path.join(directory, "imagegen-result.json")))
  const bytes = await readFile(path.join(directory, result.file))
  if (result.inputKey !== task.key || sha256(bytes) !== result.outputHash) throw new Error("ImageGen output changed or belongs to a different task.")
  await inspectImage(bytes, 7 * 1024 * 1024)
  const dimensions = await sharp(bytes).metadata()
  if (dimensions.width !== dimensions.height) throw new Error("ImageGen changed the square frame.")
  const normalized = await sharp(bytes).resize(task.context.side, task.context.side, { fit: "fill", kernel: "lanczos3" }).png().toBuffer()
  for (const index of task.indices) {
    const region = plan.names[index]
    if (!region || region.reuseImageHash) throw new Error("ImageGen region no longer matches its task.")
    const patch = await sharp(normalized).extract({ left: region.left - task.context.left, top: region.top - task.context.top,
      width: region.width, height: region.height }).png().toBuffer()
    patches.set(index, patch)
    await atomicWrite(path.join(directory, `name-region-${index}.png`), patch)
  }
  if (patches.size !== plan.names.length) throw new Error("Some name regions have no ImageGen result.")
  return patches
}

export async function generationMetrics(directory: string): Promise<{ calls: number; elapsedMs: number }> {
  const file = path.join(directory, "imagegen-attempts.json")
  const history = await exists(file) ? attemptsSchema.parse(await readJson(file)) : []
  return { calls: history.length, elapsedMs: history.reduce((sum, value) => sum + value.elapsedMs, 0) }
}
