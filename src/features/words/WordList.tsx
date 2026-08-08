import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Word } from "../../types/word";
import { deleteWord, getAllWords } from "../../db/wordsRepo";

type SortKey = "recent" | "wrongRate" | "alphabetical";

function wrongRate(word: Word): number {
  const attempts = word.correctCount + word.wrongCount;
  return attempts === 0 ? 0 : word.wrongCount / attempts;
}

export function WordList() {
  const [words, setWords] = useState<Word[]>([]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("recent");

  useEffect(() => {
    getAllWords().then(setWords);
  }, []);

  async function handleDelete(id: string) {
    await deleteWord(id);
    setWords((prev) => prev.filter((w) => w.id !== id));
  }

  const visibleWords = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? words.filter(
          (w) =>
            w.english.toLowerCase().includes(q) || w.korean.toLowerCase().includes(q),
        )
      : words;

    const sorted = [...filtered];
    if (sortKey === "recent") {
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (sortKey === "wrongRate") {
      sorted.sort((a, b) => wrongRate(b) - wrongRate(a));
    } else {
      sorted.sort((a, b) => a.english.localeCompare(b.english));
    }
    return sorted;
  }, [words, query, sortKey]);

  return (
    <div>
      <div className="toolbar">
        <input
          type="text"
          placeholder="검색 (영어/한글)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
          <option value="recent">최근순</option>
          <option value="wrongRate">오답률순</option>
          <option value="alphabetical">알파벳순</option>
        </select>
        <Link to="/words/new" className="button">
          단어 등록
        </Link>
      </div>

      <table>
        <thead>
          <tr>
            <th>English</th>
            <th>한글</th>
            <th>오답</th>
            <th>정답</th>
            <th>마지막 정답</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {visibleWords.map((w) => (
            <tr key={w.id}>
              <td>{w.english}</td>
              <td>{w.korean}</td>
              <td>{w.wrongCount}</td>
              <td>{w.correctCount}</td>
              <td>{w.lastCorrectAt ? new Date(w.lastCorrectAt).toLocaleString() : "-"}</td>
              <td>
                <div className="row-actions">
                  <Link to={`/words/${w.id}/edit`} className="text-action">
                    수정
                  </Link>
                  <button className="text-action" onClick={() => handleDelete(w.id)}>
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {visibleWords.length === 0 && <p>등록된 단어가 없습니다.</p>}
    </div>
  );
}
