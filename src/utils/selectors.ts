import type { Word } from "../types/word";
import { RECENT_WORDS_TEST_COUNT, HIGH_WRONG_RATE_TEST_COUNT } from "../config";

export function selectRecentWords(words: Word[]): Word[] {
  return [...words]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, RECENT_WORDS_TEST_COUNT);
}

export function selectHighWrongRateWords(words: Word[]): Word[] {
  return words
    .filter((w) => w.correctCount + w.wrongCount > 0)
    .map((w) => ({ word: w, rate: w.wrongCount / (w.correctCount + w.wrongCount) }))
    .sort((a, b) => b.rate - a.rate || b.word.wrongCount - a.word.wrongCount)
    .slice(0, HIGH_WRONG_RATE_TEST_COUNT)
    .map((x) => x.word);
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
