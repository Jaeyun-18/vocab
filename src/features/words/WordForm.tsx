import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Word } from "../../types/word";
import { addWord, getAllWords, getWord, updateWord } from "../../db/wordsRepo";

export function WordForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [english, setEnglish] = useState("");
  const [korean, setKorean] = useState("");
  const [addedCount, setAddedCount] = useState(0);
  const [existingWords, setExistingWords] = useState<Word[]>([]);
  const englishInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(id);

  useEffect(() => {
    getAllWords().then(setExistingWords);
  }, []);

  useEffect(() => {
    if (!id) return;
    getWord(id).then((word) => {
      if (word) {
        setEnglish(word.english);
        setKorean(word.korean);
      }
    });
  }, [id]);

  const isDuplicate = useMemo(() => {
    const normalized = english.trim().toLowerCase();
    if (!normalized) return false;
    return existingWords.some((w) => w.id !== id && w.english.trim().toLowerCase() === normalized);
  }, [english, existingWords, id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!english.trim() || !korean.trim()) return;

    if (id) {
      const existing = await getWord(id);
      if (existing) {
        await updateWord({ ...existing, english: english.trim(), korean: korean.trim() });
      }
      navigate("/words");
      return;
    }

    const word = await addWord(english.trim(), korean.trim());
    setExistingWords((prev) => [...prev, word]);
    setAddedCount((count) => count + 1);
    setEnglish("");
    setKorean("");
    englishInputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>{isEditing ? "단어 수정" : "단어 등록"}</h2>
      <label>
        English
        <input
          ref={englishInputRef}
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          required
        />
        {isDuplicate && <p role="alert">이미 존재하는 단어입니다.</p>}
      </label>
      <label>
        한글 뜻
        <input value={korean} onChange={(e) => setKorean(e.target.value)} required />
      </label>
      <button type="submit">{isEditing ? "수정 저장" : "등록"}</button>
      {!isEditing && addedCount > 0 && <p role="status">지금까지 {addedCount}개 등록했습니다.</p>}
    </form>
  );
}
