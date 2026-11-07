"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

// Inbox rows only change status; the admin pages re-render, the public cache is untouched
export async function setInboxStatus(id: string, status: "new" | "read" | "archived") {
  await requireAdmin();
  await db.contactSubmission.update({ where: { id }, data: { status } });
  revalidatePath("/admin/inbox");
  revalidatePath("/admin");
}
