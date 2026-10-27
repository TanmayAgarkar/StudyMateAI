import { useState } from "react";

function Quiz({ questions, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  if (!questions.length) {
    return <p>No quiz questions available.</p>;
  }

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentQuestion.id];

  function selectAnswer(optionIndex) {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: optionIndex
    }));
  }

  function handleNext() {
    if (selectedAnswer === undefined) {
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((previous) => previous + 1);
    } else {
      onComplete(answers);
    }
  }

  return (
    <section className="study-panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">PRACTICE QUIZ</span>
          <h2>Test your knowledge</h2>
        </div>

        <span className="counter">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${
              ((currentIndex + 1) / questions.length) * 100
            }%`
          }}
        />
      </div>

      <div className="question-card">
        <h3>{currentQuestion.question}</h3>

        <div className="options-list">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${
                selectedAnswer === index ? "selected" : ""
              }`}
              onClick={() => selectAnswer(index)}
              aria-pressed={selectedAnswer === index}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + index)}
              </span>

              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="navigation-buttons">
        <button
          className="secondary-button"
          onClick={() =>
            setCurrentIndex((previous) =>
              Math.max(previous - 1, 0)
            )
          }
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>

        <button
          className="primary-button"
          onClick={handleNext}
          disabled={selectedAnswer === undefined}
        >
          {currentIndex === questions.length - 1
            ? "Submit Quiz"
            : "Next Question →"}
        </button>
      </div>
    </section>
  );
}

export default Quiz;
