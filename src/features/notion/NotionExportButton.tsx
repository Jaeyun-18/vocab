import { useState } from "react";
import { getAllWords, updateWord } from "../../db/wordsRepo";
import { exportWordToNotion, syncFingerprint } from "./notionClient";

const DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID;

interface ExportFailure {
  english: string;
  message: string;
}

export function NotionExportButton() {
  const [status, setStatus] = useState<"idle" | "exporting" | "done">("idle");
  const [failures, setFailures] = useState<ExportFailure[]>([]);
  const [exportedCount, setExportedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);

  // Notion has no bulk write endpoint, so every exported word costs one request
  // and the whole export is bounded by Notion's rate limit. Skipping words that
  // Notion already has is what keeps a routine export fast.
  // `force` re-sends everything, which is the way to restore pages deleted in
  // Notion — a skipped word would otherwise stay missing forever.
  async function handleExport(force: boolean) {
    setStatus("exporting");
    setFailures([]);
    const words = await getAllWords();
    const failed: ExportFailure[] = [];
    let succeeded = 0;
    let skipped = 0;

    for (const word of words) {
      const fingerprint = syncFingerprint(word);
      if (!force && word.notionPageId && word.lastSyncedFingerprint === fingerprint) {
        skipped += 1;
        continue;
      }

      try {
        const pageId = await exportWordToNotion(word, DATABASE_ID);
        await updateWord({ ...word, notionPageId: pageId, lastSyncedFingerprint: fingerprint });
        succeeded += 1;
      } catch (e) {
        failed.push({ english: word.english, message: e instanceof Error ? e.message : String(e) });
      }
    }

    setExportedCount(succeeded);
    setSkippedCount(skipped);
    setFailures(failed);
    setStatus("done");
  }

  return (
    <div>
      <button onClick={() => handleExport(false)} disabled={status === "exporting"}>
        {status === "exporting" ? "Notion으로 내보내는 중..." : "Notion으로 내보내기"}
      </button>
      <button
        onClick={() => handleExport(true)}
        disabled={status === "exporting"}
        title="변경 여부와 상관없이 전체 단어를 다시 보냅니다. Notion에서 지운 페이지를 되살릴 때 사용하세요."
      >
        전체 다시 내보내기
      </button>
      {status === "done" && (
        <p role="status">
          {exportedCount}개 내보내기 완료
          {skippedCount > 0 && `, ${skippedCount}개는 변경 없어 건너뜀`}
          {failures.length > 0 && `, ${failures.length}개 실패`}
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
