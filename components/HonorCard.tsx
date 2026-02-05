
import React from 'react';
import { AchievementCard } from '../types';
import { ImageLoader } from './ImageLoader';

interface HonorCardProps {
  card: AchievementCard;
  unlocked: boolean;
  onClick?: (id: string) => void;
}

export const HonorCard: React.FC<HonorCardProps> = ({ card, unlocked, onClick }) => {
  return (
    <div 
      className="group perspective-[1000px] w-full aspect-[3/5] cursor-pointer"
      onClick={() => unlocked && onClick && onClick(card.id)}
    >
      <div className={`relative w-full h-full duration-700 [transform-style:preserve-3d] transition-all ${unlocked ? 'group-hover:[transform:rotateY(180deg)]' : ''}`}>
        
        {/* Front Side */}
        <div className={`absolute inset-0 [backface-visibility:hidden] rounded-2xl border-4 shadow-xl overflow-hidden flex flex-col items-center p-2 ${unlocked ? 'bg-white border-white' : 'bg-gray-200 border-gray-300 opacity-90'}`}>
          <div className="w-full aspect-square bg-gray-50 rounded-xl mb-2 flex items-center justify-center overflow-hidden relative">
            {unlocked ? (
               <ImageLoader 
                 src={`${card.image}?v=1`} 
                 alt={card.title}
                 className="w-full h-full p-1"
                 fallbackText={card.title.substring(0, 1)}
               />
            ) : (
               <div className="text-5xl opacity-30">🔒</div>
            )}
          </div>
          <h3 className={`font-black text-sm md:text-base mb-1 leading-tight ${unlocked ? 'text-gray-800' : 'text-gray-500'}`}>{card.title}</h3>
          
          <div className="flex-1 flex items-center justify-center w-full px-1">
             {!unlocked && <span className="text-[10px] text-white bg-gray-400 px-2 py-1 rounded-full">{card.conditionText}</span>}
             {unlocked && <span className="text-[10px] text-sky-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">✨ 背面有惊喜</span>}
          </div>
        </div>

        {/* Back Side */}
        <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl border-4 bg-white border-amber-200 shadow-xl p-4 flex flex-col items-center justify-center text-center ${card.colorClass}`}>
           <div className="text-4xl mb-2">{card.icon}</div>
           <h3 className="font-black text-lg mb-2">{card.title}</h3>
           <p className="text-xs font-bold opacity-80 leading-relaxed mb-4">{card.message}</p>
           <div className="mt-auto text-[10px] bg-white/50 px-3 py-2 rounded-lg font-bold text-gray-600">
             {card.description}
           </div>
        </div>

      </div>
    </div>
  );
};
