export interface Word {
  id: string;
  english: string;
  korean: string;
  createdAt: string; // ISO datetime
  correctCount: number;
  wrongCount: number;
  lastCorrectAt: string | null; // ISO datetime
  notionPageId?: string;
  // Fingerprint of the values at the last successful export/import. If it still
  // matches the current values, Notion is already up to date and the export can
  // skip this word. See syncFingerprint() in features/notion/notionClient.ts.
  lastSyncedFingerprint?: string;
}
