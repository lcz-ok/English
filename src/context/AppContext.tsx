import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LangCode, UserStats } from "../data/types";
import { ACHIEVEMENTS } from "../data/achievements";
import { COURSES } from "../data/courses";
import { load, save, remove, STORAGE_KEYS, hashPassword, uid, syncFromCloud } from "../lib/storage";
import { supabaseEnabled } from "../lib/supabaseClient";
import { buildPersonalizedPath } from "../lib/recommend";
import type { LearningPath } from "../lib/recommend";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  preferredLangs: LangCode[];
  goal: string;
  createdAt: number;
  isAdmin?: boolean;
  banned?: boolean;
}

// Built-in administrator account (auto-seeded on first load)
const ADMIN_EMAIL = "lczdyx2026@163.com";
const ADMIN_PASSWORD = "abg13579";

function makeAdmin(): User {
  return {
    id: "admin",
    name: "管理员",
    email: ADMIN_EMAIL,
    passwordHash: hashPassword(ADMIN_PASSWORD),
    avatar: "👑",
    preferredLangs: ["en", "ja", "ko"],
    goal: "平台管理",
    createdAt: Date.now(),
    isAdmin: true,
  };
}

// Ensure the admin account always exists in the user list.
// Preserves editable profile fields (name/avatar/goal/preferredLangs) the admin
// may have changed, but always re-asserts the fixed password & admin flag.
function ensureAdmin(list: User[]): User[] {
  const existing = list.find((u) => u.email === ADMIN_EMAIL);
  if (!existing) return [makeAdmin(), ...list];
  return list.map((u) =>
    u.email === ADMIN_EMAIL
      ? {
          ...u,
          passwordHash: hashPassword(ADMIN_PASSWORD),
          isAdmin: true,
          // guarantee the three languages remain available to admin
          preferredLangs: u.preferredLangs?.length ? u.preferredLangs : ["en", "ja", "ko"],
        }
      : u
  );
}

// Built-in guest demo account (auto-seeded on first load)
const GUEST_EMAIL = "123@123";
const GUEST_PASSWORD = "123456";

function makeGuest(): User {
  return {
    id: "guest",
    name: "游客体验",
    email: GUEST_EMAIL,
    passwordHash: hashPassword(GUEST_PASSWORD),
    avatar: "🦊",
    preferredLangs: ["en", "ja", "ko"],
    goal: "体验探索",
    createdAt: Date.now(),
  };
}

// Ensure the guest account always exists and keeps its fixed password.
// Preserves editable profile fields the guest may have changed.
function ensureGuest(list: User[]): User[] {
  const existing = list.find((u) => u.email === GUEST_EMAIL);
  if (!existing) return [makeGuest(), ...list];
  return list.map((u) =>
    u.email === GUEST_EMAIL
      ? {
          ...u,
          passwordHash: hashPassword(GUEST_PASSWORD),
          preferredLangs: u.preferredLangs?.length ? u.preferredLangs : ["en", "ja", "ko"],
        }
      : u
  );
}

// Seed all built-in accounts (admin + guest) into the user list
function ensureBuiltinAccounts(list: User[]): User[] {
  return ensureGuest(ensureAdmin(list));
}

interface Progress {
  userId: string;
  completedLessons: string[]; // lesson ids
  xp: number;
  streak: number;
  lastStudyDate: string | null; // YYYY-MM-DD
  daysActive: string[];
  wordsLearned: number;
  perfectScores: number;
  unlockedAchievements: string[];
  dailyXp: Record<string, number>; // date -> xp
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AppContextValue {
  user: User | null;
  users: User[];
  progress: Progress | null;
  allProgress: Record<string, Progress>;
  register: (data: RegisterData & { preferredLangs: LangCode[]; goal: string }) => { ok: boolean; error?: string };
  login: (email: string, password: string, remember?: boolean) => { ok: boolean; error?: string };
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  deleteAccount: () => { ok: boolean; error?: string };
  // admin user management
  adminBanUser: (targetId: string) => { ok: boolean; error?: string };
  adminUnbanUser: (targetId: string) => { ok: boolean; error?: string };
  adminDeleteUser: (targetId: string) => { ok: boolean; error?: string };
  completeLesson: (lessonId: string, earnedXp: number, perfect: boolean, words: number) => string[]; // returns newly unlocked achievement ids
  stats: UserStats;
  learningPath: LearningPath;
  unlockedAchievements: { id: string; name: string; description: string; icon: string }[];
}

const AppContext = createContext<AppContextValue | null>(null);

// Avatar options available for users to pick in their profile
export const AVATARS = ["🐱", "🐼", "🦊", "🐧", "🦉", "🐰", "🐯", "🦁", "🐨", "🐸", "🐻", "🐹", "🦄", "🐲", "🦋"];

// 7-day auto-login duration
const REMEMBER_DAYS = 7;
const REMEMBER_MS = REMEMBER_DAYS * 86400000;

interface RememberEntry {
  userId: string;
  expiresAt: number;
}

function readRemember(): RememberEntry | null {
  const entry = load<RememberEntry | null>(STORAGE_KEYS.remember, null);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    remove(STORAGE_KEYS.remember);
    return null;
  }
  return entry;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateDiffDays(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function emptyProgress(userId: string): Progress {
  return {
    userId,
    completedLessons: [],
    xp: 0,
    streak: 0,
    lastStudyDate: null,
    daysActive: [],
    wordsLearned: 0,
    perfectScores: 0,
    unlockedAchievements: [],
    dailyXp: {},
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => ensureBuiltinAccounts(load(STORAGE_KEYS.users, [])));
  const [userId, setUserId] = useState<string | null>(() => {
    // 1) explicit current session first
    const current = load<string | null>(STORAGE_KEYS.currentUser, null);
    if (current) return current;
    // 2) otherwise try 7-day "保存密码" auto-login
    const remember = readRemember();
    return remember ? remember.userId : null;
  });
  const [allProgress, setAllProgress] = useState<Record<string, Progress>>(() => {
    const existing = load<Record<string, Progress>>(STORAGE_KEYS.progress, {});
    // seed empty progress for built-in accounts if missing
    if (!existing["admin"]) existing["admin"] = emptyProgress("admin");
    if (!existing["guest"]) existing["guest"] = emptyProgress("guest");
    return existing;
  });

  // persist
  useEffect(() => save(STORAGE_KEYS.users, users), [users]);
  useEffect(() => save(STORAGE_KEYS.currentUser, userId), [userId]);
  useEffect(() => save(STORAGE_KEYS.progress, allProgress), [allProgress]);

  // 启动时从云端拉取数据（仅在配置了 Supabase 时执行）
  // 实现跨设备同步：新设备登录后会从云端拉取最新的用户列表和进度
  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      const [cloudUsers, cloudProgress] = await Promise.all([
        syncFromCloud<User[]>(STORAGE_KEYS.users),
        syncFromCloud<Record<string, Progress>>(STORAGE_KEYS.progress),
      ]);
      if (cloudUsers) {
        setUsers(ensureBuiltinAccounts(cloudUsers));
      }
      if (cloudProgress) {
        setAllProgress((prev) => ({ ...prev, ...cloudProgress }));
      }
    })();
  }, []);

  const user = useMemo(() => users.find((u) => u.id === userId) ?? null, [users, userId]);
  const progress = useMemo(() => (userId ? allProgress[userId] ?? null : null), [allProgress, userId]);

  const register: AppContextValue["register"] = (data) => {
    const email = data.email.trim().toLowerCase();
    if (!email || !data.password || !data.name.trim()) {
      return { ok: false, error: "请完整填写信息" };
    }
    if (users.some((u) => u.email === email)) {
      return { ok: false, error: "该邮箱已注册" };
    }
    const newUser: User = {
      id: uid("u"),
      name: data.name.trim(),
      email,
      passwordHash: hashPassword(data.password),
      avatar: AVATARS[users.length % AVATARS.length],
      preferredLangs: data.preferredLangs.length ? data.preferredLangs : ["en"],
      goal: data.goal || "日常交流",
      createdAt: Date.now(),
    };
    setUsers((prev) => [...prev, newUser]);
    const np = emptyProgress(newUser.id);
    setAllProgress((prev) => ({ ...prev, [newUser.id]: np }));
    setUserId(newUser.id);
    return { ok: true };
  };

  const login: AppContextValue["login"] = (email, password, remember = false) => {
    const found = users.find((u) => u.email === email.trim().toLowerCase());
    if (!found) return { ok: false, error: "用户不存在" };
    if (found.passwordHash !== hashPassword(password)) return { ok: false, error: "密码错误" };
    if (found.banned) return { ok: false, error: "该账号已被封禁，请联系管理员" };
    setUserId(found.id);
    if (remember) {
      save(STORAGE_KEYS.remember, { userId: found.id, expiresAt: Date.now() + REMEMBER_MS });
    } else {
      remove(STORAGE_KEYS.remember);
    }
    return { ok: true };
  };

  const logout = () => {
    setUserId(null);
    remove(STORAGE_KEYS.currentUser);
    remove(STORAGE_KEYS.remember);
  };

  // Remove a user account entirely (shared by self-delete & admin-delete)
  function purgeUser(targetId: string) {
    setUsers((prev) => prev.filter((u) => u.id !== targetId));
    setAllProgress((prev) => {
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
    // remove their community posts from localStorage (keep seed posts)
    const remaining = load<{ authorId: string }[]>(STORAGE_KEYS.posts, []).filter((p) => p.authorId !== targetId);
    save(STORAGE_KEYS.posts, remaining);
  }

  const deleteAccount: AppContextValue["deleteAccount"] = () => {
    if (!user) return { ok: false, error: "未登录" };
    if (user.isAdmin) return { ok: false, error: "管理员账号不可注销" };
    if (user.id === "guest") return { ok: false, error: "游客体验账号不可注销" };
    purgeUser(user.id);
    setUserId(null);
    remove(STORAGE_KEYS.currentUser);
    remove(STORAGE_KEYS.remember);
    return { ok: true };
  };

  // ===== Admin user management =====
  const adminBanUser: AppContextValue["adminBanUser"] = (targetId) => {
    if (!user?.isAdmin) return { ok: false, error: "无权限" };
    const target = users.find((u) => u.id === targetId);
    if (!target) return { ok: false, error: "用户不存在" };
    if (target.isAdmin) return { ok: false, error: "不能封禁管理员" };
    if (target.id === "guest") return { ok: false, error: "不能封禁游客账号" };
    setUsers((prev) => prev.map((u) => (u.id === targetId ? { ...u, banned: true } : u)));
    return { ok: true };
  };

  const adminUnbanUser: AppContextValue["adminUnbanUser"] = (targetId) => {
    if (!user?.isAdmin) return { ok: false, error: "无权限" };
    setUsers((prev) => prev.map((u) => (u.id === targetId ? { ...u, banned: false } : u)));
    return { ok: true };
  };

  const adminDeleteUser: AppContextValue["adminDeleteUser"] = (targetId) => {
    if (!user?.isAdmin) return { ok: false, error: "无权限" };
    const target = users.find((u) => u.id === targetId);
    if (!target) return { ok: false, error: "用户不存在" };
    if (target.isAdmin) return { ok: false, error: "不能删除管理员账号" };
    if (target.id === "guest") return { ok: false, error: "不能删除游客账号" };
    purgeUser(targetId);
    // if admin deleted their own session (not possible since admin blocked), log out
    if (userId === targetId) {
      setUserId(null);
      remove(STORAGE_KEYS.currentUser);
      remove(STORAGE_KEYS.remember);
    }
    return { ok: true };
  };

  const updateUser: AppContextValue["updateUser"] = (patch) => {
    if (!user) return;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...patch } : u)));
  };

  const completeLesson: AppContextValue["completeLesson"] = (lessonId, earnedXp, perfect, words) => {
    if (!user || !progress) return [];
    const today = todayStr();
    let streak = progress.streak;
    if (progress.lastStudyDate) {
      const diff = dateDiffDays(progress.lastStudyDate, today);
      if (diff === 1) streak += 1;
      else if (diff > 1) streak = 1;
      // same day -> streak unchanged
    } else {
      streak = 1;
    }
    const daysActive = progress.daysActive.includes(today) ? progress.daysActive : [...progress.daysActive, today];
    const completedLessons = progress.completedLessons.includes(lessonId)
      ? progress.completedLessons
      : [...progress.completedLessons, lessonId];
    const dailyXp = { ...progress.dailyXp, [today]: (progress.dailyXp[today] ?? 0) + earnedXp };

    const newProgress: Progress = {
      ...progress,
      completedLessons,
      xp: progress.xp + earnedXp,
      streak,
      lastStudyDate: today,
      daysActive,
      wordsLearned: progress.wordsLearned + words,
      perfectScores: progress.perfectScores + (perfect ? 1 : 0),
      dailyXp,
    };

    // evaluate achievements
    const languagesStudied = new Set(
      completedLessons
        .map((id) => COURSES.find((c) => c.lessons.some((l) => l.id === id))?.lang)
        .filter(Boolean)
    ).size;
    const stats: UserStats = {
      totalXp: newProgress.xp,
      streak: newProgress.streak,
      lessonsCompleted: newProgress.completedLessons.length,
      wordsLearned: newProgress.wordsLearned,
      perfectScores: newProgress.perfectScores,
      daysActive: newProgress.daysActive.length,
      languagesStudied,
    };
    const newlyUnlocked: string[] = [];
    for (const a of ACHIEVEMENTS) {
      if (!newProgress.unlockedAchievements.includes(a.id) && a.check(stats)) {
        newlyUnlocked.push(a.id);
      }
    }
    newProgress.unlockedAchievements = [...newProgress.unlockedAchievements, ...newlyUnlocked];

    setAllProgress((prev) => ({ ...prev, [user.id]: newProgress }));
    return newlyUnlocked;
  };

  const stats: UserStats = useMemo(() => {
    if (!progress) {
      return { totalXp: 0, streak: 0, lessonsCompleted: 0, wordsLearned: 0, perfectScores: 0, daysActive: 0, languagesStudied: 0 };
    }
    const languagesStudied = new Set(
      progress.completedLessons
        .map((id) => COURSES.find((c) => c.lessons.some((l) => l.id === id))?.lang)
        .filter(Boolean)
    ).size;
    return {
      totalXp: progress.xp,
      streak: progress.streak,
      lessonsCompleted: progress.completedLessons.length,
      wordsLearned: progress.wordsLearned,
      perfectScores: progress.perfectScores,
      daysActive: progress.daysActive.length,
      languagesStudied,
    };
  }, [progress]);

  const learningPath = useMemo<LearningPath>(() => {
    if (!user || !progress) {
      return { title: "开始你的语言之旅", description: "注册后即可获得专属学习路径。", steps: [] };
    }
    return buildPersonalizedPath(user.preferredLangs, progress.completedLessons, stats);
  }, [user, progress, stats]);

  const unlockedAchievements = useMemo(() => {
    if (!progress) return [];
    return ACHIEVEMENTS.filter((a) => progress.unlockedAchievements.includes(a.id)).map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
    }));
  }, [progress]);

  const value: AppContextValue = {
    user,
    users,
    progress,
    allProgress,
    register,
    login,
    logout,
    updateUser,
    deleteAccount,
    adminBanUser,
    adminUnbanUser,
    adminDeleteUser,
    completeLesson,
    stats,
    learningPath,
    unlockedAchievements,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
