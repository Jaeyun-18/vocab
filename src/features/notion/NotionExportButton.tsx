import { useState } from "react";
import { getAllWords, updateWord } from "../../db/wordsRepo";
import { exportWordToNotion } from "./notionClient";

const DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID;

export function NotionExportButton() {
  const [status, setStatus] = useState<"idle" | "exporting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setStatus("exporting");
    setError(null);
    try {
      const words = await getAllWords();
      for (const word of words) {
        const pageId = await exportWordToNotion(word, DATABASE_ID);
        if (word.notionPageId !== pageId) {
          await updateWord({ ...word, notionPageId: pageId });
        }
      }
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  return (
    <div>
      <button onClick={handleExport} disabled={status === "exporting"}>
        {status === "exporting" ? "Notion으로 내보내는 중..." : "Notion으로 내보내기"}
      </button>
      {status === "done" && <p>내보내기 완료</p>}
      {status === "error" && <p role="alert">오류: {error}</p>}
    </div>
  );
}
