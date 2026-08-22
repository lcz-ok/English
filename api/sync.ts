// Bulk sync endpoint. App startup calls this once to pull users + progress
// in a single round-trip (avoids 2 cold starts on a fresh page load).
// GET /api/sync
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors, handleOptions, jsonOk, readBucket, writeBucket } from "../lib-server/shared";

export const ADMIN_EMAIL = "lczdyx2026@163.com";
export const ADMIN_PASSWORD_HASH = "h" + hash("abg13579");
export const GUEST_EMAIL = "123@123";
export const GUEST_PASSWORD_HASH = "h" + hash("123456");

function hash(pw: string): number {
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = (h << 5) - h + pw.charCodeAt(i);
    h |= 0;
  }
  return h;
}

interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  preferredLangs: string[];
  goal: string;
  createdAt: number;
  isAdmin?: boolean;
  banned?: boolean;
}

interface Progress {
  userId: string;
  completedLessons: string[];
  xp: number;
  streak: number;
  lastStudyDate: string | null;
  daysActive: string[];
  wordsLearned: number;
  perfectScores: number;
  unlockedAchievements: string[];
  dailyXp: Record<string, number>;
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

function ensureBuiltins(users: User[]): { users: User[]; added: boolean } {
  let added = false;
  const adminIdx = users.findIndex((u) => u.email === ADMIN_EMAIL);
  if (adminIdx === -1) {
    users.unshift({
      id: "admin",
      name: "管理员",
      email: ADMIN_EMAIL,
      passwordHash: ADMIN_PASSWORD_HASH,
      avatar: "👑",
      preferredLangs: ["en", "ja", "ko"],
      goal: "平台管理",
      createdAt: Date.now(),
      isAdmin: true,
    });
    added = true;
  } else {
    users[adminIdx] = { ...users[adminIdx], passwordHash: ADMIN_PASSWORD_HASH, isAdmin: true };
    if (!users[adminIdx].preferredLangs?.length) users[adminIdx].preferredLangs = ["en", "ja", "ko"];
  }

  const guestIdx = users.findIndex((u) => u.email === GUEST_EMAIL);
  if (guestIdx === -1) {
    users.unshift({
      id: "guest",
      name: "游客体验",
      email: GUEST_EMAIL,
      passwordHash: GUEST_PASSWORD_HASH,
      avatar: "🦊",
      preferredLangs: ["en", "ja", "ko"],
      goal: "体验探索",
      createdAt: Date.now(),
    });
    added = true;
  } else {
    users[guestIdx] = { ...users[guestIdx], passwordHash: GUEST_PASSWORD_HASH };
    if (!users[guestIdx].preferredLangs?.length) users[guestIdx].preferredLangs = ["en", "ja", "ko"];
  }
  return { users, added };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (handleOptions(req, res)) return;

  // Pull and sanitize in one step
  let users = (await readBucket<User[]>("users", [])) as User[];
  let progress = (await readBucket<Record<string, Progress>>("progress", {})) as Record<string, Progress>;

  const { users: finalUsers, added } = ensureBuiltins(users);
  if (added) {
    // write the newly-seeded admin/guest back so next load finds them
    await writeBucket("users", finalUsers);
  }
  if (!progress["admin"]) progress["admin"] = emptyProgress("admin");
  if (!progress["guest"]) progress["guest"] = emptyProgress("guest");

  return jsonOk(res, {
    users: finalUsers,
    progress,
    builtin: {
      admin: { email: ADMIN_EMAIL, hint: "password set per config" },
      guest: { email: GUEST_EMAIL, hint: "password set per config" },
    },
  });
}
