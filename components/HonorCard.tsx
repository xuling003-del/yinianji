
import React from 'react';
import { AchievementCard } from '../types';
import { ImageLoader } from './ImageLoader';

interface HonorCardProps {
  card: AchievementCard;
  unlocked: boolean;
  isFlipped?: boolean; 
  onClick?: () => void;
  variant?: 'list' | 'modal';
}

export const HonorCard: React.FC<HonorCardProps> = ({ card, unlocked, isFlipped = false, onClick, variant = 'list' }) => {
  const isModal = variant === 'modal';

  return (
    <div 
      className={`group perspective-[1000px] cursor-pointer select-none ${isModal ? 'h-[60vh] md:h-[70vh] aspect-[3/5] max-w-[90vw]' : 'w-full aspect-[3/5]'}`}
      onClick={(e) => {
        if (unlocked && onClick) {
             onClick();
        }
      }}
    >
      <div className={`relative w-full h-full duration-700 [transform-style:preserve-3d] transition-all ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* Front Side */}
        <div className={`absolute inset-0 [backface-visibility:hidden] rounded-2xl border-4 shadow-xl overflow-hidden flex flex-col items-center ${
            unlocked ? 'bg-white border-white' : 'bg-gray-200 border-gray-300 opacity-90'
          } ${isModal ? 'p-0 border-0' : 'p-1.5'}`}>
          
          <div className={`w-full ${isModal ? 'h-full' : 'aspect-square bg-gray-50 mb-1 rounded-xl'} flex items-center justify-center overflow-hidden relative`}>
            {unlocked ? (
               <ImageLoader 
                 src={`${card.image}?v=1`} 
                 alt={card.title}
                 className={`w-full h-full ${isModal ? 'object-cover' : 'object-contain p-1'}`}
                 fallbackText={card.title.substring(0, 1)}
               />
            ) : (
               <div className="text-4xl md:text-5xl opacity-30">🔒</div>
            )}
          </div>
          
          {!isModal && (
            <>
              <h3 className={`font-black text-[10px] md:text-xs mb-0.5 leading-tight text-center truncate w-full px-1 ${unlocked ? 'text-gray-800' : 'text-gray-500'}`}>{card.title}</h3>
              
              <div className="flex-1 flex items-center justify-center w-full px-1">
                 {!unlocked && <span className="text-[9px] text-white bg-gray-400 px-1.5 py-0.5 rounded-full scale-90 truncate max-w-full">{card.conditionText}</span>}
                 {unlocked && <span className="text-[10px] text-sky-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">✨</span>}
              </div>
            </>
          )}
        </div>

        {/* Back Side */}
        <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl border-4 bg-white border-amber-200 shadow-xl flex flex-col items-center justify-center text-center ${card.colorClass} ${isModal ? 'p-6 gap-2' : 'p-2 gap-1'}`}>
           <div className={`${isModal ? 'text-6xl' : 'text-2xl'} mb-1`}>{card.icon}</div>
           <h3 className={`font-black ${isModal ? 'text-2xl' : 'text-sm'} mb-1`}>{card.title}</h3>
           <p className={`${isModal ? 'text-base' : 'text-[9px]'} font-bold opacity-80 leading-relaxed`}>{card.message}</p>
           <div className={`mt-auto ${isModal ? 'text-sm px-4 py-2' : 'text-[8px] px-1.5 py-1'} bg-white/50 rounded-lg font-bold text-gray-600`}>
             {card.description}
           </div>
        </div>

      </div>
    </div>
  );
};
