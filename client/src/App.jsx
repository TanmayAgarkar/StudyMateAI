import { useEffect, useRef, useState } from "react";
import { createGenerationClient } from "./utils/generation";

import Navbar from "./components/Navbar";
import NotesInput from "./components/NotesInput";
import Flashcard from "./components/Flashcard";
import Quiz from "./components/Quiz";
import QuizResults from "./components/QuizResults";

import "./App.css";

function App() {
  const [studyData, setStudyData] = useState(null);
  const [activeTab, setActiveTab] = useState("flashcards");

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState(null);
  const [quizSession, setQuizSession] = useState(0);

  const [{ isLoading, error }, setGenerationState] = useState({ isLoading: false, error: "" });
  const generation = useRef(null);

  useEffect(() => {
    const client = createGenerationClient({
      onState: setGenerationState,
      onSuccess(data) {
        setStudyData(data);
        setActiveTab("flashcards");
        setQuizQuestions(data.quiz);
        setQuizAnswers(null);
        setQuizSession(previous => previous + 1);
      }
    });
    generation.current = client;
    return () => client.dispose();
  }, []);

  function handleGenerate(notes) {
    return generation.current?.generate(notes);
  }
  function handleRetry(incorrectQuestions) {
    setQuizQuestions(incorrectQuestions);
    setQuizAnswers(null);
    setQuizSession((previous) => previous + 1);
  }

  function handleRestart() {
    setQuizQuestions(studyData.quiz);
    setQuizAnswers(null);
    setQuizSession((previous) => previous + 1);
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
  }

  return (
    <div className="app">
      <Navbar />

      <main className="main-container">
        <section className="hero">
          <span className="hero-badge">
            ✨ LEARN SMARTER WITH AI
          </span>

          <h1>
            Turn your notes into
            <span> knowledge.</span>
          </h1>

          <p>
            Transform study material into interactive
            flashcards and quizzes that make learning
            more engaging.
          </p>
        </section>

        <NotesInput onGenerate={handleGenerate} isLoading={isLoading} error={error} onRetry={() => generation.current?.retry()} />

        {studyData && (
          <section className="study-section">
            <div className="tab-navigation">
              <button
                className={
                  activeTab === "flashcards" ? "active" : ""
                }
                onClick={() => handleTabChange("flashcards")}
              >
                📚 Flashcards
              </button>

              <button
                className={
                  activeTab === "quiz" ? "active" : ""
                }
                onClick={() => handleTabChange("quiz")}
              >
                🧠 Practice Quiz
              </button>
            </div>

            {activeTab === "flashcards" && (
              <Flashcard
                key={quizSession}
                flashcards={studyData.flashcards}
              />
            )}

            {activeTab === "quiz" && (
              quizAnswers === null ? (
                <Quiz
                  key={quizSession}
                  questions={quizQuestions}
                  onComplete={setQuizAnswers}
                />
              ) : (
                <QuizResults
                  questions={quizQuestions}
                  answers={quizAnswers}
                  onRetry={handleRetry}
                  onRestart={handleRestart}
                />
              )
            )}
          </section>
        )}

        <footer className="footer">
          StudyMate AI · Learn smarter, remember longer.
        </footer>
      </main>
    </div>
  );
}

export default App;
