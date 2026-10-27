export function calculateQuizResults(questions, answers) {
  if (!questions.length) {
    return {
      correctCount: 0,
      incorrectCount: 0,
      percentage: 0,
      incorrectQuestions: []
    };
  }

  const incorrectQuestions = questions.filter(
    (question) =>
      answers[question.id] !== question.correctAnswer
  );

  const incorrectCount = incorrectQuestions.length;

  const correctCount = questions.length - incorrectCount;

  const percentage = Math.round(
    (correctCount / questions.length) * 100
  );

  return {
    correctCount,
    incorrectCount,
    percentage,
    incorrectQuestions
  };
}