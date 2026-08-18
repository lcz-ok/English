import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { COURSES } from "../data/courses";
import { moduleLabel } from "../lib/recommend";
import { LANGUAGES } from "../data/languages";
import { ProgressBar, StatCard, EmptyState, Badge } from "../components/ui";
import { capsFor } from "../lib/permissions";

const MODULE_ICONS: Record<string, string> = { vocab: "📖", grammar: "✍️", speaking: "🎙️", listening: "🎧" };

export function LearningPathPage() {
  const { user, progress, learningPath, stats } = useApp();
  if (!user || !progress) return null;

  const caps = capsFor(user);

  // Guest gate: personalized path requires a registered account
  if (!caps.canAccessLearningPath) {
    return (
      <div className="mx-auto max-w-md py-10">
        <div className="card relative overflow-hidden p-8 text-center">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/30 to-rose-500/20 blur-2xl" />
          <div className="relative">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-500/30 to-rose-500/20 text-3xl">🔒</div>
            <h1 className="mt-4 text-2xl font-black">个性化路径已锁定</h1>
            <p className="mt-2 text-sm text-slate-400">游客账号仅可浏览 A1 入门课程。注册一个免费账号，即可解锁智能推荐学习计划、社区发帖、完整课程体系等全部能力。</p>
            <div className="mt-6 flex flex-col gap-2">
              <Link to="/register" className="btn-primary w-full py-3">免费注册解锁</Link>
              <Link to="/app/courses" className="btn-ghost w-full py-3">先去看看 A1 课程</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // module completion analysis
  const moduleStats = { vocab: { done: 0, total: 0 }, grammar: { done: 0, total: 0 }, speaking: { done: 0, total: 0 }, listening: { done: 0, total: 0 } };
  for (const course of COURSES) {
    for (const lesson of course.lessons) {
      moduleStats[lesson.moduleType].total++;
      if (progress.completedLessons.includes(lesson.id)) moduleStats[lesson.moduleType].done++;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">个性化学习路径</h1>
        <p className="mt-1 text-slate-400">基于你的偏好与进度，智能推荐最适合的下一步</p>
      </div>

      {/* AI recommendation banner */}
      <div className="card relative overflow-hidden p-6 sm:p-8">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-brand-500/30 to-accent-500/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧭</span>
            <Badge color="brand">智能推荐</Badge>
          </div>
          <h2 className="mt-3 text-xl font-bold">{learningPath.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">{learningPath.description}</p>
        </div>
      </div>

      {/* Module balance */}
      <div className="card p-6">
        <h2 className="mb-4 font-bold">四项能力均衡分析</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(moduleStats) as Array<keyof typeof moduleStats>).map((m) => {
            const { done, total } = moduleStats[m];
            const pct = total > 0 ? (done / total) * 100 : 0;
            return (
              <div key={m} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="text-xl">{MODULE_ICONS[m]}</span>
                    {moduleLabel(m as any)}
                  </span>
                  <span className="text-sm text-slate-400">{done}/{total}</span>
                </div>
                <ProgressBar value={pct} gradient={pct >= 50 ? "from-emerald-500 to-teal-400" : "from-amber-500 to-rose-400"} />
                <div className="mt-1.5 text-xs text-slate-500">
                  {pct === 0 ? "尚未开始" : pct < 30 ? "起步阶段" : pct < 60 ? "稳步前进" : "掌握良好"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended path steps */}
      <div>
        <h2 className="mb-4 text-lg font-bold">推荐学习计划</h2>
        {learningPath.steps.length === 0 ? (
          <EmptyState icon="🎓" title="你已完成全部课程" description="太棒了！可以复习已学内容或探索新语言。" />
        ) : (
          <div className="relative">
            {/* timeline line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-brand-400/50 via-accent-400/30 to-transparent" />
            <div className="space-y-3">
              {learningPath.steps.map(({ course, lesson, reason }, i) => {
                const lang = LANGUAGES[course.lang];
                const completed = progress.completedLessons.includes(lesson.id);
                return (
                  <div key={lesson.id} className="relative flex gap-4">
                    <div className={`relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br ${lang.gradient} text-xl shadow-glow`}>
                      {MODULE_ICONS[lesson.moduleType]}
                    </div>
                    <div className="card flex-1 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>第 {i + 1} 步</span>
                            <span>·</span>
                            <span>{lang.flag} {lang.name} · {course.level}</span>
                            {completed && <Badge color="green">已完成</Badge>}
                          </div>
                          <h3 className="mt-1 font-bold">{lesson.title}</h3>
                          <p className="mt-0.5 text-sm text-slate-400">{lesson.description}</p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-brand-300">💡 {reason}</div>
                        </div>
                        <a href={`/app/lesson/${lesson.id}`} className="btn-soft shrink-0">
                          {completed ? "复习" : "学习"}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon="📊" label="总完成率" value={`${Math.round((stats.lessonsCompleted / COURSES.flatMap((c) => c.lessons).length) * 100)}%`} />
        <StatCard icon="✨" label="累计 XP" value={stats.totalXp} gradient="from-amber-500/20 to-rose-500/20" />
        <StatCard icon="📖" label="学习单词" value={stats.wordsLearned} gradient="from-cyan-500/20 to-blue-500/20" />
        <StatCard icon="🎯" label="满分次数" value={stats.perfectScores} gradient="from-emerald-500/20 to-teal-500/20" />
      </div>
    </div>
  );
}
