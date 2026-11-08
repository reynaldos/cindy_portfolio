import Image from "next/image";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Admin login · Cuts By Cindy", robots: { index: false } };

export default function Login() {
  return (
    <main className="min-h-dvh grid place-items-center p-4 font-sans">
      <div className="w-full max-w-sm bg-panel border border-line">
        <div className="bg-slate text-ink px-4 py-3 font-mono text-[13px] font-bold flex items-center gap-2"><Image src="/cbc.svg" alt="" width={16} height={16} />Project: Cuts By Cindy — Admin</div>
        <div className="p-4">
          <LoginForm siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
        </div>
      </div>
    </main>
  );
}
