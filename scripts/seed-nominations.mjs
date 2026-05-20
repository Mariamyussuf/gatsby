/**
 * Seeds award_nominations from scripts/seed-nominations.json via Supabase REST API.
 *
 * Requires env:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (preferred) or SUPABASE_ANON_KEY
 *
 * Usage:
 *   node scripts/seed-nominations.mjs
 *   node scripts/seed-nominations.mjs --dry-run
 */
import { readFileSync, writeFileSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { createClient } from "@supabase/supabase-js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const jsonPath = join(__dirname, "seed-nominations.json")
const dryRun = process.argv.includes("--dry-run")

const url = process.env.SUPABASE_URL?.trim()
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.SUPABASE_ANON_KEY?.trim()

if (!url || !key) {
  console.error(
    "Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)."
  )
  process.exit(1)
}

const records = JSON.parse(readFileSync(jsonPath, "utf8"))

/** Columns used by the live app + seed SQL (see Awards.tsx, seed_fake_nominations.sql). */
function mapRow(r) {
  return {
    id: r.id,
    award_category_id: r.award_category_id,
    award_category_name: r.award_category_name ?? null,
    nominee_name: r.nominee_name,
    nominee_email: r.nominee_email,
    nominee_phone: r.nominee_phone,
    nominator_name: r.nominator_name,
    nominator_email: r.nominator_email,
    nominator_phone: r.nominator_phone,
    nominator_matric: r.nominator_matric ?? null,
    nomination_reason: r.nomination_reason ?? "",
    evidence_link: r.evidence_link,
    created_at: r.created_at,
    updated_at: r.updated_at,
    status: r.status ?? "pending",
    notes: r.notes,
  }
}

const rows = records.map(mapRow)
const categoryIds = [...new Set(rows.map((r) => r.award_category_id))]

if (dryRun) {
  console.log(`Dry run: ${rows.length} rows, ${categoryIds.length} unique category IDs`)
  process.exit(0)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const reportPath = join(__dirname, "seed-nominations-result.json")

async function main() {
  // Verify award categories exist
  const { data: cats, error: catErr } = await supabase
    .from("award_categories")
    .select("id")
    .in("id", categoryIds)

  if (catErr) {
    console.error("Category check failed:", catErr.message)
    process.exit(1)
  }

  const found = new Set((cats ?? []).map((c) => c.id))
  const missing = categoryIds.filter((id) => !found.has(id))
  if (missing.length) {
    const result = {
      ok: false,
      inserted: 0,
      errors: 0,
      missingCategoryIds: missing,
      message:
        "Seed aborted: award_category_id FK would fail. Run 20260514_sync_award_categories.sql first.",
    }
    writeFileSync(reportPath, JSON.stringify(result, null, 2))
    console.error(JSON.stringify(result, null, 2))
    process.exit(1)
  }

  const batchSize = 25
  let inserted = 0
  const errors = []

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { data, error } = await supabase
      .from("award_nominations")
      .upsert(batch, { onConflict: "id", ignoreDuplicates: false })
      .select("id")

    if (error) {
      errors.push({ batchStart: i, message: error.message, code: error.code })
    } else {
      inserted += (data ?? []).length
    }
  }

  const result = {
    ok: errors.length === 0,
    inserted,
    attempted: rows.length,
    errors,
    missingCategoryIds: [],
  }
  writeFileSync(reportPath, JSON.stringify(result, null, 2))
  console.log(JSON.stringify(result, null, 2))
  process.exit(errors.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
