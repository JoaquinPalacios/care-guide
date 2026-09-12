import "dotenv/config";

import pg from "pg";

const PROTECTED_IDS = new Set(["practice_guide_demo_rivers_extraction"]);

export const ARTIFACT_SQL = `
  SELECT id, title, "publicSlug", status, "clinicId", "createdAt"
  FROM "PracticeGuide"
  WHERE NOT (id = ANY($1::text[]))
    AND (
      title = 'UX polish draft'
      OR title LIKE 'Unpublish lifecycle%'
      OR title LIKE 'Delete draft %'
      OR title LIKE 'Delete after unpublish %'
      OR title IN ('Empty preview draft', 'Delete me draft', 'Editor delete draft')
      OR "publicSlug" LIKE 'ux-polish-%'
      OR "publicSlug" LIKE 'unpublish-%'
      OR "publicSlug" LIKE 'empty-preview-%'
      OR "publicSlug" LIKE 'delete-draft-%'
      OR "publicSlug" LIKE 'editor-delete-%'
      OR "publicSlug" LIKE 'delete-unpublish-%'
    )
  ORDER BY "createdAt"
`;

export function developmentDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) {
    throw new Error("DATABASE_URL is required.");
  }
  return value;
}

export async function listE2eGuideArtifacts(
  connectionString = developmentDatabaseUrl()
) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    const result = await client.query(ARTIFACT_SQL, [[...PROTECTED_IDS]]);
    return result.rows;
  } finally {
    await client.end();
  }
}

export { PROTECTED_IDS };
