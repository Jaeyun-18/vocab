import type { Word } from "../../types/word";

const NOTION_VERSION = "2022-06-28";

class NotionApiError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(`Notion API error (${status}): ${body}`);
    this.status = status;
    this.body = body;
  }
}

async function notionFetch(path: string, init?: RequestInit) {
  const res = await fetch(`/api/notion${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new NotionApiError(res.status, await res.text());
  }
  return res.json();
}

// True if the page can no longer be edited because it (or an ancestor) was
// deleted in Notion, which archives the block instead of removing it.
function isArchivedPageError(error: unknown): boolean {
  return error instanceof NotionApiError && /archived/i.test(error.body);
}

function wordToNotionProperties(word: Word) {
  return {
    English: { title: [{ text: { content: word.english } }] },
    Korean: { rich_text: [{ text: { content: word.korean } }] },
    WrongCount: { number: word.wrongCount },
    CorrectCount: { number: word.correctCount },
    LastCorrectAt: word.lastCorrectAt ? { date: { start: word.lastCorrectAt } } : { date: null },
    CreatedAt: { date: { start: word.createdAt } },
  };
}

// Every value wordToNotionProperties sends, in a fixed order. Two words with the
// same fingerprint produce an identical Notion page, so an export can skip the
// request entirely. Keep the field list in sync with wordToNotionProperties —
// a field sent to Notion but missing here would stop triggering re-exports.
export function syncFingerprint(word: Word): string {
  return JSON.stringify([
    word.english,
    word.korean,
    word.wrongCount,
    word.correctCount,
    word.lastCorrectAt,
    word.createdAt,
  ]);
}

// Creates the Notion page on first export, updates it on subsequent exports.
// Returns the Notion page id so the caller can persist it on the local word.
export async function exportWordToNotion(word: Word, databaseId: string): Promise<string> {
  const properties = wordToNotionProperties(word);

  if (word.notionPageId) {
    try {
      await notionFetch(`/v1/pages/${word.notionPageId}`, {
        method: "PATCH",
        body: JSON.stringify({ properties }),
      });
      return word.notionPageId;
    } catch (error) {
      // The page was deleted in Notion (archived, not removed) since the last
      // export. Recreate it as a new page rather than failing the whole export.
      if (!isArchivedPageError(error)) throw error;
    }
  }

  const page = await notionFetch("/v1/pages", {
    method: "POST",
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
  });
  return page.id as string;
}

export type ImportedWord = Omit<Word, "id"> & { notionPageId: string };

function notionPageToWord(page: any): ImportedWord {
  const props = page.properties;
  return {
    notionPageId: page.id,
    english: props.English?.title?.[0]?.plain_text ?? "",
    korean: props.Korean?.rich_text?.[0]?.plain_text ?? "",
    wrongCount: props.WrongCount?.number ?? 0,
    correctCount: props.CorrectCount?.number ?? 0,
    lastCorrectAt: props.LastCorrectAt?.date?.start ?? null,
    createdAt: props.CreatedAt?.date?.start ?? new Date().toISOString(),
  };
}

// Fetches every page in the database, following pagination.
export async function fetchAllWordsFromNotion(databaseId: string): Promise<ImportedWord[]> {
  const words: ImportedWord[] = [];
  let cursor: string | undefined;

  do {
    const res = await notionFetch(`/v1/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
    });
    words.push(...res.results.map(notionPageToWord));
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return words;
}
