"use client";

import { TrendingUp, Target, TrendingDown, Download } from "lucide-react";
import ProgressChart from "@/components/dashboard/ProgressChart";
import { useSpeakFlow } from "@/context/SpeakFlowContext";

export default function ProgressPage() {
  const { addNotification } = useSpeakFlow();

  const handleExport = () => {
    addNotification({ title: "Export Started", message: "Preparing CSV export of progress data...", type: "success" });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-sans text-text-primary">Progress Tracker</h1>
          <p className="text-sm text-text-secondary mt-1">Long-term fluency and accuracy trends.</p>
        </div>
        <button onClick={handleExport} className="flex items-center px-4 py-2 border border-gray-200 text-text-secondary text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm bg-white">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="speakflow-card bg-white p-6">
          <div className="flex items-center text-sm font-bold text-text-secondary mb-2">
            <TrendingUp className="w-4 h-4 mr-2 text-status-good" /> Average WPM Growth
          </div>
          <div className="text-3xl font-bold font-sans text-text-primary">+12%</div>
          <p className="text-xs text-text-muted mt-1">Over the last 30 days</p>
        </div>
        <div className="speakflow-card bg-white p-6">
          <div className="flex items-center text-sm font-bold text-text-secondary mb-2">
            <Target className="w-4 h-4 mr-2 text-accent-secondary" /> Accuracy Improvement
          </div>
          <div className="text-3xl font-bold font-sans text-text-primary">+5%</div>
          <p className="text-xs text-text-muted mt-1">Over the last 30 days</p>
        </div>
        <div className="speakflow-card bg-white p-6">
          <div className="flex items-center text-sm font-bold text-text-secondary mb-2">
            <TrendingDown className="w-4 h-4 mr-2 text-status-good" /> Cognitive Load Spikes
          </div>
          <div className="text-3xl font-bold font-sans text-text-primary">-8%</div>
          <p className="text-xs text-text-muted mt-1">Over the last 30 days</p>
        </div>
      </div>

      <div className="h-[500px]">
        <ProgressChart />
      </div>
    </div>
  );
}
