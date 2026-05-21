/** Placeholder pool — replace or extend when final questions are ready. */
export const CONTACT_RANDOM_QUESTIONS = [
  'What is your most memorable setback?',
  "What's one thing you changed your mind about recently?",
  'What project are you most proud of and why?',
  'If you could learn one skill overnight, what would it be?',
  'What problem do you wish more people were working on?',
]

export function pickRandomContactQuestion() {
  const index = Math.floor(Math.random() * CONTACT_RANDOM_QUESTIONS.length)
  return CONTACT_RANDOM_QUESTIONS[index]
}
