import React from "react";
import { BrainActivitySnapshot } from "../types";
import { Zap, ShieldCheck, Database, Cpu, Activity } from "lucide-react";

interface BrainStatsBarProps {
  activity: BrainActivitySnapshot;
  weightsCount: number;
}

export const BrainStatsBar: React.FC<BrainStatsBarProps> = ({
  activity,
  weightsCount,
}) => {
  return (
    <div className="w-full bg-slate-950/80 border-b border-slate-800/80 backdrop-blur px-4 py-2 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 sm:gap-6">
        {/* Neural Activity Progress */}
        <div className="flex items-center space-x-2 space-x-reverse min-w-[130px]">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-medium text-slate-400">النشاط العصبي:</span>
          <div className="flex-1 min-w-[50px] bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-amber-500 to-purple-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, activity.neural_activation)}%` }}
            />
          </div>
          <span className="font-bold text-amber-300 w-8 text-left">
            {activity.neural_activation}%
          </span>
        </div>

        {/* Confidence Progress */}
        <div className="flex items-center space-x-2 space-x-reverse min-w-[130px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-medium text-slate-400">درجة الثقة:</span>
          <div className="flex-1 min-w-[50px] bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, activity.attention_focus)}%` }}
            />
          </div>
          <span className="font-bold text-emerald-300 w-8 text-left">
            {activity.attention_focus}%
          </span>
        </div>

        {/* Cognitive Load */}
        <div className="flex items-center space-x-2 space-x-reverse min-w-[120px]">
          <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="font-medium text-slate-400">الحمل المعرفي:</span>
          <div className="flex-1 min-w-[40px] bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className="bg-indigo-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, activity.cognitive_load)}%` }}
            />
          </div>
          <span className="font-bold text-indigo-300 w-8 text-left">
            {activity.cognitive_load}%
          </span>
        </div>

        {/* Weights Count Stat */}
        <div className="flex items-center space-x-1.5 space-x-reverse">
          <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-400">جلسات الأوزان:</span>
          <span className="font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-md">
            {weightsCount} JSON
          </span>
        </div>

        {/* Incremental Learning Stat */}
        <div className="flex items-center space-x-1.5 space-x-reverse">
          <Activity className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="text-slate-400">التعلم التراكمي:</span>
          <span className="font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            دمج تلقائي
          </span>
        </div>
      </div>
    </div>
  );
};
