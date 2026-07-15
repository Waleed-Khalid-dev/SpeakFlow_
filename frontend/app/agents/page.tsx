import { Bot, Terminal, Activity, CheckCircle2 } from "lucide-react";

export default function AgentsPage() {
  const agents = [
    { id: "phonetic", name: "Phonetic Analyst", model: "gemma-4-turbo", status: "Active", latency: "1.2s", jobs: 142 },
    { id: "difficulty", name: "Difficulty Assessor", model: "gemma-4-turbo", status: "Active", latency: "0.8s", jobs: 142 },
    { id: "engagement", name: "Engagement Tracker", model: "gemma-4-turbo", status: "Active", latency: "1.5s", jobs: 142 },
    { id: "practice", name: "Practice Generator", model: "gemma-4-turbo", status: "Active", latency: "2.1s", jobs: 142 },
    { id: "progress", name: "Progress Synthesizer", model: "gemma-4-turbo", status: "Active", latency: "0.9s", jobs: 142 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-sans text-text-primary">AI Agents Command Center</h1>
          <p className="text-sm text-text-secondary mt-1">Monitor the Gemma 4 parallel pipeline in real-time.</p>
        </div>
        <div className="flex items-center px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm font-bold rounded-lg shadow-sm">
          <Activity className="w-4 h-4 mr-2" />
          System Healthy
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Agent List */}
        <div className="lg:col-span-5 space-y-4">
          {agents.map((agent) => (
            <div key={agent.id} className="speakflow-card bg-white p-4 cursor-pointer hover:border-accent-primary transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-accent-primary-bg rounded-lg mr-3">
                    <Bot className="w-5 h-5 text-accent-primary-dark" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{agent.name}</h3>
                    <p className="text-xs text-text-muted font-mono">{agent.model}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end mb-1">
                    <CheckCircle2 className="w-3 h-3 text-status-good mr-1" />
                    <span className="text-xs font-bold text-status-good">{agent.status}</span>
                  </div>
                  <span className="text-xs font-mono text-text-secondary">{agent.latency} avg</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Col: Live Terminal Logs */}
        <div className="lg:col-span-7 speakflow-card bg-[#1A1A1A] text-gray-300 p-6 flex flex-col font-mono text-xs">
          <div className="flex items-center mb-4 border-b border-gray-700 pb-2">
            <Terminal className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-gray-400 font-bold uppercase tracking-wider">Live Execution Logs</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 opacity-80">
            <div className="text-green-400">[2026-07-13 14:22:01] Orchestrator: Starting pipeline for Session SES-001</div>
            <div>[2026-07-13 14:22:01] PhoneticAnalyst: Parsing transcript...</div>
            <div>[2026-07-13 14:22:01] DifficultyAssessor: Calculating Lexile complexity...</div>
            <div>[2026-07-13 14:22:02] EngagementTracker: Analyzing hesitation vectors...</div>
            <div className="text-blue-400">[2026-07-13 14:22:02] PhoneticAnalyst: SUCCESS - returned JSON (latency: 1.1s)</div>
            <div className="text-blue-400">[2026-07-13 14:22:02] DifficultyAssessor: SUCCESS - returned JSON (latency: 0.9s)</div>
            <div>[2026-07-13 14:22:03] PracticeGenerator: Generating exercises based on Phonetic output...</div>
            <div className="text-blue-400">[2026-07-13 14:22:03] EngagementTracker: SUCCESS - returned JSON (latency: 1.6s)</div>
            <div className="text-blue-400">[2026-07-13 14:22:04] PracticeGenerator: SUCCESS - returned JSON (latency: 1.8s)</div>
            <div>[2026-07-13 14:22:04] ProgressSynthesizer: Aggregating pipeline results...</div>
            <div className="text-blue-400">[2026-07-13 14:22:05] ProgressSynthesizer: SUCCESS - returned JSON (latency: 0.7s)</div>
            <div className="text-green-400 font-bold">[2026-07-13 14:22:05] Orchestrator: Pipeline complete. Total duration: 3.8s</div>
          </div>
        </div>
      </div>
    </div>
  );
}
