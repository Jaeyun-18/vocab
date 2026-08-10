import type { Word } from "../types/word";
import { RECENT_WORDS_TEST_COUNT, HIGH_WRONG_RATE_TEST_COUNT } from "../config";

export function selectRecentWords(words: Word[]): Word[] {
  return shuffle(
    [...words]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, RECENT_WORDS_TEST_COUNT),
  );
}

// 오답 우세/정답 우세 그룹에서만 호출된다.
// 두 그룹은 오답 수와 정답 수가 다르므로 시도 이력이 반드시 1회 이상이라 0으로 나눌 일이 없다.
function wrongRate(word: Word): number {
  return word.wrongCount / (word.correctCount + word.wrongCount);
}

// 0: 오답 > 정답, 1: 오답 === 정답 (시도 이력 없는 0/0 포함), 2: 정답 > 오답
function priorityTier(word: Word): number {
  if (word.wrongCount > word.correctCount) return 0;
  if (word.wrongCount === word.correctCount) return 1;
  return 2;
}

function byWrongRateDesc(a: Word, b: Word): number {
  return wrongRate(b) - wrongRate(a) || b.wrongCount - a.wrongCount;
}

export function selectHighWrongRateWords(words: Word[]): Word[] {
  const tiers: Word[][] = [[], [], []];
  for (const word of words) tiers[priorityTier(word)].push(word);

  // 동률 그룹은 오답률이 모두 같아 우열을 가릴 수 없으므로 랜덤 순서로 둔다.
  const ordered = [
    ...tiers[0].sort(byWrongRateDesc),
    ...shuffle(tiers[1]),
    ...tiers[2].sort(byWrongRateDesc),
  ];

  return shuffle(ordered.slice(0, HIGH_WRONG_RATE_TEST_COUNT));
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
