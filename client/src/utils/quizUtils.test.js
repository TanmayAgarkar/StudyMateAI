import { calculateQuizResults } from "./quizUtils.js";

const questions = [
  {
    id: 1,
    correctAnswer: 1
  },
  {
    id: 2,
    correctAnswer: 2
  },
  {
    id: 3,
    correctAnswer: 0
  }
];

function runTests() {
  // Test 1: All answers correct

  const test1 = calculateQuizResults(questions, {
    1: 1,
    2: 2,
    3: 0
  });

  console.assert(
    test1.percentage === 100,
    "Test 1 failed"
  );

  // Test 2: All answers incorrect

  const test2 = calculateQuizResults(questions, {
    1: 0,
    2: 0,
    3: 1
  });

  console.assert(
    test2.percentage === 0,
    "Test 2 failed"
  );

  // Test 3: Two answers correct

  const test3 = calculateQuizResults(questions, {
    1: 1,
    2: 0,
    3: 0
  });

  console.assert(
    test3.correctCount === 2,
    "Test 3 failed"
  );

  console.assert(
    test3.incorrectQuestions.length === 1,
    "Test 3 incorrect question count"
  );

  // Test 4: Empty quiz

  const test4 = calculateQuizResults([], {});

  console.assert(
    test4.percentage === 0,
    "Test 4 failed"
  );

  // Test 5: Unanswered question

  const test5 = calculateQuizResults(questions, {
    1: 1,
    2: 2
  });

  console.assert(
    test5.correctCount === 2,
    "Test 5 failed"
  );

  console.log("Quiz tests completed.");
}

runTests();