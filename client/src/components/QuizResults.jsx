import { calculateQuizResults } from "../utils/quizUtils";

function QuizResults({
  questions,
  answers,
  onRetry,
  onRestart
}) {
  const {
    correctCount,
    incorrectCount,
    percentage,
    incorrectQuestions
  } = calculateQuizResults(questions, answers);

  return (
    <section className="study-panel results-panel">
      <span className="eyebrow">QUIZ COMPLETED</span>

      <h2>Your Results</h2>

      <div className="score-circle">
        <span>{percentage}%</span>
        <small>Score</small>
      </div>

      <h3>
        You answered {correctCount} out of{" "}
        {questions.length} questions correctly!
      </h3>

      <p className="results-description">
        {percentage === 100
          ? "Excellent work! You got everything right."
          : `You missed ${incorrectCount} question(s). Keep practicing!`}
      </p>

      <div className="results-actions">
        {incorrectQuestions.length > 0 && (
          <button
            className="primary-button"
            onClick={() => onRetry(incorrectQuestions)}
          >
            Retry Incorrect Answers
          </button>
        )}

        <button
          className="secondary-button"
          onClick={onRestart}
        >
          Restart Quiz
        </button>
      </div>
    </section>
  );
}

export default QuizResults;