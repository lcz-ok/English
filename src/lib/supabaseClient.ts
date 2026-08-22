import { createClient } from "@supabase/supabase-js";

// 从环境变量读取 Supabase 配置
// Vite 会将 VITE_ 前缀的变量注入到前端
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// 是否已配置 Supabase（未配置时自动降级为 localStorage 单机模式）
export const supabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

// 创建 Supabase 客户端（仅在配置完整时初始化）
export const supabase = supabaseEnabled
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

// 云端同步工具：把本地数据推到云端 / 从云端拉取
// 未配置 Supabase 时这些函数都是 no-op，应用照常以单机模式运行
export async function cloudGet<T>(table: string, key: string): Promise<T | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from(table).select("value").eq("key", key).maybeSingle();
    if (error || !data) return null;
    return (data as { value: T }).value;
  } catch {
    return null;
  }
}

export async function cloudSet<T>(table: string, key: string, value: T): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from(table).upsert({ key, value }, { onConflict: "key" });
  } catch {
    // 静默失败，不影响本地体验
  }
}
