import { useState } from "react";
import type { ListeningItem, LangCode } from "../../data/types";
import { LANGUAGES } from "../../data/languages";
import { speak } from "../../lib/speech";

export function ListeningModule({ items, lang, onComplete }: { items: ListeningItem[]; lang: LangCode; onComplete: (correct: number, total: number) => void }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const current = items[index];
  const langInfo = LANGUAGES[lang];

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === current.answer) setCorrectCount((c) => c + 1);
  };

  const handleNext = () => {
    if (index + 1 >= items.length) {
      setFinished(true);
      onComplete(correctCount, items.length);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
      setRevealed(false);
    }
  };

  if (finished) {
    return (
      <div className="text-center">
        <div className="mb-4 text-6xl animate-pop">🎧</div>
        <h3 className="text-2xl font-extrabold">听力训练完成！</h3>
        <p className="mt-2 text-slate-400">
          正确 <span className="font-bold text-emerald-300">{correctCount}</span> / {items.length} 题
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
        <span>第 {index + 1} / {items.length} 段</span>
        <span className="chip bg-white/5 text-slate-300">{langInfo.flag} {langInfo.name}</span>
      </div>
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all" style={{ width: `${((index + 1) / items.length) * 100}%` }} />
      </div>

      {/* Audio player */}
      <div className="card mb-6 p-6 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-3xl shadow-glow">
          🎧
        </div>
        <button onClick={() => speak(current.transcript, lang)} className="btn-primary">
          ▶ 播放音频
        </button>
        <p className="mt-3 text-xs text-slate-500">点击播放，可多次重复聆听</p>
      </div>

      {/* Transcript toggle */}
      <div className="mb-4">
        <button onClick={() => setRevealed((r) => !r)} className="text-sm text-brand-300 hover:underline">
          {revealed ? "🙈 隐藏原文" : "👁️ 查看原文"}
        </button>
        {revealed && (
          <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            <p className="font-jp font-medium">{current.transcript}</p>
            <p className="mt-2 text-slate-400">{current.translation}</p>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="card mb-4 p-5">
        <div className="mb-1 text-xs uppercase tracking-wide text-brand-300">问题</div>
        <p className="text-lg font-bold">{current.question}</p>
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
        <button onClick={handleNext} className="btn-primary mt-5 w-full">
          {index + 1 >= items.length ? "完成" : "下一段 →"}
        </button>
      )}
    </div>
  );
}
