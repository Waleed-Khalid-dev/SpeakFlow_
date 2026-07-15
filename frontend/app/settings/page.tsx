"use client";

import { Settings2, Key, Bell, Shield, Database, Check, Circle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useSpeakFlow } from "@/context/SpeakFlowContext";

const API_BASE = "http://127.0.0.1:8000";

export default function SettingsPage() {
  const { addNotification } = useSpeakFlow();

  // The keys stored in backend/.env — we show their status, not their values
  const [keyStatus, setKeyStatus] = useState<{
    total: number;
    active: number;
    status: "loading" | "ok" | "error";
  }>({ total: 0, active: 0, status: "loading" });

  const [activeModel, setActiveModel] = useState("gemma-4-31b-it");
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Ping backend health and key count on mount
  const checkBackend = async () => {
    setKeyStatus(prev => ({ ...prev, status: "loading" }));
    setBackendOnline(null);
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        const data = await res.json();
        setBackendOnline(true);
        setKeyStatus({
          total: data.api_key_count ?? 0,
          active: data.api_key_count ?? 0,
          status: "ok",
        });
      } else {
        setBackendOnline(false);
        setKeyStatus(prev => ({ ...prev, status: "error" }));
      }
    } catch {
      setBackendOnline(false);
      setKeyStatus(prev => ({ ...prev, status: "error" }));
    }
  };

  useEffect(() => { checkBackend(); }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-sans text-text-primary">System Settings</h1>
          <p className="text-sm text-text-secondary mt-1">Configure your SpeakFlow AI environment.</p>
        </div>
      </div>

      <div className="speakflow-card bg-white overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 min-h-[500px]">
          {/* Sidebar */}
          <div className="col-span-1 bg-gray-50 border-r border-gray-200 p-4 space-y-2">
            <button className="w-full flex items-center px-3 py-2 bg-accent-primary-bg text-accent-primary-dark font-bold text-sm rounded-lg">
              <Key className="w-4 h-4 mr-2" /> API Keys
            </button>
            <button className="w-full flex items-center px-3 py-2 text-text-secondary hover:bg-gray-100 font-medium text-sm rounded-lg transition-colors">
              <Database className="w-4 h-4 mr-2" /> Database
            </button>
            <button className="w-full flex items-center px-3 py-2 text-text-secondary hover:bg-gray-100 font-medium text-sm rounded-lg transition-colors">
              <Bell className="w-4 h-4 mr-2" /> Notifications
            </button>
            <button className="w-full flex items-center px-3 py-2 text-text-secondary hover:bg-gray-100 font-medium text-sm rounded-lg transition-colors">
              <Shield className="w-4 h-4 mr-2" /> Privacy
            </button>
          </div>

          {/* Content */}
          <div className="col-span-3 p-8">
            <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center">
              <Key className="w-5 h-5 mr-2 text-text-secondary" />
              API Key Management
            </h2>

            <div className="space-y-6">

              {/* Backend status card */}
              <div className={`p-4 rounded-xl border ${backendOnline === true ? "bg-green-50 border-green-200" : backendOnline === false ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-text-primary">
                      Backend Server
                      <span className={`ml-2 text-xs font-mono px-2 py-0.5 rounded-full ${
                        backendOnline === true ? "bg-green-100 text-green-700" :
                        backendOnline === false ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {backendOnline === true ? "ONLINE" : backendOnline === false ? "OFFLINE" : "CHECKING..."}
                      </span>
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {backendOnline === true
                        ? `Connected to http://127.0.0.1:8000`
                        : "Cannot reach FastAPI backend. Is uvicorn running?"}
                    </p>
                  </div>
                  <button
                    onClick={checkBackend}
                    className="p-2 rounded-lg hover:bg-white transition-colors"
                    title="Re-check backend"
                  >
                    <RefreshCw className="w-4 h-4 text-text-secondary" />
                  </button>
                </div>
              </div>

              {/* API Key pool status */}
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-3">
                  Google API Key Pool
                </label>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-text-primary font-medium">
                      Keys configured in <code className="text-xs bg-gray-200 px-1 rounded">backend/.env</code>
                    </span>
                    <span className={`text-xs font-mono font-bold px-2 py-1 rounded-full ${
                      keyStatus.status === "ok" ? "bg-green-100 text-green-700" :
                      keyStatus.status === "error" ? "bg-red-100 text-red-700" :
                      "bg-gray-200 text-gray-500"
                    }`}>
                      {keyStatus.status === "loading" ? "..." :
                       keyStatus.status === "ok" ? `${keyStatus.total} ACTIVE` : "UNREACHABLE"}
                    </span>
                  </div>

                  {/* Show key slots */}
                  <div className="space-y-2">
                    {Array.from({ length: Math.max(keyStatus.total, 3) }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-gray-100">
                        <Circle className={`w-2 h-2 fill-current ${
                          i < keyStatus.active && keyStatus.status === "ok"
                            ? "text-status-good"
                            : "text-gray-300"
                        }`} />
                        <span className="text-xs font-mono text-text-muted">
                          {i < keyStatus.active && keyStatus.status === "ok"
                            ? `API Key ${i + 1} — ●●●●●●●●●●●●●●●●●●●●●●●●●●●● (active)`
                            : `API Key ${i + 1} — not configured`}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-text-muted mt-3">
                    Keys are read from <code className="bg-gray-200 px-1 rounded">backend/.env → GOOGLE_API_KEYS</code>.
                    The orchestrator rotates between them automatically on rate-limit errors.
                    To add or change keys, edit the file directly and restart the backend.
                  </p>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Active model */}
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">Active AI Model</label>
                <select
                  value={activeModel}
                  onChange={(e) => setActiveModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-accent-primary"
                >
                  <option value="gemma-4-31b-it">gemma-4-31b-it — Recommended (Text reasoning)</option>
                  <option value="gemma-4-26b-it">gemma-4-26b-it — MoE variant (faster)</option>
                </select>
                <p className="text-xs text-text-muted mt-2">
                  Model selection is configured in <code className="bg-gray-100 px-1 rounded">backend/agents/orchestrator.py</code>.
                  Only text-capable models are listed here. Audio preprocessing is handled by Whisper + Librosa.
                </p>
              </div>

              {/* Info box */}
              <div className="p-4 bg-accent-primary-bg rounded-xl border border-accent-primary/20">
                <p className="text-xs font-bold text-accent-primary-dark mb-1">How the pipeline works</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Your audio is processed locally by <strong>Whisper</strong> (transcription + word timing) and <strong>Librosa</strong> (pitch + pauses).
                  The structured data is then sent to 5 parallel <strong>Gemma agents</strong> via your API key pool.
                  No raw audio ever leaves your machine — only text telemetry goes to the Google API.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
