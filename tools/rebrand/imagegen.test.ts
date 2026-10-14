import { test } from "node:test"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"
import { type Instructions, sha256 } from "../../src/lib/rebrand/contracts"
import { prepareImagegen, importImagegenOutput, imagegenPatches, generationMetrics } from "./imagegen"

const instructions: Instructions = {
  ownership: "wellona", imageAction: "edit", wellonaBrandingPresent: false, domainPresent: false,
  domainPlacementsAlreadyCorrect: false, preserveBrands: ["Cipla"], notes: "Two name labels; medicine information must remain untouched.",
  editPlan: { sourceWidth: 300, sourceHeight: 80, names: [
    { left: 0, top: 1, width: 80, height: 20, from: "Wellovir", to: "Dexovir" },
    { left: 220, top: 58, width: 80, height: 20, from: "Wellovir", to: "Dexovir" },
  ], logos: [], protectedRegions: [] },
}

async function fixture() {
  const directory = path.resolve(".cache/rebrand-checks", randomUUID())
  await mkdir(directory, { recursive: true })
  const original = await sharp({ create: { width: 300, height: 80, channels: 3, background: "#607090" } }).png().toBuffer()
  const key = await prepareImagegen(original, instructions, directory)
  assert.ok(key)
  const file = path.join(directory, "external.png")
  return { directory, original, key, file }
}

test("one padded square context contains all name edits, including image edges", async () => {
  const { directory, original, key, file } = await fixture()
  const input = await readFile(path.join(directory, "imagegen-input.png"))
  const dimensions = await sharp(input).metadata()
  assert.equal(dimensions.width, 324)
  assert.equal(dimensions.height, 324)
  const prompt = await readFile(path.join(directory, "imagegen-prompt.txt"), "utf8")
  assert.equal((prompt.match(/Replace "Wellovir"/g) ?? []).length, 2)
  await writeFile(file, await sharp({ create: { width: 1024, height: 1024, channels: 3, background: "#aa0011" } }).png().toBuffer())
  await importImagegenOutput(directory, file, key, 1000)
  const patches = await imagegenPatches(original, instructions, directory)
  assert.equal(patches.size, 2)
  for (const bytes of Array.from(patches.values())) {
    assert.equal((await sharp(bytes).metadata()).width, 80)
    assert.equal((await sharp(bytes).metadata()).height, 20)
  }
  assert.equal(await prepareImagegen(original, instructions, directory), key)
  await importImagegenOutput(directory, file, key, 1000)
  assert.deepEqual(await generationMetrics(directory), { calls: 1, elapsedMs: 1000 })
})

test("foreign task keys, non-square output, changed inputs and changed outputs are rejected", async () => {
  const { directory, original, key, file } = await fixture()
  await writeFile(file, await sharp({ create: { width: 100, height: 80, channels: 3, background: "white" } }).png().toBuffer())
  await assert.rejects(importImagegenOutput(directory, file, key, 1), /square frame/)
  await writeFile(file, await readFile(path.join(directory, "imagegen-input.png")))
  await assert.rejects(importImagegenOutput(directory, file, "a".repeat(64), 1), /different inputs/)
  await importImagegenOutput(directory, file, key, 1)
  await writeFile(path.join(directory, "imagegen-output.png"), "changed")
  await assert.rejects(imagegenPatches(original, instructions, directory), /output changed/)
  await importImagegenOutput(directory, file, key, 1)
  await writeFile(path.join(directory, "imagegen-input.png"), "changed")
  await assert.rejects(imagegenPatches(original, instructions, directory), /input changed/)
})

test("only one correction is accepted and already inspected patches can be retained", async () => {
  const { directory, original, key, file } = await fixture()
  for (const [index, colour] of Array.from(["red", "blue", "green"].entries())) {
    await writeFile(file, await sharp({ create: { width: 100, height: 100, channels: 3, background: colour } }).png().toBuffer())
    if (index < 2) await importImagegenOutput(directory, file, key, 500)
    else await assert.rejects(importImagegenOutput(directory, file, key, 500))
  }
  assert.deepEqual(await generationMetrics(directory), { calls: 2, elapsedMs: 1000 })
  const patches = await imagegenPatches(original, instructions, directory)
  const plan = instructions.editPlan
  assert.ok(plan)
  const first = patches.get(0)
  assert.ok(first)
  const correction = { ...instructions, editPlan: { ...plan, names: [
    { ...plan.names[0], reuseImageHash: sha256(first) }, plan.names[1],
  ] } }
  const correctionKey = await prepareImagegen(original, correction, directory)
  assert.ok(correctionKey)
  const prompt = await readFile(path.join(directory, "imagegen-prompt.txt"), "utf8")
  assert.equal((prompt.match(/Replace "Wellovir"/g) ?? []).length, 1)
  await assert.rejects(imagegenPatches(original, correction, directory), /different task/)
})
