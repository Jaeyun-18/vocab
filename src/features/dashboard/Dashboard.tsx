import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Word } from "../../types/word";
import { getAllWords } from "../../db/wordsRepo";
import { findDuplicateNotionPageIds } from "../../utils/findDuplicateNotionPageIds";
import { NotionExportButton } from "../notion/NotionExportButton";
import { NotionImportButton } from "../notion/NotionImportButton";

export function Dashboard() {
  const [words, setWords] = useState<Word[]>([]);

  useEffect(() => {
    getAllWords().then(setWords);
  }, []);

  function refreshWords() {
    getAllWords().then(setWords);
  }

  const duplicateGroups = useMemo(() => findDuplicateNotionPageIds(words), [words]);

  return (
    <div>
      <p>전체 단어 수: {words.length}개</p>

      {duplicateGroups.length > 0 && (
        <div role="alert">
          <p>
            같은 Notion 페이지를 공유하는 단어가 {duplicateGroups.length}그룹 있습니다. 내보내기 시
            서로 덮어써서 Notion 개수가 줄어듭니다:
          </p>
          <ul>
            {duplicateGroups.map((group) => (
              <li key={group[0].notionPageId}>
                {group.map((w) => w.english).join(", ")} → 같은 페이지 ({group[0].notionPageId})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="toolbar">
        <Link to="/words/new" className="button">
          단어 등록
        </Link>
        <Link to="/words" className="button">
          단어 목록
        </Link>
        <Link to="/test/setup" className="button">
          테스트 시작
        </Link>
        <NotionExportButton />
        <NotionImportButton onImported={refreshWords} />
      </div>
    </div>
  );
}
