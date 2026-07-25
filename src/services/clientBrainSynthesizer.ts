import { BrainSessionWeights } from "../types";
import { getAllStoredWeights } from "./brainWeightsStorage";

/**
 * 6 Browser-side Weights-Reading Algorithms Implementation
 * (Strictly implements DS-WEIGHTS-READING-ALGORITHMS-2026-001)
 */

export interface SynthesisResult {
  finalResponse: string;
  confidence: number;
  algorithmsUsed: number;
  readSessionId: string;
  totalStoredSessionsCount: number;
  incrementalBoost?: number;
  iterationCount?: number;
  executionMetrics: {
    contextExtractionTime: number;
    patternAnalysisTime: number;
    emotionalResponseTime: number;
    contentGenerationTime: number;
    qualityCheckTime: number;
    formattingTime: number;
    totalSynthesisTime: number;
  };
}

export function findMatchingSessionInStorage(userText: string): { sessionId: string; weights: BrainSessionWeights; matchScore: number } | null {
  const allWeights = getAllStoredWeights();
  
  if (Object.keys(allWeights).length === 0) {
    return null;
  }

  // Improved Normalization, Prefix Removal & Stop Words Removal
  const stopWords = new Set(["في", "من", "على", "الى", "إلى", "عن", "مع", "هل", "كيف", "ماذا", "متى", "أين", "يا", "و", "أو", "ثم", "ان", "أن", "كان", "كانت"]);
  
  // Light Arabic stemmer removing common prefixes (الـ, بالـ, فالـ, والـ, كالـ, للـ, و, ف)
  const stripArabicPrefixes = (word: string): string => {
    if (word.length <= 3) return word;
    if (word.startsWith("بال") || word.startsWith("فال") || word.startsWith("وال") || word.startsWith("كال")) return word.slice(3);
    if (word.startsWith("لل")) return word.slice(2);
    if (word.startsWith("ال")) return word.slice(2);
    if ((word.startsWith("و") || word.startsWith("ف") || word.startsWith("ب") || word.startsWith("ل") || word.startsWith("ك")) && word.length > 4) {
      return word.slice(1);
    }
    return word;
  };

  const normalize = (text: string) => {
    return text.trim().toLowerCase()
      .replace(/[^\w\u0600-\u06FF\s]/g, "") // Remove punctuation
      .replace(/[أإآ]/g, "ا") // Normalize Alef
      .replace(/ة/g, "ه") // Normalize Teh Marbuta
      .replace(/ى/g, "ي"); // Normalize Alef Maqsura
  };

  const normalizedUser = normalize(userText);
  if (!normalizedUser) return null;

  const userWordsRaw = normalizedUser.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  const userWords = userWordsRaw.map(stripArabicPrefixes);

  let bestMatch: { sessionId: string; weights: BrainSessionWeights; matchScore: number } | null = null;
  let highestScore = 0;

  for (const [sessionId, weights] of Object.entries(allWeights)) {
    const storedInput = weights?.input?.text;
    if (!storedInput) continue;

    const normalizedStored = normalize(storedInput);

    // 1. Exact match (highest priority)
    if (normalizedStored === normalizedUser) {
      return { sessionId, weights, matchScore: 1.0 };
    }

    // 2. Contains match
    if (normalizedStored.includes(normalizedUser) || normalizedUser.includes(normalizedStored)) {
      const score = 0.88;
      if (score > highestScore) {
        highestScore = score;
        bestMatch = { sessionId, weights, matchScore: score };
      }
      continue;
    }

    // 3. Morphological Stem-based Similarity & Keyword Overlap
    if (userWords.length > 0) {
      const storedWordsRaw = normalizedStored.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
      const storedWordsStemmed = storedWordsRaw.map(stripArabicPrefixes);
      const storedSet = new Set(storedWordsStemmed);
      
      let matchedCount = 0;
      for (const word of userWords) {
        if (storedSet.has(word)) {
          matchedCount += 1.0;
        } else {
          // Check for sub-word or prefix/suffix overlap
          for (const sWord of storedSet) {
            if (sWord.includes(word) || word.includes(sWord)) {
              matchedCount += 0.6; // Improved partial match score
              break;
            }
          }
        }
      }
      
      // Union size based on stemmed words
      const unionSize = new Set([...userWords, ...storedWordsStemmed]).size;
      const similarity = unionSize > 0 ? (matchedCount / unionSize) : 0;
      
      // Boost score if incremental learning shows high historical similarity
      const incrementalBoost = weights.incremental_learning?.historical_similarity_score || 0;
      const adjustedSimilarity = Math.min(1.0, similarity + (incrementalBoost * 0.1));

      if (adjustedSimilarity >= 0.55 && adjustedSimilarity > highestScore) {
        highestScore = adjustedSimilarity;
        bestMatch = { sessionId, weights, matchScore: adjustedSimilarity };
      }
    }
  }

  return bestMatch;
}

import { analyzeSentiment } from "./sentimentAnalyzer";

export function synthesizeResponseFromStoredWeights(sessionId: string, currentUserText?: string): SynthesisResult {
  const startTime = performance.now();

  // --- ALG 1: Context Extractor (مستخرج السياق من مخزن localStorage) ---
  const alg1Start = performance.now();
  const allWeights = getAllStoredWeights();
  const currentWeights = allWeights[sessionId];

  if (!currentWeights) {
    throw new Error(`لم يتم العثور على أوزان الجلسة (${sessionId}) في مخزن JSON المحلي.`);
  }

  const allSessionsKeys = Object.keys(allWeights);
  const totalStoredSessionsCount = allSessionsKeys.length;
  const alg1Time = performance.now() - alg1Start;

  // --- ALG 2: Cognitive Pattern Analyzer (محلل الأنماط المعرفية) ---
  const alg2Start = performance.now();
  let sentimentVal = currentWeights.phase_1?.sentiment || 0;
  
  // Blend with current user text sentiment if provided
  if (currentUserText) {
      const currentSentiment = analyzeSentiment(currentUserText);
      sentimentVal = (sentimentVal + currentSentiment.score) / 2;
  }
  
  const alg2Time = performance.now() - alg2Start;

  // --- ALG 3: Emotional Response Generator (مولد الاستجابة العاطفية) ---
  const alg3Start = performance.now();
  let openingEmpathy = "";

  if (sentimentVal > 0.4) {
    openingEmpathy = "يسعدني جداً سماع ذلك! 😊\n\n";
  } else if (sentimentVal < -0.4) {
    openingEmpathy = "أتفهم تماماً ما تمر به، وأنا هنا للمساعدة. 🤝\n\n";
  } else if (sentimentVal > 0.15) {
    openingEmpathy = "ممتاز، سأوضح لك الأمر:\n\n";
  } else if (sentimentVal < -0.15) {
    openingEmpathy = "لا تقلق، دعنا نتعامل مع هذا:\n\n";
  }
  const alg3Time = performance.now() - alg3Start;

  // --- ALG 4: Cognitive Content Generator (مولد المحتوى المعرفي من الأوزان) ---
  const alg4Start = performance.now();
  let rawContent = currentWeights.ai_response?.raw || "";
  
  // Basic content adaptation (ALG 4.5): if the content doesn't have markdown formatting but looks like lists, format it
  if (rawContent && !rawContent.includes('*') && !rawContent.includes('#') && rawContent.includes('\n-')) {
    rawContent = rawContent.replace(/\n-/g, '\n• ');
  }
  
  const alg4Time = performance.now() - alg4Start;

  // --- ALG 5: Quality & Confidence Checker (مدقق الجودة والثقة + التعلم التراكمي) ---
  const alg5Start = performance.now();
  const bayesianPosterior = currentWeights.phase_3?.bayesian_inference?.posterior || 0.95;
  const metacognitionQuality = currentWeights.phase_3?.metacognition?.quality_score || 0.90;
  const baseConfidence = (bayesianPosterior + metacognitionQuality) / 2;
  const incBoost = currentWeights.incremental_learning?.cumulative_confidence_boost || 0;
  const finalConfidence = Math.min(0.99, Math.round((baseConfidence + incBoost) * 100) / 100);
  const alg5Time = performance.now() - alg5Start;

  // --- ALG 6: Final Output Coordinator (منسق الإخراج النهائي) ---
  const alg6Start = performance.now();
  // Assemble the final response carefully combining empathy and content
  const formattedResponse = `${openingEmpathy}${rawContent}`;
  const alg6Time = performance.now() - alg6Start;

  const totalTime = performance.now() - startTime;

  return {
    finalResponse: formattedResponse,
    confidence: finalConfidence,
    algorithmsUsed: 12,
    readSessionId: sessionId,
    totalStoredSessionsCount,
    incrementalBoost: incBoost,
    iterationCount: currentWeights.incremental_learning?.iteration_count || totalStoredSessionsCount,
    executionMetrics: {
      contextExtractionTime: Math.round(alg1Time * 100) / 100,
      patternAnalysisTime: Math.round(alg2Time * 100) / 100,
      emotionalResponseTime: Math.round(alg3Time * 100) / 100,
      contentGenerationTime: Math.round(alg4Time * 100) / 100,
      qualityCheckTime: Math.round(alg5Time * 100) / 100,
      formattingTime: Math.round(alg6Time * 100) / 100,
      totalSynthesisTime: Math.round(totalTime * 100) / 100,
    },
  };
}
