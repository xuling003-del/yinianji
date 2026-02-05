
import React, { useState, useEffect } from 'react';
import { UserState, View, Question } from '../types';
import { DECORATIONS, generateLesson } from '../constants';
import { playClick } from '../sound';
import { BouncingItem } from './BouncingItem';
import { getTimeOfDay } from '../utils/helpers';

export const IslandMap: React.FC<{ 
  user: UserState; 
  questionBank: Question[];
  onSelectDay: (d: number) => void; 
  setView: (v: View) => void 
}> = ({ user, questionBank, onSelectDay, setView }) => {
  const finished = user.courseProgress[user.activeCourseId] || [];
  const days = Array.from({ length: 20 }, (_, i) => i + 1);
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());

  // Decoration Logic
  const activeTheme = DECORATIONS.find(d => d.id === user.activeDecorations.theme) || DECORATIONS[0];
  const activePet = DECORATIONS.find(d => d.id === user.activeDecorations.pet);
  const activeBuilding = DECORATIONS.find(d => d.id === user.activeDecorations.building);

  // Dynamic Background Styles based on time, ONLY applies if the default "theme_sky" is selected
  // If user bought a specific theme, we respect that.
  let bgClass = activeTheme.styleClass || 'bg-sky-50';
  let overlayClass = '';
  
  if (activeTheme.id === 'theme_sky') {
    switch(timeOfDay) {
      case 'morning':
        bgClass = 'bg-gradient-to-b from-sky-200 to-orange-100'; // Dawn
        break;
      case 'day':
        bgClass = 'bg-gradient-to-b from-blue-300 to-sky-100'; // Bright Day
        break;
      case 'sunset':
        bgClass = 'bg-gradient-to-b from-indigo-400 via-purple-300 to-orange-300'; // Sunset
        overlayClass = 'mix-blend-overlay bg-orange-200/20';
        break;
      case 'night':
        bgClass = 'bg-gradient-to-b from-slate-900 to-slate-700'; // Night
        overlayClass = 'text-white/90'; // Adjust text color for night
        break;
    }
  }

  // Refresh time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`pt-20 md:pt-28 pb-32 px-4 md:px-6 w-full min-h-screen transition-all duration-1000 ${bgClass} relative overflow-hidden`}>
      {/* Dynamic Elements */}
      {timeOfDay === 'night' && activeTheme.id === 'theme_sky' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 text-yellow-100 text-xs animate-pulse">✨</div>
          <div className="absolute top-20 right-20 text-yellow-100 text-xs animate-pulse delay-700">✨</div>
          <div className="absolute top-40 left-1/2 text-white text-xs animate-pulse delay-300">✨</div>
          <div className="absolute top-5 right-5 text-4xl opacity-80">🌙</div>
        </div>
      )}
      {timeOfDay === 'day' && activeTheme.id === 'theme_sky' && (
        <div className="absolute top-10 right-10 text-6xl opacity-90 animate-spin-slow origin-center" style={{animationDuration:'20s'}}>☀️</div>
      )}
      {timeOfDay === 'morning' && activeTheme.id === 'theme_sky' && (
         <div className="absolute top-20 left-10 text-6xl opacity-80">🌤️</div>
      )}

      {/* Decorative Building (Bouncing/Floating Randomly) */}
      {activeBuilding && <BouncingItem icon={activeBuilding.icon} sizeRem={8} speed={0.3} zIndex={5} />}

      {/* Decorative Pet (Bouncing/Floating Randomly) */}
      {activePet && <BouncingItem icon={activePet.icon} sizeRem={5} speed={0.8} zIndex={20} />}

      <div className={`max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-6 relative z-10 ${overlayClass}`}>
        {days.map(d => {
          const isLocked = d > finished.length + 1;
          const isDone = finished.includes(d);
          // We must pass questions to generateLesson now
          const l = generateLesson(questionBank, d, [], user.gameSeed, user.parentSettings); 
          return (
            <div key={d} onClick={() => { if(!isLocked) { playClick(); onSelectDay(d); } }} className={`relative p-3 md:p-6 rounded-2xl md:rounded-[3rem] border-b-4 md:border-b-[12px] flex flex-col items-center gap-1 md:gap-2 cursor-pointer transition-all ${isLocked ? 'bg-gray-100/80 grayscale opacity-60 border-gray-300' : isDone ? 'bg-green-50 border-green-300 scale-95 opacity-90' : 'bg-white border-sky-100 active:scale-95 md:hover:scale-105 shadow-md md:shadow-xl island-float'}`}>
              <div className="text-4xl md:text-6xl mb-1 md:mb-2">{l.icon}</div>
              <div className="text-center w-full">
                <span className={`text-[10px] font-black block ${isLocked ? 'text-gray-400' : 'text-sky-400'}`}>DAY {d}</span>
                <span className={`font-bold truncate w-full block text-sm md:text-base ${isLocked ? 'text-gray-400' : 'text-gray-700'}`}>{l.title}</span>
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
