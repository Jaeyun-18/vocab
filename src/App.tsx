import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { Dashboard } from "./features/dashboard/Dashboard";
import { WordList } from "./features/words/WordList";
import { WordForm } from "./features/words/WordForm";
import { TestSetup } from "./features/test/TestSetup";
import { TestSession } from "./features/test/TestSession";
import { TestResult } from "./features/test/TestResult";

export default function App() {
  return (
    <BrowserRouter>
      <header className="app-header">
        <Link to="/" className="app-title">
          단어장
        </Link>
        <nav>
          <Link to="/words">단어 목록</Link>
          <Link to="/test/setup">테스트</Link>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/words" element={<WordList />} />
          <Route path="/words/new" element={<WordForm />} />
          <Route path="/words/:id/edit" element={<WordForm />} />
          <Route path="/test/setup" element={<TestSetup />} />
          <Route path="/test/session" element={<TestSession />} />
          <Route path="/test/result" element={<TestResult />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
