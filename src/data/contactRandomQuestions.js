/** Placeholder pool — replace or extend when final questions are ready. */
export const CONTACT_RANDOM_QUESTIONS = [
  'What is your most memorable setback?',
  'What skill are you most proud of?',
  "What's one thing you'd build if time wasn't a limit?",
  'Who inspired your career path?',
  "What's one thing you changed your mind about recently?",
]

export function pickRandomContactQuestion() {
  const index = Math.floor(Math.random() * CONTACT_RANDOM_QUESTIONS.length)
  return CONTACT_RANDOM_QUESTIONS[index]
}
