// Typed storage layer: localStorage + Supabase cloud sync
// 未配置 Supabase 时自动降级为纯 localStorage 单机模式

import { cloudGet, cloudSet, supabaseEnabled } from "./supabaseClient";

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
  // 后台异步推送到云端（不阻塞 UI）
  if (supabaseEnabled) {
    void cloudSet("users", key, value).catch(() => {});
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const STORAGE_KEYS = {
  users: "lv.users",
  currentUser: "lv.currentUser",
  progress: "lv.progress", // progress keyed by userId
  posts: "lv.posts",
  remember: "lv.remember", // 7-day auto-login entry { userId, expiresAt }
} as const;

// 从云端拉取数据并合并到本地（启动时调用）
export async function syncFromCloud<T>(key: string): Promise<T | null> {
  if (!supabaseEnabled) return null;
  const cloudData = await cloudGet<T>("users", key);
  if (cloudData) {
    try {
      localStorage.setItem(key, JSON.stringify(cloudData));
    } catch {
      // ignore
    }
    return cloudData;
  }
  return null;
}

// Simple hash (NOT secure - demo only) to avoid storing raw passwords
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
