import { BrainSessionWeights, APISettings } from "../types";

const WEIGHTS_STORAGE_KEY = "brain_weights_data";
const API_SETTINGS_KEY = "hyper_brain_api_settings";

export const defaultAPISettings: APISettings = {
  apiKey: "",
  apiUrl: "https://api.deepseek.com/v1/chat/completions",
  model: "gemini-3.6-flash",
  temperature: 0.7,
  provider: "gemini-default",
};

export const getStoredAPISettings = (): APISettings => {
  try {
    const raw = localStorage.getItem(API_SETTINGS_KEY);
    if (!raw) return defaultAPISettings;
    return { ...defaultAPISettings, ...JSON.parse(raw) };
  } catch (err) {
    console.error("Error reading API settings:", err);
    return defaultAPISettings;
  }
};

export const saveAPISettings = (settings: APISettings): void => {
  try {
    localStorage.setItem(API_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Error saving API settings:", err);
  }
};

export const getAllStoredWeights = (): Record<string, BrainSessionWeights> => {
  try {
    const raw = localStorage.getItem(WEIGHTS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading stored weights:", err);
    return {};
  }
};

export const saveSessionWeights = (sessionId: string, weights: BrainSessionWeights): void => {
  try {
    const all = getAllStoredWeights();
    
    // --- INCREMENTAL LEARNING (التعلم التراكمي) ---
    // Extract key terms & concepts from previous sessions
    const existingSessions = Object.values(all);
    const iterationCount = existingSessions.length + 1;

    const allPreviousKeyTerms = new Set<string>();
    existingSessions.forEach((s) => {
      s.phase_1?.attention_focus?.key_terms?.forEach((kt) => allPreviousKeyTerms.add(kt.toLowerCase()));
      s.phase_2?.associative_memory?.activated_nodes?.forEach((an) => allPreviousKeyTerms.add(an.toLowerCase()));
    });

    const currentKeyTerms = weights.phase_1?.attention_focus?.key_terms || [];
    let matchCount = 0;
    currentKeyTerms.forEach((kt) => {
      if (allPreviousKeyTerms.has(kt.toLowerCase())) matchCount++;
    });

    const historicalSimilarityScore = currentKeyTerms.length > 0
      ? Math.round((matchCount / currentKeyTerms.length) * 100) / 100
      : 0;

    // Cumulative confidence boost based on network depth & repetition
    const cumulativeConfidenceBoost = Math.min(0.25, Math.round((iterationCount * 0.02 + historicalSimilarityScore * 0.1) * 100) / 100);
    const knowledgeDensity = Math.min(1.0, Math.round(((allPreviousKeyTerms.size + currentKeyTerms.length) / 50) * 100) / 100);

    const fusedTerms = Array.from(
      new Set([
        ...currentKeyTerms,
        ...(weights.phase_2?.associative_memory?.activated_nodes || []),
        ...Array.from(allPreviousKeyTerms).slice(-10),
      ])
    ).slice(0, 15);

    // Attach incremental learning data
    weights.incremental_learning = {
      iteration_count: iterationCount,
      fused_key_terms: fusedTerms,
      cumulative_confidence_boost: cumulativeConfidenceBoost,
      knowledge_density: knowledgeDensity,
      historical_similarity_score: historicalSimilarityScore,
      last_merged_timestamp: new Date().toISOString(),
    };

    all[sessionId] = weights;
    
    // --- MEMORY PRUNING (تقليم الذاكرة العصبية) ---
    const MAX_SESSIONS = 50;
    const sessionKeys = Object.keys(all);
    if (sessionKeys.length > MAX_SESSIONS) {
      // Sort sessions by value: combined confidence and knowledge density
      sessionKeys.sort((a, b) => {
        const scoreA = (all[a].incremental_learning?.cumulative_confidence_boost || 0) + (all[a].incremental_learning?.knowledge_density || 0);
        const scoreB = (all[b].incremental_learning?.cumulative_confidence_boost || 0) + (all[b].incremental_learning?.knowledge_density || 0);
        return scoreA - scoreB; // Ascending order (lowest score first)
      });
      
      // Delete the least valuable sessions to get back to the limit
      const keysToDelete = sessionKeys.slice(0, sessionKeys.length - MAX_SESSIONS);
      keysToDelete.forEach(key => delete all[key]);
    }

    localStorage.setItem(WEIGHTS_STORAGE_KEY, JSON.stringify(all, null, 2));
  } catch (err) {
    console.error("Error saving session weights with incremental learning:", err);
  }
};

export const downloadWeightsJSON = (): void => {
  const data = getAllStoredWeights();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `brain_weights_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importWeightsJSON = async (file: File): Promise<Record<string, BrainSessionWeights>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (typeof parsed !== "object" || parsed === null) {
          throw new Error("ملف JSON غير صالح");
        }
        localStorage.setItem(WEIGHTS_STORAGE_KEY, JSON.stringify(parsed, null, 2));
        resolve(parsed);
      } catch (err: any) {
        reject(new Error(err.message || "فشل تحليل ملف JSON"));
      }
    };
    reader.onerror = () => reject(new Error("حدث خطأ أثناء قراءة الملف"));
    reader.readAsText(file);
  });
};

export const clearAllStoredWeights = (): void => {
  localStorage.removeItem(WEIGHTS_STORAGE_KEY);
};
