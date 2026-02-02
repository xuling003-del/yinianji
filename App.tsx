
import React, { useState, useEffect, useMemo } from 'react';
import { UserState, View, Lesson, Question } from './types';
import { COURSES, AVATARS, generateLesson } from './constants';

// --- Helper Functions ---
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// --- UI Components ---

const Header: React.FC<{ user: UserState; setView: (v: View) => void }> = ({ user, setView }) => (
  <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-50 px-3 py-2 md:p-4 flex justify-between items-center border-b-2 border-sky-50 h-14 md:h-auto">
    <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => setView(View.MAP)}>
      <span className="text-2xl md:text-4xl">🏝️</span>
      <div>
        <h1 className="text-lg md:text-xl font-black text-sky-600 leading-tight">奇幻岛</h1>
        <p className="hidden md:block text-[10px] text-sky-300 font-bold uppercase tracking-widest">Adventure Lab</p>
      </div>
    </div>
    <div className="flex items-center gap-2 md:gap-3">
      <div className="bg-amber-100 px-2 md:px-4 py-1 rounded-full flex items-center gap-1 md:gap-2 border-2 border-amber-200">
        <span className="text-sm md:text-xl">⭐</span>
        <span className="font-black text-amber-600 tabular-nums text-sm md:text-base">{user.stars}</span>
      </div>
      <button onClick={() => setView(View.PROFILE)} className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white border-2 border-sky-100 flex items-center justify-center text-xl md:text-3xl shadow-sm active:scale-95 transition-transform">
        {user.avatar}
      </button>
    </div>
  </header>
);

const LessonViewer: React.FC<{
  lesson: Lesson;
  onComplete: (points: number, questionIds: string[]) => void;
  onClose: () => void;
}> = ({ lesson, onComplete, onClose }) => {
  const [step, setStep] = useState<'intro' | 'quiz' | 'finish'>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [feedback, setFeedback] = useState<{msg: string, ok: boolean} | null>(null);
  
  // Standard Multiple Choice State
  const [selected, setSelected] = useState<string | null>(null);

  // Unscramble State
  const [scrambledSelected, setScrambledSelected] = useState<string[]>([]);

  // Fill-in-the-blank State (New)
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

  // Multiple Choice Shuffle
  const currentOptions = useMemo(() => {
    if (q.type !== 'multiple-choice' || !q.options) return [];
    return shuffleArray(q.options);
  }, [q]);

  // Handle MC Answer
  const handleMCAnswer = (ans: string) => {
    if (selected) return;
    setSelected(ans);
    if (ans === q.answer) {
      setFeedback({ msg: "太棒了！完全正确！🌟", ok: true });
    } else {
      setFeedback({ msg: q.explanation, ok: false });
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
    const userAns = scrambledSelected.join('');
    const correctAns = q.answer.replace(/\s+/g, ''); // Unscramble answer is usually the full sentence
    if (userAns === correctAns) {
      setFeedback({ msg: "太棒了！完全正确！🌟", ok: true });
    } else {
      setFeedback({ msg: q.explanation, ok: false });
    }
  };

  // Handle Fill-in-the-blank Logic
  const handleFillBankClick = (word: string, bankIndex: number) => {
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
    const word = blankSlots[index];
    if (!word) return;

    const newSlots = [...blankSlots];
    newSlots[index] = '';
    setBlankSlots(newSlots);

    setBlankBank([...blankBank, word]);
  };

  const handleFillSubmit = () => {
    const userAns = blankSlots.join('');
    // For fill-in-the-blank, answer is the concatenated correct words
    if (userAns === q.answer) {
      setFeedback({ msg: "太棒了！完全正确！🌟", ok: true });
    } else {
      setFeedback({ msg: q.explanation, ok: false });
    }
  };

  // Navigation
  const handleNext = () => {
    if (qIndex < lesson.questions.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      setStep('finish');
    }
  };

  const handleRetry = () => {
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
        <button onClick={onClose} className="text-2xl md:text-4xl text-sky-400 hover:text-sky-600 w-8">✕</button>
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
             </div>
             <button onClick={() => setStep('quiz')} className="w-full py-4 md:py-6 bg-sky-500 text-white rounded-[1.5rem] md:rounded-[2rem] text-2xl md:text-4xl font-black shadow-[0_8px_0_0_#0369a1] active:translate-y-2 active:shadow-none transition-all">出发冒险！</button>
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
                     <button key={i} onClick={() => setScrambledSelected([...scrambledSelected, w])} className="bg-white px-3 py-2 md:px-5 md:py-3 rounded-lg md:rounded-xl text-lg md:text-2xl font-bold shadow-sm border border-gray-100 hover:bg-sky-50 active:scale-95 font-standard">{w}</button>
                   ))}
                </div>
                <div className="min-h-[80px] md:min-h-[120px] bg-white p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border-4 border-sky-100 shadow-inner flex flex-wrap gap-2 items-center justify-center">
                   {scrambledSelected.length === 0 && <span className="text-gray-300 text-sm md:text-xl italic">点击上方词语组句</span>}
                   {scrambledSelected.map((w, i) => (
                     <button key={i} onClick={() => {
                       if (feedback) return;
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
            <button onClick={() => onComplete(lesson.points, lesson.questions.map(q => q.id))} className="w-full py-4 md:py-8 bg-green-500 text-white rounded-[2rem] md:rounded-[2.5rem] text-2xl md:text-4xl font-black shadow-[0_8px_0_0_#15803d] active:shadow-none active:translate-y-2">回到地图</button>
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileView: React.FC<{ user: UserState; setUser: (u: UserState) => void; onClose: () => void }> = ({ user, setUser, onClose }) => {
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(user.name);

  const handleSave = () => {
    if (nameVal.trim()) {
      setUser({ ...user, name: nameVal.trim().slice(0, 8) });
      setEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white p-6 md:p-10 flex flex-col items-center overflow-y-auto animate-fade-in">
       <button onClick={onClose} className="absolute top-4 left-4 md:top-8 md:left-8 text-3xl md:text-5xl text-gray-300 hover:text-gray-500 transition-colors">✕</button>
       <div className="mt-10 md:mt-20 w-40 h-40 md:w-56 md:h-56 bg-sky-50 rounded-[2rem] md:rounded-[4rem] flex items-center justify-center text-[5rem] md:text-[8rem] border-[6px] md:border-[10px] border-white shadow-2xl">{user.avatar}</div>
       
       {editing ? (
         <div className="flex gap-2 mt-4 md:mt-8 items-center animate-pop">
            <input 
              value={nameVal} 
              onChange={e => setNameVal(e.target.value)}
              className="border-4 border-sky-300 rounded-2xl px-4 py-2 text-2xl md:text-4xl font-black text-center w-64 md:w-80 outline-none focus:border-sky-500 bg-white"
              autoFocus
              maxLength={8}
            />
            <button onClick={handleSave} className="bg-green-500 text-white p-2 md:p-3 rounded-xl md:rounded-2xl shadow-md active:scale-95 text-xl">✓</button>
         </div>
       ) : (
         <h2 onClick={() => { setEditing(true); setNameVal(user.name); }} className="mt-4 md:mt-8 text-3xl md:text-5xl font-black text-sky-800 flex items-center gap-3 cursor-pointer border-b-4 border-transparent hover:border-sky-100 px-4 py-2 rounded-xl transition-all">
           {user.name} <span className="text-lg md:text-2xl text-sky-300">✎</span>
         </h2>
       )}

       <div className="mt-8 md:mt-12 grid grid-cols-2 gap-4 md:gap-6 w-full max-w-lg">
          <div className="bg-sky-50 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] text-center border-b-4 border-sky-100">
             <div className="text-2xl md:text-4xl font-black text-sky-600">{user.courseProgress.main.length}</div>
             <div className="text-gray-400 font-bold text-xs md:text-sm uppercase">已通关卡</div>
          </div>
          <div className="bg-amber-50 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] text-center border-b-4 border-amber-100">
             <div className="text-2xl md:text-4xl font-black text-amber-600">{user.stars}</div>
             <div className="text-gray-400 font-bold text-xs md:text-sm uppercase">持有星星</div>
          </div>
       </div>
       
       {!editing && (
         <button onClick={() => { setEditing(true); setNameVal(user.name); }} className="mt-8 md:mt-10 px-6 md:px-10 py-3 md:py-4 bg-sky-100 text-sky-600 rounded-2xl font-black hover:bg-sky-200 transition-colors text-lg md:text-base">修改代号</button>
       )}
    </div>
  );
};

const IslandMap: React.FC<{ user: UserState; onSelectDay: (d: number) => void; setView: (v: View) => void }> = ({ user, onSelectDay, setView }) => {
  const finished = user.courseProgress[user.activeCourseId] || [];
  const days = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div className="pt-20 md:pt-28 pb-32 px-4 md:px-6 max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-6">
      {days.map(d => {
        const isLocked = d > finished.length + 1;
        const isDone = finished.includes(d);
        const l = generateLesson(d, [], user.gameSeed); 
        return (
          <div key={d} onClick={() => !isLocked && onSelectDay(d)} className={`relative p-3 md:p-6 rounded-2xl md:rounded-[3rem] border-b-4 md:border-b-[12px] flex flex-col items-center gap-1 md:gap-2 cursor-pointer transition-all ${isLocked ? 'bg-gray-100 grayscale opacity-40 border-gray-300' : isDone ? 'bg-green-50 border-green-300 scale-95 opacity-80' : 'bg-white border-sky-100 active:scale-95 md:hover:scale-105 shadow-md md:shadow-xl island-float'}`}>
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
      <div onClick={() => setView(View.STORE)} className="p-3 md:p-6 rounded-2xl md:rounded-[3rem] bg-amber-50 border-b-4 md:border-b-[12px] border-amber-300 shadow-md md:shadow-xl flex flex-col items-center justify-center gap-1 md:gap-2 cursor-pointer active:scale-95 md:hover:scale-110 island-float">
        <div className="text-4xl md:text-6xl">🎁</div>
        <span className="font-bold text-amber-700 text-sm md:text-base">宝藏店</span>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<View>(View.MAP);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [user, setUser] = useState<UserState>(() => {
    const s = localStorage.getItem('quest_island_v10');
    return s ? JSON.parse(s) : { 
      name: '超级探险家', 
      avatar: '🐱', 
      stars: 0, 
      courseProgress: { 'main': [] }, 
      usedQuestionIds: [], 
      activeCourseId: 'main', 
      unlockedItems: ['cat'],
      gameSeed: Math.floor(Math.random() * 1000000)
    };
  });

  useEffect(() => {
    if (!user.gameSeed) {
      setUser(u => ({ ...u, gameSeed: Math.floor(Math.random() * 1000000) }));
    }
  }, []);

  useEffect(() => localStorage.setItem('quest_island_v10', JSON.stringify(user)), [user]);

  return (
    <div className="min-h-screen font-standard bg-sky-50">
      <Header user={user} setView={setView} />
      
      {view === View.MAP && <IslandMap user={user} onSelectDay={d => { setSelectedDay(d); setView(View.LESSON); }} setView={setView} />}
      
      {view === View.LESSON && selectedDay && (
        <LessonViewer 
          lesson={generateLesson(selectedDay, user.usedQuestionIds, user.gameSeed)} 
          onComplete={(p, qIds) => {
            setUser(prev => ({
              ...prev,
              stars: prev.stars + p,
              usedQuestionIds: Array.from(new Set([...prev.usedQuestionIds, ...qIds])),
              courseProgress: { ...prev.courseProgress, [prev.activeCourseId]: Array.from(new Set([...(prev.courseProgress[prev.activeCourseId] || []), selectedDay])) }
            }));
            setView(View.MAP);
          }}
          onClose={() => setView(View.MAP)}
        />
      )}

      {view === View.STORE && (
        <div className="fixed inset-0 z-[100] bg-sky-50 p-6 md:p-10 flex flex-col items-center overflow-y-auto">
           <button onClick={() => setView(View.MAP)} className="absolute top-4 left-4 md:top-8 md:left-8 text-3xl md:text-5xl text-gray-300">✕</button>
           <h2 className="text-3xl md:text-5xl font-black text-amber-600 mb-8 md:mb-12 font-playful mt-8">魔法皮肤店 🎁</h2>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl">
              {AVATARS.map(a => {
                const owned = user.unlockedItems.includes(a.id);
                return (
                  <div key={a.id} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] shadow-xl flex flex-col items-center gap-4 md:gap-6 border-4 border-white">
                     <div className="text-6xl md:text-8xl">{a.icon}</div>
                     <button 
                        disabled={owned && user.avatar === a.icon}
                        onClick={() => {
                          if (owned) {
                            setUser({...user, avatar: a.icon});
                          } else if (user.stars >= a.cost) {
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
        </div>
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
