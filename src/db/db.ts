import { openDB, type DBSchema } from "idb";
import type { Word } from "../types/word";

interface VocabDB extends DBSchema {
  words: {
    key: string;
    value: Word;
    indexes: { createdAt: string };
  };
}

export const dbPromise = openDB<VocabDB>("vocab-db", 1, {
  upgrade(db) {
    const store = db.createObjectStore("words", { keyPath: "id" });
    store.createIndex("createdAt", "createdAt");
  },
});
