import { dbPromise } from "./db";
import type { Word } from "../types/word";

export async function getAllWords(): Promise<Word[]> {
  return (await dbPromise).getAll("words");
}

export async function getWord(id: string): Promise<Word | undefined> {
  return (await dbPromise).get("words", id);
}

export async function addWord(english: string, korean: string): Promise<Word> {
  const word: Word = {
    id: crypto.randomUUID(),
    english,
    korean,
    createdAt: new Date().toISOString(),
    correctCount: 0,
    wrongCount: 0,
    lastCorrectAt: null,
  };
  await (await dbPromise).add("words", word);
  return word;
}

export async function updateWord(word: Word): Promise<void> {
  await (await dbPromise).put("words", word);
}

export async function deleteWord(id: string): Promise<void> {
  await (await dbPromise).delete("words", id);
}
