export interface Word {
  id: string;
  english: string;
  korean: string;
  createdAt: string; // ISO datetime
  correctCount: number;
  wrongCount: number;
  lastCorrectAt: string | null; // ISO datetime
  notionPageId?: string;
}
