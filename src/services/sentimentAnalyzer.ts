/**
 * Sentiment Analysis Engine for User Messages
 * Analyzes Arabic and English text for emotional tone, sentiment score, label, and emoji.
 */

export interface SentimentResult {
  score: number; // -1.0 to +1.0
  label: string;
  emoji: string;
  colorClass: string;
  bgClass: string;
  borderColor: string;
  intensity: 'عالية' | 'متوسطة' | 'منخفضة';
}

const POSITIVE_WORDS_AR = [
  "ممتاز", "رائع", "جميل", "شكرا", "شكراً", "مبدع", "احسنت", "أحسنت", "تطور", "نجاح", 
  "سريع", "دقيق", "عملي", "مذهل", "خرافي", "سعيد", "حب", "يحب", "افضل", "أفضل", 
  "سهل", "واضح", "ممتازة", "رائعة", "مفيدة", "مفيد", "استفدت", "تحسين", "تفوق", "جيد",
  "حل", "حلول", "فهمت", "يعطيك", "العافية", "تسلم", "ممتازه", "رهيب"
];

const NEGATIVE_WORDS_AR = [
  "سيء", "بطيء", "خطأ", "فشل", "مشكلة", "صعب", "معقد", "غير", "لا", "ما", "لم",
  "خربان", "ضعيف", "تالف", "بطيئة", "غريب", "مستحيل", "حزين", "غاضب", "مزعج", "طويل",
  "تراجع", "بطء", "عيب", "عيوب", "تأخير", "ثقيل", "ملل", "تكلفة", "سيئة", "غالي"
];

const QUESTION_WORDS_AR = [
  "هل", "كيف", "لماذا", "ماذا", "من", "أين", "متى", "كم", "اي", "أي", "شنو", "كيفية", "شلون"
];

const ENTHUSIASTIC_WORDS_AR = [
  "واو", "يا سلام", "رهيب", "عظيم", "اسطوري", "أسطوري", "سرعة", "قوة", "فوق العتاولة"
];

export function analyzeSentiment(text: string): SentimentResult {
  if (!text || !text.trim()) {
    return {
      score: 0,
      label: "محايد",
      emoji: "😐",
      colorClass: "text-slate-400",
      bgClass: "bg-slate-800/60",
      borderColor: "border-slate-700/50",
      intensity: "منخفضة"
    };
  }

  const cleanText = text.toLowerCase().trim();
  const words = cleanText.split(/\s+/);

  let score = 0;
  let isQuestion = false;
  let isEnthusiastic = false;

  // Check for questions
  if (cleanText.includes("?") || cleanText.includes("؟")) {
    isQuestion = true;
  }

  const NEGATION_WORDS = ["غير", "ليس", "ليست", "بدون", "لا", "ما"];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const cleanWord = word.replace(/[^\w\u0600-\u06FF]/g, "");
    const prevWord = i > 0 ? words[i - 1].replace(/[^\w\u0600-\u06FF]/g, "") : "";
    const isNegated = NEGATION_WORDS.includes(prevWord);

    if (QUESTION_WORDS_AR.includes(cleanWord)) {
      isQuestion = true;
    }

    if (ENTHUSIASTIC_WORDS_AR.includes(cleanWord)) {
      isEnthusiastic = true;
      score += isNegated ? -0.2 : 0.4;
    }

    if (POSITIVE_WORDS_AR.some(p => cleanWord.includes(p))) {
      score += isNegated ? -0.25 : 0.25;
    }

    if (NEGATIVE_WORDS_AR.some(n => cleanWord.includes(n))) {
      score += isNegated ? 0.25 : -0.25;
    }
  }

  // Check emojis in text
  if (/😊|😃|😄|😁|🤩|😍|👍|❤️|🎉|✨|🔥|👌/.test(text)) {
    score += 0.4;
  }
  if (/😢|😭|😡|🤬|👎|💔|😞|☹️|❌|👎/.test(text)) {
    score -= 0.4;
  }
  if (/🤔|🧐|❓|❓/.test(text)) {
    isQuestion = true;
  }

  // Clamp score
  score = Math.max(-1, Math.min(1, Math.round(score * 100) / 100));

  const absScore = Math.abs(score);
  const intensity: 'عالية' | 'متوسطة' | 'منخفضة' = absScore > 0.6 ? 'عالية' : absScore > 0.2 ? 'متوسطة' : 'منخفضة';

  // Determine emotional state
  if (isEnthusiastic || score >= 0.5) {
    return {
      score,
      label: "متحمس / معجب",
      emoji: "🤩",
      colorClass: "text-amber-400",
      bgClass: "bg-amber-950/60",
      borderColor: "border-amber-700/60",
      intensity
    };
  } else if (score > 0.15) {
    return {
      score,
      label: "إيجابي / راضٍ",
      emoji: "😃",
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-950/60",
      borderColor: "border-emerald-700/60",
      intensity
    };
  } else if (score < -0.4) {
    return {
      score,
      label: "مستاء / غاضب",
      emoji: "😡",
      colorClass: "text-rose-400",
      bgClass: "bg-rose-950/60",
      borderColor: "border-rose-700/60",
      intensity
    };
  } else if (score < -0.15) {
    return {
      score,
      label: "سلبي / محبط",
      emoji: "😓",
      colorClass: "text-orange-400",
      bgClass: "bg-orange-950/60",
      borderColor: "border-orange-700/60",
      intensity
    };
  } else if (isQuestion) {
    return {
      score,
      label: "فضول / استفسار",
      emoji: "🤔",
      colorClass: "text-cyan-400",
      bgClass: "bg-cyan-950/60",
      borderColor: "border-cyan-700/60",
      intensity: "متوسطة"
    };
  } else {
    return {
      score: 0,
      label: "محايد",
      emoji: "😐",
      colorClass: "text-slate-300",
      bgClass: "bg-slate-800/70",
      borderColor: "border-slate-700/60",
      intensity: "منخفضة"
    };
  }
}
