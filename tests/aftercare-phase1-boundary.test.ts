import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function sourceFiles(directory: string): string[] {
  return walk(directory).filter((path) => /\.(ts|tsx|css)$/.test(path));
}

describe("Phase 1 aftercare product boundary", () => {
  it("does not couple aftercare to ProcedureSession or patient PII", () => {
    const files = [
      ...sourceFiles("app/(aftercare)"),
      ...sourceFiles("lib/aftercare"),
      ...sourceFiles("lib/tenancy"),
      ...sourceFiles("lib/branding"),
    ];

    expect(files.length).toBeGreaterThan(10);

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/\bProcedureSession\b/);
      expect(source, file).not.toMatch(/\bpatientEmail\b/);
      expect(source, file).not.toMatch(/\bpatientName\b/);
      expect(source, file).not.toMatch(/\bdateOfBirth\b/);
    }
  });

  it("keeps Prisma out of the hostname proxy", () => {
    const source = readFileSync("proxy.ts", "utf8");

    expect(source).not.toContain("prisma");
    expect(source).not.toContain("@/lib/prisma");
    expect(source).not.toContain("getClinicBySlug");
  });
});
