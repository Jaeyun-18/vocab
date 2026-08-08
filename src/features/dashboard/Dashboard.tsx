import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Word } from "../../types/word";
import { getAllWords } from "../../db/wordsRepo";
import { selectHighWrongRateWords, selectRecentWords } from "../../utils/selectors";
import { NotionExportButton } from "../notion/NotionExportButton";

export function Dashboard() {
  const [words, setWords] = useState<Word[]>([]);

  useEffect(() => {
    getAllWords().then(setWords);
  }, []);

  const recentPreview = selectRecentWords(words).slice(0, 5);
  const highWrongRatePreview = selectHighWrongRateWords(words).slice(0, 5);

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
      </div>

      <NotionExportButton />

      <h3>최근 등록한 단어</h3>
      {recentPreview.length === 0 ? (
        <p>등록된 단어가 없습니다.</p>
      ) : (
        <ul>
          {recentPreview.map((w) => (
            <li key={w.id}>
              {w.english} - {w.korean}
            </li>
          ))}
        </ul>
      )}

      <h3>오답률 높은 단어</h3>
      {highWrongRatePreview.length === 0 ? (
        <p>아직 테스트 기록이 없습니다.</p>
      ) : (
        <ul>
          {highWrongRatePreview.map((w) => (
            <li key={w.id}>
              {w.english} - {w.korean} (오답 {w.wrongCount}회)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
