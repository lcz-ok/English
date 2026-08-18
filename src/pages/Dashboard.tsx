import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { LANGUAGES } from "../data/languages";
import { COURSES } from "../data/courses";
import { getLevelInfo } from "../data/achievements";
import { ProgressRing, StatCard, ProgressBar, EmptyState, Badge } from "../components/ui";

const MODULE_ICONS: Record<string, string> = { vocab: "📖", grammar: "✍️", speaking: "🎙️", listening: "🎧" };

export function Dashboard() {
  const { user, stats, progress, learningPath, unlockedAchievements } = useApp();
  if (!user || !progress) return null;

  const levelInfo = getLevelInfo(stats.totalXp);
  const totalLessons = COURSES.reduce((sum, c) => sum + c.lessons.length, 0);
  const completionPct = totalLessons > 0 ? (stats.lessonsCompleted / totalLessons) * 100 : 0;

  // last 7 days activity
  const days: { label: string; xp: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    days.push({ label: ["日", "一", "二", "三", "四", "五", "六"][d.getDay()], xp: progress.dailyXp[key] ?? 0 });
  }
  const maxDayXp = Math.max(...days.map((d) => d.xp), 50);

  // preferred language courses progress
  const langProgress = user.preferredLangs.map((lang) => {
    const courses = COURSES.filter((c) => c.lang === lang);
    const lessons = courses.flatMap((c) => c.lessons);
    const done = lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
    return { lang, total: lessons.length, done };
  });

  const hour = new Date().getHours();
  const greeting = hour < 6 ? "夜深了" : hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";

  return (
    <div className="space-y-6">
      {/* Greeting hero */}
      <div className="card relative overflow-hidden p-6 sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-brand-500/30 to-accent-500/20 blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-slate-400">{greeting}，{user.name} 👋</div>
            <h1 className="mt-1 text-2xl font-black sm:text-3xl">今天想练习什么语言？</h1>
            <p className="mt-2 max-w-md text-sm text-slate-300">
              {stats.streak > 0 ? `你已连续学习 ${stats.streak} 天，保持势头！` : "开始今天的第一次学习，开启连续打卡吧～"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {learningPath.steps.length > 0 ? (
                <Link to={`/app/lesson/${learningPath.steps[0].lesson.id}`} className="btn-primary">
                  继续「{learningPath.steps[0].lesson.title}」→
                </Link>
              ) : (
                <Link to="/app/courses" className="btn-primary">浏览课程库</Link>
              )}
              <Link to="/app/path" className="btn-ghost">查看学习路径</Link>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <ProgressRing value={levelInfo.progress * 100} size={140}>
              <div className="text-3xl">{levelInfo.current.icon}</div>
              <div className="mt-1 text-xs text-slate-400">{levelInfo.current.name}</div>
            </ProgressRing>
            <div className="mt-2 text-center text-xs text-slate-500">
              {levelInfo.next ? `距 ${levelInfo.next.name} ${levelInfo.next.minXp - stats.totalXp} XP` : "已达最高等级"}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon="🔥" label="连续学习" value={`${stats.streak} 天`} hint="坚持就是胜利" />
        <StatCard icon="✨" label="累计经验" value={stats.totalXp} hint={`等级 ${levelInfo.levelIndex + 1}`} gradient="from-amber-500/20 to-rose-500/20" />
        <StatCard icon="📚" label="已完成课程" value={stats.lessonsCompleted} hint={`${Math.round(completionPct)}% 总进度`} gradient="from-emerald-500/20 to-teal-500/20" />
        <StatCard icon="📖" label="学习单词" value={stats.wordsLearned} hint="词汇积累中" gradient="from-cyan-500/20 to-blue-500/20" />
      </div>

      {/* 7-day activity */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">近 7 天学习活跃度</h2>
          <Badge color="brand">本周 XP {days.reduce((s, d) => s + d.xp, 0)}</Badge>
        </div>
        <div className="flex h-40 items-end justify-between gap-2">
          {days.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-accent-400 transition-all hover:opacity-80"
                  style={{ height: `${Math.max((d.xp / maxDayXp) * 100, 4)}%`, minHeight: 4 }}
                  title={`${d.xp} XP`}
                />
              </div>
              <div className="text-xs text-slate-400">{d.label}</div>
              <div className="text-xs font-semibold">{d.xp}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended path preview */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold">为你推荐</h2>
            <p className="text-sm text-slate-400">{learningPath.description}</p>
          </div>
          <Link to="/app/path" className="text-sm font-semibold text-brand-300 hover:underline">全部 →</Link>
        </div>
        {learningPath.steps.length === 0 ? (
          <EmptyState icon="🎓" title="暂无推荐" description="完成一些课程后将获得个性化推荐" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {learningPath.steps.slice(0, 4).map(({ course, lesson, reason }) => {
              const lang = LANGUAGES[course.lang];
              return (
                <Link
                  key={lesson.id}
                  to={`/app/lesson/${lesson.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-brand-400/30 hover:bg-white/[0.06]"
                >
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${lang.gradient} text-xl`}>
                    {MODULE_ICONS[lesson.moduleType]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>{lang.flag} {lang.name}</span>
                      <span>·</span>
                      <span>{course.level}</span>
                    </div>
                    <div className="truncate font-semibold">{lesson.title}</div>
                    <div className="truncate text-xs text-slate-500">{reason}</div>
                  </div>
                  <span className="text-slate-500 transition group-hover:text-brand-300">→</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Language progress + achievements */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-bold">语言学习进度</h2>
          <div className="space-y-4">
            {langProgress.map(({ lang, total, done }) => {
              const l = LANGUAGES[lang];
              const pct = total > 0 ? (done / total) * 100 : 0;
              return (
                <div key={lang}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-semibold">{l.flag} {l.name}</span>
                    <span className="text-slate-400">{done}/{total} 课</span>
                  </div>
                  <ProgressBar value={pct} gradient={`from-brand-500 to-accent-500`} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">最近成就</h2>
            <Link to="/app/achievements" className="text-sm font-semibold text-brand-300 hover:underline">全部 →</Link>
          </div>
          {unlockedAchievements.length === 0 ? (
            <EmptyState icon="🏆" title="还没有成就" description="完成课程来解锁你的第一个成就吧！" />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {unlockedAchievements.slice(-6).reverse().map((a) => (
                <div key={a.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                  <div className="text-2xl">{a.icon}</div>
                  <div className="mt-1 text-xs font-semibold">{a.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
