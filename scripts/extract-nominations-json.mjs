/**
 * Extracts the nominations JSON array from the agent transcript jsonl.
 * Usage: node scripts/extract-nominations-json.mjs [transcriptPath]
 */
import { readFileSync, writeFileSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultTranscript =
  "C:\\Users\\ywx1505725\\.cursor\\projects\\empty-window\\agent-transcripts\\ac3e7d3f-e2bd-40a2-9357-13d28f650833\\ac3e7d3f-e2bd-40a2-9357-13d28f650833.jsonl"

const transcriptPath = process.argv[2] || defaultTranscript
const outPath = join(__dirname, "seed-nominations.json")

const lines = readFileSync(transcriptPath, "utf8").trim().split("\n")
let raw = null

for (const line of lines) {
  const row = JSON.parse(line)
  const text = row?.message?.content?.find?.((c) => c.type === "text")?.text ?? ""
  if (text.includes("fake data [{")) {
    const start = text.indexOf("[{")
    const end = text.lastIndexOf("}]") + 2
    if (start >= 0 && end > start) {
      raw = text.slice(start, end)
      break
    }
  }
}

if (!raw) {
  console.error("Could not find nominations JSON in transcript")
  process.exit(1)
}

const data = JSON.parse(raw)
writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8")
console.log(`Wrote ${data.length} records to ${outPath}`)
