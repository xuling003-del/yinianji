
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

export interface UserState {
  name: string;
  avatar: string;
  stars: number;
  courseProgress: { [courseId: string]: number[] };
  usedQuestionIds: string[]; // Track questions used across all days
  activeCourseId: string;
  unlockedItems: string[];
  gameSeed: number; // Random seed unique to the user profile
}

export enum View {
  MAP = 'MAP',
  LESSON = 'LESSON',
  STORE = 'STORE',
  PROFILE = 'PROFILE',
  COURSE_SELECT = 'COURSE_SELECT'
}
