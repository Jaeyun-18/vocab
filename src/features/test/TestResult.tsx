import { Link, useLocation } from "react-router-dom";
import type { TestResultItem } from "./testTypes";

export function TestResult() {
  const location = useLocation();
  const results = (location.state as { results?: TestResultItem[] } | null)?.results;

  if (!results) {
    return (
      <div>
        <p>결과 정보가 없습니다.</p>
        <Link to="/test/setup" className="button">
          테스트 설정으로 돌아가기
        </Link>
      </div>
    );
  }

  const correctCount = results.filter((r) => r.correct).length;
  const wrongResults = results.filter((r) => !r.correct);

  return (
    <div>
      <h2>
        결과: {correctCount} / {results.length} 정답
      </h2>

      {wrongResults.length > 0 && (
        <>
          <h3>틀린 단어</h3>
          <table>
            <thead>
              <tr>
                <th>English</th>
                <th>한글</th>
                <th>내 답</th>
              </tr>
            </thead>
            <tbody>
              {wrongResults.map((r, i) => (
                <tr key={i}>
                  <td>{r.english}</td>
                  <td>{r.korean}</td>
                  <td>{r.userAnswer || "(빈 답)"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <div className="toolbar">
        <Link to="/test/setup" className="button">
          다시 테스트
        </Link>
        <Link to="/words" className="button">
          단어 목록으로
        </Link>
      </div>
    </div>
  );
}
