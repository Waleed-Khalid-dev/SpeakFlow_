export const MOCK_SESSION_DATA = {
  liveTranscript: [
    { word: "The", status: "correct" },
    { word: "brave", status: "correct" },
    { word: "driver", status: "struggling" },
    { word: "drove", status: "correct" },
    { word: "through", status: "correct" },
    { word: "the", status: "correct" },
    { word: "cold", status: "correct" },
    { word: "dark", status: "correct" },
    { word: "street.", status: "correct" },
  ],
  stats: {
    wpm: 68.5,
    accuracy: 85,
    pauses: 3,
    duration: "1m 12s"
  },
  diagnosis: {
    score: 82,
    phonetic: ["dr blend"],
    cognitive: ["driver"],
    category: "MIXED",
  },
  agents: {
    phonetic: "complete",
    difficulty: "complete",
    engagement: "in_progress",
    practice: "pending",
    progress: "pending"
  },
  practice: [
    { text: "The dragon drank the water.", focus: "dr blend" },
    { text: "She drew a dress.", focus: "dr blend" },
    { text: "The drum dropped on the floor.", focus: "dr blend" }
  ],
  progressChart: [
    { session: "Mon", wpm: 55, accuracy: 72 },
    { session: "Tue", wpm: 58, accuracy: 75 },
    { session: "Wed", wpm: 62, accuracy: 80 },
    { session: "Thu", wpm: 65, accuracy: 82 },
    { session: "Today", wpm: 68.5, accuracy: 85 },
  ]
};
