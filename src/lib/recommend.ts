import type { Course, Lesson, LangCode, UserStats } from "../data/types";
import { COURSES, getCoursesByLang } from "../data/courses";

export interface RecommendedLesson {
  course: Course;
  lesson: Lesson;
  reason: string;
  priority: number;
}

export interface LearningPath {
  title: string;
  description: string;
  steps: RecommendedLesson[];
}

// Determine the user's weakest module type based on completion ratios
function weakestModule(
  completedLessonIds: string[],
  allLessons: { course: Course; lesson: Lesson }[]
): Lesson["moduleType"] | null {
  const byType: Record<string, { total: number; done: number }> = {
    vocab: { total: 0, done: 0 },
    grammar: { total: 0, done: 0 },
    speaking: { total: 0, done: 0 },
    listening: { total: 0, done: 0 },
  };
  for (const { lesson } of allLessons) {
    byType[lesson.moduleType].total++;
    if (completedLessonIds.includes(lesson.id)) byType[lesson.moduleType].done++;
  }
  let weakest: string | null = null;
  let lowestRatio = 2;
  for (const [type, { total, done }] of Object.entries(byType)) {
    if (total === 0) continue;
    const ratio = done / total;
    if (ratio < lowestRatio) {
      lowestRatio = ratio;
      weakest = type;
    }
  }
  return weakest as Lesson["moduleType"] | null;
}

const MODULE_LABELS: Record<Lesson["moduleType"], string> = {
  vocab: "单词记忆",
  grammar: "语法练习",
  speaking: "口语跟读",
  listening: "听力训练",
};

const MODULE_REASONS: Record<Lesson["moduleType"], string> = {
  vocab: "巩固词汇是构建语言能力的基石",
  grammar: "语法训练能让你表达更准确",
  speaking: "开口练习让发音更地道自然",
  listening: "磨耳朵提升语感与反应速度",
};

export function buildPersonalizedPath(
  preferredLangs: LangCode[],
  completedLessonIds: string[],
  stats: UserStats
): LearningPath {
  const allLessons = COURSES.flatMap((c) => c.lessons.map((l) => ({ course: c, lesson: l })));

  // Pick target language: first preferred lang with remaining lessons, else any
  let targetLangs = preferredLangs.length ? preferredLangs : (["en"] as LangCode[]);
  let pool = targetLangs.flatMap((l) => getCoursesByLang(l)).flatMap((c) =>
    c.lessons.map((l) => ({ course: c, lesson: l }))
  );
  let remaining = pool.filter(({ lesson }) => !completedLessonIds.includes(lesson.id));
  if (remaining.length === 0) {
    // preferred language done -> open up to all languages
    targetLangs = ["en", "ja", "ko"];
    pool = targetLangs.flatMap((l) => getCoursesByLang(l)).flatMap((c) =>
      c.lessons.map((l) => ({ course: c, lesson: l }))
    );
    remaining = pool.filter(({ lesson }) => !completedLessonIds.includes(lesson.id));
  }
  if (remaining.length === 0) {
    return {
      title: "你已完成全部课程",
      description: "太棒了！可以复习已学内容或探索新语言。",
      steps: [],
    };
  }

  const weak = weakestModule(completedLessonIds, allLessons);

  // Score lessons: prioritize weakest module + earlier courses/lessons
  const scored: RecommendedLesson[] = remaining.map(({ course, lesson }) => {
    let priority = 100;
    if (weak && lesson.moduleType === weak) priority += 50;
    // earlier lessons within a course get higher priority
    const lessonIndex = course.lessons.findIndex((l) => l.id === lesson.id);
    priority -= lessonIndex * 2;
    // lower level courses first
    const levelOrder = ["A1", "A2", "B1", "B2", "C1"];
    priority -= levelOrder.indexOf(course.level) * 3;
    priority -= lesson.duration * 0.1;
    return {
      course,
      lesson,
      reason: MODULE_REASONS[lesson.moduleType],
      priority,
    };
  });

  scored.sort((a, b) => b.priority - a.priority);
  const steps = scored.slice(0, 5);

  let title = "为你定制的专属学习路径";
  let description = "基于你的学习偏好与进度，我们为你精选了接下来最适合的课程。";
  if (weak) {
    description = `检测到你在「${MODULE_LABELS[weak]}」模块练习较少，已优先为你安排相关训练。`;
  }
  if (stats.languagesStudied <= 1 && steps.length > 0) {
    description += " 持续完成可解锁更多成就！";
  }

  return { title, description, steps };
}

export function moduleLabel(t: Lesson["moduleType"]): string {
  return MODULE_LABELS[t];
}
