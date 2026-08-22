// Typed storage layer: localStorage + Vercel cloud sync (via /api endpoints).
// If cloud is unreachable or not yet wired, application continues to work
// locally exactly as it did before — just no cross-device sync yet.

import { cloudPushKey } from "./cloudApi";

// localStorage keys. Prefixed "lv." to avoid collisions with other apps on
// the same origin — and intentionally kept stable so APK builds and earlier
// browser sessions retain their user/progress data.
export const STORAGE_KEYS = {
  users: "lv.users",
  currentUser: "lv.currentUser",
  progress: "lv.progress",
  posts: "lv.posts",
  remember: "lv.remember",
} as const;

// Map a localStorage key (e.g. "lv.users") → the canonical cloud-store key.
// The server adds its own "lv:" KV namespace prefix, so strip ours here.
function cloudKey(localKey: string): string {
  return localKey.replace(/^lv\./, "");
}

// 同步读取（localStorage 优先，立即返回；云端在 AppContext 启动时单独拉取）
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// 同步保存到 localStorage，并 fire-and-forget 同步到云端
export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
  // 后台异步推送到云端（不阻塞 UI，失败静默）
  void cloudPushKey(cloudKey(key), value).catch(() => {});
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// 兼容旧版 — 现在 AppContext 直接用 cloudPullAll()
export async function syncFromCloud<T>(_key: string): Promise<T | null> {
  return null;
}

// Simple hash (NOT secure - demo only) to avoid storing raw passwords.
// Kept byte-for-byte identical with api/sync.ts so hashes match server-side.
export function hashPassword(pw: string): string {
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = (h << 5) - h + pw.charCodeAt(i);
    h |= 0;
  }
  return `h${h}`;
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
