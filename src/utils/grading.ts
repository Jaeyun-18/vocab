function normalize(value: string): string {
  return value.trim().toLowerCase();
}

// A word's meaning can list multiple synonyms (e.g. "성취, 업적"); any one of
// them counts as a correct answer.
export function isCorrectAnswer(userInput: string, correctAnswer: string): boolean {
  const candidates = correctAnswer
    .split(/[,\/、;]/)
    .map(normalize)
    .filter(Boolean);
  return candidates.includes(normalize(userInput));
}
