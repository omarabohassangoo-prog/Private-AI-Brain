import React, { useState, useRef, useEffect } from "react";
import { Search, Sparkles, CornerDownLeft, Database, PlusCircle } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string, mode: "search_store" | "fetch_data") => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [text]);

  const handleSend = (mode: "search_store" | "fetch_data") => {
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim(), mode);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Default Enter key triggers 'fetch_data'
      handleSend("fetch_data");
    }
  };

  const handleQuickPrompt = (promptText: string, mode: "search_store" | "fetch_data" = "fetch_data") => {
    if (disabled) return;
    onSendMessage(promptText, mode);
  };

  return (
    <div className="w-full bg-slate-900/90 border-t border-slate-800 p-3 sm:p-4 backdrop-blur-md">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Quick Prompts Bar */}
        <div className="flex items-center space-x-2 space-x-reverse overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 flex items-center space-x-1 space-x-reverse shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>مقترحات:</span>
          </span>
          <button
            onClick={() => handleQuickPrompt("عرف الذكاء الاصطناعي والشبكات العصبية", "search_store")}
            className="shrink-0 px-2.5 py-1 rounded-full bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 transition active:scale-95 flex items-center gap-1"
          >
            <Search className="w-3 h-3 text-cyan-400" />
            <span>🔍 بحث بالمخزن: الذكاء الاصطناعي</span>
          </button>
          <button
            onClick={() => handleQuickPrompt("كيف تعمل المرونة العصبية في الدماغ البشري؟", "fetch_data")}
            className="shrink-0 px-2.5 py-1 rounded-full bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/60 transition active:scale-95 flex items-center gap-1"
          >
            <PlusCircle className="w-3 h-3 text-purple-400" />
            <span>📥 جلب وتدريب: المرونة العصبية</span>
          </button>
        </div>

        {/* Textarea Input Box with 2 Action Buttons */}
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl bg-slate-950 border border-slate-800 focus-within:border-purple-500/80 focus-within:ring-2 focus-within:ring-purple-500/20 shadow-inner transition-all p-2 gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="اكتب استعلامك هنا... اختر زراً للبحث بالمخزن أو جلب وتدريب بيانات جديدة"
            className="w-full bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none disabled:opacity-50 min-h-[44px] max-h-[140px]"
          />

          {/* Action Buttons Container */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            {/* BUTTON 1: Search in Store */}
            <button
              type="button"
              onClick={() => handleSend("search_store")}
              disabled={disabled || !text.trim()}
              title="البحث المباشر واسترجاع الإجابة من أوزان المخزن المحلي بدون AI"
              className="flex items-center space-x-1.5 space-x-reverse px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 text-xs font-semibold shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="whitespace-nowrap">بحث في المخزن</span>
            </button>

            {/* BUTTON 2: Fetch Data to Store & Train */}
            <button
              type="button"
              onClick={() => handleSend("fetch_data")}
              disabled={disabled || !text.trim()}
              title="جلب بيانات جديدة، تدريب الشبكة العصبية بـ Backpropagation وحفظ الأوزان بالمخزن"
              className="flex items-center space-x-1.5 space-x-reverse px-3.5 py-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-900/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 text-xs font-bold"
            >
              <Database className="w-3.5 h-3.5 text-purple-200 shrink-0" />
              <span className="whitespace-nowrap">جلب بيانات للمخزن</span>
            </button>
          </div>
        </div>

        {/* Footer info & shortcut hint */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span className="flex items-center space-x-1 space-x-reverse">
            <CornerDownLeft className="w-3 h-3 text-slate-500" />
            <span>Enter = جلب وتدريب للمخزن | يمكنك استخدام زر "بحث في المخزن" للاستعلام من الذاكرة</span>
          </span>
          <span>{text.length} / 4000 حرف</span>
        </div>
      </div>
    </div>
  );
};

