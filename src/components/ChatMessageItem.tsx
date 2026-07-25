import React, { useState } from "react";
import { ChatMessage, BrainSessionWeights } from "../types";
import { analyzeSentiment } from "../services/sentimentAnalyzer";
import { marked } from "marked";
import {
  Brain,
  User,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Database,
  Activity,
  FileText,
  Zap,
} from "lucide-react";

interface ChatMessageItemProps {
  message: ChatMessage;
  onViewWeights?: (weights: BrainSessionWeights) => void;
}

// Setup global copy code function
if (typeof window !== "undefined" && !(window as any).copyCodeBlock) {
  (window as any).copyCodeBlock = (btn: HTMLButtonElement) => {
    const wrapper = btn.closest(".code-block-wrapper");
    if (!wrapper) return;
    const codeEl = wrapper.querySelector("code");
    if (!codeEl) return;
    const codeText = codeEl.innerText || codeEl.textContent || "";
    navigator.clipboard.writeText(codeText);
    const span = btn.querySelector("span");
    if (span) {
      const original = span.innerText;
      span.innerText = "تم النسخ ✓";
      btn.classList.add("text-emerald-400", "border-emerald-500/50");
      setTimeout(() => {
        span.innerText = original;
        btn.classList.remove("text-emerald-400", "border-emerald-500/50");
      }, 2000);
    }
  };
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const customRenderer = {
  code({ text, lang }: { text: string; lang?: string }) {
    const language = lang || "code";
    return `<div class="code-block-wrapper my-3 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg dir-ltr text-left">
      <div class="code-block-header flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400 font-mono">
        <span class="flex items-center space-x-1.5 font-semibold text-purple-400">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-purple-500/60"></span>
          <span>${language}</span>
        </span>
        <button onclick="window.copyCodeBlock(this)" class="copy-code-btn flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition text-[11px] font-sans active:scale-95 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 ml-1"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          <span>نسخ الكود</span>
        </button>
      </div>
      <pre class="p-3.5 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre"><code>${escapeHtml(text)}</code></pre>
    </div>`;
  }
};

marked.use({ renderer: customRenderer });

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onViewWeights,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPhases, setShowPhases] = useState(false);
  const [activeTab, setActiveTab] = useState<"p1" | "p2" | "p3" | "p4">("p1");

  const isBot = message.role === "bot";
  const isSystem = message.role === "system";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMarkdown = (text: string) => {
    try {
      const html = marked.parse(text);
      return { __html: html as string };
    } catch (err) {
      return { __html: text };
    }
  };

  const weights = message.weightsData;
  const userSentiment = !isBot && !isSystem ? (message.sentiment || analyzeSentiment(message.content)) : null;

  return (
    <div
      className={`group flex w-full my-4 space-x-3 space-x-reverse transition-all ${
        isBot ? "justify-start" : "justify-end"
      }`}
    >
      {/* Bot Avatar */}
      {isBot && (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-900/30">
          <Brain className="w-5 h-5 animate-pulse" />
        </div>
      )}

      {/* Message Bubble Container */}
      <div
        className={`max-w-[88%] sm:max-w-[80%] lg:max-w-[75%] rounded-2xl px-4 py-3 shadow-md border ${
          isBot
            ? "bg-slate-900/90 text-slate-100 border-slate-800"
            : isSystem
            ? "bg-amber-950/40 text-amber-200 border-amber-800/50"
            : "bg-indigo-600 text-white border-indigo-500"
        }`}
      >
        {/* Message Header */}
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800/60 text-xs text-slate-400">
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="font-semibold text-slate-300">
              {isBot ? "الوسيط الذكي (Hyper-Brain)" : isSystem ? "تنبيه النظام" : "أنت"}
            </span>

            {/* Sentiment Emoji Badge for User Messages */}
            {userSentiment && (
              <span
                title={`تحليل المشاعر: ${userSentiment.label} (درجة الشعور: ${userSentiment.score})`}
                className={`inline-flex items-center space-x-1 space-x-reverse text-[11px] px-2 py-0.5 rounded-full border ${userSentiment.bgClass} ${userSentiment.colorClass} ${userSentiment.borderColor} font-sans shadow-sm transition hover:scale-105`}
              >
                <span className="text-xs leading-none">{userSentiment.emoji}</span>
                <span className="font-medium text-[10px]">{userSentiment.label}</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <span>{message.timestamp}</span>
            {isBot && (
              <button
                onClick={handleCopy}
                title="نسخ النص"
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Message Content */}
        {isBot ? (
          <div
            className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed dark:prose-p:text-slate-200 dark:prose-headings:text-purple-300"
            dangerouslySetInnerHTML={renderMarkdown(message.content)}
          />
        ) : (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        )}

        {/* Processing Phases & Weights Inspector Banner for Bot Responses */}
        {isBot && weights && (
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => setShowPhases(!showPhases)}
                className="flex items-center space-x-1.5 space-x-reverse text-xs font-medium text-purple-400 hover:text-purple-300 bg-purple-950/40 border border-purple-800/40 px-2.5 py-1 rounded-lg transition"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>مراحل المعالجة الـ4</span>
                {showPhases ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {onViewWeights && (
                <button
                  onClick={() => onViewWeights(weights)}
                  className="flex items-center space-x-1.5 space-x-reverse text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-lg transition"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>معاينة أوزان JSON</span>
                </button>
              )}
            </div>

            {/* Expandable Phases Viewer */}
            {showPhases && (
              <div className="mt-2.5 bg-slate-950 rounded-xl p-3 border border-slate-800 text-xs">
                {/* Phase Tabs */}
                <div className="flex space-x-1 space-x-reverse border-b border-slate-800 pb-2 mb-2">
                  <button
                    onClick={() => setActiveTab("p1")}
                    className={`px-2 py-1 rounded-md font-medium transition ${
                      activeTab === "p1" ? "bg-purple-600 text-white" : "text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    1. تحليل النص
                  </button>
                  <button
                    onClick={() => setActiveTab("p2")}
                    className={`px-2 py-1 rounded-md font-medium transition ${
                      activeTab === "p2" ? "bg-purple-600 text-white" : "text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    2. الأوزان العصبية
                  </button>
                  <button
                    onClick={() => setActiveTab("p3")}
                    className={`px-2 py-1 rounded-md font-medium transition ${
                      activeTab === "p3" ? "bg-purple-600 text-white" : "text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    3. الاستدلال البايزي
                  </button>
                  <button
                    onClick={() => setActiveTab("p4")}
                    className={`px-2 py-1 rounded-md font-medium transition ${
                      activeTab === "p4" ? "bg-purple-600 text-white" : "text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    4. الرد المعرفي
                  </button>
                </div>

                {/* Tab 1 Content */}
                {activeTab === "p1" && (
                  <div className="space-y-1.5 text-slate-300">
                    <p>
                      <strong className="text-purple-300">الأنماط المكتشفة:</strong>{" "}
                      {weights.phase_1.pattern_recognition.detected_patterns.join(", ")}
                    </p>
                    <p>
                      <strong className="text-purple-300">الكلمات المفتاحية:</strong>{" "}
                      {weights.phase_1.attention_focus.key_terms.join(", ") || "لا يوجد"}
                    </p>
                    <p>
                      <strong className="text-purple-300">مؤشر الحمل المعرفي:</strong>{" "}
                      {weights.phase_1.cognitive_load.load_index} ({weights.phase_1.cognitive_load.complexity_level})
                    </p>
                    <p>
                      <strong className="text-purple-300">زمن المعالجة:</strong>{" "}
                      {weights.performance_metrics.phase_1_time} ثانية
                    </p>
                  </div>
                )}

                {/* Tab 2 Content */}
                {activeTab === "p2" && (
                  <div className="space-y-1.5 text-slate-300">
                    <p>
                      <strong className="text-emerald-300">معدل التعلم (Plasticity):</strong>{" "}
                      {weights.phase_2.neural_plasticity.learning_rate}
                    </p>
                    <p>
                      <strong className="text-emerald-300">العقد الترابطية النشطة:</strong>{" "}
                      {weights.phase_2.associative_memory.activated_nodes.join(", ") || "لا يوجد"}
                    </p>
                    <p>
                      <strong className="text-emerald-300">نشاط الطبقة الخارجية:</strong>{" "}
                      {weights.phase_2.connectionist_network.output_activation}
                    </p>
                    <p>
                      <strong className="text-emerald-300">زمن اتصال API والأوزان:</strong>{" "}
                      {weights.performance_metrics.phase_2_time} ثانية
                    </p>
                  </div>
                )}

                {/* Tab 3 Content */}
                {activeTab === "p3" && (
                  <div className="space-y-1.5 text-slate-300">
                    <p>
                      <strong className="text-amber-300">المعرفة المحدثة (Posterior):</strong>{" "}
                      {weights.phase_3.bayesian_inference.posterior}
                    </p>
                    <p>
                      <strong className="text-amber-300">الاستجابة العاطفية:</strong>{" "}
                      {weights.phase_3.emotional_intelligence.emotional_response} (تعاطف:{" "}
                      {weights.phase_3.emotional_intelligence.empathy_level})
                    </p>
                    <p>
                      <strong className="text-amber-300">تقييم الجودة (Metacognition):</strong>{" "}
                      {weights.phase_3.metacognition.quality_score}
                    </p>
                    <p>
                      <strong className="text-amber-300">زمن التحليل البايزي:</strong>{" "}
                      {weights.performance_metrics.phase_3_time} ثانية
                    </p>
                  </div>
                )}

                {/* Tab 4 Content */}
                {activeTab === "p4" && (
                  <div className="space-y-1.5 text-slate-300">
                    <p>
                      <strong className="text-cyan-300">عدد الخوارزميات الدماغية:</strong> 12 خوارزمية
                    </p>
                    <p>
                      <strong className="text-cyan-300">درجة الثقة النهائية:</strong>{" "}
                      {weights.ai_response.confidence * 100}%
                    </p>
                    <p>
                      <strong className="text-cyan-300">الزمن الكلي للأنبوب (Pipeline):</strong>{" "}
                      {weights.performance_metrics.total_time} ثانية
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isBot && (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};
