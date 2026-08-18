import { useState } from "react";
import { Link } from "react-router-dom";
import { COURSES } from "../data/courses";
import { LANGUAGE_LIST } from "../data/languages";
import type { LangCode } from "../data/types";
import { useApp } from "../context/AppContext";
import { capsFor, getRole } from "../lib/permissions";
import { ProgressBar, Badge } from "../components/ui";

const LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;
const MODULE_ICONS: Record<string, string> = { vocab: "📖", grammar: "✍️", speaking: "🎙️", listening: "🎧" };

export function Courses() {
  const { user, progress } = useApp();
  const caps = capsFor(user);
  const role = getRole(user);
  const [activeLang, setActiveLang] = useState<LangCode | "all">("all");

  const courses = activeLang === "all" ? COURSES : COURSES.filter((c) => c.lang === activeLang);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">课程库</h1>
        <p className="mt-1 text-slate-400">分级课程体系，从入门到精通，循序渐进</p>
      </div>

      {/* Guest banner */}
      {role === "guest" && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          🦊 游客模式：仅 A1 入门课程可学习，A2 及以上需<Link to="/register" className="font-bold underline">注册账号</Link>解锁。
        </div>
      )}

      {/* Language filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveLang("all")}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${activeLang === "all" ? "border-brand-400 bg-brand-500/20 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}
        >
          全部语言
        </button>
        {LANGUAGE_LIST.map((l) => (
          <button
            key={l.code}
            onClick={() => setActiveLang(l.code)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${activeLang === l.code ? "border-brand-400 bg-brand-500/20 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}
          >
            {l.flag} {l.name}
          </button>
        ))}
      </div>

      {/* Course cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const lang = LANGUAGE_LIST.find((l) => l.code === course.lang)!;
          const done = course.lessons.filter((l) => progress?.completedLessons.includes(l.id)).length;
          const pct = (done / course.lessons.length) * 100;
          const completed = done === course.lessons.length;
          const locked = !caps.canAccessCourseLevel(course.level);
          const cardCls = "card group relative overflow-hidden p-6 transition hover:-translate-y-1 hover:border-brand-400/30";
          const inner = (
            <div className="relative">
              <div className="mb-3 flex items-start justify-between">
                <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${lang.gradient} text-2xl`}>
                  {lang.flag}
                </div>
                <Badge color={locked ? "slate" : completed ? "green" : "brand"}>
                  {locked ? "🔒 " : ""}{course.level} · {course.levelName}
                </Badge>
              </div>
              <h3 className="text-lg font-extrabold">{course.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-400">{course.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>📚 {course.lessons.length} 节课</span>
                <span>⏱ {course.hours} 小时</span>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-400">进度</span>
                  <span className={completed ? "font-semibold text-emerald-300" : "font-semibold"}>{completed ? "已完成" : `${done}/${course.lessons.length}`}</span>
                </div>
                <ProgressBar value={pct} />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {Array.from(new Set(course.lessons.map((l) => l.moduleType))).map((m) => (
                  <span key={m} className="chip bg-white/5 text-slate-300">{MODULE_ICONS[m]}</span>
                ))}
              </div>
              {locked && (
                <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-center text-xs font-semibold text-amber-200">
                  🔒 游客不可访问 · 注册解锁
                </div>
              )}
            </div>
          );
          return locked ? (
            <Link key={course.id} to="/register" className={cardCls} title="注册后解锁">
              {inner}
            </Link>
          ) : (
            <Link key={course.id} to={`/app/courses/${course.id}`} className={cardCls}>
              {inner}
            </Link>
          );
        })}
      </div>

      {/* Levels legend */}
      <div className="card p-5">
        <div className="mb-3 text-sm font-bold">CEFR 分级体系说明</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {LEVELS.map((lv, i) => (
            <div key={lv} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
              <div className="text-lg font-black text-brand-300">{lv}</div>
              <div className="text-xs text-slate-400">{["入门", "初级", "中级", "中高级", "高级"][i]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
