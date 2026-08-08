import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Word } from "../../types/word";
import { getAllWords } from "../../db/wordsRepo";
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

  return (
    <div>
      <p>전체 단어 수: {words.length}개</p>

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
