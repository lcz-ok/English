// Shared helpers for Vercel Serverless Functions.
// Uses @vercel/kv when the environment is wired; otherwise gracefully degrades.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { kv } from "./kv";

export const KV_PREFIX = "lv:";

export function cors(res: VercelResponse): VercelResponse {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === "OPTIONS") {
    cors(res).status(204).end();
    return true;
  }
  return false;
}

export function jsonError(res: VercelResponse, status: number, message: string, extra?: Record<string, unknown>) {
  return cors(res).status(status).json({ ok: false, error: message, ...extra });
}

export function jsonOk<T>(res: VercelResponse, data: T) {
  return cors(res).status(200).json({ ok: true, data });
}

// ---------- KV-backed JSON bucket (the single source of truth) ----------
export async function readBucket<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await kv.get<string>(`${KV_PREFIX}${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw as unknown as string) as T;
  } catch {
    return fallback;
  }
}

export async function writeBucket<T>(key: string, value: T): Promise<void> {
  try {
    await kv.set(`${KV_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // swallow — KV may be down; next request will retry
  }
}

export function storageConfigured(): boolean {
  // @vercel/kv will throw on connect if env vars are missing, but the
  // graceful shim we export in _kv.ts lets us detect explicit "not set".
  return process.env.KV_ENABLED !== "0";
}
