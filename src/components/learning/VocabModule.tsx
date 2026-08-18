import { useState } from "react";
import type { VocabItem, LangCode } from "../../data/types";
import { LANGUAGES } from "../../data/languages";
import { speak } from "../../lib/speech";

export function VocabModule({ items, lang, onComplete }: { items: VocabItem[]; lang: LangCode; onComplete: (correct: number, total: number) => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = items[index];
  const langInfo = LANGUAGES[lang];

  const next = (known: boolean) => {
    if (known) setKnownCount((c) => c + 1);
    if (index + 1 >= items.length) {
      setFinished(true);
      onComplete(known ? knownCount + 1 : knownCount, items.length);
    } else {
      setFlipped(false);
      setIndex((i) => i + 1);
    }
  };

  if (finished) {
    return (
      <div className="text-center">
        <div className="mb-4 text-6xl animate-pop">🎉</div>
        <h3 className="text-2xl font-extrabold">单词学习完成！</h3>
        <p className="mt-2 text-slate-400">
          你掌握了 <span className="font-bold text-brand-300">{knownCount}</span> / {items.length} 个单词
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
        <span>单词 {index + 1} / {items.length}</span>
        <span className="chip bg-white/5 text-slate-300">{langInfo.flag} {langInfo.name}</span>
      </div>
      <div className="mb-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all" style={{ width: `${((index + 1) / items.length) * 100}%` }} />
        </div>
      </div>

      <div className="flip-card mx-auto mb-6 h-72 w-full max-w-md cursor-pointer" onClick={() => setFlipped((f) => !f)}>
        <div className={`flip-inner relative h-full w-full ${flipped ? "flipped" : ""}`}>
          <div className="flip-face absolute inset-0 grid place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-brand-600/30 to-accent-500/20 p-6 text-center shadow-card">
            <div>
              <div className="mb-3 text-3xl font-black font-jp" style={{ fontFamily: lang === "ja" ? "'Noto Sans JP'" : lang === "ko" ? "'Noto Sans KR'" : undefined }}>{current.word}</div>
              <div className="text-sm text-slate-300">{current.pronunciation}</div>
              <div className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{current.partOfSpeech}</div>
              <div className="mt-6 text-xs text-slate-400">点击卡片查看释义</div>
            </div>
          </div>
          <div className="flip-face flip-back absolute inset-0 grid place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-accent-500/20 to-brand-600/30 p-6 text-center shadow-card">
            <div>
              <div className="mb-2 text-2xl font-bold">{current.meaning}</div>
              <div className="mt-3 text-sm italic text-slate-200">"{current.example}"</div>
              <div className="mt-1 text-xs text-slate-400">{current.exampleTranslation}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-center">
        <button onClick={() => speak(current.word, lang)} className="btn-soft">
          🔊 听发音
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => next(false)} className="btn-ghost border-rose-400/20 text-rose-200 hover:bg-rose-500/10">
          😅 还要再记
        </button>
        <button onClick={() => next(true)} className="btn-primary">
          ✅ 已掌握
        </button>
      </div>
    </div>
  );
}
