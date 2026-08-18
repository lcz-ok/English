// Core domain types for the LinguaVerse learning platform

export type LangCode = "en" | "ja" | "ko";

export type ModuleType = "vocab" | "grammar" | "speaking" | "listening";

export interface LanguageInfo {
  code: LangCode;
  name: string;
  nativeName: string;
  flag: string;
  gradient: string;
  tagline: string;
}

export interface VocabItem {
  id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  partOfSpeech: string;
}

export interface GrammarQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number; // index
  explanation: string;
}

export interface SpeakingItem {
  id: string;
  text: string;
  translation: string;
  pronunciation: string;
  tips: string;
}

export interface ListeningItem {
  id: string;
  transcript: string;
  translation: string;
  question: string;
  options: string[];
  answer: number;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: number; // minutes
  xp: number;
  moduleType: ModuleType;
  vocab?: VocabItem[];
  grammar?: GrammarQuestion[];
  speaking?: SpeakingItem[];
  listening?: ListeningItem[];
}

export interface Course {
  id: string;
  lang: LangCode;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  levelName: string;
  title: string;
  description: string;
  hours: number;
  lessons: Lesson[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  // condition evaluated against stats
  check: (stats: UserStats) => boolean;
}

export interface UserStats {
  totalXp: number;
  streak: number;
  lessonsCompleted: number;
  wordsLearned: number;
  perfectScores: number;
  daysActive: number;
  languagesStudied: number;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  lang: LangCode | "all";
  title: string;
  body: string;
  createdAt: number;
  likes: number;
  likedBy: string[];
  tags: string[];
}
