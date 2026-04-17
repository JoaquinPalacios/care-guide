import "server-only";

import { randomBytes } from "node:crypto";

const DISPLAY_TOKEN_BYTES = 32;

/**
 * Generate an opaque, cryptographically strong token for
 * `ProcedureSession.displayToken`. 32 random bytes encoded as base64url
 * produces a 43-character URL-safe string with 256 bits of entropy.
 *
 * The token is the sole capability needed to read a patient display session,
 * so it must come from a CSPRNG and never be derived from user input.
 */
export function generateDisplayToken(): string {
  return randomBytes(DISPLAY_TOKEN_BYTES).toString("base64url");
}
