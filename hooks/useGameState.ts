
import { useState, useEffect } from 'react';
import { UserState } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { getTodayStr } from '../utils/helpers';

export function useGameState() {
  const [user, setUser] = useState<UserState>(() => {
    const s = localStorage.getItem('quest_island_v10');
    if (s) {
      const parsed = JSON.parse(s);
      // Backfill new properties for existing users
      return {
        ...parsed,
        streak: parsed.streak || 0,
        lastLoginDate: parsed.lastLoginDate || '',
        statsHistory: parsed.statsHistory || {},
        // Deep merge parent settings to ensure new categories appear
        parentSettings: {
          ...DEFAULT_SETTINGS,
          ...parsed.parentSettings,
          questionCounts: {
            ...DEFAULT_SETTINGS.questionCounts,
            ...(parsed.parentSettings?.questionCounts || {})
          }
        },
        unlockedAchievements: parsed.unlockedAchievements || [],
        inventory: parsed.inventory || [],
        // New stats backfill
        consecutivePerfectLevels: parsed.consecutivePerfectLevels || 0,
        totalTimeSpent: parsed.totalTimeSpent || 0,
        totalCorrectAnswers: parsed.totalCorrectAnswers || 0,
        // Smart Learning
        mistakeQueue: parsed.mistakeQueue || [],
        pendingMistakes: parsed.pendingMistakes || [],
        // Update: Default fallback for decorations is now empty for pet/building
        activeDecorations: parsed.activeDecorations || { theme: 'theme_sky', pet: '', building: '' },
        currentSession: parsed.currentSession
      };
    }
    return { 
      name: '超级探险家', 
      avatar: '🐱', 
      stars: 0, 
      courseProgress: { 'main': [] }, 
      usedQuestionIds: [], 
      activeCourseId: 'main', 
      // Update: Removed specific pet/building from explicit unlock list (since cost 0 items are auto-unlocked logic-wise in Store)
      // but keeping theme_sky and cat as base.
      unlockedItems: ['cat', 'theme_sky'], 
      unlockedAchievements: [],
      inventory: [],
      gameSeed: Math.floor(Math.random() * 1000000),
      streak: 0,
      lastLoginDate: '',
      statsHistory: {},
      parentSettings: DEFAULT_SETTINGS,
      // New stats init
      consecutivePerfectLevels: 0,
      totalTimeSpent: 0,
      totalCorrectAnswers: 0,
      // Smart Learning
      mistakeQueue: [],
      pendingMistakes: [],
      // Update: Initial state has no active pet or building
      activeDecorations: { theme: 'theme_sky', pet: '', building: '' },
      currentSession: undefined
    };
  });

  // Streak Calculation Logic
  useEffect(() => {
    const today = getTodayStr();
    if (user.lastLoginDate !== today) {
      let newStreak = user.streak;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (user.lastLoginDate === yesterdayStr) {
        newStreak += 1; // Consecutive day
      } else if (user.lastLoginDate < yesterdayStr) {
        newStreak = 1; // Break in streak or first time
      } else if (user.streak === 0) {
        newStreak = 1; // First day ever
      }
      
      setUser(prev => ({
        ...prev,
        lastLoginDate: today,
        streak: newStreak
      }));
    }
  }, []); // Only run on mount to check streak

  useEffect(() => localStorage.setItem('quest_island_v10', JSON.stringify(user)), [user]);

  return { user, setUser };
}
