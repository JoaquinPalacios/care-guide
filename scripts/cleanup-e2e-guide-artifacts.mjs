import pg from "pg";

import {
  PROTECTED_IDS,
  developmentDatabaseUrl,
  listE2eGuideArtifacts,
} from "./e2e-guide-artifacts.mjs";

if (!process.argv.includes("--yes")) {
  console.error(
    "Refusing to delete. Re-run with --yes after reviewing:\n  node scripts/list-e2e-guide-artifacts.mjs"
  );
  process.exit(1);
}

const rows = await listE2eGuideArtifacts();
if (rows.length === 0) {
  console.log("No known Playwright guide artifacts to delete.");
  process.exit(0);
}

const ids = rows.map((row) => row.id);
if (ids.some((id) => PROTECTED_IDS.has(id))) {
  throw new Error("Refusing to delete a protected demo guide.");
}

const client = new pg.Client({ connectionString: developmentDatabaseUrl() });
await client.connect();
try {
  const deleted = await client.query(
    `DELETE FROM "PracticeGuide" WHERE id = ANY($1::text[]) AND NOT (id = ANY($2::text[])) RETURNING id, title`,
    [ids, [...PROTECTED_IDS]]
  );
  console.log(`Deleted ${deleted.rowCount} Playwright guide artifact(s):`);
  for (const row of deleted.rows) {
    console.log(`${row.id}\t${row.title}`);
  }
} finally {
  await client.end();
}
