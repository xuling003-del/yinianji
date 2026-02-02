
export type Subject = 'Math' | 'Chinese' | 'English' | 'General';
export type QuestionCategory = 'basic' | 'application' | 'logic' | 'sentence' | 'word';

export interface Question {
  id: string;
  category: QuestionCategory;
  type: 'multiple-choice' | 'unscramble' | 'fill-in-the-blank';
  text: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface Lesson {
  day: number;
  title: string;
  icon: string;
  story: string;
  questions: Question[];
  points: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface DailyStats {
  date: string;
  timeSpentSeconds: number;
  mistakes: number;
  mistakesByCategory: Record<QuestionCategory, number>;
  totalQuestionsByCategory: Record<QuestionCategory, number>;
}

export interface LevelStats {
  day: number;
  timeSpent: number;
  mistakesByCat: Record<QuestionCategory, number>;
  maxCombo: number; // Maximum consecutive correct answers
  timestamp: number;
}

export interface ParentSettings {
  questionCounts: Record<QuestionCategory, number>;
  shuffleQuestions: boolean; // true = random order, false = ordered by category
}

export interface AchievementCard {
  id: string;
  title: string;
  conditionText: string;
  icon: string;
  message: string;
  colorClass: string; // Tailwind classes for background/border
}

export interface UserState {
  name: string;
  avatar: string;
  stars: number;
  courseProgress: { [courseId: string]: number[] };
  usedQuestionIds: string[]; // Track questions used across all days
  activeCourseId: string;
  unlockedItems: string[];
  unlockedAchievements: string[]; // List of unlocked card IDs
  gameSeed: number; // Random seed unique to the user profile
  
  // New Statistics Fields
  streak: number;
  lastLoginDate: string; // ISO Date String (YYYY-MM-DD)
  statsHistory: { [date: string]: DailyStats };
  lastLevelStats?: LevelStats; // Stores stats of the most recently finished level

  // New Settings Fields
  parentSettings: ParentSettings;
}

export enum View {
  MAP = 'MAP',
  LESSON = 'LESSON',
  STORE = 'STORE',
  PROFILE = 'PROFILE',
  COURSE_SELECT = 'COURSE_SELECT'
}
