import { Suspense } from "react";
import { AdminNav } from "@/components/admin/nav";
import { logout } from "@/lib/actions/auth";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Admin · Cuts By Cindy", robots: { index: false } };
// Every admin page reads live data, so the panel renders on the server per request
export const instant = false;

// The panel is for Cindy only: plain forms on the same tokens, no editor costume.
// The session check reads cookies, so it and everything under it render at request time.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh grid grid-rows-[auto_1fr] md:grid-rows-1 md:grid-cols-[220px_1fr] font-sans">
      <AdminNav>
        <form action={logout}><button type="submit" className="font-mono text-xs text-dim hover:text-paper px-3 py-2">Log out</button></form>
      </AdminNav>
      <main className="p-4 md:p-6 max-w-5xl w-full min-w-0">
        <Suspense fallback={null}><Gate>{children}</Gate></Suspense>
      </main>
    </div>
  );
}

async function Gate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}
