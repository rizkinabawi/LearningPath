export interface PromptTemplate {
  id: string;
  topic: string;
  type: "quiz" | "flashcard";
  title: string;
  description: string;
  template: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "fc-concepts",
    topic: "Umum",
    type: "flashcard",
    title: "Konsep & Definisi",
    description: "Flashcard konsep inti dan definisi",
    template: `Buatkan 10 flashcard tentang [TOPIC] untuk level [LEVEL].
Fokus pada konsep inti, definisi, dan contoh nyata.
Output harus dalam format JSON berikut (tanpa teks lain di luar JSON):

{
  "type": "flashcard",
  "topic": "[TOPIC]",
  "difficulty": "[LEVEL]",
  "items": [
    {
      "front": "Pertanyaan atau istilah di sini",
      "back": "Jawaban atau definisi lengkap di sini",
      "image": null
    }
  ]
}`,
  },
  {
    id: "fc-vocab",
    topic: "Bahasa",
    type: "flashcard",
    title: "Kosakata & Frasa",
    description: "Flashcard kosakata dan frasa penting",
    template: `Buatkan 15 flashcard kosakata untuk belajar [TOPIC], level [LEVEL].
Sertakan kata, makna, dan contoh kalimat.
Output harus dalam format JSON berikut:

{
  "type": "flashcard",
  "topic": "[TOPIC]",
  "difficulty": "[LEVEL]",
  "items": [
    {
      "front": "Kata atau frasa",
      "back": "Makna + contoh kalimat: '...'",
      "image": null
    }
  ]
}`,
  },
  {
    id: "fc-dates",
    topic: "Sejarah",
    type: "flashcard",
    title: "Tanggal & Peristiwa",
    description: "Flashcard peristiwa historis penting",
    template: `Buatkan 10 flashcard tentang peristiwa, tanggal, dan tokoh penting dalam [TOPIC], level [LEVEL].
Output harus dalam format JSON berikut:

{
  "type": "flashcard",
  "topic": "[TOPIC]",
  "difficulty": "[LEVEL]",
  "items": [
    {
      "front": "Tanggal / Tokoh / Peristiwa",
      "back": "Penjelasan dan dampaknya",
      "image": null
    }
  ]
}`,
  },
  {
    id: "qz-mcq",
    topic: "Umum",
    type: "quiz",
    title: "Pilihan Ganda",
    description: "Quiz pilihan ganda dengan 4 opsi",
    template: `Buatkan quiz pilihan ganda 10 soal tentang [TOPIC], level [LEVEL].
Setiap soal memiliki 4 pilihan (A, B, C, D) dan satu jawaban benar.
Output harus dalam format JSON berikut:

{
  "type": "quiz",
  "topic": "[TOPIC]",
  "difficulty": "[LEVEL]",
  "items": [
    {
      "question": "Pertanyaan di sini?",
      "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
      "answer": "Pilihan A",
      "explanation": "Penjelasan mengapa jawaban ini benar",
      "image": null
    }
  ]
}`,
  },
  {
    id: "qz-prog",
    topic: "Programming",
    type: "quiz",
    title: "Kode & Syntax",
    description: "Quiz konsep programming dan syntax",
    template: `Buatkan 8 soal quiz tentang [TOPIC] untuk level [LEVEL].
Campurkan soal konseptual dan soal tentang output kode.
Output harus dalam format JSON berikut:

{
  "type": "quiz",
  "topic": "[TOPIC]",
  "difficulty": "[LEVEL]",
  "items": [
    {
      "question": "Apa output dari kode berikut?\n[kode]",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "answer": "Opsi A",
      "explanation": "Karena...",
      "image": null
    }
  ]
}`,
  },
  {
    id: "qz-math",
    topic: "Matematika",
    type: "quiz",
    title: "Soal & Pemecahan",
    description: "Quiz pemecahan soal matematika",
    template: `Buatkan 8 soal matematika tentang [TOPIC] untuk level [LEVEL].
Mulai dari soal mudah dan tingkatkan kesulitannya secara bertahap.
Output harus dalam format JSON berikut:

{
  "type": "quiz",
  "topic": "[TOPIC]",
  "difficulty": "[LEVEL]",
  "items": [
    {
      "question": "Soal matematika di sini",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "answer": "Opsi A",
      "explanation": "Langkah penyelesaian: ...",
      "image": null
    }
  ]
}`,
  },
];

export function generatePrompt(
  template: string,
  topic: string,
  level: string
): string {
  return template
    .replace(/\[TOPIC\]/g, topic)
    .replace(/\[LEVEL\]/g, level);
}
