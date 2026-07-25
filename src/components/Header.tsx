import React from "react";
import {
  Brain,
  Trash2,
  Download,
  Settings,
  Database,
  Sun,
  Moon,
  Activity,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface HeaderProps {
  status: "idle" | "processing" | "error";
  statusText: string;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenWeights: () => void;
  onOpenAlgorithms: () => void;
  onExportChat: () => void;
  onClearChat: () => void;
  weightsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  statusText,
  theme,
  onToggleTheme,
  onOpenSettings,
  onOpenWeights,
  onOpenAlgorithms,
  onExportChat,
  onClearChat,
  weightsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors bg-slate-900/90 border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 shadow-lg shadow-indigo-500/30">
            <Brain className="w-6 h-6 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent">
                الوسيط الذكي
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                v5.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              API + دماغ بشري بـ 12 خوارزمية معالجة
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="hidden md:flex items-center px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-x-2 space-x-reverse">
          {status === "processing" ? (
            <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
          ) : status === "error" ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>{statusText}</span>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 space-x-reverse">
          {/* Algorithms Inspector Drawer Toggle */}
          <button
            onClick={onOpenAlgorithms}
            title="خوارزميات الدماغ الـ12"
            className="flex items-center space-x-1 space-x-reverse px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 transition-all active:scale-95"
          >
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">12 خوارزمية</span>
          </button>

          {/* Weights Manager Modal Toggle */}
          <button
            onClick={onOpenWeights}
            title="مخزن الأوزان JSON"
            className="relative flex items-center space-x-1 space-x-reverse px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">الأوزان</span>
            {weightsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                {weightsCount}
              </span>
            )}
          </button>

          {/* API Settings Button */}
          <button
            onClick={onOpenSettings}
            title="إعدادات API"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Export Chat */}
          <button
            onClick={onExportChat}
            title="تصدير المحادثة"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Clear Chat */}
          <button
            onClick={onClearChat}
            title="مسح المحادثة"
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleTheme}
            title="تغيير المظهر"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all active:scale-95"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
