import "server-only";

// Turnstile is optional: with no secret in the env, every visitor passes
export async function human(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: new URLSearchParams({ secret, response: token, remoteip: ip }) });
  return res.ok && (await res.json()).success === true;
}

export function clientIp(h: Headers) {
  return h.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
}
