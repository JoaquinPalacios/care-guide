import "server-only";

export const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const useSecureCookies = process.env.NODE_ENV === "production";

export const AUTH_SESSION_COOKIE_NAME = useSecureCookies
  ? "__Secure-authjs.session-token"
  : "authjs.session-token";

export const authSessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: useSecureCookies,
};
