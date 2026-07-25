import React from "react";
import { BRAIN_ALGORITHMS } from "../data/brainAlgorithms";
import {
  X,
  Zap,
  Database,
  Search,
  Network,
  GitFork,
  HeartHandshake,
  Cpu,
  Eye,
  TrendingUp,
  Activity,
  Target,
  Sliders,
  CheckCircle2,
} from "lucide-react";

interface AlgorithmsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-4 h-4 text-amber-400" />,
  Database: <Database className="w-4 h-4 text-emerald-400" />,
  Search: <Search className="w-4 h-4 text-cyan-400" />,
  Network: <Network className="w-4 h-4 text-indigo-400" />,
  GitFork: <GitFork className="w-4 h-4 text-purple-400" />,
  HeartHandshake: <HeartHandshake className="w-4 h-4 text-rose-400" />,
  Cpu: <Cpu className="w-4 h-4 text-blue-400" />,
  Eye: <Eye className="w-4 h-4 text-teal-400" />,
  TrendingUp: <TrendingUp className="w-4 h-4 text-lime-400" />,
  Activity: <Activity className="w-4 h-4 text-violet-400" />,
  Target: <Target className="w-4 h-4 text-amber-300" />,
  Sliders: <Sliders className="w-4 h-4 text-fuchsia-400" />,
};

export const AlgorithmsDrawer: React.FC<AlgorithmsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Activity className="w-5 h-5 text-purple-400" />
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  خوارزميات العقل البشري الـ12
                </h2>
                <p className="text-xs text-slate-400">
                  خوارزميات محلية محاكاة للدماغ البشري
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of Algorithms */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {BRAIN_ALGORITHMS.map((algo, index) => (
              <div
                key={algo.id}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/40 transition group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 group-hover:scale-105 transition">
                      {iconMap[algo.icon] || <Activity className="w-4 h-4 text-purple-400" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200">
                        {index + 1}. {algo.nameAr}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {algo.nameEn}
                      </span>
                    </div>
                  </div>
                  <span className="flex items-center space-x-1 space-x-reverse text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>نشط</span>
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-2">
                  {algo.descriptionAr}
                </p>

                {/* Parameters */}
                <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800/60 text-[11px] space-y-1 text-slate-300">
                  {Object.entries(algo.parameters).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-400">{key}:</span>
                      <span className="font-mono text-purple-300 font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400 flex items-center justify-between">
            <span>إجمالي الخوارزميات: 12/12</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition"
            >
              تم
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
