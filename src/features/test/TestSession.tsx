import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { Word } from "../../types/word";
import { getAllWords, updateWord } from "../../db/wordsRepo";
import { selectHighWrongRateWords, selectRecentWords, shuffle } from "../../utils/selectors";
import { isCorrectAnswer } from "../../utils/grading";
import type { TestDirection, TestMode, TestResultItem } from "./testTypes";

interface Question {
  word: Word;
  direction: TestDirection;
}

function randomDirection(): TestDirection {
  return Math.random() < 0.5 ? "enToKr" : "krToEn";
}

function buildQuestionSet(words: Word[], mode: TestMode): Question[] {
  const selected =
    mode === "recent"
      ? selectRecentWords(words)
      : mode === "highWrongRate"
        ? selectHighWrongRateWords(words)
        : shuffle(words);
  return selected.map((word) => ({ word, direction: randomDirection() }));
}

export function TestSession() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = (searchParams.get("mode") as TestMode) ?? "recent";

  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [results, setResults] = useState<TestResultItem[]>([]);

  useEffect(() => {
    getAllWords().then((words) => setQuestions(buildQuestionSet(words, mode)));
  }, [mode]);

  if (questions === null) return <p>불러오는 중...</p>;

  if (questions.length === 0) {
    return (
      <div>
        <p>이 조건에 해당하는 단어가 없습니다.</p>
        <Link to="/test/setup" className="button">
          테스트 설정으로 돌아가기
        </Link>
      </div>
    );
  }

  const total = questions.length;
  const { word: currentWord, direction } = questions[index];
  const question = direction === "enToKr" ? currentWord.english : currentWord.korean;
  const correctAnswer = direction === "enToKr" ? currentWord.korean : currentWord.english;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const correct = isCorrectAnswer(input, correctAnswer);

    const updated: Word = correct
      ? {
          ...currentWord,
          correctCount: currentWord.correctCount + 1,
          lastCorrectAt: new Date().toISOString(),
        }
      : { ...currentWord, wrongCount: currentWord.wrongCount + 1 };
    await updateWord(updated);

    const nextResults = [
      ...results,
      {
        wordId: currentWord.id,
        english: currentWord.english,
        korean: currentWord.korean,
        direction,
        userAnswer: input,
        correct,
      },
    ];

    setInput("");

    if (index + 1 < total) {
      setResults(nextResults);
      setIndex(index + 1);
    } else {
      navigate("/test/result", { state: { results: nextResults } });
    }
  }

  return (
    <div className="form">
      <p>
        {index + 1} / {total}
      </p>
      <h2>{question}</h2>
      <form onSubmit={handleSubmit}>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={direction === "enToKr" ? "한글 뜻 입력" : "영단어 입력"}
        />
        <button type="submit">제출</button>
      </form>
    </div>
  );
}
