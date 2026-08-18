import { useState } from "react";
import type { GrammarQuestion, LangCode } from "../../data/types";

export function GrammarModule({ questions, onComplete }: { questions: GrammarQuestion[]; lang: LangCode; onComplete: (correct: number, total: number) => void }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[index];

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === current.answer) setCorrectCount((c) => c + 1);
  };

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      setFinished(true);
      onComplete(correctCount, questions.length);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (finished) {
    const correct = correctCount;
    const total = questions.length;
    const perfect = correct === total;
    return (
      <div className="text-center">
        <div className="mb-4 text-6xl animate-pop">{perfect ? "🎯" : "📊"}</div>
        <h3 className="text-2xl font-extrabold">{perfect ? "满分通过！" : "练习完成"}</h3>
        <p className="mt-2 text-slate-400">
          正确 <span className="font-bold text-emerald-300">{correct}</span> / {total} 题
        </p>
        {perfect && <p className="mt-2 text-sm text-brand-300">恭喜获得满分成绩！</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
        <span>第 {index + 1} / {questions.length} 题</span>
        <span className="chip bg-white/5 text-slate-300">正确 {correctCount}</span>
      </div>
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="card mb-6 p-6">
        <div className="mb-1 text-xs uppercase tracking-wide text-brand-300">语法练习</div>
        <p className="text-xl font-bold leading-relaxed">{current.prompt}</p>
      </div>

      <div className="grid gap-3">
        {current.options.map((opt, i) => {
          const isCorrect = i === current.answer;
          const isSelected = i === selected;
          let cls = "border-white/10 bg-white/5 hover:bg-white/10";
          if (answered) {
            if (isCorrect) cls = "border-emerald-400/40 bg-emerald-500/15 text-emerald-100";
            else if (isSelected) cls = "border-rose-400/40 bg-rose-500/15 text-rose-100";
            else cls = "border-white/10 bg-white/5 opacity-60";
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left font-semibold transition ${cls}`}
            >
              <span>{opt}</span>
              {answered && isCorrect && <span>✓</span>}
              {answered && isSelected && !isCorrect && <span>✕</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-5 animate-slide-up rounded-xl border border-brand-400/20 bg-brand-500/10 p-4 text-sm">
          <div className="mb-1 font-bold text-brand-200">解析</div>
          <p className="text-slate-300">{current.explanation}</p>
        </div>
      )}

      {answered && (
        <button onClick={handleNext} className="btn-primary mt-5 w-full">
          {index + 1 >= questions.length ? "完成练习" : "下一题 →"}
        </button>
      )}
    </div>
  );
}
