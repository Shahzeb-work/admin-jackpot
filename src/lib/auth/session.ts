import { cookies } from "next/headers";
import crypto from "node:crypto";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function verify(payload: string, signature: string) {
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function encode(adminId: string) {
  const payload = Buffer.from(
    JSON.stringify({ aid: adminId, exp: Date.now() + SESSION_TTL_MS })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !verify(payload, signature)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      aid?: unknown;
      exp?: unknown;
    };
    if (typeof data.aid !== "string" || typeof data.exp !== "number" || data.exp < Date.now()) {
      return null;
    }
    return data.aid;
  } catch {
    return null;
  }
}

export async function createAdminSession(adminId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encode(adminId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionAdminId() {
  const cookieStore = await cookies();
  return decode(cookieStore.get(SESSION_COOKIE)?.value);
}
