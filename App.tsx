
import React, { useState, useEffect } from 'react';
import { View, LevelStats, InventoryItem, DailyStats, SessionState, BeforeInstallPromptEvent, Question, QuestionCategory, PendingMistake } from './types';
import { generateLesson } from './constants';
import { getTodayStr } from './utils/helpers';
import { useGameState } from './hooks/useGameState';

// Components - Ensure using relative paths ./
import { Header } from './components/Header';
import { IslandMap } from './components/IslandMap';
import { LessonViewer } from './components/LessonViewer';
import { StoreView } from './components/StoreView';
import { ProfileView } from './components/ProfileView';

export default function App() {
  const [view, setView] = useState<View>(View.MAP);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { user, setUser } = useGameState();
  
  // Question Bank State (Loaded from JSON)
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Load Questions from Manifest
  useEffect(() => {
    async function loadQuestions() {
      try {
        // 1. Fetch Manifest
        const manifestRes = await fetch('/data/manifest.json');
        if (!manifestRes.ok) throw new Error('Manifest not found');
        const manifest = await manifestRes.json();
        
        // 2. Fetch all modules in parallel
        const promises = manifest.modules.map((m: any) => 
          fetch(m.path).then(res => res.json())
        );
        
        const results = await Promise.all(promises);
        
        // 3. Flatten and combine
        const allQuestions = results.flat();
        console.log(`Loaded ${allQuestions.length} questions from ${results.length} modules.`);
        
        setQuestions(allQuestions);
        setIsLoadingQuestions(false);
      } catch (err) {
        console.error("Failed to load questions", err);
        // Retry logic or offline fallback could happen here
        setIsLoadingQuestions(false);
      }
    }
    
    loadQuestions();
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
        <div className="text-sky-400 text-sm mt-2">加载题库资源中</div>
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
          // Pass mistakeQueue to generateLesson for smart review
          lesson={generateLesson(questions, selectedDay, user.usedQuestionIds, user.gameSeed, user.parentSettings, user.mistakeQueue)} 
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
          onComplete={(p, qIds, lessonStats: LevelStats, reward: InventoryItem | null, wrongQuestionIds: string[], skippedQuestionIds: string[]) => {
            const today = getTodayStr();
            const currentStats: DailyStats = user.statsHistory[today] || {
              date: today,
              timeSpentSeconds: 0,
              mistakes: 0,
              mistakesByCategory: { 
                basic: 0, application: 0, logic: 0, emoji: 0, 
                sentence: 0, word: 0, punctuation: 0, antonym: 0, synonym: 0 
              },
              totalQuestionsByCategory: { 
                basic: 0, application: 0, logic: 0, emoji: 0,
                sentence: 0, word: 0, punctuation: 0, antonym: 0, synonym: 0 
              }
            };

            const mistakesCount = Object.values(lessonStats.mistakesByCat).reduce((a, b) => a + b, 0);

            // Merge new stats
            const updatedStats: DailyStats = {
              ...currentStats,
              timeSpentSeconds: currentStats.timeSpentSeconds + lessonStats.timeSpent,
              mistakes: currentStats.mistakes + mistakesCount,
              mistakesByCategory: {
                 ...currentStats.mistakesByCategory,
                 basic: (currentStats.mistakesByCategory.basic || 0) + (lessonStats.mistakesByCat.basic || 0),
                 application: (currentStats.mistakesByCategory.application || 0) + (lessonStats.mistakesByCat.application || 0),
                 logic: (currentStats.mistakesByCategory.logic || 0) + (lessonStats.mistakesByCat.logic || 0),
                 emoji: (currentStats.mistakesByCategory.emoji || 0) + (lessonStats.mistakesByCat.emoji || 0),
                 sentence: (currentStats.mistakesByCategory.sentence || 0) + (lessonStats.mistakesByCat.sentence || 0),
                 word: (currentStats.mistakesByCategory.word || 0) + (lessonStats.mistakesByCat.word || 0),
                 punctuation: (currentStats.mistakesByCategory.punctuation || 0) + (lessonStats.mistakesByCat.punctuation || 0),
                 antonym: (currentStats.mistakesByCategory.antonym || 0) + (lessonStats.mistakesByCat.antonym || 0),
                 synonym: (currentStats.mistakesByCategory.synonym || 0) + (lessonStats.mistakesByCat.synonym || 0),
              }
            };
            
            // --- Achievement Calculations ---
            const newUnlocks = [...user.unlockedAchievements];
            const completedCount = (user.courseProgress[user.activeCourseId] || []).length + 1; // +1 for the one just finished
            const isNoMistakes = mistakesCount === 0;
            const isFast = lessonStats.timeSpent < 60; // Less than 1 minute

            // Inventory update
            const newInventory = reward ? [...user.inventory, reward] : user.inventory;

            // 1. Streak Cards (Days)
            if (completedCount >= 3 && !newUnlocks.includes('streak_3')) newUnlocks.push('streak_3');
            if (completedCount >= 10 && !newUnlocks.includes('streak_10')) newUnlocks.push('streak_10');
            
            // 2. Performance Cards
            if (isNoMistakes && !newUnlocks.includes('perfect_score')) newUnlocks.push('perfect_score');
            if (isFast && !newUnlocks.includes('speed_runner')) newUnlocks.push('speed_runner');
            if (isNoMistakes && isFast && !newUnlocks.includes('perfect_storm')) newUnlocks.push('perfect_storm');

            // 3. New Advanced Stats Calculation
            const prevConsecutive = user.consecutivePerfectLevels || 0;
            const newConsecutive = isNoMistakes ? prevConsecutive + 1 : 0;
            
            const prevTotalTime = user.totalTimeSpent || 0;
            const newTotalTime = prevTotalTime + lessonStats.timeSpent;

            const prevTotalCorrect = user.totalCorrectAnswers || 0;
            const currentCorrect = qIds.length; // Assuming completing a lesson implies answering all Qs correctly
            const newTotalCorrect = prevTotalCorrect + currentCorrect;

            // 4. New Achievement Checks
            
            // Sharpshooter: 3 Consecutive Perfect Levels
            if (newConsecutive >= 3 && !newUnlocks.includes('sharpshooter')) {
              newUnlocks.push('sharpshooter');
            }

            // Knowledge Expert: 2 Hours (7200 seconds)
            if (newTotalTime >= 7200 && !newUnlocks.includes('knowledge_expert')) {
              newUnlocks.push('knowledge_expert');
            }

            // Logic Master: 100 Correct Questions
            if (newTotalCorrect >= 100 && !newUnlocks.includes('logic_master')) {
              newUnlocks.push('logic_master');
            }

            // Colorful Collector: 5 Different Collection Cards
            // We check the *new* inventory state
            const uniqueCardNames = new Set(
              newInventory
                .filter(i => i.type === 'card')
                .map(i => i.name)
            );
            if (uniqueCardNames.size >= 5 && !newUnlocks.includes('collection_king')) {
              newUnlocks.push('collection_king');
            }

            // --- Smart Learning: Update Mistake Queue with Delay & Skipping Logic ---
            
            // 1. Remove questions that were in the queue but got answered correctly this time
            // We only remove if it wasn't skipped. If skipped, we assume it's still "unknown" or "problematic".
            // But if skipped, it shouldn't be in the answered list for removal logic?
            // Wait, if it's skipped, it IS in qIds (lesson questions).
            // Logic: Remove from mistakeQueue ONLY IF (in qIds) AND (NOT in wrongQuestionIds) AND (NOT in skippedQuestionIds).
            // Note: wrongQuestionIds includes skipped ones usually (due to 5 attempts), but let's be explicit.
            
            const answeredCorrectlyIds = qIds.filter(id => !wrongQuestionIds.includes(id) && !skippedQuestionIds.includes(id));
            let newMistakeQueue = user.mistakeQueue.filter(id => !answeredCorrectlyIds.includes(id));
            
            // 2. Manage Delayed Review (Pending Mistakes)
            let newPendingMistakes = [...(user.pendingMistakes || [])];
            
            // Move eligible pending mistakes to active queue
            // Rule: "Gap of 2 levels". If current level completed is N (completedCount), 
            // mistakes from level N-3 (gap of 2: N-2, N-1) are ready?
            // Let's use simple logic: if (currentCount - pending.levelIndex) >= 2.
            const currentCount = completedCount; 
            
            const eligibleToMove = newPendingMistakes.filter(p => (currentCount - p.levelIndex) >= 2);
            const keepInPending = newPendingMistakes.filter(p => (currentCount - p.levelIndex) < 2);
            
            eligibleToMove.forEach(p => {
               p.questionIds.forEach(id => {
                  if (!newMistakeQueue.includes(id)) newMistakeQueue.push(id);
               });
            });
            
            newPendingMistakes = keepInPending;

            // 3. Add NEW mistakes to Pending (excluding skipped ones)
            // Filter out skipped IDs from wrong IDs
            const effectiveWrongIds = wrongQuestionIds.filter(id => !skippedQuestionIds.includes(id));
            
            if (effectiveWrongIds.length > 0) {
               // Add to pending, tagged with current level count
               newPendingMistakes.push({
                  levelIndex: currentCount,
                  questionIds: effectiveWrongIds
               });
            }

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
              currentSession: undefined, // Clear saved session on completion
              // Save new tracked stats
              consecutivePerfectLevels: newConsecutive,
              totalTimeSpent: newTotalTime,
              totalCorrectAnswers: newTotalCorrect,
              mistakeQueue: newMistakeQueue,
              pendingMistakes: newPendingMistakes
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
    </div>
  );
}
