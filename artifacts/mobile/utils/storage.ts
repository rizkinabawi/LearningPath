import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Types
export interface User {
  id: string;
  name: string;
  goal: string;
  topic: string;
  level: "beginner" | "intermediate" | "advanced";
  createdAt: string;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  userId: string;
  tags?: string[];
  createdAt: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  pathId: string;
  order: number;
  icon?: string;
  createdAt: string;
}

export interface Lesson {
  id: string;
  name: string;
  description: string;
  moduleId: string;
  order: number;
  notes?: string;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  tag: string;
  lessonId: string;
  image?: string;
  createdAt: string;
}

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  answer: string;
  type: "multiple-choice" | "true-false";
  lessonId: string;
  image?: string;
  createdAt: string;
}

export interface Progress {
  id: string;
  userId: string;
  lessonId: string;
  flashcardId?: string;
  quizId?: string;
  isCorrect: boolean;
  userAnswer?: string;
  timestamp: string;
}

export interface Stats {
  totalStudyTime: number;
  totalAnswers: number;
  correctAnswers: number;
  streak: number;
  lastStudyDate: string;
}

const STORAGE_KEYS = {
  USER: "user",
  LEARNING_PATHS: "learning_paths",
  MODULES: "modules",
  LESSONS: "lessons",
  FLASHCARDS: "flashcards",
  QUIZZES: "quizzes",
  PROGRESS: "progress",
  STATS: "stats",
};

export const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getFromStorage = async <T>(key: string): Promise<T[]> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveToStorage = async <T>(key: string, data: T[]) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch {}
};

// User
export const getUser = async (): Promise<User | null> => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const saveUser = async (user: User) => {
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

// Learning Paths
export const getLearningPaths = async (): Promise<LearningPath[]> => {
  return getFromStorage<LearningPath>(STORAGE_KEYS.LEARNING_PATHS);
};

export const saveLearningPath = async (path: LearningPath) => {
  const paths = await getLearningPaths();
  const index = paths.findIndex((p) => p.id === path.id);
  if (index >= 0) paths[index] = path;
  else paths.push(path);
  await saveToStorage(STORAGE_KEYS.LEARNING_PATHS, paths);
};

export const deleteLearningPath = async (id: string) => {
  const paths = await getLearningPaths();
  await saveToStorage(
    STORAGE_KEYS.LEARNING_PATHS,
    paths.filter((p) => p.id !== id)
  );
};

// Modules
export const getModules = async (pathId?: string): Promise<Module[]> => {
  const modules = await getFromStorage<Module>(STORAGE_KEYS.MODULES);
  return pathId ? modules.filter((m) => m.pathId === pathId) : modules;
};

export const saveModule = async (module: Module) => {
  const modules = await getModules();
  const index = modules.findIndex((m) => m.id === module.id);
  if (index >= 0) modules[index] = module;
  else modules.push(module);
  await saveToStorage(STORAGE_KEYS.MODULES, modules);
};

export const deleteModule = async (id: string) => {
  const modules = await getModules();
  await saveToStorage(
    STORAGE_KEYS.MODULES,
    modules.filter((m) => m.id !== id)
  );
};

// Lessons
export const getLessons = async (moduleId?: string): Promise<Lesson[]> => {
  const lessons = await getFromStorage<Lesson>(STORAGE_KEYS.LESSONS);
  return moduleId ? lessons.filter((l) => l.moduleId === moduleId) : lessons;
};

export const saveLesson = async (lesson: Lesson) => {
  const lessons = await getLessons();
  const index = lessons.findIndex((l) => l.id === lesson.id);
  if (index >= 0) lessons[index] = lesson;
  else lessons.push(lesson);
  await saveToStorage(STORAGE_KEYS.LESSONS, lessons);
};

export const deleteLesson = async (id: string) => {
  const lessons = await getLessons();
  await saveToStorage(
    STORAGE_KEYS.LESSONS,
    lessons.filter((l) => l.id !== id)
  );
};

// Flashcards
export const getFlashcards = async (lessonId?: string): Promise<Flashcard[]> => {
  const cards = await getFromStorage<Flashcard>(STORAGE_KEYS.FLASHCARDS);
  return lessonId ? cards.filter((c) => c.lessonId === lessonId) : cards;
};

export const saveFlashcard = async (card: Flashcard) => {
  const cards = await getFlashcards();
  const index = cards.findIndex((c) => c.id === card.id);
  if (index >= 0) cards[index] = card;
  else cards.push(card);
  await saveToStorage(STORAGE_KEYS.FLASHCARDS, cards);
};

export const deleteFlashcard = async (id: string) => {
  const cards = await getFlashcards();
  await saveToStorage(
    STORAGE_KEYS.FLASHCARDS,
    cards.filter((c) => c.id !== id)
  );
};

// Quizzes
export const getQuizzes = async (lessonId?: string): Promise<Quiz[]> => {
  const quizzes = await getFromStorage<Quiz>(STORAGE_KEYS.QUIZZES);
  return lessonId ? quizzes.filter((q) => q.lessonId === lessonId) : quizzes;
};

export const saveQuiz = async (quiz: Quiz) => {
  const quizzes = await getQuizzes();
  const index = quizzes.findIndex((q) => q.id === quiz.id);
  if (index >= 0) quizzes[index] = quiz;
  else quizzes.push(quiz);
  await saveToStorage(STORAGE_KEYS.QUIZZES, quizzes);
};

export const deleteQuiz = async (id: string) => {
  const quizzes = await getQuizzes();
  await saveToStorage(
    STORAGE_KEYS.QUIZZES,
    quizzes.filter((q) => q.id !== id)
  );
};

// Progress & Stats
export const getProgress = async (lessonId?: string): Promise<Progress[]> => {
  const progress = await getFromStorage<Progress>(STORAGE_KEYS.PROGRESS);
  return lessonId ? progress.filter((p) => p.lessonId === lessonId) : progress;
};

export const saveProgress = async (progress: Progress) => {
  const all = await getProgress();
  all.push(progress);
  await saveToStorage(STORAGE_KEYS.PROGRESS, all);
};

export const getWrongAnswers = async (): Promise<Progress[]> => {
  return (await getProgress()).filter((p) => !p.isCorrect);
};

export const getStats = async (): Promise<Stats> => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
  return data
    ? JSON.parse(data)
    : {
        totalStudyTime: 0,
        totalAnswers: 0,
        correctAnswers: 0,
        streak: 0,
        lastStudyDate: "",
      };
};

export const updateStats = async (updates: Partial<Stats>) => {
  const stats = await getStats();
  const updated = { ...stats, ...updates };
  await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
};

export const clearAllData = async () => {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
};
