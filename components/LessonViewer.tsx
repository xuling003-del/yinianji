
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Lesson, ParentSettings, SessionState, LevelStats, InventoryItem, QuestionCategory } from '../types';
import { STICKERS } from '../constants';
import { playClick, playCorrect, playIncorrect, playFanfare, playUnlock } from '../sound';
import { shuffleArray } from '../utils/helpers';

export const LessonViewer: React.FC<{
  lesson: Lesson;
  streak: number;
  userSettings: ParentSettings;
  finishedCount: number; 
  initialSession?: SessionState; // Prop for resume capability
  onComplete: (points: number, questionIds: string[], stats: LevelStats, reward: InventoryItem | null) => void;
  onSaveProgress: (state: SessionState) => void; // Callback to save progress
  onClose: () => void;
}> = ({ lesson, streak, userSettings, finishedCount, initialSession, onComplete, onSaveProgress, onClose }) => {
  // Initialize state based on saved session or defaults
  const [step, setStep] = useState<'intro' | 'quiz' | 'finish' | 'chest'>(() => {
    if (initialSession && initialSession.qIndex > 0) return 'quiz';
    return 'intro';
  });
  const [qIndex, setQIndex] = useState(() => initialSession ? initialSession.qIndex : 0);
  
  // Stats Tracking
  // Current session start time. Total time = accumulatedTime + (now - startTime)
  const startTimeRef = useRef<number>(Date.now());
  const accumulatedTimeRef = useRef<number>(initialSession ? initialSession.accumulatedTime : 0);

  const [mistakesByCat, setMistakesByCat] = useState<Record<QuestionCategory, number>>(() => 
    initialSession ? initialSession.mistakesByCat : { basic: 0, application: 0, logic: 0, sentence: 0, word: 0 }
  );
  const [currentCombo, setCurrentCombo] = useState(() => initialSession ? initialSession.currentCombo : 0);
  const [maxCombo, setMaxCombo] = useState(() => initialSession ? initialSession.maxCombo : 0);

  const [feedback, setFeedback] = useState<{msg: string, ok: boolean} | null>(null);
  
  // Chest / Reward State
  const [chestOpened, setChestOpened] = useState(false);
  const [wonReward, setWonReward] = useState<{type: string, name: string, icon: string} | null>(null);

  // Standard Multiple Choice State
  const [selected, setSelected] = useState<string | null>(null);

  // Unscramble State
  const [scrambledSelected, setScrambledSelected] = useState<string[]>([]);

  // Fill-in-the-blank State
  const [blankSlots, setBlankSlots] = useState<string[]>([]);
  const [blankBank, setBlankBank] = useState<string[]>([]);

  const q = lesson.questions[qIndex];

  // Helper to calculate current total time
  const calculateTotalTime = () => {
    return Math.floor(accumulatedTimeRef.current + (Date.now() - startTimeRef.current) / 1000);
  };

  // Helper to construct current state object
  const getCurrentSessionState = (): SessionState => ({
    day: lesson.day,
    qIndex,
    mistakesByCat,
    currentCombo,
    maxCombo,
    accumulatedTime: calculateTotalTime()
  });

  // Save progress when user explicitly closes
  const handleClose = () => {
    if (step === 'quiz') {
      onSaveProgress(getCurrentSessionState());
    }
    onClose();
  };

  // Initialize states when question changes
  useEffect(() => {
    // Reset common states
    setFeedback(null);
    setSelected(null);
    setScrambledSelected([]);
    
    // Init Fill-in-the-blank
    if (q.type === 'fill-in-the-blank') {
      const numBlanks = q.text.split('（ ）').length - 1;
      setBlankSlots(Array(numBlanks).fill(''));
      if (q.options) {
        setBlankBank(shuffleArray([...q.options]));
      }
    }
  }, [qIndex, lesson]);

  // Record Mistake & Combo Logic
  const handleCorrect = () => {
    playCorrect();
    setFeedback({ msg: "太棒了！完全正确！🌟", ok: true });
    const newCombo = currentCombo + 1;
    setCurrentCombo(newCombo);
    if (newCombo > maxCombo) {
      setMaxCombo(newCombo);
    }
  };

  const handleIncorrect = () => {
    playIncorrect();
    setFeedback({ msg: q.explanation, ok: false });
    setMistakesByCat(prev => ({
      ...prev,
      [q.category]: prev[q.category] + 1
    }));
    setCurrentCombo(0);
  };

  // Multiple Choice Shuffle
  const currentOptions = useMemo(() => {
    if (q.type !== 'multiple-choice' || !q.options) return [];
    return shuffleArray(q.options);
  }, [q]);

  // Handle MC Answer
  const handleMCAnswer = (ans: string) => {
    if (selected) return;
    playClick();
    setSelected(ans);
    if (ans === q.answer) {
      handleCorrect();
    } else {
      handleIncorrect();
    }
  };

  // Handle Unscramble Logic
  const unscrambleWordBank = useMemo(() => {
    if (q?.type !== 'unscramble') return [];
    return shuffleArray(q.text.split('/').map(s => s.trim()));
  }, [qIndex, lesson]);

  const availableUnscrambleWords = useMemo(() => {
    let temp = [...scrambledSelected];
    return unscrambleWordBank.filter(w => {
      const idx = temp.indexOf(w);
      if (idx > -1) { temp.splice(idx, 1); return false; }
      return true;
    });
  }, [scrambledSelected, unscrambleWordBank]);

  const handleUnscrambleSubmit = () => {
    playClick();
    const userAns = scrambledSelected.join('');
    const correctAns = q.answer.replace(/\s+/g, ''); // Unscramble answer is usually the full sentence
    if (userAns === correctAns) {
      handleCorrect();
    } else {
      handleIncorrect();
    }
  };

  // Handle Fill-in-the-blank Logic
  const handleFillBankClick = (word: string, bankIndex: number) => {
    playClick();
    // Find first empty slot
    const emptyIndex = blankSlots.findIndex(s => s === '');
    if (emptyIndex === -1) return; // No empty slots

    const newSlots = [...blankSlots];
    newSlots[emptyIndex] = word;
    setBlankSlots(newSlots);

    const newBank = [...blankBank];
    newBank.splice(bankIndex, 1);
    setBlankBank(newBank);
  };

  const handleFillSlotClick = (index: number) => {
    playClick();
    const word = blankSlots[index];
    if (!word) return;

    const newSlots = [...blankSlots];
    newSlots[index] = '';
    setBlankSlots(newSlots);

    setBlankBank([...blankBank, word]);
  };

  const handleFillSubmit = () => {
    playClick();
    const userAns = blankSlots.join('');
    // For fill-in-the-blank, answer is the concatenated correct words
    if (userAns === q.answer) {
      handleCorrect();
    } else {
      handleIncorrect();
    }
  };

  // Navigation
  const handleNext = () => {
    playClick();
    if (qIndex < lesson.questions.length - 1) {
      const nextQ = qIndex + 1;
      setQIndex(nextQ);
      // Auto-save progress when moving to next question
      // We need to calculate state manually here because React state updates (qIndex) are async
      onSaveProgress({
        day: lesson.day,
        qIndex: nextQ,
        mistakesByCat,
        currentCombo,
        maxCombo,
        accumulatedTime: calculateTotalTime()
      });
    } else {
      playFanfare();
      setStep('finish');
    }
  };

  const handleRetry = () => {
    playClick();
    setFeedback(null);
    if (q.type === 'multiple-choice') {
      setSelected(null);
    } else if (q.type === 'unscramble') {
      setScrambledSelected([]);
    } else if (q.type === 'fill-in-the-blank') {
       // Reset slots and bank from scratch
       const numBlanks = q.text.split('（ ）').length - 1;
       setBlankSlots(Array(numBlanks).fill(''));
       if (q.options) setBlankBank(shuffleArray([...q.options]));
    }
  };

  // Treasure Chest Logic
  const handleOpenChest = () => {
    setChestOpened(true);
    playUnlock();

    // 1. Roll for Custom Rewards
    let reward: InventoryItem | null = null;
    const roll = Math.random() * 100;

    // Sort rewards by probability ascending so smaller probabilities check first if we iterate (simplistic approach)
    // Or just pick one random custom reward to check against its probability
    const shuffledCustom = shuffleArray(userSettings.customRewards || []);
    
    for (const r of shuffledCustom) {
      if (Math.random() * 100 < r.probability) {
        reward = {
          id: `custom_${Date.now()}`,
          type: 'custom_coupon',
          name: r.name,
          icon: '🎟️',
          obtainedAt: Date.now(),
          isRedeemed: false
        };
        break;
      }
    }

    // 2. If no custom reward, give a game reward (Sticker or Extra Stars)
    if (!reward) {
      const gameRoll = Math.random();
      if (gameRoll < 0.7) {
         // 70% chance for Sticker
         const randomSticker = STICKERS[Math.floor(Math.random() * STICKERS.length)];
         reward = {
           id: `sticker_${Date.now()}`,
           type: 'sticker',
           name: randomSticker.name,
           icon: randomSticker.icon,
           obtainedAt: Date.now()
         };
      } else {
         // 30% chance for Bonus Stars (Virtual Item)
         const randomSticker = STICKERS[Math.floor(Math.random() * STICKERS.length)];
         reward = {
           id: `sticker_${Date.now()}`,
           type: 'sticker',
           name: randomSticker.name,
           icon: randomSticker.icon,
           obtainedAt: Date.now()
         };
      }
    }

    setWonReward({ type: reward.type, name: reward.name, icon: reward.icon });

    // Wait a bit then finish
    setTimeout(() => {
       const totalTimeSpent = calculateTotalTime();
       onComplete(lesson.points, lesson.questions.map(q => q.id), { 
          day: lesson.day,
          timeSpent: totalTimeSpent, 
          mistakesByCat, 
          maxCombo, 
          timestamp: Date.now() 
       }, reward);
    }, 2500); // Give time to read the reward
  };

  const renderFillInTheBlankArea = () => {
    const parts = q.text.split('（ ）');
    
    return (
      <div className="flex flex-col items-center w-full">
        {/* Question Text with Slots */}
        <div className="text-xl md:text-3xl font-bold text-gray-800 leading-relaxed text-center font-standard mb-8">
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              <span>{part}</span>
              {i < parts.length - 1 && (
                <button
                  onClick={() => !feedback && handleFillSlotClick(i)}
                  className={`inline-flex items-center justify-center border-b-4 md:border-4 rounded-lg md:rounded-xl px-2 mx-1 min-w-[3rem] h-10 md:h-14 text-center transition-all align-middle text-2xl md:text-3xl font-black ${
                    blankSlots[i] 
                      ? 'bg-sky-100 border-sky-300 text-sky-700 -translate-y-1 shadow-sm' 
                      : 'bg-gray-100 border-gray-300'
                  }`}
                >
                  {blankSlots[i]}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Word Bank */}
        {!feedback && (
            <div className="bg-sky-50/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 border-dashed border-sky-200 min-h-[80px] w-full flex flex-wrap gap-3 justify-center content-center mb-6">
                {blankBank.length === 0 && <span className="text-gray-400 text-sm">暂无可用选项</span>}
                {blankBank.map((word, i) => (
                <button 
                    key={`${word}-${i}`} 
                    onClick={() => handleFillBankClick(word, i)}
                    disabled={blankSlots.every(s => s !== '')}
                    className="bg-white w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl text-xl md:text-3xl font-black shadow-sm border-b-4 border-gray-200 hover:border-sky-300 active:scale-95 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:active:translate-y-0"
                >
                    {word}
                </button>
                ))}
            </div>
        )}

        {/* Submit Button */}
        {!feedback && (
             <button 
             onClick={handleFillSubmit} 
             disabled={blankSlots.some(s => s === '')}
             className="w-full py-3 md:py-5 bg-sky-500 disabled:bg-gray-300 text-white rounded-xl md:rounded-2xl text-xl md:text-2xl font-black shadow-[0_4px_0_0_#0369a1] active:shadow-none active:translate-y-1 transition-all"
           >
             选好了！✨
           </button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col font-standard overflow-hidden">
      {/* Top Bar */}
      <div className="px-3 py-2 md:p-4 border-b flex justify-between items-center bg-sky-50 h-14 shrink-0">
        <button onClick={() => { playClick(); handleClose(); }} className="text-2xl md:text-4xl text-sky-400 hover:text-sky-600 w-8">✕</button>
        <div className="flex-1 px-4 md:px-8">
           <div className="h-3 md:h-4 bg-white rounded-full overflow-hidden border">
              <div className="h-full bg-sky-400 transition-all duration-500" style={{ width: `${((qIndex + 1) / lesson.questions.length) * 100}%` }}></div>
           </div>
        </div>
        <div className="font-black text-sky-600 text-sm md:text-base whitespace-nowrap">Day {lesson.day}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col items-center">
        {step === 'intro' && (
          <div className="w-full max-w-xl text-center flex flex-col items-center justify-center h-full space-y-6 md:space-y-12 animate-pop">
             <div className="text-[6rem] md:text-[10rem] island-float leading-none">{lesson.icon}</div>
             <div className="bg-sky-50 p-6 md:p-8 rounded-[2rem] border-4 border-sky-100 w-full">
               <h2 className="text-2xl md:text-4xl font-black text-sky-800 mb-2 md:mb-4">{lesson.title}</h2>
               <p className="text-lg md:text-2xl text-gray-600 font-bold leading-relaxed">{lesson.story}</p>
               {streak > 1 && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full font-black animate-bounce">
                    <span>🔥</span> 连续学习第 {streak} 天！继续加油！
                  </div>
               )}
             </div>
             <button onClick={() => { playClick(); setStep('quiz'); startTimeRef.current = Date.now(); }} className="w-full py-4 md:py-6 bg-sky-500 text-white rounded-[1.5rem] md:rounded-[2rem] text-2xl md:text-4xl font-black shadow-[0_8px_0_0_#0369a1] active:translate-y-2 active:shadow-none transition-all">出发冒险！</button>
          </div>
        )}

        {step === 'quiz' && (
          <div className="w-full max-w-2xl flex flex-col gap-4 md:gap-8 animate-pop pb-10">
            {/* Question Card Container */}
            <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[3rem] border-4 border-sky-100 shadow-lg min-h-[10rem] flex flex-col justify-center items-center text-center relative mt-2">
               <span className="absolute -top-3 left-4 bg-sky-500 text-white px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider shadow-sm">{q.category}</span>
               
               {/* Content based on type */}
               {q.type === 'fill-in-the-blank' ? (
                   renderFillInTheBlankArea()
               ) : (
                   <h3 className="text-xl md:text-3xl font-bold text-gray-800 leading-tight font-standard">{q.text}</h3>
               )}
               
               {/* Combo Indicator */}
               {currentCombo > 1 && !feedback && (
                 <div className="absolute -right-2 -top-2 bg-amber-400 text-white w-12 h-12 rounded-full flex items-center justify-center font-black border-4 border-white shadow-md animate-bounce rotate-12 z-10">
                    x{currentCombo}
                 </div>
               )}
            </div>

            {/* Multiple Choice Options */}
            {q.type === 'multiple-choice' && (
              <div className="grid gap-3 md:gap-4">
                {currentOptions.map(opt => (
                  <button
                    key={opt}
                    disabled={!!selected}
                    onClick={() => handleMCAnswer(opt)}
                    className={`p-4 md:p-6 rounded-xl md:rounded-[2rem] text-lg md:text-2xl font-medium border-4 text-left transition-all font-standard ${selected === opt ? (opt === q.answer ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500') : 'bg-white border-gray-100 hover:border-sky-200 active:bg-sky-50'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Unscramble Area */}
            {q.type === 'unscramble' && (
              <div className="space-y-4 md:space-y-8">
                <div className="bg-sky-50/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 border-dashed border-sky-200 min-h-[80px] md:min-h-[100px] flex flex-wrap gap-2 justify-center content-center">
                   {availableUnscrambleWords.map((w, i) => (
                     <button key={i} onClick={() => { playClick(); setScrambledSelected([...scrambledSelected, w]); }} className="bg-white px-3 py-2 md:px-5 md:py-3 rounded-lg md:rounded-xl text-lg md:text-2xl font-bold shadow-sm border border-gray-100 hover:bg-sky-50 active:scale-95 font-standard">{w}</button>
                   ))}
                </div>
                <div className="min-h-[80px] md:min-h-[120px] bg-white p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border-4 border-sky-100 shadow-inner flex flex-wrap gap-2 items-center justify-center">
                   {scrambledSelected.length === 0 && <span className="text-gray-300 text-sm md:text-xl italic">点击上方词语组句</span>}
                   {scrambledSelected.map((w, i) => (
                     <button key={i} onClick={() => {
                       if (feedback) return;
                       playClick();
                       const next = [...scrambledSelected];
                       next.splice(i, 1);
                       setScrambledSelected(next);
                     }} className="bg-amber-400 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-lg md:text-2xl font-bold shadow-sm animate-pop font-standard">{w}</button>
                   ))}
                </div>
                {!feedback && (
                  <button 
                    onClick={handleUnscrambleSubmit} 
                    disabled={scrambledSelected.length === 0}
                    className="w-full py-3 md:py-5 bg-sky-500 disabled:bg-gray-300 text-white rounded-xl md:rounded-2xl text-xl md:text-2xl font-black shadow-[0_4px_0_0_#0369a1] active:shadow-none active:translate-y-1 transition-all"
                  >
                    拼好了！🚀
                  </button>
                )}
              </div>
            )}

            {feedback && (
              <div className={`p-4 md:p-8 rounded-2xl md:rounded-[3rem] border-4 md:border-8 animate-pop ${feedback.ok ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex gap-3 md:gap-4 items-start">
                   <span className="text-4xl md:text-6xl">{feedback.ok ? '🎉' : '💡'}</span>
                   <div className="flex-1">
                      <h4 className={`text-lg md:text-2xl font-black ${feedback.ok ? 'text-green-600' : 'text-amber-600'}`}>{feedback.ok ? "太棒啦！" : "小贴士"}</h4>
                      <p className="text-base md:text-xl font-medium text-gray-700 mt-1 md:mt-2 font-standard leading-normal">{feedback.msg}</p>
                   </div>
                </div>
                {feedback.ok ? (
                  <button onClick={handleNext} className="w-full mt-4 md:mt-6 py-3 md:py-4 bg-sky-600 text-white rounded-xl md:rounded-2xl text-xl md:text-2xl font-black shadow-[0_4px_0_0_#0284c7] active:shadow-none active:translate-y-1">继续前进 ➡️</button>
                ) : (
                  <button onClick={handleRetry} className="w-full mt-4 md:mt-6 py-3 md:py-4 bg-amber-500 text-white rounded-xl md:rounded-2xl text-xl md:text-2xl font-black shadow-[0_4px_0_0_#d97706] active:shadow-none active:translate-y-1">重做一遍 ↩️</button>
                )}
              </div>
            )}
          </div>
        )}

        {step === 'finish' && (
          <div className="w-full max-w-xl text-center flex flex-col items-center justify-center h-full space-y-6 md:space-y-10 animate-pop">
            <div className="text-[8rem] md:text-[12rem]">🏆</div>
            <h2 className="text-3xl md:text-5xl font-black text-sky-800">冒险大获全胜！</h2>
            <div className="bg-amber-50 p-6 md:p-8 rounded-[2rem] border-4 border-amber-200 inline-block px-10 md:px-16">
               <span className="text-gray-500 font-bold block mb-1 md:mb-2 text-sm md:text-base">获得星星</span>
               <span className="text-4xl md:text-6xl font-black text-amber-600">+{lesson.points}</span>
            </div>
            <button onClick={() => {
              playClick();
              setStep('chest');
            }} className="w-full py-4 md:py-8 bg-green-500 text-white rounded-[2rem] md:rounded-[2.5rem] text-2xl md:text-4xl font-black shadow-[0_8px_0_0_#15803d] active:shadow-none active:translate-y-2">去开宝箱！🎁</button>
          </div>
        )}

        {step === 'chest' && (
           <div className="w-full max-w-xl text-center flex flex-col items-center justify-center h-full space-y-6 animate-pop relative">
              <h2 className="text-3xl md:text-4xl font-black text-amber-600 mb-4">{chestOpened ? (wonReward ? '恭喜获得！' : '...') : '神秘宝箱'}</h2>
              
              {!chestOpened ? (
                <div 
                  onClick={handleOpenChest}
                  className="cursor-pointer text-[10rem] md:text-[12rem] animate-bounce hover:scale-110 transition-transform active:scale-95"
                >
                  🎁
                  <p className="text-lg text-gray-400 font-bold mt-2 animate-pulse">点击打开</p>
                </div>
              ) : (
                <div className="animate-pop flex flex-col items-center">
                   <div className="text-[8rem] md:text-[10rem] mb-4 drop-shadow-2xl">{wonReward?.icon}</div>
                   <div className="text-2xl md:text-3xl font-black text-gray-800 bg-white border-4 border-amber-200 px-8 py-4 rounded-full shadow-lg">
                      {wonReward?.name}
                   </div>
                   <p className="mt-8 text-gray-500 font-bold">正在放入背包...</p>
                </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
};
