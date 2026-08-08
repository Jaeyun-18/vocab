import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TestMode } from "./testTypes";

export function TestSetup() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<TestMode>("recent");

  function handleStart() {
    navigate(`/test/session?mode=${mode}`);
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

      <button onClick={handleStart}>테스트 시작</button>
    </div>
  );
}
