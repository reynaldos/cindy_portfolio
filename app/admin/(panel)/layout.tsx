import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/lib/actions/auth";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Admin · Cuts By Cindy", robots: { index: false } };

const NAV = [
  ["/admin", "Overview"],
  ["/admin/profile", "Profile"],
  ["/admin/projects", "Projects"],
  ["/admin/recent-work", "Recent Work"],
  ["/admin/inbox", "Inbox"],
] as const;

// The panel is for Cindy only: plain forms on the same tokens, no editor costume.
// The session check reads cookies, so it and everything under it render at request time.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh grid grid-cols-1 md:grid-cols-[220px_1fr] font-sans">
      <aside className="bg-panel border-r border-line p-4 flex flex-col gap-1">
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-dim mb-3">Cuts By Cindy · Admin</div>
        {NAV.map(([href, name]) => <Link key={href} href={href} className="font-mono text-sm px-3 py-2 rounded-xs hover:bg-track text-paper">{name}</Link>)}
        <div className="mt-auto pt-4 flex flex-col gap-2">
          <Link href="/" className="font-mono text-xs text-dim hover:text-paper px-3">View site ↗</Link>
          <form action={logout}><button type="submit" className="font-mono text-xs text-dim hover:text-paper px-3 py-2">Log out</button></form>
        </div>
      </aside>
      <main className="p-6 max-w-5xl w-full">
        <Suspense fallback={null}><Gate>{children}</Gate></Suspense>
      </main>
    </div>
  );
}

async function Gate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}
