import { main } from "./runner"

main().catch(() => {
  console.error("Rebranding command failed. Check the command, local configuration and tools/rebrand/README.md.")
  process.exitCode = 1
})
