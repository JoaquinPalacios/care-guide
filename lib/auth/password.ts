import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_PREFIX = "scrypt";
const SCRYPT_KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");
  return `${SCRYPT_PREFIX}:${salt}:${hash}`;
}

export function verifyPassword(
  password: string,
  passwordHash: string | null | undefined
) {
  if (!passwordHash) {
    return false;
  }

  const [algorithm, salt, storedHash] = passwordHash.split(":");

  if (!algorithm || !salt || !storedHash || algorithm !== SCRYPT_PREFIX) {
    return false;
  }

  const derivedHash = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  const storedHashBuffer = Buffer.from(storedHash, "hex");

  if (storedHashBuffer.length !== derivedHash.length) {
    return false;
  }

  return timingSafeEqual(derivedHash, storedHashBuffer);
}
