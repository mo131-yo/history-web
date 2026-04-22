import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "atlas_admin_session";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function getSigningKey() {
  return process.env.ADMIN_SESSION_SECRET || process.env.DATABASE_URL || "atlas-admin-secret";
}

function signValue(value: string) {
  return createHmac("sha256", getSigningKey()).update(value).digest("hex");
}

export function isAdminAuthConfigured() {
  return getAdminPassword().length > 0;
}

export function verifyAdminPassword(password: string) {
  const configured = getAdminPassword();

  if (!configured) {
    return false;
  }

  return timingSafeEqual(Buffer.from(password), Buffer.from(configured));
}

export function createAdminSessionToken() {
  const payload = "role=admin";
  return `${payload}.${signValue(payload)}`;
}

export function isValidAdminSession(token: string | undefined) {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return false;
  }

  const expected = signValue(payload);

  if (expected.length !== signature.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) && payload === "role=admin";
}
