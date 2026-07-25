import React, { useState } from "react";
import { APISettings } from "../types";
import { X, Key, Globe, Cpu, Sliders, Eye, EyeOff, Save, RotateCcw, CheckCircle2 } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: APISettings;
  onSave: (newSettings: APISettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<APISettings>(settings);
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    const resetVal: APISettings = {
      apiKey: "",
      apiUrl: "https://api.deepseek.com/v1/chat/completions",
      model: "gemini-3.6-flash",
      temperature: 0.7,
      provider: "gemini-default",
    };
    setFormData(resetVal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-slate-100">إعدادات الاتصال والـ API</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          {/* Provider Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              مزود الخدمة (Provider)
            </label>
            <select
              value={formData.provider}
              onChange={(e) => {
                const prov = e.target.value as APISettings["provider"];
                let newUrl = formData.apiUrl;
                let newModel = formData.model;
                if (prov === "gemini-default") {
                  newUrl = "";
                  newModel = "gemini-3.6-flash";
                } else if (prov === "deepseek") {
                  newUrl = "https://api.deepseek.com/v1/chat/completions";
                  newModel = "deepseek-chat";
                } else if (prov === "openai") {
                  newUrl = "https://api.openai.com/v1/chat/completions";
                  newModel = "gpt-4o";
                } else if (prov === "claude") {
                  newUrl = "https://api.anthropic.com/v1/messages";
                  newModel = "claude-3-5-sonnet-20241022";
                }
                setFormData({ ...formData, provider: prov, apiUrl: newUrl, model: newModel });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="gemini-default">الافتراضي (Google Gemini Server-Side Key)</option>
              <option value="deepseek">DeepSeek AI API</option>
              <option value="openai">OpenAI ChatGPT API</option>
              <option value="claude">Anthropic Claude API</option>
              <option value="custom">مزود مخصص (Custom Endpoint)</option>
            </select>
          </div>

          {/* API Key Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1 space-x-reverse">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                <span>مفتاح API الخاص بك (API Key)</span>
              </span>
              <span className="text-[10px] text-slate-500">تخزين محلي آمن في المتصفح</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder={
                  formData.provider === "gemini-default"
                    ? "اختياري (يتم استخدام المفتاح المدمج في الخادم)"
                    : "أدخل مفتاح API الخاص بك هنا..."
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pl-9 text-slate-200 focus:outline-none focus:border-purple-500 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute left-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* API Endpoint URL */}
          {formData.provider !== "gemini-default" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1 space-x-reverse">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>رابط الخدمة (Endpoint URL)</span>
              </label>
              <input
                type="text"
                value={formData.apiUrl}
                onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                placeholder="https://api.deepseek.com/v1/chat/completions"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 text-xs dir-ltr text-left"
              />
            </div>
          )}

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1 space-x-reverse">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>اسم النموذج (Model)</span>
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="gemini-3.6-flash أو deepseek-chat"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 text-xs dir-ltr text-left"
            />
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                درجة الإبداع (Temperature): <span className="text-purple-400">{formData.temperature}</span>
              </label>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0.0 (دقيق وموضوعي)</span>
              <span>1.0 (متوازن)</span>
              <span>2.0 (إبداعي جداً)</span>
            </div>
          </div>

          {/* Buttons Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center space-x-1 space-x-reverse px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة تعيين</span>
            </button>

            <div className="flex space-x-2 space-x-reverse">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 space-x-reverse px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-900/30 transition active:scale-95"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>تم الحفظ!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>حفظ الإعدادات</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
