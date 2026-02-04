
import React from 'react';
import { UserState, View } from '../types';
import { DECORATIONS, generateLesson } from '../constants';
import { playClick } from '../sound';
import { BouncingItem } from './BouncingItem';

export const IslandMap: React.FC<{ user: UserState; onSelectDay: (d: number) => void; setView: (v: View) => void }> = ({ user, onSelectDay, setView }) => {
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
