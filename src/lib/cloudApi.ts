// Frontend → Vercel Serverless Functions bridge.
// All calls are fire-and-forget safe: if the server is unreachable or the
// cloud storage isn't configured yet, we silently fall back to localStorage.

import { STORAGE_KEYS } from "./storage";

export interface CloudSyncPayload {
  users: import("../context/AppContext").User[];
  progress: Record<string, import("../context/AppContext").Progress>;
}

const CLOUD_TIMEOUT_MS = 4000;

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), CLOUD_TIMEOUT_MS);
    const resp = await fetch(url, { ...init, signal: ctrl.signal });
    clearTimeout(t);
    if (!resp.ok) return null;
    const body = (await resp.json()) as { ok?: boolean; data?: T };
    if (body && typeof body === "object" && "ok" in body && body.ok === true) {
      return (body.data ?? null) as T | null;
    }
    return (body as unknown as T) ?? null;
  } catch {
    return null;
  }
}

// Pull both users + progress in one request (cold-start friendly).
export async function cloudPullAll(): Promise<CloudSyncPayload | null> {
  const data = await fetchJson<CloudSyncPayload>("/api/sync");
  return data;
}

// Save a single localStorage key to the cloud store.
export async function cloudPushKey<T>(key: string, value: T): Promise<boolean> {
  const resp = await fetchJson<{ saved?: boolean }>("/api/store", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
  return !!resp?.saved;
}

export { STORAGE_KEYS };
