import type { LangCode } from "../data/types";

// Web Speech API helpers for speaking practice & listening.
// Browsers without support degrade gracefully.

const BCP47: Record<LangCode, string> = {
  en: "en-US",
  ja: "ja-JP",
  ko: "ko-KR",
};

export function speechSynthesisAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, lang: LangCode): void {
  if (!speechSynthesisAvailable()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = BCP47[lang];
  u.rate = 0.9;
  const voices = synth.getVoices();
  const match = voices.find((v) => v.lang.startsWith(lang));
  if (match) u.voice = match;
  synth.speak(u);
}

// Speech recognition for pronunciation practice
export interface RecognitionResult {
  transcript: string;
  confidence: number;
}

export function recognitionAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    (("SpeechRecognition" in window) || ("webkitSpeechRecognition" in window))
  );
}

export function createRecognizer(lang: LangCode, onResult: (r: RecognitionResult) => void, onEnd: () => void) {
  const Ctor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = BCP47[lang];
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.onresult = (e: any) => {
    const res = e.results[0][0];
    onResult({ transcript: res.transcript, confidence: res.confidence ?? 0 });
  };
  rec.onerror = () => onEnd();
  rec.onend = () => onEnd();
  return rec;
}

// Normalize text for similarity comparison (strip punctuation, lowercase)
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?。、！？'"""']/g, "")
    .trim();
}

export function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (!na || !nb) return 0;
  // Levenshtein-based similarity ratio
  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return 1 - dist / maxLen;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}
