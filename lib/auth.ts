import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { COOKIE, SESSION_DAYS, makeSession, validSession } from "@/lib/session";

// Every admin page and action calls this; the proxy alone is not enough, because actions can be called directly.
// connection() keeps the expiry check (Date.now) out of the prerender.
export async function requireAdmin() {
  await connection();
  if (!validSession((await cookies()).get(COOKIE)?.value)) redirect("/admin/login");
}

export async function startSession() {
  (await cookies()).set(COOKIE, makeSession(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/admin", maxAge: SESSION_DAYS * 86400 });
}

export async function endSession() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}
