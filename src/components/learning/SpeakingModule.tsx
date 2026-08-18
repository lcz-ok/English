import { useRef, useState } from "react";
import type { SpeakingItem, LangCode } from "../../data/types";
import { LANGUAGES } from "../../data/languages";
import { speak, createRecognizer, recognitionAvailable, similarity } from "../../lib/speech";

type Status = "idle" | "listening" | "done";

export function SpeakingModule({ items, lang, onComplete }: { items: SpeakingItem[]; lang: LangCode; onComplete: (correct: number, total: number) => void }) {
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [passedCount, setPassedCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const recognizerRef = useRef<any>(null);
  const supported = recognitionAvailable();

  const current = items[index];
  const langInfo = LANGUAGES[lang];

  const handleStart = () => {
    if (!supported) return;
    setStatus("listening");
    setTranscript("");
    setScore(null);
    const rec = createRecognizer(
      lang,
      (result) => {
        setTranscript(result.transcript);
        const sim = similarity(result.transcript, current.text);
        const s = Math.round(sim * 100);
        setScore(s);
        setStatus("done");
        if (s >= 70) setPassedCount((c) => c + 1);
      },
      () => {
        setStatus((st) => (st === "listening" ? "idle" : st));
      }
    );
    if (rec) {
      recognizerRef.current = rec;
      rec.start();
    }
  };

  const stop = () => {
    try {
      recognizerRef.current?.stop();
    } catch {
      // ignore
    }
  };

  const handleNext = () => {
    if (index + 1 >= items.length) {
      setFinished(true);
      onComplete(passedCount + (score !== null && score >= 70 && status === "done" ? 0 : 0), items.length);
    } else {
      setIndex((i) => i + 1);
      setStatus("idle");
      setTranscript("");
      setScore(null);
    }
  };

  if (finished) {
    return (
      <div className="text-center">
        <div className="mb-4 text-6xl animate-pop">🎙️</div>
        <h3 className="text-2xl font-extrabold">口语练习完成！</h3>
        <p className="mt-2 text-slate-400">
          你成功跟读了 <span className="font-bold text-brand-300">{passedCount}</span> / {items.length} 句
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
        <span>句子 {index + 1} / {items.length}</span>
        <span className="chip bg-white/5 text-slate-300">{langInfo.flag} {langInfo.name}</span>
      </div>
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all" style={{ width: `${((index + 1) / items.length) * 100}%` }} />
      </div>

      <div className="card mb-6 p-6 text-center">
        <div className="mb-2 text-3xl font-black" style={{ fontFamily: lang === "ja" ? "'Noto Sans JP'" : lang === "ko" ? "'Noto Sans KR'" : undefined }}>
          {current.text}
        </div>
        <div className="text-slate-300">{current.translation}</div>
        <div className="mt-3 text-sm text-slate-400">{current.pronunciation}</div>
        <div className="mt-4 inline-block rounded-xl bg-brand-500/10 px-4 py-2 text-sm text-brand-200">💡 {current.tips}</div>
      </div>

      <div className="mb-4 flex justify-center gap-3">
        <button onClick={() => speak(current.text, lang)} className="btn-soft">
          🔊 听范例
        </button>
        {supported ? (
          status === "listening" ? (
            <button onClick={stop} className="btn-ghost border-rose-400/30 text-rose-200">
              ⏹ 停止录音
            </button>
          ) : (
            <button onClick={handleStart} disabled={status === "done"} className="btn-primary">
              🎤 开始跟读
            </button>
          )
        ) : (
          <span className="chip bg-amber-500/15 text-amber-200">当前浏览器不支持语音识别</span>
        )}
      </div>

      {status === "listening" && (
        <div className="mb-4 flex items-center justify-center gap-2 text-sm text-rose-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" /> 正在聆听…请大声朗读
        </div>
      )}

      {score !== null && (
        <div className="mb-4 animate-slide-up rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <div className="text-xs uppercase tracking-wide text-slate-400">识别结果</div>
          <div className="mt-1 font-semibold">"{transcript}"</div>
          <div className="mt-3 text-4xl font-black" style={{ color: score >= 70 ? "#34d399" : "#fbbf24" }}>
            {score}
            <span className="text-base font-bold">分</span>
          </div>
          <div className={`mt-1 text-sm font-semibold ${score >= 70 ? "text-emerald-300" : "text-amber-300"}`}>
            {score >= 90 ? "发音完美！" : score >= 70 ? "不错，继续加油！" : "再多练习几次～"}
          </div>
        </div>
      )}

      <button onClick={handleNext} className="btn-primary mt-2 w-full">
        {index + 1 >= items.length ? "完成" : "下一句 →"}
      </button>
    </div>
  );
}
