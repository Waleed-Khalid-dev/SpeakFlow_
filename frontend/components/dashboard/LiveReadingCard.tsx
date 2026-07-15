"use client";

import { Mic, MicOff } from "lucide-react";
import { useSpeakFlow } from "@/context/SpeakFlowContext";

export default function LiveReadingCard() {
  const { sessionState, transcript, agents, recordingTime, audioVolume, targetSentence, setTargetSentence, availableSentences } = useSpeakFlow();

  const isListening = sessionState === "listening";
  const isProcessing = sessionState === "processing";
  const isIdle = sessionState === "idle" || sessionState === "complete";
  
  // Extract struggling words from the phonetic agent if available
  const phoneticAgent = agents.find(a => a.id === 'phonetic');
  const strugglingWords: string[] = phoneticAgent?.result?.struggling_words?.map((w: string) => w.toLowerCase()) || [];

  // Split transcript into words to simulate analysis
  const words = transcript.split(" ").map(w => {
    const cleanWord = w.toLowerCase().replace(/[.,!?]/g, "");
    return {
      word: w,
      status: strugglingWords.includes(cleanWord) ? "struggling" : "normal"
    };
  });

  return (
    <div className="speakflow-card p-6 flex flex-col h-full bg-white relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-sans text-text-primary flex items-center">
          {isListening && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></div>}
          {!isListening && <div className="w-2 h-2 rounded-full bg-gray-300 mr-2"></div>}
          Live Acoustic Reading Analysis
        </h2>
        {isListening && (
          <span className="text-xs font-mono font-bold text-red-500 px-2 py-1 bg-red-50 rounded animate-pulse">
            LISTENING
          </span>
        )}
        {isProcessing && (
          <span className="text-xs font-mono font-bold text-status-inprogress px-2 py-1 bg-accent-primary-bg rounded">
            PROCESSING
          </span>
        )}
        {isIdle && (
          <span className="text-xs font-mono font-bold text-text-muted px-2 py-1 bg-gray-100 rounded">
            {sessionState === "complete" ? "COMPLETED" : "INACTIVE"}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col space-y-4">
        {/* Target Sentence Display / Selector */}
        <div className="bg-gray-50 border-l-4 border-accent-primary p-4 rounded-r-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Target Sentence</h3>
            {isIdle && (
              <select 
                value={targetSentence}
                onChange={(e) => setTargetSentence(e.target.value)}
                className="text-xs border-gray-300 rounded text-gray-700 bg-white py-1 px-2 focus:ring-accent-primary focus:border-accent-primary"
              >
                {availableSentences.map((s, i) => (
                  <option key={i} value={s}>Sentence {i + 1}</option>
                ))}
              </select>
            )}
          </div>
          <p className="text-xl font-serif text-gray-800 leading-relaxed">
            {targetSentence}
          </p>
        </div>

        {/* Live Audio / Transcript Visualizer */}
        <div className="flex-1 bg-bg-base rounded-xl p-6 border border-gray-100 shadow-inner overflow-y-auto">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Live Transcript</h3>
          <p className="text-2xl font-sans font-medium leading-relaxed text-text-primary">
          {transcript === "" ? (
            <span className="text-gray-400 italic">Waiting for audio input...</span>
          ) : (
            words.map((item, i) => (
              <span 
                key={i} 
                className={`inline-block mr-2 px-1 rounded transition-all duration-300 ${
                  item.status === 'struggling' 
                    ? 'bg-status-anxious/20 text-status-anxious border-b-2 border-status-anxious transform scale-105' 
                    : ''
                }`}
              >
                {item.word}
              </span>
            ))
          )}
        </p>
        </div>
      </div>

      <div className="mt-6 flex items-center bg-gray-50 rounded-lg p-3 border border-gray-200 transition-all duration-300">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors ${isListening ? 'bg-red-500' : 'bg-gray-300'}`}>
          {isListening ? <Mic className="w-5 h-5 text-white animate-pulse" /> : <MicOff className="w-5 h-5 text-gray-500" />}
        </div>
        <div className="ml-4 flex-1 h-6 flex items-center space-x-1">
          {/* Dynamic Audio Waveform */}
          {[...Array(30)].map((_, i) => {
            // Calculate a wave height based on volume and random jitter, but only if listening
            const randomFactor = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
            const volumeHeight = isListening ? Math.max(10, Math.min(100, audioVolume * randomFactor)) : 20;
            const opacity = isListening ? Math.max(0.3, Math.min(1, audioVolume / 100)) : 0.3;
            
            return (
              <div 
                key={i} 
                className={`w-1 rounded-full transition-all duration-75 ${isListening ? 'bg-red-400' : 'bg-gray-300'}`}
                style={{
                  height: `${volumeHeight}%`,
                  opacity: opacity
                }}
              ></div>
            );
          })}
        </div>
        <span className="text-xs font-mono text-text-muted ml-4">
          00:{recordingTime.toString().padStart(2, '0')} / 00:30
        </span>
      </div>
    </div>
  );
}
