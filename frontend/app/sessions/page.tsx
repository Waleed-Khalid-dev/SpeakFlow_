"use client";

import { History, Search, Calendar, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchSessions } from "@/lib/api";
import { useSpeakFlow } from "@/context/SpeakFlowContext";
import { formatDistanceToNow } from "date-fns";

export default function SessionsPage() {
  const { addNotification } = useSpeakFlow();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        const data = await fetchSessions();
        setSessions(data);
      } catch (err) {
        addNotification({ title: "Error", message: "Failed to load reading sessions", type: "error" });
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, [addNotification]);

  const handleFilter = () => {
    addNotification({ title: "Filters", message: "Advanced filtering coming soon", type: "info" });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-sans text-text-primary">Reading Sessions</h1>
          <p className="text-sm text-text-secondary mt-1">Review historical session data and AI analyses.</p>
        </div>
      </div>

      <div className="speakflow-card bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text-muted" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary bg-gray-50"
              placeholder="Search sessions..."
            />
          </div>
          <div className="flex space-x-3">
            <button onClick={handleFilter} className="flex items-center px-4 py-2 border border-gray-200 text-text-secondary text-sm font-medium rounded-lg hover:bg-gray-50">
              <Calendar className="w-4 h-4 mr-2" /> Date
            </button>
            <button onClick={handleFilter} className="flex items-center px-4 py-2 border border-gray-200 text-text-secondary text-sm font-medium rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary uppercase bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">Session ID</th>
                <th className="px-6 py-4 font-bold">Student</th>
                <th className="px-6 py-4 font-bold">Date & Time</th>
                <th className="px-6 py-4 font-bold">Duration</th>
                <th className="px-6 py-4 font-bold text-center">WPM</th>
                <th className="px-6 py-4 font-bold text-center">Accuracy</th>
                <th className="px-6 py-4 font-bold text-center">Health Score</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-text-muted">Loading sessions...</td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-text-muted">No sessions recorded yet. Start a session from the Dashboard.</td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id} onClick={() => addNotification({title: "Session Details", message: `Opening details for session ${s.id.split('-')[0]}...`, type: "info"})} className="bg-white border-b hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-mono text-text-muted">{s.id.split('-')[0]}</td>
                    <td className="px-6 py-4 font-bold text-text-primary">{s.student_name}</td>
                    <td className="px-6 py-4 text-text-secondary">{formatDistanceToNow(new Date(s.timestamp))} ago</td>
                    <td className="px-6 py-4 text-text-secondary">1m 12s</td>
                    <td className="px-6 py-4 text-center font-mono font-bold">{s.wpm ? Math.round(s.wpm) : '--'}</td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-status-good">{s.accuracy ? Math.round(s.accuracy * 100) : '--'}%</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        (s.overall_score || 0) > 85 ? 'bg-green-100 text-green-700' :
                        (s.overall_score || 0) > 70 ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {s.overall_score || '--'}/100
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
