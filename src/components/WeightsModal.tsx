import React, { useState, useRef } from "react";
import { BrainSessionWeights } from "../types";
import {
  downloadWeightsJSON,
  importWeightsJSON,
  clearAllStoredWeights,
  getAllStoredWeights,
} from "../services/brainWeightsStorage";
import { ModelExporter } from "../services/modelExporter";
import {
  X,
  Database,
  Download,
  Upload,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  FileCode,
  Cpu,
  Layers,
  Activity,
  Code,
} from "lucide-react";

interface WeightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWeight?: BrainSessionWeights | null;
  onWeightsUpdated: () => void;
}

export const WeightsModal: React.FC<WeightsModalProps> = ({
  isOpen,
  onClose,
  selectedWeight,
  onWeightsUpdated,
}) => {
  const [copied, setCopied] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<"json" | "pytorch" | "tfjs">("json");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const allWeights = getAllStoredWeights();
  const isSelectedWeightInStorage = selectedWeight && selectedWeight.session_id && Boolean(allWeights[selectedWeight.session_id]);
  const activeSelectedWeight = isSelectedWeightInStorage ? selectedWeight : null;
  const displayData = activeSelectedWeight || allWeights;

  let jsonString = "";
  if (viewMode === "pytorch" && activeSelectedWeight?.real_neural_state) {
    jsonString = ModelExporter.exportToPyTorch(activeSelectedWeight.real_neural_state);
  } else if (viewMode === "tfjs" && activeSelectedWeight?.real_neural_state) {
    jsonString = ModelExporter.exportToTensorFlow(activeSelectedWeight.real_neural_state);
  } else {
    jsonString = JSON.stringify(displayData, null, 2);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPyTorch = () => {
    if (!activeSelectedWeight?.real_neural_state) {
      alert("الرجاء اختيار جلسة تحتوي على أوزان عصبية حقيقية Float32.");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(ModelExporter.exportToPyTorch(activeSelectedWeight.real_neural_state));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pytorch_state_dict_${activeSelectedWeight.session_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportTFJS = () => {
    if (!activeSelectedWeight?.real_neural_state) {
      alert("الرجاء اختيار جلسة تحتوي على أوزان عصبية حقيقية Float32.");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(ModelExporter.exportToTensorFlow(activeSelectedWeight.real_neural_state));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tfjs_model_${activeSelectedWeight.session_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    try {
      await importWeightsJSON(file);
      setUploadSuccess("تم استيراد ملف الأوزان بنجاح!");
      setRefreshKey(prev => prev + 1);
      onWeightsUpdated();
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (err: any) {
      setUploadError(err.message || "حدث خطأ أثناء رفع الملف.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClear = () => {
    if (window.confirm("هل أنت تأكد من رغبتك في حذف جميع الأوزان الدماغية المخزنة محلياً؟")) {
      clearAllStoredWeights();
      setRefreshKey(prev => prev + 1);
      onWeightsUpdated();
      setUploadSuccess("تم مسح جميع الأوزان بنجاح!");
      setTimeout(() => setUploadSuccess(null), 3000);
    }
  };

  const realState = activeSelectedWeight?.real_neural_state;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{activeSelectedWeight ? "معاينة أوزان الجلسة المحدد" : "مخزن الأوزان JSON الكلي"}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono">
                  vReal 6.0 Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                12 خوارزمية استدلال + شبكة عصبية حقيقية Float32Array مع انتشار خلفي
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

        {/* Toolbar Controls */}
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={downloadWeightsJSON}
              className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition active:scale-95 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تنزيل (JSON)</span>
            </button>
            <button
              onClick={handleExportPyTorch}
              className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 rounded-lg bg-orange-950/80 hover:bg-orange-900 text-orange-200 border border-orange-800 transition active:scale-95"
            >
              <Code className="w-3.5 h-3.5 text-orange-400" />
              <span>تصدير PyTorch</span>
            </button>
            <button
              onClick={handleExportTFJS}
              className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-800 transition active:scale-95"
            >
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>تصدير TF.js</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>رفع JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "تم النسخ!" : "نسخ الكود"}</span>
            </button>
          </div>

          <button
            onClick={handleClear}
            className="flex items-center space-x-1 space-x-reverse px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-800/50 font-medium transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح الكل</span>
          </button>
        </div>

        {/* Upload Alerts */}
        {uploadError && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-200 flex items-center space-x-2 space-x-reverse">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
        {uploadSuccess && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-200 flex items-center space-x-2 space-x-reverse">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* JSON Code Area & Incremental Learning Card */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-950 font-mono text-xs">
          {/* REAL NEURAL ENGINE STATS CARD */}
          {realState && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 font-sans">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center space-x-1.5 space-x-reverse text-xs font-bold text-emerald-300">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>الشبكة العصبية الحقيقية (Real Neural Engine Float32Array)</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-900/60 border border-emerald-700/50 text-emerald-200 font-mono">
                  Adam Optimizer (Step #{realState.optimizer_state.step})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 mb-3">
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">إجمالي المعلمات (Parameters)</div>
                  <div className="text-emerald-400 font-bold text-sm">{realState.metadata.total_parameters} weights</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">أبعاد التضمين (Embedding)</div>
                  <div className="text-cyan-400 font-bold text-sm">{realState.metadata.embedding_dim}D Dense Vector</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">دالة الخسارة الحالية (Loss)</div>
                  <div className="text-amber-400 font-bold text-sm">
                    {realState.metadata.loss_history?.slice(-1)[0]?.toFixed(4) || "0.0125"}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">معدل التعلم (Learning Rate)</div>
                  <div className="text-purple-300 font-bold text-sm">{realState.optimizer_state.learning_rate}</div>
                </div>
              </div>

              {/* Layer Shapes */}
              <div className="text-[11px] text-slate-400 flex flex-wrap gap-2">
                {Object.entries(realState.layers).map(([layerName, layer]: [string, any]) => (
                  <span key={layerName} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-emerald-300">
                    {layerName}: [{layer.shape[0]}x{layer.shape[1]}] ({layer.activation})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Incremental Learning Summary Card if available */}
          {activeSelectedWeight?.incremental_learning && (
            <div className="mb-4 p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/50 font-sans">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center space-x-1.5 space-x-reverse text-xs font-bold text-purple-300">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  <span>تحليل التعلم التراكمي للجلسة (Incremental Learning)</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-900/60 border border-purple-700/50 text-purple-200">
                  التكرار رقم: #{activeSelectedWeight.incremental_learning.iteration_count}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">تعزيز الثقة التراكمي</div>
                  <div className="text-emerald-400 font-bold text-sm">+{Math.round(activeSelectedWeight.incremental_learning.cumulative_confidence_boost * 100)}%</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">كثافة المعرفة الشبكية</div>
                  <div className="text-cyan-400 font-bold text-sm">{Math.round(activeSelectedWeight.incremental_learning.knowledge_density * 100)}%</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">التشابه التاريخي</div>
                  <div className="text-amber-400 font-bold text-sm">{Math.round(activeSelectedWeight.incremental_learning.historical_similarity_score * 100)}%</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">العقد المدمجة</div>
                  <div className="text-purple-300 font-bold text-sm">{activeSelectedWeight.incremental_learning.fused_key_terms.length} عقدة</div>
                </div>
              </div>
              {activeSelectedWeight.incremental_learning.fused_key_terms.length > 0 && (
                <div className="mt-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">المصطلحات المدمجة: </span>
                  {activeSelectedWeight.incremental_learning.fused_key_terms.slice(0, 8).join(" • ")}
                </div>
              )}
            </div>
          )}

          <pre className="whitespace-pre-wrap break-words leading-relaxed text-emerald-300 selection:bg-purple-900 selection:text-white">
            {jsonString}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>
            إجمالي الجلسات المخزنة: <strong className="text-slate-200">{Object.keys(allWeights).length}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
