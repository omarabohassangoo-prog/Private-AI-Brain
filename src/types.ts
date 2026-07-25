import { SentimentResult } from "./services/sentimentAnalyzer";

export interface BrainMetadata {
  user_agent: string;
  provider_used: string;
  model_used: string;
}

export interface InputAnalysis {
  text: string;
  tokens: string[];
  length: number;
  word_count: number;
  language: string;
}

export interface Phase1Data {
  pattern_recognition: {
    detected_patterns: string[];
    confidence: number;
  };
  attention_focus: {
    key_terms: string[];
    importance: number;
  };
  cognitive_load: {
    load_index: number;
    complexity_level: string;
  };
  sentiment: number;
}

export interface Phase2Data {
  neural_plasticity: {
    learning_rate: number;
    synaptic_pruning: string;
    neurogenesis: string;
    weight_adjustments: {
      previous_similar: number;
      new_information: number;
      contextual_boost: number;
    };
  };
  associative_memory: {
    activated_nodes: string[];
    association_strength: number;
    spreading_activation: string;
  };
  connectionist_network: {
    input_activation: number;
    hidden_layers: Array<{ [key: string]: number }>;
    output_activation: number;
    gradient_descent: number;
    backpropagation: string;
  };
}

export interface Phase3Data {
  bayesian_inference: {
    prior_knowledge: number;
    likelihood: number;
    posterior: number;
    uncertainty: string;
  };
  memory_consolidation: {
    short_term: string;
    long_term: string;
    replay_count: number;
    hippocampal_activity: number;
  };
  emotional_intelligence: {
    user_sentiment: string;
    emotional_response: string;
    empathy_level: number;
    regulation: string;
  };
  metacognition: {
    confidence: number;
    quality_score: number;
    error_probability: number;
    self_monitoring: string;
  };
}

export interface AIResponseData {
  raw: string;
  confidence: number;
}

export interface PerformanceMetrics {
  phase_1_time: number;
  phase_2_time: number;
  phase_3_time: number;
  phase_4_time: number;
  total_time: number;
}

export interface BrainActivitySnapshot {
  neural_activation: number;
  synaptic_strength: number;
  memory_consolidation: number;
  cognitive_load: number;
  attention_focus: number;
}

export interface IncrementalLearningData {
  iteration_count: number;
  fused_key_terms: string[];
  cumulative_confidence_boost: number;
  knowledge_density: number;
  historical_similarity_score: number;
  last_merged_timestamp: string;
}

import { RealBrainWeights } from "./services/realNeuralEngine";

export interface BrainSessionWeights {
  session_id: string;
  timestamp: string;
  metadata: BrainMetadata;
  input: InputAnalysis;
  phase_1: Phase1Data;
  phase_2: Phase2Data;
  phase_3: Phase3Data;
  ai_response: AIResponseData;
  algorithms_used: number;
  performance_metrics: PerformanceMetrics;
  brain_activity_snapshot: BrainActivitySnapshot;
  incremental_learning?: IncrementalLearningData;
  real_neural_state?: RealBrainWeights;
}

export interface APISettings {
  apiKey: string;
  apiUrl: string;
  model: string;
  temperature: number;
  provider: 'gemini-default' | 'deepseek' | 'openai' | 'claude' | 'custom';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot' | 'system';
  content: string;
  timestamp: string;
  sessionId?: string;
  weightsData?: BrainSessionWeights;
  brainActivity?: BrainActivitySnapshot;
  confidence?: number;
  processingPhasesTime?: PerformanceMetrics;
  sentiment?: SentimentResult;
}

export interface BrainAlgorithmInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  descriptionAr: string;
  parameters: { [key: string]: string | number };
  status: 'active' | 'standby';
}
