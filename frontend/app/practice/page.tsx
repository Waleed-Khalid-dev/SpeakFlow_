"use client";

import { Play, Search, Filter, BookOpen } from "lucide-react";
import { useSpeakFlow } from "@/context/SpeakFlowContext";

export default function PracticePage() {
  const { addNotification } = useSpeakFlow();
  
  const exercises = [
    { id: 1, title: "The 'dr' Blend Challenge", type: "Phonetics", difficulty: "Medium", duration: "2 mins" },
    { id: 2, title: "Pacing and Pausing", type: "Fluency", difficulty: "Hard", duration: "5 mins" },
    { id: 3, title: "Sight Word Speed Run", type: "Accuracy", difficulty: "Easy", duration: "1 min" },
  ];

  const handleStart = (title: string) => {
    addNotification({ title: "Loading Exercise", message: `Preparing "${title}" practice environment...`, type: "info" });
  };

  const handleFilter = () => {
    addNotification({ title: "Filters", message: "Curriculum filters coming soon", type: "info" });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-sans text-text-primary">Practice Center</h1>
          <p className="text-sm text-text-secondary mt-1">Targeted phonetic exercises and fluency drills.</p>
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
              placeholder="Search exercises..."
            />
          </div>
          <button onClick={handleFilter} className="flex items-center px-4 py-2 border border-gray-200 text-text-secondary text-sm font-medium rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" /> Filter by Type
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((e) => (
            <div key={e.id} className="border border-gray-200 rounded-xl p-5 hover:border-accent-primary transition-colors bg-gray-50/50">
              <div className="w-10 h-10 rounded-full bg-accent-primary-bg text-accent-primary-dark flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-text-primary mb-1">{e.title}</h3>
              <p className="text-sm text-text-secondary mb-4">{e.type} • {e.difficulty}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200">
                <span className="text-xs font-bold text-text-muted">{e.duration}</span>
                <button 
                  onClick={() => handleStart(e.title)}
                  className="flex items-center px-3 py-1.5 bg-white border border-gray-200 text-text-primary text-xs font-bold rounded-lg hover:border-accent-primary hover:text-accent-primary transition-colors"
                >
                  <Play className="w-3 h-3 mr-1.5" /> Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
