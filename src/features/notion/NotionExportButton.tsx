import { useState } from "react";
import { getAllWords, updateWord } from "../../db/wordsRepo";
import { exportWordToNotion } from "./notionClient";

const DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID;

interface ExportFailure {
  english: string;
  message: string;
}

export function NotionExportButton() {
  const [status, setStatus] = useState<"idle" | "exporting" | "done">("idle");
  const [failures, setFailures] = useState<ExportFailure[]>([]);
  const [exportedCount, setExportedCount] = useState(0);

  async function handleExport() {
    setStatus("exporting");
    setFailures([]);
    const words = await getAllWords();
    const failed: ExportFailure[] = [];
    let succeeded = 0;

    for (const word of words) {
      try {
        const pageId = await exportWordToNotion(word, DATABASE_ID);
        if (word.notionPageId !== pageId) {
          await updateWord({ ...word, notionPageId: pageId });
        }
        succeeded += 1;
      } catch (e) {
        failed.push({ english: word.english, message: e instanceof Error ? e.message : String(e) });
      }
    }

    setExportedCount(succeeded);
    setFailures(failed);
    setStatus("done");
  }

  return (
    <div>
      <button onClick={handleExport} disabled={status === "exporting"}>
        {status === "exporting" ? "Notion으로 내보내는 중..." : "Notion으로 내보내기"}
      </button>
      {status === "done" && (
        <p role="status">
          {exportedCount}개 내보내기 완료{failures.length > 0 && `, ${failures.length}개 실패`}
        </p>
      )}
      {failures.length > 0 && (
        <ul role="alert">
          {failures.map((f) => (
            <li key={f.english}>
              {f.english}: {f.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
