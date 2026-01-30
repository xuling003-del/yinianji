
import React, { useState, useEffect, useMemo } from 'react';
import { UserState, View, Lesson, Question } from './types';
import { COURSES, AVATARS, generateLesson } from './constants';

// --- UI Components ---

const Header: React.FC<{ user: UserState; setView: (v: View) => void }> = ({ user, setView }) => (
  <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-50 p-4 flex justify-between items-center border-b-2 border-sky-50">
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView(View.MAP)}>
      <span className="text-4xl">🏝️</span>
      <div>
        <h1 className="text-xl font-black text-sky-600 leading-tight">奇幻岛</h1>
        <p className="text-[10px] text-sky-300 font-bold uppercase tracking-widest">Adventure Lab</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="bg-amber-100 px-4 py-1.5 rounded-full flex items-center gap-2 border-2 border-amber-200">
        <span className="text-xl">⭐</span>
        <span className="font-black text-amber-600 tabular-nums">{user.stars}</span>
      </div>
      <button onClick={() => setView(View.PROFILE)} className="w-12 h-12 rounded-2xl bg-white border-2 border-sky-100 flex items-center justify-center text-3xl shadow-sm hover:scale-105 transition-transform">
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
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{msg: string, ok: boolean} | null>(null);
  
  // Scrambling state
  const [scrambledSelected, setScrambledSelected] = useState<string[]>([]);

  const q = lesson.questions[qIndex];

  const handleAnswer = (ans: string) => {
    if (selected) return;
    setSelected(ans);
    // Compare answer, removing all spaces for robust checking in unscramble
    const cleanUser = ans.replace(/\s+/g, '');
    const cleanCorrect = q.answer.replace(/\s+/g, '');
    
    if (cleanUser === cleanCorrect) {
      setFeedback({ msg: "太棒了！完全正确！🌟", ok: true });
    } else {
      setFeedback({ msg: q.explanation, ok: false });
    }
  };

  const wordBank = useMemo(() => {
    if (q?.type !== 'unscramble') return [];
    return q.text.split('/').map(s => s.trim()).sort(() => Math.random() - 0.5);
  }, [qIndex, lesson]);

  const availableWords = useMemo(() => {
    let temp = [...scrambledSelected];
    return wordBank.filter(w => {
      const idx = temp.indexOf(w);
      if (idx > -1) { temp.splice(idx, 1); return false; }
      return true;
    });
  }, [scrambledSelected, wordBank]);

  const handleNext = () => {
    if (qIndex < lesson.questions.length - 1) {
      setQIndex(qIndex + 1);
      setSelected(null);
      setFeedback(null);
      setScrambledSelected([]);
    } else {
      setStep('finish');
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setFeedback(null);
    setScrambledSelected([]);
  };

  const renderFillInTheBlankText = () => {
    if (!q) return null;
    const parts = q.text.split('（ ）');
    if (parts.length === 1) return <span className="text-3xl font-black text-gray-800">{q.text}</span>;

    return (
      <div className="text-3xl font-black text-gray-800 leading-relaxed text-center">
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            <span>{part}</span>
            {i < parts.length - 1 && (
              <span className={`inline-block border-b-4 px-2 min-w-[3rem] text-center transition-colors ${selected ? (selected === q.answer ? 'text-green-600 border-green-400 bg-green-50' : 'text-red-500 border-red-400 bg-red-50') : 'text-transparent border-gray-300 bg-gray-100'}`}>
                 {selected || '？'}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col font-standard overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center bg-sky-50">
        <button onClick={onClose} className="text-4xl text-sky-300">✕</button>
        <div className="flex-1 px-8">
           <div className="h-3 bg-white rounded-full overflow-hidden border">
              <div className="h-full bg-sky-400 transition-all duration-500" style={{ width: `${((qIndex + 1) / lesson.questions.length) * 100}%` }}></div>
           </div>
        </div>
        <div className="font-black text-sky-600">Day {lesson.day}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        {step === 'intro' && (
          <div className="max-w-xl text-center space-y-12 py-10 animate-pop">
             <div className="text-[10rem] island-float">{lesson.icon}</div>
             <div className="bg-sky-50 p-8 rounded-[3rem] border-4 border-sky-100">
               <h2 className="text-4xl font-black text-sky-800 mb-4">{lesson.title}</h2>
               <p className="text-2xl text-gray-600 font-bold leading-relaxed">{lesson.story}</p>
             </div>
             <button onClick={() => setStep('quiz')} className="w-full py-6 bg-sky-500 text-white rounded-[2rem] text-4xl font-black shadow-[0_12px_0_0_#0369a1] active:translate-y-3 active:shadow-none transition-all">出发冒险！</button>
          </div>
        )}

        {step === 'quiz' && (
          <div className="w-full max-w-2xl space-y-8 animate-pop py-6">
            <div className="bg-white p-8 rounded-[3rem] border-4 border-sky-100 shadow-xl">
               <span className="bg-sky-500 text-white px-4 py-1 rounded-full text-xs font-black mb-4 inline-block uppercase">{q.category}</span>
               {q.type === 'fill-in-the-blank' ? renderFillInTheBlankText() : <h3 className="text-3xl font-black text-gray-800 leading-tight">{q.text}</h3>}
            </div>

            {(q.type === 'multiple-choice' || q.type === 'fill-in-the-blank') && (
              <div className={q.type === 'fill-in-the-blank' ? "flex flex-wrap gap-4 justify-center" : "grid gap-4"}>
                {q.options?.map(opt => (
                  <button
                    key={opt}
                    disabled={!!selected}
                    onClick={() => handleAnswer(opt)}
                    className={
                      q.type === 'fill-in-the-blank' 
                      ? `w-20 h-20 rounded-2xl text-3xl font-black border-4 transition-all ${selected === opt ? (opt === q.answer ? 'bg-green-500 text-white border-green-600' : 'bg-red-500 text-white border-red-600') : 'bg-white border-sky-100 hover:border-sky-300 shadow-md'}`
                      : `p-6 rounded-[2rem] text-2xl font-bold border-4 text-left transition-all ${selected === opt ? (opt === q.answer ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500') : 'bg-white border-gray-100 hover:border-sky-200'}`
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {q.type === 'unscramble' && (
              <div className="space-y-8">
                <div className="bg-sky-50/50 p-6 rounded-3xl border-2 border-dashed border-sky-200 min-h-[100px] flex flex-wrap gap-2 justify-center">
                   {availableWords.map((w, i) => (
                     <button key={i} onClick={() => setScrambledSelected([...scrambledSelected, w])} className="bg-white px-5 py-3 rounded-xl text-2xl font-bold shadow-md hover:bg-sky-50">{w}</button>
                   ))}
                </div>
                <div className="min-h-[120px] bg-white p-6 rounded-[2.5rem] border-4 border-sky-100 shadow-inner flex flex-wrap gap-2">
                   {scrambledSelected.map((w, i) => (
                     <button key={i} onClick={() => {
                       if (selected) return; // Prevent editing after answer
                       const next = [...scrambledSelected];
                       next.splice(i, 1);
                       setScrambledSelected(next);
                     }} className="bg-amber-400 text-white px-4 py-2 rounded-lg text-2xl font-black shadow-sm animate-pop">{w}</button>
                   ))}
                </div>
                {!feedback && (
                  <button onClick={() => handleAnswer(scrambledSelected.join(' '))} className="w-full py-5 bg-sky-500 text-white rounded-2xl text-2xl font-black">拼好了！🚀</button>
                )}
              </div>
            )}

            {feedback && (
              <div className={`p-8 rounded-[3rem] border-8 animate-pop ${feedback.ok ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex gap-4">
                   <span className="text-6xl">{feedback.ok ? '🎉' : '💡'}</span>
                   <div className="flex-1">
                      <h4 className={`text-2xl font-black ${feedback.ok ? 'text-green-600' : 'text-amber-600'}`}>{feedback.ok ? "太棒啦！" : "小贴士"}</h4>
                      <p className="text-xl font-bold text-gray-700 mt-2">{feedback.msg}</p>
                   </div>
                </div>
                {feedback.ok ? (
                  <button onClick={handleNext} className="w-full mt-6 py-4 bg-sky-600 text-white rounded-2xl text-2xl font-black">继续前进 ➡️</button>
                ) : (
                  <button onClick={handleRetry} className="w-full mt-6 py-4 bg-amber-500 text-white rounded-2xl text-2xl font-black">重做一遍 ↩️</button>
                )}
              </div>
            )}
          </div>
        )}

        {step === 'finish' && (
          <div className="text-center space-y-10 py-10 animate-pop">
            <div className="text-[12rem]">🏆</div>
            <h2 className="text-5xl font-black text-sky-800">冒险大获全胜！</h2>
            <div className="bg-amber-50 p-8 rounded-[3rem] border-4 border-amber-200 inline-block px-16">
               <span className="text-gray-500 font-bold block mb-2">获得星星</span>
               <span className="text-6xl font-black text-amber-600">+{lesson.points}</span>
            </div>
            <button onClick={() => onComplete(lesson.points, lesson.questions.map(q => q.id))} className="w-full max-sm py-8 bg-green-500 text-white rounded-[2.5rem] text-4xl font-black shadow-[0_12px_0_0_#15803d]">回到地图</button>
          </div>
        )}
      </div>
    </div>
  );
};

const IslandMap: React.FC<{ user: UserState; onSelectDay: (d: number) => void; setView: (v: View) => void }> = ({ user, onSelectDay, setView }) => {
  const finished = user.courseProgress[user.activeCourseId] || [];
  const days = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div className="pt-28 pb-32 px-6 max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
      {days.map(d => {
        const isLocked = d > finished.length + 1;
        const isDone = finished.includes(d);
        // Map uses a static generation to maintain UI icons consistently.
        // We pass user.gameSeed here, though it primarily affects question selection, which isn't used for icon/title display.
        const l = generateLesson(d, [], user.gameSeed); 
        return (
          <div key={d} onClick={() => !isLocked && onSelectDay(d)} className={`relative p-6 rounded-[3rem] border-b-[12px] flex flex-col items-center gap-2 cursor-pointer transition-all ${isLocked ? 'bg-gray-100 grayscale opacity-40 border-gray-300' : isDone ? 'bg-green-50 border-green-300 scale-95 opacity-80' : 'bg-white border-sky-100 hover:scale-105 shadow-xl island-float'}`}>
            <div className="text-6xl mb-2">{l.icon}</div>
            <div className="text-center">
               <span className="text-[10px] font-black text-sky-300 block">DAY {d}</span>
               <span className="font-bold text-gray-700 truncate w-24 block">{l.title}</span>
            </div>
            {isDone && <div className="absolute -top-3 -right-3 bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-pop">✓</div>}
            {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-gray-900/5 rounded-[3rem]">🔒</div>}
          </div>
        );
      })}
      <div onClick={() => setView(View.STORE)} className="p-6 rounded-[3rem] bg-amber-50 border-b-[12px] border-amber-300 shadow-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-110 island-float">
        <div className="text-6xl">🎁</div>
        <span className="font-bold text-amber-700">宝藏店</span>
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

  // Ensure older saved states get a seed if they don't have one
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
        <div className="fixed inset-0 z-[100] bg-sky-50 p-10 flex flex-col items-center overflow-y-auto">
           <button onClick={() => setView(View.MAP)} className="absolute top-8 left-8 text-5xl text-gray-300">✕</button>
           <h2 className="text-5xl font-black text-amber-600 mb-12 font-playful">魔法皮肤店 🎁</h2>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-6xl">
              {AVATARS.map(a => {
                const owned = user.unlockedItems.includes(a.id);
                return (
                  <div key={a.id} className="bg-white p-10 rounded-[3.5rem] shadow-xl flex flex-col items-center gap-6 border-4 border-white">
                     <div className="text-8xl">{a.icon}</div>
                     <button 
                        disabled={owned && user.avatar === a.icon}
                        onClick={() => {
                          if (owned) {
                            setUser({...user, avatar: a.icon});
                          } else if (user.stars >= a.cost) {
                            setUser({...user, stars: user.stars - a.cost, unlockedItems: [...user.unlockedItems, a.id], avatar: a.icon});
                          }
                        }}
                        className={`w-full py-4 rounded-2xl font-black text-xl transition-all ${user.avatar === a.icon ? 'bg-sky-100 text-sky-500' : owned ? 'bg-sky-500 text-white' : user.stars >= a.cost ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'}`}
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
        <div className="fixed inset-0 z-[100] bg-white p-10 flex flex-col items-center overflow-y-auto animate-fade-in">
           <button onClick={() => setView(View.MAP)} className="absolute top-8 left-8 text-5xl text-gray-300">✕</button>
           <div className="mt-20 w-56 h-56 bg-sky-50 rounded-[4rem] flex items-center justify-center text-[8rem] border-[10px] border-white shadow-2xl">{user.avatar}</div>
           <h2 className="mt-8 text-5xl font-black text-sky-800">{user.name}</h2>
           <div className="mt-12 grid grid-cols-2 gap-6 w-full max-w-lg">
              <div className="bg-sky-50 p-8 rounded-[2rem] text-center border-b-4 border-sky-100">
                 <div className="text-4xl font-black text-sky-600">{user.courseProgress.main.length}</div>
                 <div className="text-gray-400 font-bold text-sm uppercase">已通关卡</div>
              </div>
              <div className="bg-amber-50 p-8 rounded-[2rem] text-center border-b-4 border-amber-100">
                 <div className="text-4xl font-black text-amber-600">{user.stars}</div>
                 <div className="text-gray-400 font-bold text-sm uppercase">持有星星</div>
              </div>
           </div>
           <button onClick={() => {
             const n = prompt('请输入你的探险家代号：', user.name);
             if (n) setUser({...user, name: n.slice(0, 8)});
           }} className="mt-10 px-10 py-4 bg-sky-100 text-sky-600 rounded-2xl font-black hover:bg-sky-200 transition-colors">修改代号</button>
        </div>
      )}
    </div>
  );
}
