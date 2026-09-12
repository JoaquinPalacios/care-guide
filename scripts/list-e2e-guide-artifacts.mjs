import { listE2eGuideArtifacts } from "./e2e-guide-artifacts.mjs";

const rows = await listE2eGuideArtifacts();
if (rows.length === 0) {
  console.log("No known Playwright guide artifacts in DATABASE_URL.");
  process.exit(0);
}

console.log(
  `Known Playwright guide artifacts in DATABASE_URL (${rows.length}):`
);
for (const row of rows) {
  console.log(
    `${row.id}\t${row.status}\t${row.publicSlug}\t${row.title}\t${row.createdAt.toISOString()}`
  );
}
