
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
        parentSettings: parsed.parentSettings || DEFAULT_SETTINGS,
        unlockedAchievements: parsed.unlockedAchievements || [],
        inventory: parsed.inventory || [],
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
      unlockedItems: ['cat', 'theme_sky', 'pet_bird', 'build_tent'], // Unlock defaults
      unlockedAchievements: [],
      inventory: [],
      gameSeed: Math.floor(Math.random() * 1000000),
      streak: 0,
      lastLoginDate: '',
      statsHistory: {},
      parentSettings: DEFAULT_SETTINGS,
      activeDecorations: { theme: 'theme_sky', pet: 'pet_bird', building: 'build_tent' },
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
