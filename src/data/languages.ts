import type { LanguageInfo, LangCode } from "./types";

export const LANGUAGES: Record<LangCode, LanguageInfo> = {
  en: {
    code: "en",
    name: "英语",
    nativeName: "English",
    flag: "🇺🇸",
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    tagline: "全球通用语言，连接世界",
  },
  ja: {
    code: "ja",
    name: "日语",
    nativeName: "日本語",
    flag: "🇯🇵",
    gradient: "from-rose-500 via-pink-500 to-red-500",
    tagline: "樱花之国的精致表达",
  },
  ko: {
    code: "ko",
    name: "韩语",
    nativeName: "한국어",
    flag: "🇰🇷",
    gradient: "from-sky-500 via-cyan-500 to-teal-500",
    tagline: "韩流文化的声音",
  },
};

export const LANGUAGE_LIST = Object.values(LANGUAGES);
