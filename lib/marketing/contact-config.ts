export const MARKETING_CONTACT_TO_EMAIL_ENV = "MARKETING_CONTACT_TO_EMAIL";
export const MARKETING_CONTACT_FROM_EMAIL_ENV = "MARKETING_CONTACT_FROM_EMAIL";
/** @deprecated Prefer MARKETING_CONTACT_TO_EMAIL. Kept as a local fallback. */
export const MARKETING_CONTACT_EMAIL_ENV = "MARKETING_CONTACT_EMAIL";
export const MARKETING_CONTACT_MAILER_ENV = "MARKETING_CONTACT_MAILER";

export const SMTP_HOST_ENV = "SMTP_HOST";
export const SMTP_PORT_ENV = "SMTP_PORT";
export const SMTP_USER_ENV = "SMTP_USER";
export const SMTP_PASSWORD_ENV = "SMTP_PASSWORD";
export const SMTP_SECURE_ENV = "SMTP_SECURE";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Env = Record<string, string | undefined>;

export type MarketingMailerKind = "smtp" | "memory";

export type MarketingContactDeliveryConfig =
  | {
      ready: true;
      kind: "memory";
      toEmail: string;
      fromEmail: string;
    }
  | {
      ready: true;
      kind: "smtp";
      toEmail: string;
      fromEmail: string;
      smtp: SmtpConfig;
    }
  | {
      ready: false;
      kind: MarketingMailerKind;
      reason: string;
    };

export type SmtpConfig = {
  host: string;
  port: number;
  user: string | null;
  password: string | null;
  secure: boolean;
};

export function parseEmailAddress(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || !EMAIL_PATTERN.test(trimmed) || /[\r\n]/.test(trimmed)) {
    return null;
  }

  return trimmed;
}

export function getMarketingContactToEmail(
  env: Env = process.env
): string | null {
  return (
    parseEmailAddress(env[MARKETING_CONTACT_TO_EMAIL_ENV]) ??
    parseEmailAddress(env[MARKETING_CONTACT_EMAIL_ENV])
  );
}

export function getMarketingContactFromEmail(
  env: Env = process.env
): string | null {
  return parseEmailAddress(env[MARKETING_CONTACT_FROM_EMAIL_ENV]);
}

export function getMarketingMailerKind(
  env: Env = process.env
): MarketingMailerKind {
  return env[MARKETING_CONTACT_MAILER_ENV]?.trim() === "memory"
    ? "memory"
    : "smtp";
}

export function getSmtpConfig(env: Env = process.env): SmtpConfig | null {
  const host = env[SMTP_HOST_ENV]?.trim();
  if (!host) {
    return null;
  }

  const portValue = env[SMTP_PORT_ENV]?.trim() || "587";
  const port = Number.parseInt(portValue, 10);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    return null;
  }

  const secureValue = env[SMTP_SECURE_ENV]?.trim().toLowerCase();
  const user = env[SMTP_USER_ENV]?.trim() || null;
  const password = env[SMTP_PASSWORD_ENV] ?? null;

  return {
    host,
    port,
    user,
    password: password && password.length > 0 ? password : null,
    secure: secureValue === "true" || secureValue === "1",
  };
}

export function getMarketingContactDeliveryConfig(
  env: Env = process.env
): MarketingContactDeliveryConfig {
  const kind = getMarketingMailerKind(env);
  const toEmail = getMarketingContactToEmail(env);
  const fromEmail = getMarketingContactFromEmail(env);

  if (!toEmail || !fromEmail) {
    return {
      ready: false,
      kind,
      reason:
        "Clinic enquiry delivery is not configured. Set MARKETING_CONTACT_TO_EMAIL and MARKETING_CONTACT_FROM_EMAIL.",
    };
  }

  if (kind === "memory") {
    return {
      ready: true,
      kind: "memory",
      toEmail,
      fromEmail,
    };
  }

  const smtp = getSmtpConfig(env);
  if (!smtp) {
    return {
      ready: false,
      kind: "smtp",
      reason:
        "Clinic enquiry delivery is not configured. Set SMTP_HOST and SMTP_PORT, or use MARKETING_CONTACT_MAILER=memory in local development.",
    };
  }

  return {
    ready: true,
    kind: "smtp",
    toEmail,
    fromEmail,
    smtp,
  };
}
