export type TestMode = "recent" | "highWrongRate" | "all";
export type TestDirection = "enToKr" | "krToEn";

export interface TestResultItem {
  wordId: string;
  english: string;
  korean: string;
  direction: TestDirection;
  userAnswer: string;
  correct: boolean;
}
