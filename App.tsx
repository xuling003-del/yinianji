
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserState, View, Lesson, Question, DailyStats, ParentSettings, QuestionCategory, LevelStats, AchievementCard, CustomReward, InventoryItem, DecorationItem } from './types';
import { COURSES, AVATARS, DECORATIONS, generateLesson, DEFAULT_SETTINGS, ACHIEVEMENT_CARDS, STICKERS } from './constants';
import { playClick, playCorrect, playIncorrect, playFanfare, playUnlock } from './sound';

// --- Helper Functions ---
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

// --- Animation Components ---

// A component that bounces an element around the screen
const BouncingItem: React.FC<{ icon: string; sizeRem: number; speed?: number; zIndex?: number }> = ({ icon, sizeRem, speed = 0.5, zIndex = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({
    x: Math.random() * (window.innerWidth - 100),
    y: Math.random() * (window.innerHeight - 100),
    vx: (Math.random() > 0.5 ? 1 : -1) * speed,
    vy: (Math.random() > 0.5 ? 1 : -1) * speed,
  });

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      const el = ref.current;
      if (!el) return;

      const s = state.current;
      const rect = el.getBoundingClientRect();
      const parentWidth = window.innerWidth;
      const parentHeight = window.innerHeight;

      // Update position
      s.x += s.vx;
      s.y += s.vy;

      // Bounce horizontally
      if (s.x <= 0) {
        s.x = 0;
        s.vx = Math.abs(s.vx);
      } else if (s.x + rect.width >= parentWidth) {
        s.x = parentWidth - rect.width;
        s.vx = -Math.abs(s.vx);
      }

      // Bounce vertically
      if (s.y <= 0) {
        s.y = 0;
        s.vy = Math.abs(s.vy);
      } else if (s.y + rect.height >= parentHeight) {
        s.y = parentHeight - rect.height;
        s.vy = -Math.abs(s.vy);
      }

      // Apply transform directly for performance
      el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [speed]);

  return (
    <div 
      ref={ref} 
      className="fixed top-0 left-0 pointer-events-none drop-shadow-xl"
      style={{ fontSize: `${sizeRem}rem`, zIndex }}
    >
      {icon}
    </div>
  );
};

// --- UI Components ---

const Header: React.FC<{ user: UserState; setView: (v: View) => void }> = ({ user, setView }) => (
  <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-50 px-3 py-2 md:p-4 flex justify-between items-center border-b-2 border-sky-50 h-14 md:h-auto">
    <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => { playClick(); setView(View.MAP); }}>
      <span className="text-2xl md:text-4xl">🏝️</span>
      <div>
        <h1 className="text-lg md:text-xl font-black text-sky-600 leading-tight">奇幻岛</h1>
        <p className="hidden md:block text-[10px] text-sky-300 font-bold uppercase tracking-widest">Adventure Lab</p>
      </div>
    </div>
    <div className="flex items-center gap-2 md:gap-3">
      {/* New Store Button in Header */}
      <button 
        onClick={() => { playClick(); setView(View.STORE); }}
        className="bg-amber-100 w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 border-amber-200 shadow-sm active:scale-95 transition-transform"
      >
        <span className="text-xl md:text-2xl">🎁</span>
      </button>

      <div className="bg-amber-100 px-2 md:px-4 py-1 rounded-full flex items-center gap-1 md:gap-2 border-2 border-amber-200">
        <span className="text-sm md:text-xl">⭐</span>
        <span className="font-black text-amber-600 tabular-nums text-sm md:text-base">{user.stars}</span>
      </div>
      <button onClick={() => { playClick(); setView(View.PROFILE); }} className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white border-2 border-sky-100 flex items-center justify-center text-xl md:text-3xl shadow-sm active:scale-95 transition-transform">
        {user.avatar}
      </button>
    </div>
  </header>
);

const LessonViewer: React.FC<{
  lesson: Lesson;
  streak: number;
  userSettings: ParentSettings;
  // Passing finished count to help calculate achievements
  finishedCount: number; 
  onComplete: (points: number, questionIds: string[], stats: LevelStats, reward: InventoryItem | null) => void;
  onClose: () => void;
}> = ({ lesson, streak, userSettings, finishedCount, onComplete, onClose }) => {
  const [step, setStep] = useState<'intro' | 'quiz' | 'finish' | 'chest'>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [feedback, setFeedback] = useState<{msg: string, ok: boolean} | null>(null);
  
  // Stats Tracking
  const startTimeRef = useRef<number>(Date.now());
  const [mistakesByCat, setMistakesByCat] = useState<Record<QuestionCategory, number>>({
    basic: 0, application: 0, logic: 0, sentence: 0, word: 0
  });
  const [currentCombo, setCurrentCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

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
      setQIndex(qIndex + 1);
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
       const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
       onComplete(lesson.points, lesson.questions.map(q => q.id), { 
          day: lesson.day,
          timeSpent, 
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
        <button onClick={() => { playClick(); onClose(); }} className="text-2xl md:text-4xl text-sky-400 hover:text-sky-600 w-8">✕</button>
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

const ProfileView: React.FC<{ user: UserState; setUser: (u: UserState) => void; onClose: () => void }> = ({ user, setUser, onClose }) => {
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(user.name);
  const [showParentSettings, setShowParentSettings] = useState(false);
  const [pin, setPin] = useState('');
  const [settingsUnlocked, setSettingsUnlocked] = useState(false);
  const [tempSettings, setTempSettings] = useState<ParentSettings>(user.parentSettings || DEFAULT_SETTINGS);
  
  // Custom Reward Form
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardProb, setNewRewardProb] = useState(10);

  const handleSaveName = () => {
    if (nameVal.trim()) {
      setUser({ ...user, name: nameVal.trim().slice(0, 8) });
      setEditing(false);
      playClick();
    }
  };

  const handleUnlockSettings = () => {
    if (pin === '20180704') {
      playUnlock();
      setSettingsUnlocked(true);
    } else {
      alert('序列号错误');
      setPin('');
    }
  };

  const handleSaveSettings = () => {
    playClick();
    setUser({ ...user, parentSettings: tempSettings });
    setShowParentSettings(false);
    setSettingsUnlocked(false);
    setPin('');
  };

  const addCustomReward = () => {
    if(!newRewardName.trim()) return;
    const newReward: CustomReward = {
      id: `r_${Date.now()}`,
      name: newRewardName,
      probability: newRewardProb
    };
    setTempSettings(prev => ({
      ...prev,
      customRewards: [...(prev.customRewards || []), newReward]
    }));
    setNewRewardName('');
  };

  const removeCustomReward = (id: string) => {
    setTempSettings(prev => ({
      ...prev,
      customRewards: prev.customRewards?.filter(r => r.id !== id) || []
    }));
  };

  // Stats Calculations
  const historyValues = Object.values(user.statsHistory || {}) as DailyStats[];
  const totalMistakes = historyValues.reduce((acc, day) => acc + day.mistakes, 0);
  const totalTime = historyValues.reduce((acc, day) => acc + day.timeSpentSeconds, 0);
  const totalHours = Math.floor(totalTime / 3600);
  const totalMins = Math.floor((totalTime % 3600) / 60);

  const mistakeDist: Record<string, number> = {};
  historyValues.forEach(day => {
    Object.entries(day.mistakesByCategory).forEach(([cat, count]) => {
      mistakeDist[cat] = (mistakeDist[cat] || 0) + count;
    });
  });
  const maxMistakeVal = Math.max(...(Object.values(mistakeDist) as number[]), 1);

  // Last Level Stats
  const lastLevel = user.lastLevelStats;
  const lastLevelMins = lastLevel ? Math.floor(lastLevel.timeSpent / 60) : 0;
  const lastLevelSecs = lastLevel ? lastLevel.timeSpent % 60 : 0;
  const lastLevelMistakes = lastLevel ? (Object.values(lastLevel.mistakesByCat) as number[]).reduce((a,b) => a+b, 0) : 0;
  const maxMistakeLevelVal = lastLevel ? Math.max(...(Object.values(lastLevel.mistakesByCat) as number[]), 1) : 1;

  const renderBarChart = (data: Record<string, number>, maxVal: number, colorClass: string, barColorClass: string) => {
    return (
      <div className="w-full flex gap-2 h-24 items-end justify-around pb-2">
          {Object.entries({ basic:'计算', application:'应用', logic:'思维', sentence:'连句', word:'填空' }).map(([cat, label]) => {
            const val = data[cat] || 0;
            const heightPct = (val / maxVal) * 100;
            return (
              <div key={cat} className="h-full flex flex-col justify-end items-center gap-1 flex-1 group">
                <div className={`w-full ${barColorClass} rounded-t-lg transition-all duration-500 relative flex items-end justify-center`} style={{ height: `${heightPct}%`, minHeight: val > 0 ? '6px' : '2px' }}>
                  {val > 0 && <span className="text-[10px] text-gray-500 absolute -top-4 font-bold opacity-0 group-hover:opacity-100">{val}</span>}
                </div>
                <span className="text-[10px] text-gray-500 font-bold">{label}</span>
              </div>
            )
          })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white p-6 md:p-10 flex flex-col items-center overflow-y-auto animate-fade-in font-standard">
       <button onClick={() => { playClick(); onClose(); }} className="absolute top-4 left-4 md:top-8 md:left-8 text-3xl md:text-5xl text-gray-300 hover:text-gray-500 transition-colors">✕</button>
       
       {!showParentSettings ? (
         <>
          {/* Header */}
          <div className="mt-10 md:mt-10 w-32 h-32 md:w-40 md:h-40 bg-sky-50 rounded-[2rem] md:rounded-[3rem] flex items-center justify-center text-[4rem] md:text-[5rem] border-[6px] md:border-[8px] border-white shadow-xl">{user.avatar}</div>
          
          {/* Name Editor */}
          {editing ? (
            <div className="flex gap-2 mt-4 md:mt-4 items-center animate-pop">
                <input 
                  value={nameVal} 
                  onChange={e => setNameVal(e.target.value)}
                  className="border-4 border-sky-300 rounded-2xl px-4 py-2 text-2xl md:text-3xl font-black text-center w-56 md:w-64 outline-none focus:border-sky-500 bg-white"
                  autoFocus
                  maxLength={8}
                />
                <button onClick={handleSaveName} className="bg-green-500 text-white p-2 md:p-3 rounded-xl shadow-md active:scale-95 text-xl">✓</button>
            </div>
          ) : (
            <div className="flex items-center gap-3 mt-4 md:mt-4">
              <h2 onClick={() => { playClick(); setEditing(true); setNameVal(user.name); }} className="text-3xl md:text-4xl font-black text-sky-800 cursor-pointer border-b-2 border-transparent hover:border-sky-200 transition-all">
                {user.name} <span className="text-lg text-sky-300 ml-1">✎</span>
              </h2>
              <button 
                onClick={() => { playClick(); setShowParentSettings(true); }}
                className="bg-gray-100 text-gray-500 p-2 rounded-lg text-sm font-bold border-2 border-gray-200 hover:bg-gray-200 active:scale-95"
              >
                家长设置 ⚙️
              </button>
            </div>
          )}

          {/* Stats Grid */}
          <div className="mt-8 md:mt-8 w-full max-w-2xl grid grid-cols-2 gap-4">
             {/* Total Stats */}
             <div className="bg-orange-50 p-4 rounded-2xl border-2 border-orange-100 flex flex-col items-center">
                <span className="text-4xl mb-1">🔥</span>
                <span className="text-3xl font-black text-orange-600">{user.streak}</span>
                <span className="text-xs text-orange-400 font-bold uppercase">连续打卡天数</span>
             </div>
             <div className="bg-sky-50 p-4 rounded-2xl border-2 border-sky-100 flex flex-col items-center">
                <span className="text-4xl mb-1">⏳</span>
                <span className="text-3xl font-black text-sky-600">{totalHours}h {totalMins}m</span>
                <span className="text-xs text-sky-400 font-bold uppercase">总学习时长</span>
             </div>

             {/* All Time Mistakes */}
             <div className="bg-red-50 p-4 rounded-2xl border-2 border-red-100 flex flex-col items-center col-span-2">
                <div className="w-full flex justify-between items-end mb-2 px-2">
                   <span className="font-bold text-red-800">总错题分布</span>
                   <span className="text-xs text-red-400 font-bold">累计: {totalMistakes}</span>
                </div>
                {renderBarChart(mistakeDist, maxMistakeVal, 'bg-red-50', 'bg-red-300')}
             </div>

             {/* Last Level Stats */}
             <div className="col-span-2 mt-2">
               <h3 className="font-black text-gray-500 text-lg mb-2 pl-2 border-l-4 border-green-400">上一关表现 {lastLevel && <span className="text-sm font-normal text-gray-400">Day {lastLevel.day}</span>}</h3>
               {lastLevel ? (
                 <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-100 grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center p-2 bg-white/50 rounded-xl">
                       <span className="text-xs text-green-600 font-bold mb-1">通关用时</span>
                       <span className="text-2xl font-black text-green-700">{lastLevelMins}分{lastLevelSecs}秒</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-white/50 rounded-xl">
                       <span className="text-xs text-amber-600 font-bold mb-1">最强连击</span>
                       <span className="text-2xl font-black text-amber-600">x{lastLevel.maxCombo}</span>
                    </div>
                    
                    <div className="col-span-2 mt-2">
                      <div className="w-full flex justify-between items-end mb-2 px-1">
                        <span className="text-xs font-bold text-green-800">本关错题分布</span>
                        <span className="text-[10px] text-green-600 font-bold">错题数: {lastLevelMistakes}</span>
                      </div>
                      {renderBarChart(lastLevel.mistakesByCat, maxMistakeLevelVal, 'bg-green-50', 'bg-green-300')}
                    </div>
                 </div>
               ) : (
                 <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-400 font-bold">
                    还没有完成过关卡哦，快去挑战吧！
                 </div>
               )}
             </div>
          </div>
         </>
       ) : (
         /* Parent Settings Modal Content */
         <div className="mt-10 md:mt-20 w-full max-w-xl animate-pop pb-20">
           <h2 className="text-3xl font-black text-gray-700 mb-6 text-center">家长设置 ⚙️</h2>
           {!settingsUnlocked ? (
             <div className="flex flex-col items-center gap-4 bg-gray-50 p-8 rounded-3xl border-2 border-gray-100">
               <p className="text-gray-500 font-medium">请输入序列号解锁设置</p>
               <input 
                 type="password" 
                 value={pin} 
                 onChange={e => setPin(e.target.value)} 
                 placeholder="输入序列号"
                 className="w-full p-4 rounded-xl border-2 border-gray-300 text-center text-2xl tracking-widest outline-none focus:border-sky-500"
               />
               <div className="flex gap-4 w-full">
                 <button onClick={() => { playClick(); setShowParentSettings(false); }} className="flex-1 py-3 bg-gray-200 text-gray-600 rounded-xl font-bold">返回</button>
                 <button onClick={handleUnlockSettings} className="flex-1 py-3 bg-sky-500 text-white rounded-xl font-bold">解锁</button>
               </div>
             </div>
           ) : (
             <div className="bg-white border-2 border-gray-100 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col gap-8">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">每日题量配置</h3>
                  <div className="space-y-4">
                    {(Object.keys(tempSettings.questionCounts) as QuestionCategory[]).map(cat => {
                      const labelMap: any = { basic:'数学计算', application:'数学应用', logic:'数学思维', sentence:'语文连句', word:'填空' };
                      return (
                        <div key={cat} className="flex items-center justify-between">
                          <span className="font-medium text-gray-600">{labelMap[cat]}</span>
                          <div className="flex items-center gap-3">
                            <button onClick={() => { playClick(); setTempSettings(prev => ({...prev, questionCounts: {...prev.questionCounts, [cat]: Math.max(0, prev.questionCounts[cat] - 1)}})) }} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-600">-</button>
                            <span className="w-6 text-center font-bold text-lg">{tempSettings.questionCounts[cat]}</span>
                            <button onClick={() => { playClick(); setTempSettings(prev => ({...prev, questionCounts: {...prev.questionCounts, [cat]: Math.min(10, prev.questionCounts[cat] + 1)}})) }} className="w-8 h-8 rounded-full bg-sky-100 hover:bg-sky-200 font-bold text-sky-600">+</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">出题模式</h3>
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                    <span className="font-medium text-gray-600">题目乱序</span>
                    <button 
                      onClick={() => { playClick(); setTempSettings(prev => ({...prev, shuffleQuestions: !prev.shuffleQuestions})) }}
                      className={`w-14 h-8 rounded-full p-1 transition-colors ${tempSettings.shuffleQuestions ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${tempSettings.shuffleQuestions ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>

                {/* Custom Rewards Section */}
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">🎁 宝箱奖励设置</h3>
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-4">
                     <p className="text-xs text-amber-600 mb-2">孩子每次通关后会开宝箱。系统会先按概率判断是否给予下方设置的“家长奖励”。若未中奖，则随机给予贴纸或拼图。</p>
                     
                     <div className="space-y-2 mb-4">
                        {tempSettings.customRewards?.map((r) => (
                          <div key={r.id} className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm border">
                             <span className="font-bold text-gray-700 flex-1">{r.name}</span>
                             <span className="text-sm font-bold text-sky-500 mr-4">{r.probability}%概率</span>
                             <button onClick={() => removeCustomReward(r.id)} className="text-red-400 hover:text-red-600 px-2 font-bold">×</button>
                          </div>
                        ))}
                        {(!tempSettings.customRewards || tempSettings.customRewards.length === 0) && (
                          <div className="text-gray-400 text-sm italic text-center py-2">暂无自定义奖励</div>
                        )}
                     </div>

                     <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 block mb-1">奖品名称</label>
                          <input 
                             value={newRewardName} 
                             onChange={e => setNewRewardName(e.target.value)}
                             placeholder="如：奖励1元"
                             className="w-full p-2 rounded-lg border text-sm"
                          />
                        </div>
                        <div className="w-20">
                          <label className="text-xs text-gray-500 block mb-1">中奖率%</label>
                          <input 
                             type="number"
                             min="1"
                             max="100"
                             value={newRewardProb} 
                             onChange={e => setNewRewardProb(Number(e.target.value))}
                             className="w-full p-2 rounded-lg border text-sm text-center"
                          />
                        </div>
                        <button 
                          onClick={addCustomReward}
                          disabled={!newRewardName.trim()}
                          className="bg-sky-500 text-white p-2 rounded-lg font-bold text-sm h-[38px] disabled:bg-gray-300"
                        >
                          添加
                        </button>
                     </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                   <button onClick={() => { playClick(); setShowParentSettings(false); }} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold">取消</button>
                   <button onClick={handleSaveSettings} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold shadow-md active:translate-y-1">保存设置</button>
                </div>
             </div>
           )}
         </div>
       )}
    </div>
  );
};

const StoreView: React.FC<{ user: UserState; setUser: (u: UserState) => void; onClose: () => void }> = ({ user, setUser, onClose }) => {
  const [activeTab, setActiveTab] = useState<'avatar' | 'cards' | 'bag' | 'deco'>('bag');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const selectedCard = ACHIEVEMENT_CARDS.find(c => c.id === selectedCardId);

  const stickers = user.inventory?.filter(i => i.type === 'sticker') || [];
  const coupons = user.inventory?.filter(i => i.type === 'custom_coupon') || [];

  return (
    <div className="fixed inset-0 z-[100] bg-sky-50 flex flex-col items-center overflow-hidden font-standard">
      {/* Top Bar */}
       <div className="w-full p-4 flex justify-between items-center z-10 bg-sky-50/90 backdrop-blur-sm">
         <button onClick={() => { playClick(); onClose(); }} className="text-3xl md:text-5xl text-gray-300 hover:text-gray-500">✕</button>
         <h2 className="text-2xl md:text-4xl font-black text-amber-600 font-playful">✨ 宝藏店 ✨</h2>
         <div className="w-8"></div>
       </div>

       {/* Tabs */}
       <div className="flex gap-2 md:gap-4 mb-4 md:mb-6 p-1 bg-white rounded-xl border-2 border-amber-100 shadow-sm overflow-x-auto max-w-full">
          <button 
            onClick={() => { playClick(); setActiveTab('bag'); }}
            className={`px-3 md:px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === 'bag' ? 'bg-amber-100 text-amber-600' : 'text-gray-400'}`}
          >
            我的背包 🎒
          </button>
          <button 
            onClick={() => { playClick(); setActiveTab('deco'); }}
            className={`px-3 md:px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === 'deco' ? 'bg-amber-100 text-amber-600' : 'text-gray-400'}`}
          >
            装饰岛屿 🏰
          </button>
          <button 
            onClick={() => { playClick(); setActiveTab('avatar'); }}
            className={`px-3 md:px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === 'avatar' ? 'bg-sky-100 text-sky-600' : 'text-gray-400'}`}
          >
            魔法皮肤 👕
          </button>
          <button 
            onClick={() => { playClick(); setActiveTab('cards'); }}
            className={`px-3 md:px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === 'cards' ? 'bg-amber-100 text-amber-600' : 'text-gray-400'}`}
          >
            荣誉卡片 🏆
          </button>
       </div>

       {/* Content Area */}
       <div className="flex-1 w-full overflow-y-auto px-4 pb-20 flex flex-col items-center">
          <div className="w-full max-w-5xl">

            {/* Inventory Bag Tab */}
            {activeTab === 'bag' && (
               <div className="space-y-8 animate-fade-in">
                  
                  {/* Coupons Section */}
                  <div className="bg-white p-4 md:p-6 rounded-3xl border-4 border-sky-100">
                     <h3 className="font-black text-xl text-gray-700 mb-4 flex items-center gap-2">
                        🎟️ 兑换券 <span className="text-sm font-normal text-gray-400">(找爸爸妈妈兑换)</span>
                     </h3>
                     {coupons.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded-xl">还未获得兑换券，去闯关开宝箱吧！</div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {coupons.map(c => (
                             <div key={c.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl shadow-sm">
                                <div className="text-3xl bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-sm">🎁</div>
                                <div className="flex-1">
                                   <div className="font-bold text-orange-800">{c.name}</div>
                                   <div className="text-xs text-orange-500">{new Date(c.obtainedAt).toLocaleDateString()} 获得</div>
                                </div>
                                <button 
                                  onClick={() => {
                                     if(confirm('确定要兑换并消耗这张券吗？')) {
                                       setUser({...user, inventory: user.inventory.filter(i => i.id !== c.id)});
                                     }
                                  }}
                                  className="px-3 py-1 bg-white text-orange-600 text-xs font-bold rounded-full border border-orange-200 active:scale-95"
                                >
                                   兑换
                                </button>
                             </div>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* Stickers Section */}
                  <div className="bg-white p-4 md:p-6 rounded-3xl border-4 border-indigo-100">
                     <h3 className="font-black text-xl text-gray-700 mb-4 flex items-center gap-2">
                        🦄 贴纸集 <span className="text-sm font-normal text-gray-400">({stickers.length}个)</span>
                     </h3>
                     {stickers.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded-xl">空空如也</div>
                     ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                           {stickers.map(s => (
                             <div key={s.id} className="aspect-square flex flex-col items-center justify-center bg-indigo-50/50 rounded-xl border border-indigo-100 p-2">
                                <div className="text-4xl md:text-5xl mb-1 animate-pop">{s.icon}</div>
                                <div className="text-[10px] md:text-xs text-indigo-400 font-bold text-center truncate w-full">{s.name}</div>
                             </div>
                           ))}
                        </div>
                     )}
                  </div>

               </div>
            )}

            {/* Island Decoration Shop Tab */}
            {activeTab === 'deco' && (
              <div className="animate-fade-in space-y-6">
                 {/* Themes */}
                 <div className="bg-white p-4 rounded-3xl border-4 border-sky-100">
                   <h3 className="font-black text-lg mb-4 text-sky-800">🌈 岛屿主题</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DECORATIONS.filter(d => d.type === 'theme').map(d => {
                        const owned = user.unlockedItems.includes(d.id) || d.cost === 0;
                        const active = user.activeDecorations.theme === d.id;
                        return (
                          <div key={d.id} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 ${active ? 'bg-sky-50 border-sky-500' : 'bg-gray-50 border-gray-100'}`}>
                             <div className="text-4xl">{d.icon}</div>
                             <span className="font-bold text-sm text-gray-700">{d.name}</span>
                             <button
                               onClick={() => {
                                 if (active) {
                                   // Keep at least one theme, maybe fallback to default if user tries to uncheck? 
                                   // For themes, usually we swap. But if user insists on deselecting, we could reset to default 'theme_sky'.
                                   if (d.id !== 'theme_sky') {
                                      playClick();
                                      setUser({...user, activeDecorations: {...user.activeDecorations, theme: 'theme_sky'}});
                                   }
                                   return;
                                 }
                                 if (owned) {
                                   playClick();
                                   setUser({...user, activeDecorations: {...user.activeDecorations, theme: d.id}});
                                 } else if (user.stars >= d.cost) {
                                   playUnlock();
                                   setUser({
                                     ...user, 
                                     stars: user.stars - d.cost, 
                                     unlockedItems: [...user.unlockedItems, d.id],
                                     activeDecorations: {...user.activeDecorations, theme: d.id}
                                   });
                                 }
                               }}
                               className={`text-xs px-3 py-1 rounded-full font-black ${active ? 'bg-green-500 text-white' : owned ? 'bg-sky-500 text-white' : user.stars >= d.cost ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                             >
                               {active ? '使用中' : owned ? '使用' : `${d.cost} ⭐`}
                             </button>
                          </div>
                        )
                      })}
                   </div>
                 </div>

                 {/* Buildings */}
                 <div className="bg-white p-4 rounded-3xl border-4 border-amber-100">
                   <h3 className="font-black text-lg mb-4 text-amber-800">🏠 岛屿建筑</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DECORATIONS.filter(d => d.type === 'building').map(d => {
                        const owned = user.unlockedItems.includes(d.id) || d.cost === 0;
                        const active = user.activeDecorations.building === d.id;
                        return (
                          <div key={d.id} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 ${active ? 'bg-amber-50 border-amber-500' : 'bg-gray-50 border-gray-100'}`}>
                             <div className="text-4xl">{d.icon}</div>
                             <span className="font-bold text-sm text-gray-700">{d.name}</span>
                             <button
                               onClick={() => {
                                 if (active) {
                                   // Allow deselecting
                                   playClick();
                                   setUser({...user, activeDecorations: {...user.activeDecorations, building: ''}});
                                   return;
                                 }
                                 if (owned) {
                                   playClick();
                                   setUser({...user, activeDecorations: {...user.activeDecorations, building: d.id}});
                                 } else if (user.stars >= d.cost) {
                                   playUnlock();
                                   setUser({
                                     ...user, 
                                     stars: user.stars - d.cost, 
                                     unlockedItems: [...user.unlockedItems, d.id],
                                     activeDecorations: {...user.activeDecorations, building: d.id}
                                   });
                                 }
                               }}
                               className={`text-xs px-3 py-1 rounded-full font-black ${active ? 'bg-green-500 text-white' : owned ? 'bg-sky-500 text-white' : user.stars >= d.cost ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                             >
                               {active ? '取消' : owned ? '使用' : `${d.cost} ⭐`}
                             </button>
                          </div>
                        )
                      })}
                   </div>
                 </div>

                 {/* Pets */}
                 <div className="bg-white p-4 rounded-3xl border-4 border-rose-100">
                   <h3 className="font-black text-lg mb-4 text-rose-800">🐾 岛屿宠物</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DECORATIONS.filter(d => d.type === 'pet').map(d => {
                        const owned = user.unlockedItems.includes(d.id) || d.cost === 0;
                        const active = user.activeDecorations.pet === d.id;
                        return (
                          <div key={d.id} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 ${active ? 'bg-rose-50 border-rose-500' : 'bg-gray-50 border-gray-100'}`}>
                             <div className="text-4xl">{d.icon}</div>
                             <span className="font-bold text-sm text-gray-700">{d.name}</span>
                             <button
                               onClick={() => {
                                 if (active) {
                                   // Allow deselecting
                                   playClick();
                                   setUser({...user, activeDecorations: {...user.activeDecorations, pet: ''}});
                                   return;
                                 }
                                 if (owned) {
                                   playClick();
                                   setUser({...user, activeDecorations: {...user.activeDecorations, pet: d.id}});
                                 } else if (user.stars >= d.cost) {
                                   playUnlock();
                                   setUser({
                                     ...user, 
                                     stars: user.stars - d.cost, 
                                     unlockedItems: [...user.unlockedItems, d.id],
                                     activeDecorations: {...user.activeDecorations, pet: d.id}
                                   });
                                 }
                               }}
                               className={`text-xs px-3 py-1 rounded-full font-black ${active ? 'bg-green-500 text-white' : owned ? 'bg-sky-500 text-white' : user.stars >= d.cost ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                             >
                               {active ? '取消' : owned ? '使用' : `${d.cost} ⭐`}
                             </button>
                          </div>
                        )
                      })}
                   </div>
                 </div>
              </div>
            )}
            
            {/* Achievement Cards Tab */}
            {activeTab === 'cards' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
                {ACHIEVEMENT_CARDS.map(card => {
                  const unlocked = user.unlockedAchievements?.includes(card.id);
                  return (
                    <div 
                      key={card.id} 
                      onClick={() => {
                        if (unlocked) {
                          playClick();
                          setSelectedCardId(card.id);
                        }
                      }}
                      className={`relative aspect-[3/4] rounded-2xl border-4 transition-all duration-300 flex flex-col items-center justify-center p-2 text-center group ${unlocked ? 'bg-white border-white shadow-xl cursor-pointer hover:scale-105 rotate-0' : 'bg-gray-200 border-gray-300 opacity-80 cursor-not-allowed grayscale'}`}
                    >
                       <div className="text-4xl md:text-6xl mb-2">{unlocked ? card.icon : '🔒'}</div>
                       <h3 className={`font-black text-sm md:text-lg mb-1 ${unlocked ? 'text-gray-800' : 'text-gray-500'}`}>{card.title}</h3>
                       {!unlocked && (
                         <div className="absolute inset-0 bg-gray-900/10 rounded-xl flex items-end justify-center p-2">
                            <span className="text-[10px] md:text-xs font-bold text-white bg-gray-600 px-2 py-1 rounded-full">{card.conditionText}</span>
                         </div>
                       )}
                       {unlocked && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">点击查看</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Avatars Tab */}
            {activeTab === 'avatar' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 animate-fade-in">
                {AVATARS.map(a => {
                  const owned = user.unlockedItems.includes(a.id);
                  return (
                    <div key={a.id} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] shadow-xl flex flex-col items-center gap-4 md:gap-6 border-4 border-white">
                      <div className="text-6xl md:text-8xl">{a.icon}</div>
                      <button 
                          disabled={owned && user.avatar === a.icon}
                          onClick={() => {
                            if (owned) {
                              playClick();
                              setUser({...user, avatar: a.icon});
                            } else if (user.stars >= a.cost) {
                              playUnlock();
                              setUser({...user, stars: user.stars - a.cost, unlockedItems: [...user.unlockedItems, a.id], avatar: a.icon});
                            }
                          }}
                          className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-lg md:text-xl transition-all ${user.avatar === a.icon ? 'bg-sky-100 text-sky-500' : owned ? 'bg-sky-500 text-white' : user.stars >= a.cost ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                      >
                        {user.avatar === a.icon ? '使用中' : owned ? '更换' : `${a.cost} ⭐`}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
       </div>

       {/* Card Detail Modal */}
       {selectedCard && (
         <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedCardId(null)}>
            <div className={`w-full max-w-sm ${selectedCard.colorClass} border-4 bg-white p-8 rounded-[2rem] shadow-2xl transform transition-all scale-100 flex flex-col items-center text-center relative`} onClick={e => e.stopPropagation()}>
               <button onClick={() => setSelectedCardId(null)} className="absolute top-4 right-4 text-2xl opacity-50 hover:opacity-100">✕</button>
               <div className="text-[6rem] mb-4 animate-bounce">{selectedCard.icon}</div>
               <h2 className="text-3xl font-black mb-2">{selectedCard.title}</h2>
               <div className="w-16 h-1 bg-current opacity-20 rounded-full mb-6"></div>
               <p className="text-xl font-bold leading-relaxed opacity-90">{selectedCard.message}</p>
               <div className="mt-8 text-xs font-bold uppercase tracking-widest opacity-50">Honor Card</div>
            </div>
         </div>
       )}
    </div>
  );
};

const IslandMap: React.FC<{ user: UserState; onSelectDay: (d: number) => void; setView: (v: View) => void }> = ({ user, onSelectDay, setView }) => {
  const finished = user.courseProgress[user.activeCourseId] || [];
  const days = Array.from({ length: 20 }, (_, i) => i + 1);

  // Decoration Logic
  const activeTheme = DECORATIONS.find(d => d.id === user.activeDecorations.theme) || DECORATIONS[0];
  const activePet = DECORATIONS.find(d => d.id === user.activeDecorations.pet);
  const activeBuilding = DECORATIONS.find(d => d.id === user.activeDecorations.building);

  return (
    <div className={`pt-20 md:pt-28 pb-32 px-4 md:px-6 w-full min-h-screen transition-colors duration-500 ${activeTheme.styleClass || 'bg-sky-50'} relative overflow-hidden`}>
      {/* Decorative Building (Bouncing/Floating Randomly) */}
      {activeBuilding && <BouncingItem icon={activeBuilding.icon} sizeRem={8} speed={0.3} zIndex={5} />}

      {/* Decorative Pet (Bouncing/Floating Randomly) */}
      {activePet && <BouncingItem icon={activePet.icon} sizeRem={5} speed={0.8} zIndex={20} />}

      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-6 relative z-10">
        {days.map(d => {
          const isLocked = d > finished.length + 1;
          const isDone = finished.includes(d);
          const l = generateLesson(d, [], user.gameSeed, user.parentSettings); 
          return (
            <div key={d} onClick={() => { if(!isLocked) { playClick(); onSelectDay(d); } }} className={`relative p-3 md:p-6 rounded-2xl md:rounded-[3rem] border-b-4 md:border-b-[12px] flex flex-col items-center gap-1 md:gap-2 cursor-pointer transition-all ${isLocked ? 'bg-gray-100 grayscale opacity-40 border-gray-300' : isDone ? 'bg-green-50 border-green-300 scale-95 opacity-80' : 'bg-white border-sky-100 active:scale-95 md:hover:scale-105 shadow-md md:shadow-xl island-float'}`}>
              <div className="text-4xl md:text-6xl mb-1 md:mb-2">{l.icon}</div>
              <div className="text-center w-full">
                <span className="text-[10px] font-black text-sky-300 block">DAY {d}</span>
                <span className="font-bold text-gray-700 truncate w-full block text-sm md:text-base">{l.title}</span>
              </div>
              {isDone && <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 bg-green-500 text-white w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 md:border-4 border-white shadow-lg animate-pop text-xs md:text-base">✓</div>}
              {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-gray-900/5 rounded-2xl md:rounded-[3rem] text-xl md:text-3xl">🔒</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<View>(View.MAP);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
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
        activeDecorations: parsed.activeDecorations || { theme: 'theme_sky', pet: '', building: '' }
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
      activeDecorations: { theme: 'theme_sky', pet: 'pet_bird', building: 'build_tent' }
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

  return (
    <div className="min-h-screen font-standard bg-sky-50">
      <Header user={user} setView={setView} />
      
      {view === View.MAP && <IslandMap user={user} onSelectDay={d => { setSelectedDay(d); setView(View.LESSON); }} setView={setView} />}
      
      {view === View.LESSON && selectedDay && (
        <LessonViewer 
          lesson={generateLesson(selectedDay, user.usedQuestionIds, user.gameSeed, user.parentSettings)} 
          streak={user.streak}
          userSettings={user.parentSettings}
          finishedCount={(user.courseProgress[user.activeCourseId] || []).length}
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
              inventory: newInventory
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
