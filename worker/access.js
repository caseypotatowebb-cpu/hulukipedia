/**
 * Pearl-style shared-password gate for Hulukipedia's paid /api routes.
 *
 * When APP_TOKEN is set, those routes require a valid session cookie
 * (set after a successful /api/login) or a matching x-app-token header
 * (for teammates' agents). There is no same-origin bypass: visiting the
 * public site is not enough. When APP_TOKEN is unset, the proxy stays open.
 */

export const COOKIE_NAME = "hulukipedia_access";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
export const PROTECTED_PATHS = ["/api/ai", "/api/image", "/api/search", "/api/scene-check"];

const encoder = new TextEncoder();
const SESSION_SALT = "hulukipedia-session-v1:";

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
async function sha256(value) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let i = 0; i < left.length; i += 1) difference |= left[i] ^ right[i];
  return difference === 0;
}

export function accessIsConfigured(appToken) {
  return Boolean(appToken && String(appToken).trim());
}

export function isProtectedPost(method, pathname) {
  return method === "POST" && PROTECTED_PATHS.includes(pathname);
}

export async function verifyAccessPassword(candidate, expected) {
  if (!candidate || !expected) return false;
  const [candidateHash, expectedHash] = await Promise.all([
    sha256(String(candidate)),
    sha256(String(expected)),
  ]);
  return constantTimeEqual(candidateHash, expectedHash);
}

export async function sessionSecretFromAppToken(appToken) {
  const digest = await sha256(SESSION_SALT + String(appToken));
  return toBase64Url(digest);
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

export async function createAccessSession(sessionSecret, nowSeconds = Math.floor(Date.now() / 1000)) {
  const expiresAt = nowSeconds + SESSION_TTL_SECONDS;
  const payload = `v1.${expiresAt}`;
  return `${payload}.${await sign(payload, sessionSecret)}`;
}

export async function verifyAccessSession(token, sessionSecret, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!token || !sessionSecret) return false;
  const parts = String(token).split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const expiresAt = Number(parts[1]);
  if (!Number.isFinite(expiresAt) || expiresAt <= nowSeconds) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expectedSignature = await sign(payload, sessionSecret);
  return constantTimeEqual(encoder.encode(parts[2]), encoder.encode(expectedSignature));
}

export function readCookie(cookieHeader, name = COOKIE_NAME) {
  if (!cookieHeader) return undefined;
  for (const part of String(cookieHeader).split(";")) {
    const trimmed = part.trim();
    const cut = trimmed.indexOf("=");
    if (cut === -1) continue;
    if (trimmed.slice(0, cut) === name) return trimmed.slice(cut + 1);
  }
  return undefined;
}

export function setAccessCookieHeader(token, { secure = true } = {}) {
  const parts = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearAccessCookieHeader({ secure = true } = {}) {
  const parts = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export async function requestIsAuthorized({ appToken, cookieHeader, appTokenHeader }) {
  if (!accessIsConfigured(appToken)) return true;
  if (await verifyAccessPassword(appTokenHeader, appToken)) return true;
  const sessionSecret = await sessionSecretFromAppToken(appToken);
  return verifyAccessSession(readCookie(cookieHeader), sessionSecret);
}
