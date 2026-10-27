import { useState } from "react";

function Flashcard({ flashcards }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards.length) {
    return <p>No flashcards available.</p>;
  }

  const currentCard = flashcards[currentIndex];

  function nextCard() {
    setCurrentIndex((previous) =>
      Math.min(previous + 1, flashcards.length - 1)
    );

    setIsFlipped(false);
  }

  function previousCard() {
    setCurrentIndex((previous) =>
      Math.max(previous - 1, 0)
    );

    setIsFlipped(false);
  }

  return (
    <section className="study-panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">FLASHCARDS</span>
          <h2>Review key concepts</h2>
        </div>

        <span className="counter">
          {currentIndex + 1} / {flashcards.length}
        </span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${
              ((currentIndex + 1) / flashcards.length) * 100
            }%`
          }}
        />
      </div>

      <button
        className={`flashcard ${isFlipped ? "flipped" : ""}`}
        onClick={() => setIsFlipped(!isFlipped)}
        aria-pressed={isFlipped}
        aria-label={
          isFlipped ? "Show question" : "Show answer"
        }
      >
        <span className="card-label">
          {isFlipped ? "ANSWER" : "QUESTION"}
        </span>

        <span className="card-content">
          {isFlipped
            ? currentCard.answer
            : currentCard.question}
        </span>

        <span className="card-hint">
          Click to flip
        </span>
      </button>

      <div className="navigation-buttons">
        <button
          className="secondary-button"
          onClick={previousCard}
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>

        <button
          className="primary-button"
          onClick={nextCard}
          disabled={currentIndex === flashcards.length - 1}
        >
          Next →
        </button>
      </div>
    </section>
  );
}

export default Flashcard;
