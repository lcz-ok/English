import type { Course } from "./types";

// ===== English courses =====
const englishCourses: Course[] = [
  {
    id: "en-a1",
    lang: "en",
    level: "A1",
    levelName: "入门",
    title: "英语零基础入门",
    description: "从字母、发音到日常问候，搭建你的第一块英语基石。",
    hours: 12,
    lessons: [
      {
        id: "en-a1-v1",
        title: "基础问候",
        subtitle: "Greetings",
        description: "学习最常用的问候语，迈出交流第一步。",
        duration: 8,
        xp: 50,
        moduleType: "vocab",
        vocab: [
          { id: "v1", word: "Hello", pronunciation: "/həˈloʊ/", meaning: "你好", example: "Hello, how are you?", exampleTranslation: "你好，你怎么样？", partOfSpeech: "int." },
          { id: "v2", word: "Goodbye", pronunciation: "/ˌɡʊdˈbaɪ/", meaning: "再见", example: "Goodbye, see you tomorrow.", exampleTranslation: "再见，明天见。", partOfSpeech: "int." },
          { id: "v3", word: "Thank you", pronunciation: "/ˈθæŋk juː/", meaning: "谢谢你", example: "Thank you for your help.", exampleTranslation: "谢谢你的帮助。", partOfSpeech: "phrase" },
          { id: "v4", word: "Please", pronunciation: "/pliːz/", meaning: "请", example: "Please sit down.", exampleTranslation: "请坐。", partOfSpeech: "adv." },
          { id: "v5", word: "Sorry", pronunciation: "/ˈsɒri/", meaning: "对不起", example: "Sorry, I'm late.", exampleTranslation: "对不起，我迟到了。", partOfSpeech: "adj." },
          { id: "v6", word: "Name", pronunciation: "/neɪm/", meaning: "名字", example: "What is your name?", exampleTranslation: "你叫什么名字？", partOfSpeech: "n." },
        ],
      },
      {
        id: "en-a1-g1",
        title: "Be 动词",
        subtitle: "The verb 'to be'",
        description: "掌握 am / is / are 的基本用法。",
        duration: 10,
        xp: 60,
        moduleType: "grammar",
        grammar: [
          { id: "g1", prompt: "I ___ a student.", options: ["am", "is", "are", "be"], answer: 0, explanation: "主语为 I 时使用 am。" },
          { id: "g2", prompt: "She ___ my friend.", options: ["am", "is", "are", "am"], answer: 1, explanation: "第三人称单数用 is。" },
          { id: "g3", prompt: "They ___ happy.", options: ["am", "is", "are", "be"], answer: 2, explanation: "复数主语用 are。" },
          { id: "g4", prompt: "We ___ from China.", options: ["is", "am", "are", "be"], answer: 2, explanation: "we 为复数，使用 are。" },
        ],
      },
      {
        id: "en-a1-s1",
        title: "自我介绍",
        subtitle: "Self-introduction",
        description: "练习用英语做简单的自我介绍。",
        duration: 7,
        xp: 55,
        moduleType: "speaking",
        speaking: [
          { id: "s1", text: "Hi, my name is Alex.", translation: "你好，我叫 Alex。", pronunciation: "haɪ maɪ neɪm ɪz ˈælɪks", tips: "注意 name 和 Alex 之间的连读。" },
          { id: "s2", text: "Nice to meet you.", translation: "很高兴认识你。", pronunciation: "naɪs tuː miːt juː", tips: "nice 末尾的 /s/ 与 to 连读。" },
          { id: "s3", text: "I am from China.", translation: "我来自中国。", pronunciation: "aɪ æm frɒm ˈtʃaɪnə", tips: "from 和 China 之间轻微连读。" },
        ],
      },
      {
        id: "en-a1-l1",
        title: "清晨问候",
        subtitle: "Morning greetings",
        description: "听一段早晨的对话并回答问题。",
        duration: 8,
        xp: 60,
        moduleType: "listening",
        listening: [
          {
            id: "l1",
            transcript: "Good morning! How are you today? I'm fine, thank you. And you? I'm great, thanks!",
            translation: "早上好！你今天怎么样？我很好，谢谢。你呢？我很好，谢谢！",
            question: "How does the second person feel?",
            options: ["Fine", "Tired", "Sad", "Angry"],
            answer: 0,
          },
        ],
      },
    ],
  },
  {
    id: "en-a2",
    lang: "en",
    level: "A2",
    levelName: "初级",
    title: "英语日常生活",
    description: "购物、点餐、问路，应对真实生活场景。",
    hours: 15,
    lessons: [
      {
        id: "en-a2-v1",
        title: "饮食词汇",
        subtitle: "Food & Drink",
        description: "掌握餐厅点餐必备词汇。",
        duration: 9,
        xp: 55,
        moduleType: "vocab",
        vocab: [
          { id: "v1", word: "Breakfast", pronunciation: "/ˈbrekfəst/", meaning: "早餐", example: "I have breakfast at seven.", exampleTranslation: "我七点吃早餐。", partOfSpeech: "n." },
          { id: "v2", word: "Menu", pronunciation: "/ˈmenjuː/", meaning: "菜单", example: "Can I see the menu?", exampleTranslation: "我可以看看菜单吗？", partOfSpeech: "n." },
          { id: "v3", word: "Delicious", pronunciation: "/dɪˈlɪʃəs/", meaning: "美味的", example: "This soup is delicious.", exampleTranslation: "这汤很美味。", partOfSpeech: "adj." },
          { id: "v4", word: "Bill", pronunciation: "/bɪl/", meaning: "账单", example: "Could I have the bill?", exampleTranslation: "请给我账单好吗？", partOfSpeech: "n." },
          { id: "v5", word: "Order", pronunciation: "/ˈɔːrdər/", meaning: "点餐", example: "Are you ready to order?", exampleTranslation: "您准备好点餐了吗？", partOfSpeech: "v." },
        ],
      },
      {
        id: "en-a2-g1",
        title: "一般现在时",
        subtitle: "Present Simple",
        description: "描述习惯与日常活动。",
        duration: 11,
        xp: 65,
        moduleType: "grammar",
        grammar: [
          { id: "g1", prompt: "He ___ coffee every morning.", options: ["drink", "drinks", "drinking", "drank"], answer: 1, explanation: "第三人称单数动词加 s。" },
          { id: "g2", prompt: "She ___ not like tea.", options: ["do", "does", "is", "has"], answer: 1, explanation: "第三人称单数否定用 does not。" },
          { id: "g3", prompt: "___ they play football?", options: ["Do", "Does", "Is", "Are"], answer: 0, explanation: "复数主语疑问用 do。" },
        ],
      },
    ],
  },
];

// ===== Japanese courses =====
const japaneseCourses: Course[] = [
  {
    id: "ja-a1",
    lang: "ja",
    level: "A1",
    levelName: "入门",
    title: "日语五十音与基础",
    description: "从五十音图开始，掌握日语发音与基础表达。",
    hours: 14,
    lessons: [
      {
        id: "ja-a1-v1",
        title: "日常问候",
        subtitle: "挨拶（あいさつ）",
        description: "学习日语中最常用的问候表达。",
        duration: 8,
        xp: 50,
        moduleType: "vocab",
        vocab: [
          { id: "v1", word: "こんにちは", pronunciation: "konnichiwa", meaning: "你好（白天）", example: "こんにちは、元気ですか？", exampleTranslation: "你好，你还好吗？", partOfSpeech: "挨拶" },
          { id: "v2", word: "ありがとう", pronunciation: "arigatou", meaning: "谢谢", example: "ありがとう、助かりました。", exampleTranslation: "谢谢，帮了大忙。", partOfSpeech: "挨拶" },
          { id: "v3", word: "さようなら", pronunciation: "sayounara", meaning: "再见", example: "さようなら、また会いましょう。", exampleTranslation: "再见，再会。", partOfSpeech: "挨拶" },
          { id: "v4", word: "すみません", pronunciation: "sumimasen", meaning: "对不起/不好意思", example: "すみません、駅はどこですか？", exampleTranslation: "请问，车站在哪里？", partOfSpeech: "挨拶" },
          { id: "v5", word: "はじめまして", pronunciation: "hajimemashite", meaning: "初次见面", example: "はじめまして、よろしくお願いします。", exampleTranslation: "初次见面，请多关照。", partOfSpeech: "挨拶" },
        ],
      },
      {
        id: "ja-a1-g1",
        title: "です 形",
        subtitle: "「です」文型",
        description: "学习日语最基础的判断句型。",
        duration: 10,
        xp: 60,
        moduleType: "grammar",
        grammar: [
          { id: "g1", prompt: "私は学生___。", options: ["です", "ます", "だ", "の"], answer: 0, explanation: "礼貌体的判断句用「です」结尾。" },
          { id: "g2", prompt: "これは本___か。", options: ["です", "だ", "ます", "の"], answer: 0, explanation: "疑问句仍用「ですか」。" },
          { id: "g3", prompt: "これは本___ありません。", options: ["では", "に", "が", "を"], answer: 0, explanation: "否定形式为「～ではありません」。" },
        ],
      },
      {
        id: "ja-a1-s1",
        title: "自我介绍",
        subtitle: "自己紹介",
        description: "练习用日语做礼貌的自我介绍。",
        duration: 7,
        xp: 55,
        moduleType: "speaking",
        speaking: [
          { id: "s1", text: "はじめまして。", translation: "初次见面。", pronunciation: "hajimemashite", tips: "语调平稳，结尾略降。" },
          { id: "s2", text: "私は田中です。", translation: "我是田中。", pronunciation: "watashi wa tanaka desu", tips: "「は」读作 wa。" },
          { id: "s3", text: "よろしくお願いします。", translation: "请多关照。", pronunciation: "yoroshiku onegaishimasu", tips: "整体语调温和谦逊。" },
        ],
      },
      {
        id: "ja-a1-l1",
        title: "便利店对话",
        subtitle: "コンビニで",
        description: "听一段便利店里的常用对话。",
        duration: 8,
        xp: 60,
        moduleType: "listening",
        listening: [
          {
            id: "l1",
            transcript: "いらっしゃいませ。温めますか？はい、お願いします。袋はいりますか？いいえ、大丈夫です。",
            translation: "欢迎光临。需要加热吗？好的，麻烦了。需要袋子吗？不用了，没关系。",
            question: "客人は袋をどうしましたか？",
            options: ["もらった", "いらなかった", "買った", "忘れた"],
            answer: 1,
          },
        ],
      },
    ],
  },
  {
    id: "ja-a2",
    lang: "ja",
    level: "A2",
    levelName: "初级",
    title: "日语生活场景",
    description: "在餐厅、车站、购物中自如表达。",
    hours: 16,
    lessons: [
      {
        id: "ja-a2-v1",
        title: "餐饮词汇",
        subtitle: "食事の言葉",
        description: "掌握日本餐厅点餐词汇。",
        duration: 9,
        xp: 55,
        moduleType: "vocab",
        vocab: [
          { id: "v1", word: "ご飯", pronunciation: "gohan", meaning: "米饭/饭", example: "ご飯を食べます。", exampleTranslation: "我吃饭。", partOfSpeech: "名詞" },
          { id: "v2", word: "お箸", pronunciation: "ohashi", meaning: "筷子", example: "お箸をください。", exampleTranslation: "请给我筷子。", partOfSpeech: "名詞" },
          { id: "v3", word: "お会計", pronunciation: "okaikei", meaning: "结账", example: "お会計をお願いします。", exampleTranslation: "请结账。", partOfSpeech: "名詞" },
          { id: "v4", word: "美味しい", pronunciation: "oishii", meaning: "好吃的", example: "この寿司は美味しいです。", exampleTranslation: "这寿司很好吃。", partOfSpeech: "形容詞" },
        ],
      },
      {
        id: "ja-a2-g1",
        title: "ます 形",
        subtitle: "「ます」文型",
        description: "学习礼貌体的动词变形。",
        duration: 11,
        xp: 65,
        moduleType: "grammar",
        grammar: [
          { id: "g1", prompt: "毎日日本語を___。", options: ["勉強します", "勉強する", "勉強した", "勉強です"], answer: 0, explanation: "礼貌体现在时用「～ます」。" },
          { id: "g2", prompt: "昨日、映画を___。", options: ["見ます", "見ました", "見る", "見て"], answer: 1, explanation: "过去时用「～ました」。" },
        ],
      },
    ],
  },
];

// ===== Korean courses =====
const koreanCourses: Course[] = [
  {
    id: "ko-a1",
    lang: "ko",
    level: "A1",
    levelName: "入门",
    title: "韩语字母与基础",
    description: "从韩文字母 한글 出发，掌握发音与日常表达。",
    hours: 13,
    lessons: [
      {
        id: "ko-a1-v1",
        title: "日常问候",
        subtitle: "일상 인사",
        description: "学习韩语中最常用的问候语。",
        duration: 8,
        xp: 50,
        moduleType: "vocab",
        vocab: [
          { id: "v1", word: "안녕하세요", pronunciation: "annyeonghaseyo", meaning: "你好", example: "안녕하세요, 만나서 반갑습니다.", exampleTranslation: "你好，很高兴见到你。", partOfSpeech: "인사" },
          { id: "v2", word: "감사합니다", pronunciation: "gamsahamnida", meaning: "谢谢", example: "도와주셔서 감사합니다.", exampleTranslation: "感谢您的帮助。", partOfSpeech: "인사" },
          { id: "v3", word: "죄송합니다", pronunciation: "joesonghamnida", meaning: "对不起", example: "늦어서 죄송합니다.", exampleTranslation: "对不起，我迟到了。", partOfSpeech: "인사" },
          { id: "v4", word: "안녕히 가세요", pronunciation: "annyeonghi gaseyo", meaning: "再见（对离开者）", example: "안녕히 가세요.", exampleTranslation: "再见（请慢走）。", partOfSpeech: "인사" },
          { id: "v5", word: "이름", pronunciation: "ireum", meaning: "名字", example: "이름이 뭐예요?", exampleTranslation: "你叫什么名字？", partOfSpeech: "명사" },
        ],
      },
      {
        id: "ko-a1-g1",
        title: "입니다 句型",
        subtitle: "「입니다」 문형",
        description: "学习韩语最基础的判断句型。",
        duration: 10,
        xp: 60,
        moduleType: "grammar",
        grammar: [
          { id: "g1", prompt: "저는 학생___.", options: ["입니다", "습니다", "해요", "요"], answer: 0, explanation: "正式判断句以「입니다」结尾。" },
          { id: "g2", prompt: "이것은 책___.", options: ["입니다", "습니다", "해요", "이다"], answer: 0, explanation: "名词后接「입니다」表示「是」。" },
          { id: "g3", prompt: "저는 한국 사람___?", options: ["입니다", "입니까", "해요", "요"], answer: 1, explanation: "疑问句用「입니까」。" },
        ],
      },
      {
        id: "ko-a1-s1",
        title: "自我介绍",
        subtitle: "자기소개",
        description: "练习用韩语做礼貌的自我介绍。",
        duration: 7,
        xp: 55,
        moduleType: "speaking",
        speaking: [
          { id: "s1", text: "안녕하세요.", translation: "你好。", pronunciation: "annyeonghaseyo", tips: "语调上扬，礼貌温和。" },
          { id: "s2", text: "저는 김민준이에요.", translation: "我叫金敏俊。", pronunciation: "jeoneun gim minjun-ieyo", tips: "「이에요」接在名字后。" },
          { id: "s3", text: "만나서 반갑습니다.", translation: "很高兴认识你。", pronunciation: "mannaseo bangapseumnida", tips: "正式场合常用表达。" },
        ],
      },
      {
        id: "ko-a1-l1",
        title: "咖啡馆对话",
        subtitle: "카페에서",
        description: "听一段咖啡馆点单对话。",
        duration: 8,
        xp: 60,
        moduleType: "listening",
        listening: [
          {
            id: "l1",
            transcript: "어서 오세요. 뭐 드릴까요? 아메리카노 한 잔 주세요. 따뜻한 걸로 드릴까요? 네, 따뜻한 걸로 주세요.",
            translation: "欢迎光临。需要什么？请给我一杯美式咖啡。要热的吗？好的，要热的。",
            question: "손님은 어떤 커피를 주문했습니까?",
            options: ["따뜻한 아메리카노", "차가운 아메리카노", "라떼", "차"],
            answer: 0,
          },
        ],
      },
    ],
  },
  {
    id: "ko-a2",
    lang: "ko",
    level: "A2",
    levelName: "初级",
    title: "韩语日常生活",
    description: "在购物、出行、社交中流畅沟通。",
    hours: 15,
    lessons: [
      {
        id: "ko-a2-v1",
        title: "饮食词汇",
        subtitle: "음식 단어",
        description: "掌握韩餐厅点餐必备词汇。",
        duration: 9,
        xp: 55,
        moduleType: "vocab",
        vocab: [
          { id: "v1", word: "밥", pronunciation: "bap", meaning: "饭/米饭", example: "밥을 먹어요.", exampleTranslation: "我吃饭。", partOfSpeech: "명사" },
          { id: "v2", word: "물", pronunciation: "mul", meaning: "水", example: "물 주세요.", exampleTranslation: "请给我水。", partOfSpeech: "명사" },
          { id: "v3", word: "맛있다", pronunciation: "masitda", meaning: "好吃的", example: "이 음식은 맛있어요.", exampleTranslation: "这食物很好吃。", partOfSpeech: "형용사" },
          { id: "v4", word: "계산", pronunciation: "gyesan", meaning: "结账", example: "계산해 주세요.", exampleTranslation: "请结账。", partOfSpeech: "명사" },
        ],
      },
      {
        id: "ko-a2-g1",
        title: "해요 体",
        subtitle: "「해요」 문형",
        description: "学习韩语口语中常用的 해요 体。",
        duration: 11,
        xp: 65,
        moduleType: "grammar",
        grammar: [
          { id: "g1", prompt: "저는 매일 한국어를 ___.", options: ["공부해요", "공부합니다", "공부했어요", "공부해"], answer: 0, explanation: "해요 体表示现在时的礼貌口语。" },
          { id: "g2", prompt: "어제 영화를 ___.", options: ["봤어요", "봐요", "봅니다", "보"], answer: 0, explanation: "过去时用「～았어요/었어요」。" },
        ],
      },
    ],
  },
];

export const COURSES: Course[] = [...englishCourses, ...japaneseCourses, ...koreanCourses];

export const getCourse = (id: string) => COURSES.find((c) => c.id === id);
export const getCoursesByLang = (lang: string) => COURSES.filter((c) => c.lang === lang);
export const getLesson = (lessonId: string) => {
  for (const c of COURSES) {
    const lesson = c.lessons.find((l) => l.id === lessonId);
    if (lesson) return { course: c, lesson };
  }
  return null;
};
export const getAllLessons = () => COURSES.flatMap((c) => c.lessons.map((l) => ({ course: c, lesson: l })));
