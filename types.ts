
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

export interface CustomReward {
  id: string;
  name: string;
  probability: number; // 0-100 percentage
}

export interface InventoryItem {
  id: string;
  type: 'sticker' | 'puzzle' | 'custom_coupon';
  name: string;
  icon: string; // Emoji or image URL
  obtainedAt: number;
  isRedeemed?: boolean; // For custom coupons
}

export type DecorationType = 'theme' | 'pet' | 'building';

export interface DecorationItem {
  id: string;
  type: DecorationType;
  name: string;
  icon: string; // Emoji
  cost: number;
  styleClass?: string; // CSS class for background themes
}

export interface ParentSettings {
  questionCounts: Record<QuestionCategory, number>;
  shuffleQuestions: boolean; // true = random order, false = ordered by category
  customRewards: CustomReward[]; // Parent defined rewards
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
  unlockedItems: string[]; // Stores IDs of unlocked avatars AND decorations
  unlockedAchievements: string[]; // List of unlocked card IDs
  inventory: InventoryItem[]; // Collected items from chests
  gameSeed: number; // Random seed unique to the user profile
  
  // New Statistics Fields
  streak: number;
  lastLoginDate: string; // ISO Date String (YYYY-MM-DD)
  statsHistory: { [date: string]: DailyStats };
  lastLevelStats?: LevelStats; // Stores stats of the most recently finished level

  // New Settings Fields
  parentSettings: ParentSettings;

  // Island Decoration State
  activeDecorations: {
    theme: string;
    pet: string;
    building: string;
  };
}

export enum View {
  MAP = 'MAP',
  LESSON = 'LESSON',
  STORE = 'STORE',
  PROFILE = 'PROFILE',
  COURSE_SELECT = 'COURSE_SELECT'
}
