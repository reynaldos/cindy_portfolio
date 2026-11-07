import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Cloudflare Stream API. Server only: it carries the account token.
const API = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/stream`;
const auth = { Authorization: `Bearer ${process.env.CF_STREAM_TOKEN}` };

export type StreamVideo = {
  uid: string;
  readyToStream: boolean;
  status: { state: "pendingupload" | "downloading" | "queued" | "inprogress" | "ready" | "error"; errorReasonText?: string };
  duration: number;
  input: { width: number; height: number };
  size: number;
};

// A one-time tus upload URL. The browser sends the file straight to Stream; the file never touches Vercel.
export async function createUpload(bytes: number, name: string) {
  const res = await fetch(`${API}?direct_user=true`, {
    method: "POST",
    headers: { ...auth, "Tus-Resumable": "1.0.0", "Upload-Length": String(bytes), "Upload-Metadata": `name ${Buffer.from(name).toString("base64")}` },
  });
  if (!res.ok) throw new Error(`Stream upload init failed: ${res.status}`);
  return { uploadUrl: res.headers.get("Location")!, uid: res.headers.get("stream-media-id")! };
}

export async function getVideo(uid: string): Promise<StreamVideo> {
  const res = await fetch(`${API}/${uid}`, { headers: auth, cache: "no-store" });
  if (!res.ok) throw new Error(`Stream get failed: ${res.status}`);
  return (await res.json()).result;
}

export async function deleteVideo(uid: string) {
  const res = await fetch(`${API}/${uid}`, { method: "DELETE", headers: auth });
  if (!res.ok && res.status !== 404) throw new Error(`Stream delete failed: ${res.status}`);
}

// Webhook-Signature: time=<unix>,sig1=<hex hmac of "<time>.<body>">
export function verifyWebhook(body: string, header: string | null, secret = process.env.CF_STREAM_WEBHOOK_SECRET ?? "") {
  const m = header?.match(/time=(\d+),sig1=([0-9a-f]+)/);
  if (!m || !secret) return false;
  if (Math.abs(Date.now() / 1000 - Number(m[1])) > 300) return false;
  const want = createHmac("sha256", secret).update(`${m[1]}.${body}`).digest();
  const got = Buffer.from(m[2], "hex");
  return want.length === got.length && timingSafeEqual(want, got);
}
