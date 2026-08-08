import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TestDirection, TestMode } from "./testTypes";

export function TestSetup() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<TestMode>("recent");
  const [direction, setDirection] = useState<TestDirection>("enToKr");

  function handleStart() {
    navigate(`/test/session?mode=${mode}&direction=${direction}`);
  }

  return (
    <div className="form">
      <h2>테스트 설정</h2>

      <fieldset>
        <legend>대상 단어</legend>
        <label>
          <input
            type="radio"
            name="mode"
            checked={mode === "recent"}
            onChange={() => setMode("recent")}
          />
          최근 등록한 단어
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            checked={mode === "highWrongRate"}
            onChange={() => setMode("highWrongRate")}
          />
          오답률 높은 단어
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            checked={mode === "all"}
            onChange={() => setMode("all")}
          />
          전체 단어
        </label>
      </fieldset>

      <fieldset>
        <legend>출제 방향</legend>
        <label>
          <input
            type="radio"
            name="direction"
            checked={direction === "enToKr"}
            onChange={() => setDirection("enToKr")}
          />
          영어 → 한글
        </label>
        <label>
          <input
            type="radio"
            name="direction"
            checked={direction === "krToEn"}
            onChange={() => setDirection("krToEn")}
          />
          한글 → 영어
        </label>
      </fieldset>

      <button onClick={handleStart}>테스트 시작</button>
    </div>
  );
}
