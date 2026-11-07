"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { endSession, startSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientIp, human } from "@/lib/human";
import { verifyPassword } from "@/lib/session";

export type LoginResult = { error: string } | undefined;

// Five failed tries in fifteen minutes from one IP lock the form for a while
export async function login(_: LoginResult, form: FormData): Promise<LoginResult> {
  const ip = clientIp(await headers());
  const ipHash = createHash("sha256").update(ip).digest("hex");
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const fails = await db.loginAttempt.count({ where: { ipHash, ok: false, createdAt: { gt: since } } });
  if (fails >= 5) return { error: "Too many tries. Wait fifteen minutes." };
  if (!(await human(String(form.get("cf-turnstile-response") ?? ""), ip))) return { error: "The spam check did not pass. Try again." };

  const ok = verifyPassword(String(form.get("password") ?? ""));
  await db.loginAttempt.create({ data: { ipHash, ok } });
  if (!ok) return { error: "Wrong password." };
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}
