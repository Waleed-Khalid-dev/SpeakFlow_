"use client";

import { FileText, Download, Printer, Search } from "lucide-react";
import { useSpeakFlow } from "@/context/SpeakFlowContext";

export default function ReportsPage() {
  const { addNotification } = useSpeakFlow();
  
  const reports = [
    { id: "REP-991", student: "Aarav Sharma", type: "Weekly Summary", date: "Jul 12, 2026", status: "Ready" },
    { id: "REP-992", student: "Zara Khan", type: "Monthly Diagnostic", date: "Jul 01, 2026", status: "Ready" },
    { id: "REP-993", student: "Rohan Patel", type: "Intervention Plan", date: "Jun 28, 2026", status: "Ready" },
  ];

  const handleGenerate = () => {
    addNotification({ title: "Generating Report", message: "Connecting to reporting engine...", type: "info" });
  };

  const handleDownload = (id: string) => {
    addNotification({ title: "Download Started", message: `Downloading report ${id}.pdf`, type: "success" });
  };

  const handlePrint = (id: string) => {
    addNotification({ title: "Sent to Printer", message: `Spooling report ${id} to default printer...`, type: "success" });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-sans text-text-primary">Diagnostic Reports</h1>
          <p className="text-sm text-text-secondary mt-1">Generate and export official reading assessments.</p>
        </div>
        <button 
          onClick={handleGenerate}
          className="flex items-center px-4 py-2 bg-text-primary text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate New Report
        </button>
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
              placeholder="Search reports..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary uppercase bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">Report ID</th>
                <th className="px-6 py-4 font-bold">Student</th>
                <th className="px-6 py-4 font-bold">Type</th>
                <th className="px-6 py-4 font-bold">Generated</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-text-muted">{r.id}</td>
                  <td className="px-6 py-4 font-bold text-text-primary">{r.student}</td>
                  <td className="px-6 py-4 text-text-secondary">{r.type}</td>
                  <td className="px-6 py-4 text-text-secondary">{r.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDownload(r.id)} className="p-2 text-text-muted hover:text-text-primary transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => handlePrint(r.id)} className="p-2 text-text-muted hover:text-text-primary transition-colors ml-1">
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
