"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { clientIp, human } from "@/lib/human";

const Inquiry = z.object({
  name: z.string().trim().min(1, "Add your name.").max(120),
  email: z.string().trim().email("Add your email so Cindy can reply."),
  projectType: z.enum(["Short Film", "Commercial", "Music Video", "Trailer", "Other"]),
  message: z.string().trim().min(1, "Add a message.").max(5000),
  website: z.string().max(0).optional(), // honeypot: humans never see it
  openedAt: z.coerce.number(),
  turnstile: z.string().optional(),
});

export type ContactResult = { ok: true } | { ok: false; field?: "name" | "email" | "message"; error: string };

// Save first, then send. A failed email keeps the row, so the inbox still has it.
export async function sendInquiry(raw: Record<string, string>): Promise<ContactResult> {
  const parsed = Inquiry.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, field: issue.path[0] as "name" | "email" | "message", error: issue.message };
  }
  const d = parsed.data;
  // bots fill the hidden field or send within three seconds; tell them nothing
  if (d.website || Date.now() - d.openedAt < 3000) return { ok: true };

  const ip = clientIp(await headers());
  if (!(await human(d.turnstile, ip))) return { ok: false, error: "The spam check did not pass. Try again, or email Cindy directly." };
  const ipHash = createHash("sha256").update(ip).digest("hex");
  const recent = await db.contactSubmission.count({ where: { ipHash, createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) } } });
  if (recent >= 3) return { ok: false, error: "Too many messages in a row. Try again in ten minutes, or email Cindy directly." };

  const row = await db.contactSubmission.create({ data: { name: d.name, email: d.email, projectType: d.projectType, message: d.message, ipHash } });

  const sent = await sendEmail(d).catch(() => false);
  if (sent) await db.contactSubmission.update({ where: { id: row.id }, data: { emailSent: true } });
  return sent ? { ok: true } : { ok: false, error: "The message is saved, but the email did not go out." };
}

async function sendEmail(d: z.infer<typeof Inquiry>) {
  const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY } = process.env;
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) return false;
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      accessToken: EMAILJS_PRIVATE_KEY,
      template_params: { name: d.name, email: d.email, project_type: d.projectType, message: d.message },
    }),
  });
  return res.ok;
}
