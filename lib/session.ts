import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// One admin password, stored as "scrypt:<salt>:<hash>". One signed cookie, "<expiry>.<hmac>".
export const COOKIE = "cbc_admin";
export const SESSION_DAYS = 30;

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored = process.env.ADMIN_PASSWORD_HASH ?? "") {
  const [, salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, "hex"), b = scryptSync(password, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}

const sign = (exp: string, secret: string) => createHmac("sha256", secret).update(exp).digest("hex");

export function makeSession(secret = process.env.SESSION_SECRET ?? "") {
  const exp = String(Date.now() + SESSION_DAYS * 86400000);
  return `${exp}.${sign(exp, secret)}`;
}

export function validSession(value: string | undefined, secret = process.env.SESSION_SECRET ?? "") {
  if (!value || !secret) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const want = Buffer.from(sign(exp, secret), "hex"), got = Buffer.from(sig, "hex");
  return want.length === got.length && timingSafeEqual(want, got);
}
