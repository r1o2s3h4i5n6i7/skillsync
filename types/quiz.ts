// ─── Quiz Attempt Types ──────────────────────────────

export interface QuizAttemptPayload {
  answers: (number | null)[];
  timeSpent: number;
}

export interface QuizAttemptResult {
  attempt: {
    id: number;
    score: number;
    correct: number;
    total: number;
    timeSpent: number;
  };
  xpAwarded: number;
}
