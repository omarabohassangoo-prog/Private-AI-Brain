import React, { useState, useEffect, useRef } from "react";
import {
  ChatMessage,
  BrainSessionWeights,
  BrainActivitySnapshot,
  APISettings,
} from "./types";
import {
  getStoredAPISettings,
  saveAPISettings,
  getAllStoredWeights,
  saveSessionWeights,
} from "./services/brainWeightsStorage";
import {
  synthesizeResponseFromStoredWeights,
  findMatchingSessionInStorage,
} from "./services/clientBrainSynthesizer";
import { analyzeSentiment } from "./services/sentimentAnalyzer";
import { Header } from "./components/Header";
import { BrainStatsBar } from "./components/BrainStatsBar";
import { ChatMessageItem } from "./components/ChatMessageItem";
import { ChatInput } from "./components/ChatInput";
import { SettingsModal } from "./components/SettingsModal";
import { WeightsModal } from "./components/WeightsModal";
import { AlgorithmsDrawer } from "./components/AlgorithmsDrawer";
import { Brain, Sparkles, AlertCircle, Loader2 } from "lucide-react";

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [statusText, setStatusText] = useState("جاهز للمعالجة الدماغية");
  const [apiSettings, setApiSettings] = useState<APISettings>(defaultAPISettings);

  // Modals & Drawer state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWeightsOpen, setIsWeightsOpen] = useState(false);
  const [isAlgorithmsOpen, setIsAlgorithmsOpen] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState<BrainSessionWeights | null>(null);

  // Live Brain Stats
  const [brainActivity, setBrainActivity] = useState<BrainActivitySnapshot>({
    neural_activation: 85,
    synaptic_strength: 88,
    memory_consolidation: 78,
    cognitive_load: 32,
    attention_focus: 92,
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load API settings & initialize welcome message on mount
  useEffect(() => {
    const settings = getStoredAPISettings();
    setApiSettings(settings);

    const initialWelcomeMsg: ChatMessage = {
      id: "welcome_1",
      role: "bot",
      content: `🧠 **مرحباً بك في نظام الوسيط الذكي المتكامل (Hyper-Brain Mediator v5.0)**

تم تفعيل النظام بنجاح مع آلية المعالجة الدماغية ذات الأربعة مراحل:

1️⃣ **المرحلة الأولى:** تحليل الإدخال والتعرف على الأنماط واستخراج الكلمات المفتاحية ورصد المشاعر.
2️⃣ **المرحلة الثانية:** الاتصال بالـ API وتعبئة الأوزان العصبية والمرونة والشبكة الاتصالية.
3️⃣ **المرحلة الثالثة:** الاستدلال البايزي، وتوطيد الذاكرة، والذكاء العاطفي، وقياس الثقة (Metacognition).
4️⃣ **المرحلة الرابعة:** معالجة رد العقل البشري المنسق بـ 12 خوارزمية وتوليد أوزان JSON دائم.

💡 **تلميح:** يمكنك الضغط على **⚙️ الإعدادات** لإضافة مفتاح API خاص بك أو استخدام المزود المدمج بالخادم مباشرة!`,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([initialWelcomeMsg]);
  }, []);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, status]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleSaveSettings = (newSettings: APISettings) => {
    setApiSettings(newSettings);
    saveAPISettings(newSettings);
  };

  const handleSendMessage = async (userText: string, mode: "search_store" | "fetch_data" = "fetch_data") => {
    const userSentiment = analyzeSentiment(userText);

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      sentiment: userSentiment,
    };

    setMessages((prev) => [...prev, userMsg]);
    setStatus("processing");

    // MODE 1: SEARCH DIRECTLY IN STORE
    if (mode === "search_store") {
      setStatusText("🔍 جاري البحث والاستعلام المباشر في مخزن الأوزان الرقمية المحلي...");
      
      const allWeights = getAllStoredWeights();
      const weightKeys = Object.keys(allWeights);

      if (weightKeys.length === 0) {
        // Empty Store Notice
        setTimeout(() => {
          const emptyStoreMsg: ChatMessage = {
            id: `msg_bot_${Date.now()}`,
            role: "bot",
            content: `⚠️ **مخزن الأوزان المحلي فارغ حالياً.**\n\nلم تقم بجلب وتدريب بيانات في المخزن بعد. يرجى كتابة سؤالك ثم الضغط على **📥 جلب بيانات للمخزن** ليقوم النظام بتوليد الإجابة وتدريب الشبكة العصبية بـ Backpropagation وتخزين أوزانها لاسترجاعها لاحقاً!`,
            timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, emptyStoreMsg]);
          setStatus("idle");
          setStatusText("جاهز للمعالجة الدماغية");
        }, 500);
        return;
      }

      const matchedSession = findMatchingSessionInStorage(userText);

      if (matchedSession) {
        try {
          const synthesis = synthesizeResponseFromStoredWeights(matchedSession.sessionId, userText);
          
          const botMsg: ChatMessage = {
            id: `msg_bot_${Date.now()}`,
            role: "bot",
            content: `${synthesis.finalResponse}\n\n---\n*🔍 (تم استرجاع الإجابة وتوليدها مباشرة من مخزن الأوزان الرقمية المحلي - نسبة التطابق العصبي: ${Math.round(matchedSession.matchScore * 100)}% - المعرف: \`${matchedSession.sessionId}\`)*`,
            timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
            sessionId: matchedSession.sessionId,
            weightsData: matchedSession.weights,
            brainActivity: matchedSession.weights.brain_activity_snapshot,
            confidence: synthesis.confidence,
          };

          setMessages((prev) => [...prev, botMsg]);
          if (matchedSession.weights.brain_activity_snapshot) {
            setBrainActivity(matchedSession.weights.brain_activity_snapshot);
          }

          setStatus("idle");
          setStatusText("🔍 تم البحث في المخزن واستخراج الإجابة من الأوزان المخزنة بنجاح");
          return;
        } catch (err) {
          console.warn("Storage search error:", err);
        }
      }

      // If no exact match found, search across available sessions or synthesize from best session
      try {
        const lastSessionId = weightKeys[weightKeys.length - 1];
        const fallbackSession = allWeights[lastSessionId];
        const synthesis = synthesizeResponseFromStoredWeights(lastSessionId, userText);

        const botMsg: ChatMessage = {
          id: `msg_bot_${Date.now()}`,
          role: "bot",
          content: `${synthesis.finalResponse}\n\n---\n*🔍 (تم الاستعلام من أقرب جلسة معرفية بالمخزن: \`${lastSessionId}\`)*`,
          timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          sessionId: lastSessionId,
          weightsData: fallbackSession,
          brainActivity: fallbackSession.brain_activity_snapshot,
          confidence: synthesis.confidence,
        };

        setMessages((prev) => [...prev, botMsg]);
        setStatus("idle");
        setStatusText("🔍 تم الاستعلام من أحدث أوزان متوفرة بالمخزن");
        return;
      } catch (err) {
        console.warn("Search synthesis fallback error:", err);
      }
    }

    // MODE 2: FETCH DATA TO STORE & TRAIN NEURAL NETWORK
    setStatusText("📥 جاري جلب البيانات، وتدريب الشبكة العصبية بـ Backpropagation، وحفظ الأوزان بالمخزن...");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          settings: apiSettings,
          allStoredWeights: getAllStoredWeights(),
          sessionHistory: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `خطأ في الاتصال بالخادم (${response.status})`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "فشلت المعالجة الدماغية.");
      }

      // 1. POPULATE LOCAL WEIGHTS STORAGE & INDEXEDDB
      if (data.weightsData && data.sessionId) {
        saveSessionWeights(data.sessionId, data.weightsData);
      }

      // 2. READ NEWLY STORED WEIGHTS AND SYNTHESIZE RESPONSE VIA BROWSER ALGORITHMS
      let clientSynthesizedText = data.response;
      let clientConfidence = data.confidence;
      if (data.sessionId) {
        try {
          const synthesis = synthesizeResponseFromStoredWeights(data.sessionId, userText);
          clientSynthesizedText = synthesis.finalResponse;
          clientConfidence = synthesis.confidence;
        } catch (synthErr) {
          console.warn("Client brain synthesis fallback:", synthErr);
        }
      }

      const trainInfo = data.trainMetrics 
        ? `\n\n---\n*📥 (تم جلب البيانات وحفظ الأوزان بـ IndexedDB والمخزن الرقمي - خوارزمية التدريب: Adam Step #${data.trainMetrics.step}, Loss: ${data.trainMetrics.loss.toFixed(4)})*`
        : `\n\n---\n*📥 (تم جلب البيانات وتخزين الأوزان بنجاح بالمخزن)*`;

      const botMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        role: "bot",
        content: `${clientSynthesizedText}${trainInfo}`,
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        sessionId: data.sessionId,
        weightsData: data.weightsData,
        brainActivity: data.brainActivity,
        confidence: clientConfidence,
      };

      setMessages((prev) => [...prev, botMsg]);

      if (data.brainActivity) {
        setBrainActivity(data.brainActivity);
      }

      setStatus("idle");
      setStatusText("✅ تم جلب البيانات وتدريب الشبكة العصبية وحفظ الأوزان بالمخزن بنجاح");
    } catch (err: any) {
      console.error("Error sending message:", err);
      setStatus("error");
      setStatusText("حدث خطأ أثناء المعالجة الدماغية");

      const errorBotMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: "system",
        content: `⚠️ **تعذر إكمال المعالجة الدماغية:** ${
          err.message || "تأكد من الاتصال أو إعدادات API."
        }\n\nيرجى مراجعة نافذة **⚙️ الإعدادات** للتحقق من مفتاح API ورابط المزود.`,
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, errorBotMsg]);
    }
  };

  const handleExportChat = () => {
    const textLog = messages
      .map((m) => `[${m.timestamp}] ${m.role.toUpperCase()}:\n${m.content}\n-------------------`)
      .join("\n");
    const blob = new Blob([textLog], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `chat_log_${new Date().toISOString().slice(0, 10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearChat = () => {
    if (window.confirm("هل تريد مسح سجل المحادثة الحالية؟")) {
      setMessages([]);
    }
  };

  const handleViewSpecificWeights = (weights: BrainSessionWeights) => {
    setSelectedWeight(weights);
    setIsWeightsOpen(true);
  };

  const weightsCount = Object.keys(getAllStoredWeights()).length;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"
      } dir-rtl text-right`}
    >
      {/* Header Bar */}
      <Header
        status={status}
        statusText={statusText}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWeights={() => {
          setSelectedWeight(null);
          setIsWeightsOpen(true);
        }}
        onOpenAlgorithms={() => setIsAlgorithmsOpen(true)}
        onExportChat={handleExportChat}
        onClearChat={handleClearChat}
        weightsCount={weightsCount}
      />

      {/* Real-time Brain Stats Bar */}
      <BrainStatsBar activity={brainActivity} weightsCount={weightsCount} />

      {/* Main Chat View Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 max-w-5xl w-full mx-auto space-y-4"
        >
          {messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              onViewWeights={handleViewSpecificWeights}
            />
          ))}

          {/* Typing Processing Indicator */}
          {status === "processing" && (
            <div className="flex items-center space-x-3 space-x-reverse text-xs text-purple-400 bg-purple-950/40 border border-purple-800/40 px-4 py-3 rounded-2xl w-fit animate-pulse my-3">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
              <span>{statusText}</span>
            </div>
          )}
        </div>

        {/* Input Dock at Bottom */}
        <ChatInput onSendMessage={handleSendMessage} disabled={status === "processing"} />
      </main>

      {/* Modals & Drawers */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={apiSettings}
        onSave={handleSaveSettings}
      />

      <WeightsModal
        isOpen={isWeightsOpen}
        onClose={() => {
          setIsWeightsOpen(false);
          setSelectedWeight(null);
        }}
        selectedWeight={selectedWeight}
        onWeightsUpdated={() => {
          setSelectedWeight(null);
        }}
      />

      <AlgorithmsDrawer
        isOpen={isAlgorithmsOpen}
        onClose={() => setIsAlgorithmsOpen(false)}
      />
    </div>
  );
}

const defaultAPISettings: APISettings = {
  apiKey: "",
  apiUrl: "https://api.deepseek.com/v1/chat/completions",
  model: "gemini-3.6-flash",
  temperature: 0.7,
  provider: "gemini-default",
};
