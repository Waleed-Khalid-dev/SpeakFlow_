import { useState } from "react";
import { Target, ArrowRight, Loader2, Check } from "lucide-react";
import { useSpeakFlow } from "@/context/SpeakFlowContext";

export default function PracticeCard() {
  const { sessionState, agents, addNotification, addAvailableSentence, setTargetSentence, resetSession } = useSpeakFlow();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const practiceAgent = agents.find(a => a.id === "practice");
  const isComplete = sessionState === "complete";
  const isProcessing = sessionState === "processing";

  const sentences = practiceAgent?.result?.sentences || [];
  const focusArea = practiceAgent?.result?.focus_area || "N/A";

  return (
    <div className="speakflow-card p-6 h-full bg-white flex flex-col relative overflow-hidden">
      <h2 className="text-lg font-bold font-sans text-text-primary mb-2 flex items-center">
        <Target className="w-5 h-5 mr-2 text-accent-secondary" />
        Targeted Practice
      </h2>
      <p className="text-sm text-text-secondary mb-6">Generated based on real-time struggles</p>

      {sessionState === "idle" && (
        <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center mt-12">
          <Target className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-gray-500 font-bold mb-1">Awaiting Diagnosis</h3>
          <p className="text-sm text-gray-400">Complete a reading session to generate targeted practice.</p>
        </div>
      )}

      {isProcessing && (
        <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center mt-12">
          <Loader2 className="w-12 h-12 text-accent-secondary animate-spin mb-4" />
          <h3 className="text-accent-secondary font-bold mb-1">Generating Exercises...</h3>
          <p className="text-sm text-gray-500">Creating custom practice sentences.</p>
        </div>
      )}

      <div className="space-y-3 flex-1 overflow-y-auto">
        {sentences.length > 0 ? (
          sentences.map((item: any, i: number) => {
            const isSelected = selectedIndex === i;
            return (
            <div 
              key={i} 
              onClick={() => setSelectedIndex(i)}
              className={`p-4 rounded-xl border transition-colors cursor-pointer group ${
                isSelected 
                  ? 'bg-accent-secondary/10 border-accent-secondary' 
                  : 'bg-accent-secondary-bg border-accent-secondary/20 hover:border-accent-secondary/40'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm font-bold transition-colors ${isSelected ? 'text-accent-secondary' : 'text-text-primary group-hover:text-accent-secondary'}`}>
                    "{item.text}"
                  </p>
                  <p className="text-xs text-text-muted mt-1 font-mono uppercase">Focus: {item.target_phoneme || focusArea}</p>
                </div>
                {isSelected ? (
                  <Check className="w-4 h-4 text-accent-secondary" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-accent-secondary opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                )}
              </div>
            </div>
          )})
        ) : (
          isComplete && <p className="text-sm text-gray-500 italic">No specific practice needed.</p>
        )}
      </div>
      
      <button 
        disabled={!isComplete || sentences.length === 0 || selectedIndex === null}
        onClick={() => {
          if (selectedIndex !== null) {
            const chosenSentence = sentences[selectedIndex].text;
            addNotification({
              title: "Practice Assigned",
              message: `New target sentence set: "${chosenSentence}"`,
              type: "success"
            });
            addAvailableSentence(chosenSentence);
            setTargetSentence(chosenSentence);
            setSelectedIndex(null);
            resetSession();
          }
        }}
        className={`w-full mt-4 py-3 border text-sm font-bold rounded-xl transition-colors ${
          isComplete && sentences.length > 0 && selectedIndex !== null
            ? 'bg-accent-secondary text-white border-accent-secondary hover:bg-accent-secondary-dark' 
            : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Assign to Student
      </button>
    </div>
  );
}
