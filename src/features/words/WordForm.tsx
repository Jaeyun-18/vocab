import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addWord, getWord, updateWord } from "../../db/wordsRepo";

export function WordForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [english, setEnglish] = useState("");
  const [korean, setKorean] = useState("");
  const isEditing = Boolean(id);

  useEffect(() => {
    if (!id) return;
    getWord(id).then((word) => {
      if (word) {
        setEnglish(word.english);
        setKorean(word.korean);
      }
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!english.trim() || !korean.trim()) return;

    if (id) {
      const existing = await getWord(id);
      if (existing) {
        await updateWord({ ...existing, english: english.trim(), korean: korean.trim() });
      }
    } else {
      await addWord(english.trim(), korean.trim());
    }
    navigate("/words");
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>{isEditing ? "단어 수정" : "단어 등록"}</h2>
      <label>
        English
        <input value={english} onChange={(e) => setEnglish(e.target.value)} required />
      </label>
      <label>
        한글 뜻
        <input value={korean} onChange={(e) => setKorean(e.target.value)} required />
      </label>
      <button type="submit">{isEditing ? "수정 저장" : "등록"}</button>
    </form>
  );
}
