import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getLesson } from "../data/courses";
import { LANGUAGES } from "../data/languages";
import { moduleLabel } from "../lib/recommend";
import { useApp } from "../context/AppContext";
import { ACHIEVEMENTS } from "../data/achievements";
import { VocabModule } from "../components/learning/VocabModule";
import { GrammarModule } from "../components/learning/GrammarModule";
import { SpeakingModule } from "../components/learning/SpeakingModule";
import { ListeningModule } from "../components/learning/ListeningModule";
import { useAchievementToast } from "../components/ui";

const MODULE_ICONS: Record<string, string> = { vocab: "📖", grammar: "✍️", speaking: "🎙️", listening: "🎧" };

export function LessonPage() {
  const { lessonId = "" } = useParams();
  const navigate = useNavigate();
  const { completeLesson, progress } = useApp();
  const toast = useAchievementToast();

  const found = useMemo(() => getLesson(lessonId), [lessonId]);
  const [done, setDone] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [result, setResult] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const alreadyCompleted = progress?.completedLessons.includes(lessonId) ?? false;

  if (!found) {
    return (
      <div className="py-20 text-center">
        <div className="mb-3 text-5xl">🤔</div>
        <p className="text-slate-400">找不到这节课</p>
        <Link to="/app/courses" className="btn-soft mt-4">返回课程库</Link>
      </div>
    );
  }

  const { course, lesson } = found;
  const langInfo = LANGUAGES[course.lang];

  const finish = (correct: number, total: number) => {
    const ratio = total > 0 ? correct / total : 0.8;
    const perfect = ratio >= 1;
    // XP scaling: full xp for full marks, scaled otherwise but at least 60%
    const xp = alreadyCompleted ? Math.round(lesson.xp * 0.3) : Math.round(lesson.xp * (0.6 + ratio * 0.4));
    const words = lesson.moduleType === "vocab" ? correct : 0;
    const newAchievements = completeLesson(lesson.id, xp, perfect, words);
    setEarnedXp(xp);
    setResult({ correct, total });
    setDone(true);
    if (newAchievements.length) {
      const items = ACHIEVEMENTS.filter((a) => newAchievements.includes(a.id)).map((a) => ({ name: a.name, icon: a.icon }));
      toast.push(items);
    }
  };

  if (done) {
    const ratio = result.total > 0 ? result.correct / result.total : 1;
    return (
      <>
        <div className="mx-auto max-w-lg py-8 text-center animate-fade-in">
          <div className="mb-4 text-7xl animate-pop">{ratio >= 1 ? "🏆" : ratio >= 0.6 ? "🎉" : "💪"}</div>
          <h1 className="text-3xl font-black">{ratio >= 1 ? "完美通关！" : "课程完成！"}</h1>
          <p className="mt-2 text-slate-400">{lesson.title} · {langInfo.name}</p>

          <div className="my-8 grid grid-cols-3 gap-3">
            <div className="card p-4">
              <div className="text-3xl font-black text-brand-300">+{earnedXp}</div>
              <div className="text-xs text-slate-400">获得 XP</div>
            </div>
            <div className="card p-4">
              <div className="text-3xl font-black text-emerald-300">{result.correct}/{result.total}</div>
              <div className="text-xs text-slate-400">正确率</div>
            </div>
            <div className="card p-4">
              <div className="text-3xl font-black text-amber-300">{Math.round(ratio * 100)}%</div>
              <div className="text-xs text-slate-400">得分</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate(`/app/courses/${course.id}`)} className="btn-ghost flex-1">返回课程</button>
            <button onClick={() => navigate("/app/dashboard")} className="btn-primary flex-1">回到学习中心</button>
          </div>
        </div>
        <div className="h-32" />
        {toast.current && (
          <div className="fixed inset-x-0 top-4 z-[60] mx-auto w-fit max-w-[92%] animate-slide-up">
            <div className="card flex items-center gap-3 border-brand-400/30 bg-ink-800/90 px-5 py-3 shadow-glow">
              <span className="text-2xl animate-pop">{toast.current.icon}</span>
              <div>
                <div className="text-xs uppercase tracking-wide text-brand-300">解锁成就</div>
                <div className="font-bold">{toast.current.name}</div>
              </div>
              <button onClick={toast.dismiss} className="ml-3 text-slate-400 hover:text-white">✕</button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-4">
      <div className="mb-5 flex items-center justify-between">
        <button onClick={() => navigate(`/app/courses/${course.id}`)} className="text-sm text-slate-400 hover:text-white">
          ← 退出
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-lg">{MODULE_ICONS[lesson.moduleType]}</span>
          <span className="font-semibold">{moduleLabel(lesson.moduleType)}</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-xs text-slate-500">{langInfo.flag} {course.level} · {course.levelName}</div>
        <h1 className="text-2xl font-extrabold">{lesson.title}</h1>
        <p className="mt-1 text-sm text-slate-400">{lesson.description}</p>
      </div>

      <div className="card p-6">
        {lesson.moduleType === "vocab" && lesson.vocab && (
          <VocabModule items={lesson.vocab} lang={course.lang} onComplete={finish} />
        )}
        {lesson.moduleType === "grammar" && lesson.grammar && (
          <GrammarModule questions={lesson.grammar} lang={course.lang} onComplete={finish} />
        )}
        {lesson.moduleType === "speaking" && lesson.speaking && (
          <SpeakingModule items={lesson.speaking} lang={course.lang} onComplete={finish} />
        )}
        {lesson.moduleType === "listening" && lesson.listening && (
          <ListeningModule items={lesson.listening} lang={course.lang} onComplete={finish} />
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
        <span>⏱ 约 {lesson.duration} 分钟</span>
        <span>·</span>
        <span>✨ {lesson.xp} XP</span>
      </div>
    </div>
  );
}
