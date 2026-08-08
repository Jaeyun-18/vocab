import { useState } from "react";
import { getAllWords, updateWord } from "../../db/wordsRepo";
import { fetchAllWordsFromNotion } from "./notionClient";

const DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID;

export function NotionImportButton({ onImported }: { onImported?: () => void }) {
  const [status, setStatus] = useState<"idle" | "importing" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    setStatus("importing");
    setError(null);
    try {
      const [notionWords, localWords] = await Promise.all([
        fetchAllWordsFromNotion(DATABASE_ID),
        getAllWords(),
      ]);
      const localIdByNotionPageId = new Map(
        localWords.filter((w) => w.notionPageId).map((w) => [w.notionPageId, w.id]),
      );

      // Notion is the source of truth: overwrite the matching local word entirely,
      // or create a new one if this Notion page has never been synced before.
      for (const notionWord of notionWords) {
        const id = localIdByNotionPageId.get(notionWord.notionPageId) ?? crypto.randomUUID();
        await updateWord({ id, ...notionWord });
      }
      setStatus("idle");
      onImported?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  return (
    <div>
      <button onClick={handleImport} disabled={status === "importing"}>
        {status === "importing" ? "Notion에서 가져오는 중..." : "Notion에서 가져오기"}
      </button>
      {status === "error" && <p role="alert">오류: {error}</p>}
    </div>
  );
}
