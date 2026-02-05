
import React, { useState, useEffect } from 'react';
import { View, LevelStats, InventoryItem, DailyStats, SessionState, BeforeInstallPromptEvent, Question } from './types';
import { generateLesson } from './constants';
import { getTodayStr } from './utils/helpers';
import { useGameState } from './hooks/useGameState';

// Components - Ensure using relative paths ./
import { Header } from './components/Header';
import { IslandMap } from './components/IslandMap';
import { LessonViewer } from './components/LessonViewer';
import { StoreView } from './components/StoreView';
import { ProfileView } from './components/ProfileView';
import { CardTestView } from './components/CardTestView';

export default function App() {
  const [view, setView] = useState<View>(View.MAP);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { user, setUser } = useGameState();
  
  // Question Bank State (Loaded from JSON)
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Load Questions
  useEffect(() => {
    fetch('/data/questions.json')
      .then(res => res.json())
      .then((data: Question[]) => {
        setQuestions(data);
        setIsLoadingQuestions(false);
      })
      .catch(err => {
        console.error("Failed to load questions", err);
        setIsLoadingQuestions(false);
        // Fallback or alert could go here
      });
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    await deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  // Determine if we should resume from a previous session
  const getResumeSession = (day: number) => {
    if (user.currentSession && user.currentSession.day === day) {
      return user.currentSession;
    }
    return undefined;
  };

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center font-standard">
        <div className="text-6xl animate-bounce mb-4">🏝️</div>
        <div className="text-sky-600 font-bold text-xl">正在前往奇幻岛...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-standard bg-sky-50">
      <Header 
        user={user} 
        setView={setView} 
        installPrompt={deferredPrompt ? handleInstallClick : undefined}
      />
      
      {view === View.MAP && (
        <IslandMap 
          user={user} 
          questionBank={questions} 
          onSelectDay={d => { setSelectedDay(d); setView(View.LESSON); }} 
          setView={setView} 
        />
      )}
      
      {view === View.LESSON && selectedDay && (
        <LessonViewer 
          lesson={generateLesson(questions, selectedDay, user.usedQuestionIds, user.gameSeed, user.parentSettings)} 
          streak={user.streak}
          userSettings={user.parentSettings}
          finishedCount={(user.courseProgress[user.activeCourseId] || []).length}
          initialSession={getResumeSession(selectedDay)}
          onSaveProgress={(state: SessionState) => {
            setUser(prev => ({
              ...prev,
              currentSession: state
            }));
          }}
          // Fix: Explicitly type callback arguments to ensure correct arithmetic operations
          onComplete={(p, qIds, lessonStats: LevelStats, reward: InventoryItem | null) => {
            const today = getTodayStr();
            const currentStats: DailyStats = user.statsHistory[today] || {
              date: today,
              timeSpentSeconds: 0,
              mistakes: 0,
              mistakesByCategory: { basic: 0, application: 0, logic: 0, sentence: 0, word: 0 },
              totalQuestionsByCategory: { basic: 0, application: 0, logic: 0, sentence: 0, word: 0 }
            };

            const mistakesCount = Object.values(lessonStats.mistakesByCat).reduce((a, b) => a + b, 0);

            // Merge new stats
            const updatedStats: DailyStats = {
              ...currentStats,
              timeSpentSeconds: currentStats.timeSpentSeconds + lessonStats.timeSpent,
              mistakes: currentStats.mistakes + mistakesCount,
              mistakesByCategory: {
                 ...currentStats.mistakesByCategory,
                 basic: currentStats.mistakesByCategory.basic + lessonStats.mistakesByCat.basic,
                 application: currentStats.mistakesByCategory.application + lessonStats.mistakesByCat.application,
                 logic: currentStats.mistakesByCategory.logic + lessonStats.mistakesByCat.logic,
                 sentence: currentStats.mistakesByCategory.sentence + lessonStats.mistakesByCat.sentence,
                 word: currentStats.mistakesByCategory.word + lessonStats.mistakesByCat.word,
              }
            };
            
            // Check for Achievement Unlocks
            const newUnlocks = [...user.unlockedAchievements];
            const completedCount = (user.courseProgress[user.activeCourseId] || []).length + 1; // +1 for the one just finished

            // 1. Streak Cards (Now based on Total Completed Levels)
            if (completedCount >= 3 && !newUnlocks.includes('streak_3')) newUnlocks.push('streak_3');
            if (completedCount >= 10 && !newUnlocks.includes('streak_10')) newUnlocks.push('streak_10');
            
            // 2. Performance Cards
            const isNoMistakes = mistakesCount === 0;
            const isFast = lessonStats.timeSpent < 60; // Less than 1 minute

            if (isNoMistakes && !newUnlocks.includes('perfect_score')) newUnlocks.push('perfect_score');
            if (isFast && !newUnlocks.includes('speed_runner')) newUnlocks.push('speed_runner');
            if (isNoMistakes && isFast && !newUnlocks.includes('perfect_storm')) newUnlocks.push('perfect_storm');

            // Inventory update
            const newInventory = reward ? [...user.inventory, reward] : user.inventory;

            setUser(prev => ({
              ...prev,
              stars: prev.stars + p,
              usedQuestionIds: Array.from(new Set([...prev.usedQuestionIds, ...qIds])),
              courseProgress: { ...prev.courseProgress, [prev.activeCourseId]: Array.from(new Set([...(prev.courseProgress[prev.activeCourseId] || []), selectedDay])) },
              statsHistory: {
                ...prev.statsHistory,
                [today]: updatedStats
              },
              lastLevelStats: lessonStats,
              unlockedAchievements: newUnlocks,
              inventory: newInventory,
              currentSession: undefined // Clear saved session on completion
            }));
            setView(View.MAP);
          }}
          onClose={() => setView(View.MAP)}
        />
      )}

      {view === View.STORE && (
        <StoreView user={user} setUser={setUser} onClose={() => setView(View.MAP)} />
      )}

      {view === View.PROFILE && (
        <ProfileView 
          user={user} 
          setUser={setUser} 
          onClose={() => setView(View.MAP)} 
        />
      )}

      {view === View.TEST_CARDS && (
        <CardTestView onClose={() => setView(View.MAP)} />
      )}
    </div>
  );
}
