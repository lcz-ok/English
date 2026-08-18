import { Link, useParams } from "react-router-dom";
import { getCourse } from "../data/courses";
import { LANGUAGES } from "../data/languages";
import { useApp } from "../context/AppContext";
import { moduleLabel } from "../lib/recommend";
import { capsFor } from "../lib/permissions";
import { ProgressBar, Badge, EmptyState } from "../components/ui";

const MODULE_ICONS: Record<string, string> = { vocab: "📖", grammar: "✍️", speaking: "🎙️", listening: "🎧" };

export function CourseDetail() {
  const { courseId = "" } = useParams();
  const course = getCourse(courseId);
  const { user, progress } = useApp();

  if (!course) {
    return (
      <div className="py-20 text-center">
        <EmptyState icon="🤔" title="课程不存在" action={<Link to="/app/courses" className="btn-soft">返回课程库</Link>} />
      </div>
    );
  }

  // Guest gate: locked courses (A2+) redirect to upgrade
  if (!capsFor(user).canAccessCourseLevel(course.level)) {
    return (
      <div className="mx-auto max-w-md py-10">
        <div className="card relative overflow-hidden p-8 text-center">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/30 to-rose-500/20 blur-2xl" />
          <div className="relative">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-500/30 to-rose-500/20 text-3xl">🔒</div>
            <h1 className="mt-4 text-2xl font-black">该课程已锁定</h1>
            <p className="mt-2 text-sm text-slate-400">{course.title}（{course.level} 级别）需要注册账号才能学习。游客仅可浏览 A1 入门课程。</p>
            <div className="mt-6 flex flex-col gap-2">
              <Link to="/register" className="btn-primary w-full py-3">免费注册解锁</Link>
              <Link to="/app/courses" className="btn-ghost w-full py-3">返回课程库</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const lang = LANGUAGES[course.lang];
  const done = course.lessons.filter((l) => progress?.completedLessons.includes(l.id)).length;
  const pct = (done / course.lessons.length) * 100;

  // find next lesson to continue
  const nextLesson = course.lessons.find((l) => !progress?.completedLessons.includes(l.id)) ?? course.lessons[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card relative overflow-hidden p-6 sm:p-8">
        <div className={`absolute inset-0 bg-gradient-to-br ${lang.gradient} opacity-10`} />
        <div className="relative">
          <Link to="/app/courses" className="text-sm text-slate-400 hover:text-white">← 返回课程库</Link>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{lang.flag}</span>
                <Badge color="brand">{course.level} · {course.levelName}</Badge>
              </div>
              <h1 className="mt-3 text-2xl font-black sm:text-3xl">{course.title}</h1>
              <p className="mt-2 max-w-xl text-slate-300">{course.description}</p>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="text-slate-400">课程进度</span>
              <span className="font-semibold">{done}/{course.lessons.length} 节 · {Math.round(pct)}%</span>
            </div>
            <ProgressBar value={pct} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to={`/app/lesson/${nextLesson.id}`} className="btn-primary">
              {done > 0 ? "继续学习 →" : "开始学习 →"}
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>📚 {course.lessons.length} 节课</span>
              <span>·</span>
              <span>⏱ {course.hours} 小时</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons list */}
      <div>
        <h2 className="mb-4 text-lg font-bold">课程章节</h2>
        <div className="grid gap-3">
          {course.lessons.map((lesson, i) => {
            const completed = progress?.completedLessons.includes(lesson.id);
            const isNext = !completed && lesson.id === nextLesson.id;
            return (
              <Link
                key={lesson.id}
                to={`/app/lesson/${lesson.id}`}
                className={`card group flex items-center gap-4 p-4 transition hover:border-brand-400/30 ${isNext ? "border-brand-400/40 shadow-glow" : ""}`}
              >
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-xl ${completed ? "bg-emerald-500/20 text-emerald-300" : "bg-brand-500/15 text-brand-200"}`}>
                  {completed ? "✓" : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-bold">{lesson.title}</h3>
                    {completed && <Badge color="green">已完成</Badge>}
                    {isNext && <Badge color="amber">下一个</Badge>}
                  </div>
                  <p className="truncate text-sm text-slate-400">{lesson.description}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
                    <span>{MODULE_ICONS[lesson.moduleType]} {moduleLabel(lesson.moduleType)}</span>
                    <span>⏱ {lesson.duration} 分钟</span>
                    <span>✨ {lesson.xp} XP</span>
                  </div>
                </div>
                <span className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-brand-300">→</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
