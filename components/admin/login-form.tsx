"use client";

import Script from "next/script";
import { useActionState } from "react";
import { login, type LoginResult } from "@/lib/actions/auth";

export function LoginForm({ siteKey }: { siteKey?: string }) {
  const [state, action, pending] = useActionState<LoginResult, FormData>(login, undefined);
  return (
    <form action={action} className="grid gap-3">
      <label className="grid gap-1 font-mono text-[11px] uppercase tracking-[0.08em] text-dim">
        Password
        <input name="password" type="password" required autoFocus autoComplete="current-password" className="h-12 bg-track border border-line rounded-xs px-3 text-paper text-sm font-mono focus:border-cut focus:outline-none" aria-describedby={state?.error ? "login-error" : undefined} aria-invalid={!!state?.error || undefined} />
      </label>
      {state?.error && <p id="login-error" className="font-mono text-xs text-cut-text" role="alert">{state.error}</p>}
      {siteKey && <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" /><div className="cf-turnstile" data-sitekey={siteKey} data-theme="dark" data-size="flexible" /></>}
      <button type="submit" disabled={pending} className="btn pri justify-center disabled:opacity-60">{pending ? "Checking…" : "Log in"}</button>
    </form>
  );
}
