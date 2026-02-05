
import { useCallback } from 'react';
import { ACHIEVEMENT_CARDS } from '../constants';
import { UserState } from '../types';
import { playUnlock } from '../sound';

export const useCards = (user: UserState, setUser: (u: UserState) => void) => {
  const cards = ACHIEVEMENT_CARDS;
  const unlockedCards = user.unlockedAchievements;

  const unlockCard = useCallback((cardId: string) => {
    if (!unlockedCards.includes(cardId)) {
      playUnlock();
      setUser({
        ...user,
        unlockedAchievements: [...user.unlockedAchievements, cardId]
      });
    }
  }, [user, setUser, unlockedCards]);

  return { cards, unlockedCards, unlockCard };
};
