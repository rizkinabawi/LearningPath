export interface PromptTemplate {
  id: string;
  topic: string;
  type: string;
  title: string;
  template: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "prog-fc",
    topic: "Programming",
    type: "Flashcards",
    title: "Concepts & Syntax",
    template:
      "Create 10 flashcards about [TOPIC]. Focus on core concepts, syntax, and common pitfalls. Format each as Question: ... Answer: ...",
  },
  {
    id: "prog-qz",
    topic: "Programming",
    type: "Quiz",
    title: "Multiple Choice Quiz",
    template:
      "Generate a 5-question multiple choice quiz about [TOPIC]. Include 4 options per question and mark the correct one. Difficulty: Intermediate.",
  },
  {
    id: "lang-fc",
    topic: "Language",
    type: "Flashcards",
    title: "Vocabulary & Phrases",
    template:
      "Create 15 vocabulary flashcards for learning [TOPIC]. Include the word, its meaning, and an example sentence. Format: Word - Meaning (Example).",
  },
  {
    id: "science-sum",
    topic: "Science",
    type: "Summary",
    title: "Key Principles",
    template:
      "Summarize the key principles and laws of [TOPIC] in bullet points. Explain each principle simply as if for a beginner.",
  },
  {
    id: "math-qz",
    topic: "Math",
    type: "Quiz",
    title: "Problem Solving",
    template:
      "Create 5 math problems related to [TOPIC] with step-by-step solutions. Start with simple problems and increase complexity.",
  },
  {
    id: "hist-fc",
    topic: "History",
    type: "Flashcards",
    title: "Dates & Events",
    template:
      "Generate 10 flashcards about major events, dates, and figures in [TOPIC] history. Format: Date/Figure - Significance.",
  },
  {
    id: "gen-qz",
    topic: "General",
    type: "Quiz",
    title: "General Knowledge",
    template:
      "Create a general knowledge quiz about [TOPIC] with 10 questions and answers.",
  },
];

export const generatePrompt = (template: string, topic: string) =>
  template.replace(/\[TOPIC\]/g, topic);
