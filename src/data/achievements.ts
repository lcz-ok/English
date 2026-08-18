import type { Achievement } from "./types";

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-step", name: "初出茅庐", description: "完成你的第一节课", icon: "🌱", check: (s) => s.lessonsCompleted >= 1 },
  { id: "streak-3", name: "三日不辍", description: "连续学习 3 天", icon: "🔥", check: (s) => s.streak >= 3 },
  { id: "streak-7", name: "一周坚持", description: "连续学习 7 天", icon: "⚡", check: (s) => s.streak >= 7 },
  { id: "words-50", name: "词汇收藏家", description: "学习 50 个单词", icon: "📚", check: (s) => s.wordsLearned >= 50 },
  { id: "xp-500", name: "经验积累", description: "累计获得 500 XP", icon: "✨", check: (s) => s.totalXp >= 500 },
  { id: "xp-2000", name: "学霸达人", description: "累计获得 2000 XP", icon: "🎓", check: (s) => s.totalXp >= 2000 },
  { id: "perfect-5", name: "满分达人", description: "获得 5 次满分", icon: "🎯", check: (s) => s.perfectScores >= 5 },
  { id: "lessons-10", name: "勤奋学员", description: "完成 10 节课", icon: "🏆", check: (s) => s.lessonsCompleted >= 10 },
  { id: "multi-lang", name: "语言通才", description: "学习 2 种以上语言", icon: "🌍", check: (s) => s.languagesStudied >= 2 },
  { id: "all-lang", name: "三语大师", description: "学习全部 3 种语言", icon: "🌐", check: (s) => s.languagesStudied >= 3 },
];

export const LEVELS = [
  { name: "青铜学员", minXp: 0, icon: "🥉" },
  { name: "白银学员", minXp: 300, icon: "🥈" },
  { name: "黄金学员", minXp: 800, icon: "🥇" },
  { name: "铂金学员", minXp: 1500, icon: "💎" },
  { name: "钻石学员", minXp: 3000, icon: "💠" },
  { name: "王者语者", minXp: 5000, icon: "👑" },
];

export function getLevelInfo(xp: number) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXp) current = lvl;
  }
  const idx = LEVELS.indexOf(current);
  const next = LEVELS[idx + 1];
  const progress = next ? (xp - current.minXp) / (next.minXp - current.minXp) : 1;
  return { current, next, progress: Math.min(progress, 1), levelIndex: idx };
}
