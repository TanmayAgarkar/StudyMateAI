import { z } from 'zod';

const text = { type: 'string', minLength: 1, maxLength: 2000, pattern: '\\S' };
const list = (properties, required) => ({
  type: 'array', minItems: 1, maxItems: 10,
  items: { type: 'object', additionalProperties: false, properties, required }
});

// JSON Schema guides Gemini; the Zod schema below validates its reply locally.
export const studySchema = {
  type: 'object', additionalProperties: false,
  properties: {
    flashcards: list({ question: text, answer: text }, ['question', 'answer']),
    quiz: list({
      question: text,
      options: { type: 'array', minItems: 4, maxItems: 4, items: text },
      correctAnswer: { type: 'integer', minimum: 0, maximum: 3 }
    }, ['question', 'options', 'correctAnswer'])
  },
  required: ['flashcards', 'quiz']
};

const nonEmptyText = z.string().trim().min(1).max(2000);
const card = z.object({ question: nonEmptyText, answer: nonEmptyText }).strict();
const question = z.object({
  question: nonEmptyText,
  options: z.array(nonEmptyText).length(4).refine(
    options => new Set(options.map(option => option.toLowerCase())).size === 4,
    'Options must be distinct.'
  ),
  correctAnswer: z.number().int().min(0).max(3)
}).strict();
export const studyResponseSchema = z.object({
  flashcards: z.array(card).min(1).max(10),
  quiz: z.array(question).min(1).max(10)
}).strict();

export function validateStudyData(data) {
  const result = studyResponseSchema.safeParse(data);
  if (!result.success) {
    throw new Error('Invalid study data');
  }
  data = result.data;
  // IDs come from our server so quiz answer keys are always unique.
  return {
    flashcards: data.flashcards.map((card, index) => ({ ...card, id: index + 1 })),
    quiz: data.quiz.map((question, index) => ({ ...question, id: index + 1 }))
  };
}
