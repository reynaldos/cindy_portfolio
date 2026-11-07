"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  ["/admin", "Overview"],
  ["/admin/profile", "Profile"],
  ["/admin/projects", "Projects"],
  ["/admin/recent-work", "Recent Work"],
  ["/admin/inbox", "Inbox"],
] as const;

// A column on wide screens; on phones a top bar whose hamburger slides the same column in. A tap on a link closes it.
export function AdminNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <>
      <header className="md:hidden sticky top-0 z-20 bg-panel border-b border-line h-12 px-2 flex items-center gap-2">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="admin-nav" aria-label={open ? "Close menu" : "Open menu"} className="h-11 w-11 grid place-items-center text-paper">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-dim">Cuts By Cindy · Admin</span>
      </header>
      {open && <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="md:hidden fixed inset-0 top-12 z-10 bg-ink/70" />}
      <aside id="admin-nav" className={`${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform motion-reduce:transition-none fixed md:sticky top-12 md:top-0 bottom-0 left-0 md:h-dvh z-10 w-64 md:w-auto bg-panel border-r border-line p-4 flex flex-col gap-1`}>
        <div className="hidden md:block font-mono text-[11px] uppercase tracking-[0.08em] text-dim mb-3">Cuts By Cindy · Admin</div>
        {NAV.map(([href, name]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={path === href ? "page" : undefined} className={`font-mono text-sm px-3 py-2 rounded-xs hover:bg-track ${path === href ? "bg-track text-paper" : "text-paper"}`}>{name}</Link>)}
        <div className="mt-auto pt-4 flex flex-col gap-2">
          <Link href="/" className="font-mono text-xs text-dim hover:text-paper px-3 py-2">View site ↗</Link>
          {children}
        </div>
      </aside>
    </>
  );
}
