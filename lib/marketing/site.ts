import { getRootDomain } from "@/lib/tenancy/root-domain";

export function marketingSiteOrigin(
  env: NodeJS.ProcessEnv = process.env
): string {
  const configured = env.CARE_GUIDE_METADATA_BASE?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  try {
    const root = getRootDomain(env);
    const protocol =
      root === "localhost" || root.endsWith(".localhost") ? "http" : "https";
    return `${protocol}://${root}`;
  } catch {
    return "http://localhost:3000";
  }
}
