export const CARE_GUIDE_ROOT_DOMAIN_ENV = "CARE_GUIDE_ROOT_DOMAIN";

export function getRootDomain(env: NodeJS.ProcessEnv = process.env): string {
  const value = env[CARE_GUIDE_ROOT_DOMAIN_ENV]?.trim().toLowerCase();

  if (!value) {
    throw new Error(`${CARE_GUIDE_ROOT_DOMAIN_ENV} is required`);
  }

  return value;
}
